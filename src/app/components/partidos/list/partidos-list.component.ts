import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject, Subscription, Observable, of, throwError } from "rxjs";
// import { Partido, partidostatus } from '../../../models/collections/partido.model';
import { PartidosService } from "../../../services/collections/partidos.service";
import {
  catchError,
  map,
  switchMap,
  takeUntil,
  flatMap,
  take,
} from "rxjs/operators";
import { refreshDataTable } from "../../../helpers/datatables.helper";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { I18nService } from "../../../services/i18n.service";
import { Category } from "../../../models/collections/category.model";
import { CategoriesService } from "../../../services/collections/categories.service";
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "../../../services/settings.service";
import { Language } from "../../../models/language.model";
import { CurrentUserService } from "../../../services/current-user.service";
import {
  Partido,
  PartidoStatus,
} from "../../../models/collections/partido.model";
import { UsersService } from "src/app/services/collections/users.service";
import { AuthService } from "src/app/services/auth.service";
import { User } from "src/app/models/collections/user.model";
import { DivisionesService } from "src/app/services/collections/divisiones.service";
import * as firebase from "firebase";
import { Division } from "src/app/models/collections/division.model";
import { Equipo } from "src/app/models/collections/equipo.model";
import { EquiposService } from "../../../services/collections/equipos.service";

@Component({
  selector: "fa-partidos-list",
  templateUrl: "./partidos-list.component.html",
  styleUrls: ["./partidos-list.component.css"],
})
export class PartidosListComponent implements OnInit, OnDestroy {
  allPartidos: Observable<Partido[]>;
  selectedPartido: Partido = null;
  @ViewChild(DataTableDirective, { static: false })
  private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings = {
    responsive: true,
    destroy: true,
    paging: false,
    order: [
      [1, "asc"],
      [0, "asc"],
    ],
  };
  dataTableTrigger: Subject<void> = new Subject();
  private subscription: Subscription = new Subscription();
  allStatus: { labels: object; colors: object };
  private routeParamsChange: Subject<void> = new Subject<void>();
  isLoading: boolean = true;
  // activeTab: string = '';
  // equipos: any;
  partidosEquipo: Observable<Partido[]>;

  constructor(
    private partidos: PartidosService,
    private divisiones: DivisionesService,
    private equipos: EquiposService,
    private auth: AuthService,
    private alert: AlertService,
    private i18n: I18nService,
    private route: ActivatedRoute,
    public navigation: NavigationService,
    public userService: UsersService,
    private settings: SettingsService
  ) {}

  ngOnInit() {
    this.userService
      .get(this.auth.firebaseUser.uid)
      .pipe(
        switchMap((user: User) => {
          this.init(user);
          return of("");
        }),
        catchError((error) => {
          return throwError(error);
        })
      )
      .subscribe();

    // Get all status
    this.allStatus = this.partidos.getAllStatusWithColors();
  }
  init(user: User) {
    this.isLoading = true;
    this.divisiones
      .getWhereFn((ref) => {
        let query: any = ref;

        var divisionesIds = user["divisiones"].map(
          (division: any) => division.idDivision
        );
        query = query.where(
          firebase.firestore.FieldPath.documentId(),
          "in",
          divisionesIds
        );
        return query;
      }, true)
      .pipe(
        switchMap((divisiones: Division[]) => {
          this.initEquipos(divisiones);
          return of("");
        }),

        takeUntil(this.routeParamsChange)
      )
      .subscribe();
  }

  initEquipos(divisiones: any) {
    this.equipos
      .getWhereFn((ref) => {
        let query: any = ref;
        var equiposIds = divisiones.flatMap((equipo) =>
          equipo.equipos.map((a) => a)
        );
        query = query.where(
          firebase.firestore.FieldPath.documentId(),
          "in",
          equiposIds
        );
        return query;
      }, true)
      .pipe(
        switchMap((equipos: Equipo[]) => {
          this.initPartidos(equipos);
          return of("");
        })
      )
      .subscribe();
  }

  initPartidos(equipos: any) {
    const batchSize = 10; // Set your desired batch size
    const allPartidos: Partido[] = [];
    let currentIndex = 0; // Track the current index

    // Define a function to fetch a batch of partidos
    const fetchPartidosBatch = () => {
      const partidosIds = equipos.flatMap((equipo) =>
        equipo.partidos.map((a) => a)
      );

      const equiposBatch = partidosIds.slice(
        currentIndex,
        currentIndex + batchSize
      );
      currentIndex += batchSize;

      return this.partidos
        .getWhereFn((ref) => {
          let query: any = ref;
          query = query.where(
            firebase.firestore.FieldPath.documentId(),
            "in",
            equiposBatch
          );
          return query;
        }, true)
        .pipe(
          map((partidos: any[]) => {
            partidos.forEach((unPartido) => {
              unPartido.parsedate = new Date(unPartido.date)
                .toISOString()
                .slice(0, 10);
            });

            return partidos.sort(
              (a: Partido, b: Partido) => b.createdAt - a.createdAt
            );
          }),
          switchMap((partidos: Partido[]) => {
            allPartidos.push(...partidos);

            // If there are more equipos to fetch, continue with the next batch
            if (currentIndex < partidosIds.length) {
              return fetchPartidosBatch();
            }

            // Otherwise, return an empty observable to terminate the recursion
            return of(allPartidos);
          }),
          take(1) // Take only one batch of data
        );
    };

    // Start fetching partidos in batches
    fetchPartidosBatch().subscribe((allPartidosArray: any[]) => {
      this.allPartidos = of(allPartidosArray);
      this.subscription.add(
        this.allPartidos.subscribe((partidos: Partido[]) => {
          // Refresh datatable on data change
          refreshDataTable(this.dataTableElement, this.dataTableTrigger);
          this.isLoading = false;
        })
      );
     
      this.isLoading = false;

    });


    
  }

  ngOnDestroy() {
    this.dataTableTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  deletePartido(partido: Partido) {
    this.partidos
      .delete(partido.id)
      .then(() => {
        this.alert.success(
          "Partido " + +partido.rival + " eliminado correctamente!",
          false,
          5000
        );
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      });
  }
}

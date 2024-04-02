import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject, Subscription, Observable, of, throwError } from "rxjs";
import { catchError, flatMap, map, switchMap, takeUntil } from "rxjs/operators";
import { refreshDataTable } from "../../../helpers/datatables.helper";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { I18nService } from "../../../services/i18n.service";
import { ActivatedRoute } from "@angular/router";
import { SettingsService } from "../../../services/settings.service";
import { Language } from "../../../models/language.model";
import { EquiposService } from "../../../services/collections/equipos.service";
// import { Page } from '../../../models/collections/page.model';
import { CurrentUserService } from "../../../services/current-user.service";
import { Equipo } from "../../../models/collections/equipo.model";
import { PartidosService } from "../../../services/collections/partidos.service";
import { query } from "@angular/animations";
import { Partido } from "../../../models/collections/partido.model";
import { User } from "src/app/models/collections/user.model";
import { UsersService } from "src/app/services/collections/users.service";
import { AuthService } from "src/app/services/auth.service";
import * as firebase from "firebase";
import { DivisionesService } from "src/app/services/collections/divisiones.service";
import { Division } from "src/app/models/collections/division.model";

@Component({
  selector: "fa-pages-list",
  templateUrl: "./equipos-list.component.html",
  styleUrls: ["./equipos-list.component.css"],
})
export class EquiposListComponent implements OnInit, OnDestroy {
  allEquipos: Observable<Equipo[]>;
  selectedPage: Equipo = null;
  @ViewChild(DataTableDirective)
  private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings | any = {
    responsive: true,
    aaSorting: [],
  };
  selectedEquipo: any;
  dataTableTrigger: Subject<void> = new Subject();
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();
  allLanguages: Language[] = [];
  isLoading: boolean = true;
  cantidadPartidos: number = 0;

  constructor(
    private equipos: EquiposService,
    private alert: AlertService,
    private partidos: PartidosService,
    private i18n: I18nService,
    private divisiones: DivisionesService,
    private route: ActivatedRoute,
    public navigation: NavigationService,
    public userService: UsersService,
    public auth: AuthService,
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
  }
  init(user: User) {
    // Get route params
    this.subscription.add(
      this.route.params.subscribe((params: { authorId: string }) => {
        this.routeParamsChange.next();
        this.isLoading = true;
        // primero ir a divisiones sino me traeria todos
        // Get all pages
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

              // this.initEquipos(divisiones);
              this.initEquipos(divisiones)
              return of("");
            }),

            // flatMap((equipos__) =>
            //   this.partidos
            //     .getWhereFn((ref) => {
            //       let query: any = ref;
            //       query = query.where(
            //         "idEquipo",
            //         "in",
            //         equipos__.map((u) => u.id)
            //       );
            //       return query;
            //     })
            //     .pipe(
            //       map((partidos: any[]) => {
            //         partidos.forEach((el) => {
            //           equipos__.forEach((eq) => {
            //             if (el.idEquipo == eq.id) {
            //               eq.cantidadPartidos++;
            //             }
            //           });
            //         });

            //         return equipos__;
            //       })
            //     )
            // ),
            takeUntil(this.routeParamsChange)
          ).subscribe();
      })
    );
  }
  initEquipos(divisiones: any) {
    this.allEquipos = this.equipos
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
        map((equipos_: any[]) => {
          equipos_.forEach((equ: any) => {
            equ.cantidadPartidos = 0;
          });
          return equipos_.sort(
            (a: Equipo, b: Equipo) => b.createdAt - a.createdAt
          );
        })
      );

    this.allEquipos.subscribe();

    this.subscription.add(
      this.allEquipos.subscribe((equipo: any[]) => {
        // Refresh datatable on data change
        refreshDataTable(this.dataTableElement, this.dataTableTrigger);
        this.isLoading = false;
      })
    );
  }

  ngOnDestroy() {
    this.dataTableTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  deleteEquipo(equipo: Equipo) {
    this.equipos
      .delete(equipo.id)
      .then(() => {
        this.alert.success(
          "Equipo " + equipo.title + "eliminado correctamente",
          false,
          5000
        );
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      });
  }
}

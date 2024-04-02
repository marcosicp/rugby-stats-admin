import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject, Subscription, Observable } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { refreshDataTable } from "../../../helpers/datatables.helper";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { I18nService } from "../../../services/i18n.service";
import { Category } from "../../../models/collections/category.model";
import { CategoriesService } from "../../../services/collections/categories.service";
import { ActivatedRoute } from "@angular/router";
import { CurrentUserService } from "../../../services/current-user.service";
// import { Entrenamiento, PartidoStatus } from '../../../models/collections/partido.model';
import { EntrenamientosService } from "../../../services/collections/entrenamientos.service";
import { Entrenamiento } from "../../../models/collections/entrenamiento.model";

@Component({
  selector: "fa-partidos-list",
  templateUrl: "./entrenamientos-list.component.html",
  styleUrls: ["./entrenamientos-list.component.css"],
})
export class EntrenamientosListComponent implements OnInit, OnDestroy {
  allEntrenamientos: Observable<Entrenamiento[]>;
  selectedPartido: Entrenamiento = null;
  @ViewChild(DataTableDirective)
  private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings | any = {
    responsive: true,
    aaSorting: [],
  };
  dataTableTrigger: Subject<void> = new Subject();
  private subscription: Subscription = new Subscription();
  allStatus: { labels: object; colors: object };
  allCategories: Category[] = [];
  // allLanguages: Language[] = [];
  private routeParamsChange: Subject<void> = new Subject<void>();
  isLoading: boolean = true;
  selectedEntrenamiento: any;

  constructor(
    // private partidos: PartidosService,
    private entrenamientos: EntrenamientosService,

    private alert: AlertService,
    private i18n: I18nService,
    private route: ActivatedRoute,
    public navigation: NavigationService,
    public currentUser: CurrentUserService
  ) {}

  ngOnInit() {
    // Get all status
    this.allStatus = this.entrenamientos.getAllStatusWithColors();

    // Get route params
    this.subscription.add(
      this.route.params.subscribe(
        (params: { status: string; categoryId: string; authorId: string }) => {
          this.routeParamsChange.next();
          this.isLoading = true;
          // Get all partidos
          this.allEntrenamientos = this.entrenamientos
            .getWhereFn((ref) => {
              let query: any = ref;
              // Filter by status
              if (params.status) {
                query = query.where("status", "==", params.status);
              }
              // Filter by author
              // else if (params.authorId) {
              //   query = query.where("createdBy", "==", params.authorId);
              // }
              //query = query.orderBy('createdAt', 'desc'); // requires an index to work
              return query;
            }, true)
            .pipe(
              map((entrenamientos: any[]) => {
                entrenamientos.forEach((entrenamiento) => {
                  entrenamiento.countPresentes = entrenamiento.jugadores.length;
                });
                
                return entrenamientos.sort(
                  (a: Entrenamiento, b: Entrenamiento) =>
                    b.createdAt - a.createdAt
                );
              }),
              takeUntil(this.routeParamsChange)
            );
          this.subscription.add(
            this.allEntrenamientos.subscribe((partidos: Entrenamiento[]) => {
              // console.log(partidos);
              // Refresh datatable on data change
              refreshDataTable(this.dataTableElement, this.dataTableTrigger);
              this.isLoading = false;
            })
          );
        }
      )
    );
  }

  ngOnDestroy() {
    this.dataTableTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  deleteEntrenamiento(entrenamientos: Entrenamiento) {
    this.entrenamientos
      .delete(entrenamientos.id)
      .then(() => {
        this.alert.success(
          "El entrenamiento " +
            entrenamientos.titulo +
            " fue eliminado correctamente!",
          false,
          5000
        );
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      });
  }
}

import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject, Subscription, Observable, throwError, of } from "rxjs";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { ActivatedRoute } from "@angular/router";
import { Language } from "../../../models/language.model";
import { CurrentUserService } from "../../../services/current-user.service";
import { Equipo } from "../../../models/collections/equipo.model";
import { Division } from "../../../models/collections/division.model";
import { DivisionesService } from "../../../services/collections/divisiones.service";
import {
  catchError,
  map,
  mergeMap,
  switchMap,
  takeUntil,
} from "rxjs/operators";
import { refreshDataTable } from "../../../helpers/datatables.helper";
import { UserGuard } from "src/app/guards/user.guard";
import { AuthService } from "src/app/services/auth.service";
import { UsersService } from "src/app/services/collections/users.service";
import * as firebase from "firebase";
import { AngularFireAuth } from "@angular/fire/auth";
import { CollectionReference } from "@angular/fire/firestore";
import { User } from "src/app/models/collections/user.model";

@Component({
  selector: "fa-divisiones-list",
  templateUrl: "./divisiones-list.component.html",
  styleUrls: ["./divisiones-list.component.css"],
})
export class DivisionesListComponent implements OnInit, OnDestroy {
  allEquipos: Observable<Division[]>;
  selectedPage: Division = null;
  @ViewChild(DataTableDirective, { static: false })
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
    private alert: AlertService,
    private divisiones: DivisionesService,
    private route: ActivatedRoute,
    private auth: AuthService,

    public navigation: NavigationService,
    private afu: AngularFireAuth,
    public userService: UsersService
  ) {}

  // getUserName(): string {
  //   return this.currentUser.get()data ? `${this.currentUser.data.firstName} ${this.currentUser.data.lastName}` : (
  //     this.auth.firebaseUser ? this.auth.firebaseUser.providerData[0].displayName || this.auth.firebaseUser.providerData[0].email : 'unknown'
  //   );
  // }

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

  ngOnDestroy() {
    this.dataTableTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  deleteEquipo(division_: Equipo) {
    this.divisiones
      .delete(division_.id)
      .then(() => {
        this.alert.success(
          "Equipo " + division_.title + "eliminado correctamente",
          false,
          5000
        );
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      });
  }

  init(user: User): any {
    this.isLoading = true;
    // Get all pages
    this.allEquipos = this.divisiones
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
        map((divisiones_: any[]) => {
          divisiones_.forEach((equ: any) => {
            equ.cantidadPartidos = 0;
          });
          return divisiones_.sort(
            (a: Equipo, b: Equipo) => b.createdAt - a.createdAt
          );
        }),
        catchError((error) => {
          return throwError(error);
        }),
        takeUntil(this.routeParamsChange)
      );

    this.allEquipos.subscribe((_equipo: any[]) => {
      // Refresh datatable on data change
      refreshDataTable(this.dataTableElement, this.dataTableTrigger);
      this.isLoading = false;
    });
  }
}

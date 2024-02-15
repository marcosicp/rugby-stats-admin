import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { initTextEditor } from "../../../helpers/posts.helper";
import { I18nService } from "../../../services/i18n.service";
import { slugify } from "../../../helpers/functions.helper";
import { CategoriesService } from "../../../services/collections/categories.service";
import { Category } from "../../../models/collections/category.model";
import { Observable, Subscription, Subject } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";
import { AlertService } from "../../../services/alert.service";
import { NavigationService } from "../../../services/navigation.service";
import { getEmptyImage } from "../../../helpers/assets.helper";
import { ActivatedRoute } from "@angular/router";
import {
  Partido,
  PartidoStatus,
} from "../../../models/collections/partido.model";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { JugadoresService } from "../../../services/collections/jugadores.service";
import { Jugador } from "../../../models/collections/jugador.model";
import { DataTableDirective } from "angular-datatables";
import { refreshDataTable } from "../../../helpers/datatables.helper";
import { EntrenamientosService } from "../../../services/collections/entrenamientos.service";
import { Entrenamiento } from "../../../models/collections/entrenamiento.model";


@Component({
  selector: "fa-posts-edit",
  templateUrl: "./entrenamientos-edit.component.html",
  styleUrls: ["./entrenamientos-edit.component.css"],
})
export class EntrenamientosEditComponent implements OnInit, OnDestroy {
  private id: string;
  titulo: string;
  editor: any;
  status: PartidoStatus;
  language: string;
  slug: string;
  date: string;
  private image: File;
  imageSrc: string | ArrayBuffer;
  checkedCategories: string[] = [];
  categoriesObservable: Observable<Category[]>;
  newCategory: string;
  isSubmitButtonsDisabled: boolean = false;
  allStatus: object | any = {};
  private subscription: Subscription = new Subscription();
  private subscriptionP: Subscription = new Subscription();
  // searchRequestSubscriptions: Subscription[] = [];
  private routeParamsChange: Subject<void> = new Subject<void>();
  jugadores: [];
  materialAddForm: FormGroup = new FormGroup({});
  searchTerm = new Subject<string>();
  // results: [] = [];
  suscJugadores: any;
  allUsers: Observable<Jugador[]>;
  jugadoresAsistencia: Jugador[] = [];
  selectedUser: Jugador = null;
  @ViewChild(DataTableDirective, { static: false })
  private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings | any = {
    responsive: true,
    // aaPagination: false,
    stateSave: true,
    info: false,
    paging: false,
    aaSorting: [],
  };

  dataTableOptionsPresentes: DataTables.Settings | any = {
    responsive: true,
    // aaPagination: false,
    stateSave: true,
    // info: false,
    paging: false,
    aaSorting: [],
  };

  dataTableTrigger: Subject<void> = new Subject();

  dataTableTriggerPresentes: Subject<void> = new Subject();
  scrum: any;
  salidas: any;
  line: any;
  juegoAereo: any;
  tackle: any;
  organizacionDefensiva: any;
  ruck: any;
  juegoConElPie: any;
  duelo: any;
  tomaDecisiones: any;
  movimientoGralJuego: any;
  analisisVideo: any;
  entrenamientoMental: any;
  lanzamientoLine: any;
  estructurasJuego: any;
  paseNueve: any;
  reglamento: any;

  constructor(
    private i18n: I18nService,
    private categories: CategoriesService,
    private alert: AlertService,
    // private etrenamientos: PartidosService,
    private entrenamientos: EntrenamientosService,
    private jugadoresService: JugadoresService,
    public navigation: NavigationService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  changed(jugador: any) {
    var exist = false;
    this.jugadoresAsistencia.forEach((juga) => {
      if (juga.id == jugador.id) exist = true;
    });

    if (!exist) {
      this.jugadoresAsistencia.push(jugador);
    } else {
      var index_ = this.jugadoresAsistencia.findIndex(
        (_jugador) => _jugador.id == jugador.id
      );
      this.jugadoresAsistencia.splice(index_, 1);
    }
  }

  ngOnInit() {
    this.allStatus = this.entrenamientos.getAllStatus();
    this.isSubmitButtonsDisabled = true;

    this.subscription.add(
      this.route.params.subscribe((params: { id: string }) => {
        // console.log(params);
        this.entrenamientos
          .get(params.id)
          .pipe(take(1))
          .toPromise()
          .then((entrenamiento_: Entrenamiento) => {
            // console.log(post);
            if (entrenamiento_) {
              this.id = entrenamiento_.id;
              this.titulo = entrenamiento_.titulo;

              this.jugadoresAsistencia = entrenamiento_.jugadores;

              this.lanzamientoLine = entrenamiento_.propiedades.lanzamientoLine;
              this.line = entrenamiento_.propiedades.line;
              this.tackle = entrenamiento_.propiedades.tackle;
              this.ruck = entrenamiento_.propiedades.ruck;
              this.scrum = entrenamiento_.propiedades.scrum;
              this.salidas = entrenamiento_.propiedades.salidas;
              this.entrenamientoMental =
                entrenamiento_.propiedades.entrenamientoMental;
              this.juegoAereo = entrenamiento_.propiedades.juegoAereo;
              this.juegoConElPie = entrenamiento_.propiedades.juegoConElPie;
              this.reglamento = entrenamiento_.propiedades.reglamento;
              this.analisisVideo = entrenamiento_.propiedades.analisisVideo;
              this.tomaDecisiones = entrenamiento_.propiedades.tomaDecisiones;
              this.estructurasJuego =
                entrenamiento_.propiedades.estructurasJuego;
              this.duelo = entrenamiento_.propiedades.duelo;
              this.organizacionDefensiva =
                entrenamiento_.propiedades.organizacionDefensiva;
              this.paseNueve = entrenamiento_.propiedades.paseNueve;
              this.movimientoGralJuego =
                entrenamiento_.propiedades.movimientoGralJuego;

              this.movimientoGralJuego =
                entrenamiento_.propiedades.movimientoGralJuego;

              this.date = new Date(entrenamiento_.date)
                .toISOString()
                .slice(0, 10);
              this.image = null;
              this.imageSrc = getEmptyImage();

              this.routeParamsChange.next();
              this.isSubmitButtonsDisabled = false;

              this.allUsers = this.jugadoresService.getAll().pipe(
                //skip(this.currentUser.data ? 1 : 0), // workaround to skip first emitted value when currentUser subscription is running (not working when we only have 1 user)
                map((jugadores: any[]) => {
                  this.jugadoresAsistencia.forEach((jugador_) => {
                    
                    jugadores.forEach((a) => {
                      if (a.id == jugador_.id) {
                        a.isChecked = true;
                        jugador_.firstName = a.firstName;
                        jugador_.lastName = a.lastName;
                        return;
                      }
                    });
                  });
                  return jugadores.sort((a: Jugador, b: Jugador) =>
                    a.lastName.localeCompare(b.lastName)
                  );
                })
              );
              this.subscription.add(
                this.allUsers.subscribe((users: Jugador[]) => {
                  // Refresh datatable on data change
                  refreshDataTable(
                    this.dataTableOptionsPresentes,
                    this.dataTableTriggerPresentes
                  );
                  refreshDataTable(
                    this.dataTableElement,
                    this.dataTableTrigger
                  );
                  // this.isLoading = false;
                })
              );
            } else {
              this.navigation.redirectTo("entrenamientos", "list");
            }
          });
      })
    );

    this.subscriptionP.add(
      this.route.params.subscribe(() => {
        // this.allUsers = this.jugadoresService.getAll().pipe(
        //   //skip(this.currentUser.data ? 1 : 0), // workaround to skip first emitted value when currentUser subscription is running (not working when we only have 1 user)
        //   map((users: Jugador[]) => {
        //     return users.sort(
        //       (a: Jugador, b: Jugador) => b.createdAt - a.createdAt
        //     );
        //   })
        // );
        // this.subscription.add(
        //   this.allUsers.subscribe((users: Jugador[]) => {
        //     // Refresh datatable on data change
        //     refreshDataTable(this.dataTableElement, this.dataTableTrigger);
        //     // this.isLoading = false;
        //   })
        // );
      })
    );
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  public get formArrayBuyInformation(): FormArray {
    return this.materialAddForm.get("buyInformation") as FormArray;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  addJugador() {
    // this.jugadores().push(this.newQuantity());
  }

  saveEntrenamiento(event: Event) {
    const target = event.target as any;
    const startLoading = () => {
      target.isLoading = true;
      this.isSubmitButtonsDisabled = true;
    };
    const stopLoading = () => {
      target.isLoading = false;
      this.isSubmitButtonsDisabled = false;
    };
    startLoading();
    
    const data: Entrenamiento = {
      titulo: this.titulo,
      date: new Date(this.date).getTime(),
      propiedades: {
        scrum: this.scrum == undefined ? 0 : this.scrum,
        salidas: this.salidas == undefined ? 0 : this.salidas,
        line: this.line == undefined ? 0 : this.line,
        juegoAereo: this.juegoAereo == undefined ? 0 : this.juegoAereo,
        tackle: this.tackle == undefined ? 0 : this.tackle,
        organizacionDefensiva:
          this.organizacionDefensiva == undefined
            ? 0
            : this.organizacionDefensiva,
        ruck: this.ruck == undefined ? 0 : this.ruck,
        juegoConElPie: this.juegoConElPie == undefined ? 0 : this.juegoConElPie,
        duelo: this.duelo == undefined ? 0 : this.duelo,
        tomaDecisiones:
          this.tomaDecisiones == undefined ? 0 : this.tomaDecisiones,
        movimientoGralJuego:
          this.movimientoGralJuego == undefined ? 0 : this.movimientoGralJuego,
        analisisVideo: this.analisisVideo == undefined ? 0 : this.analisisVideo,
        entrenamientoMental:
          this.entrenamientoMental == undefined ? 0 : this.entrenamientoMental,
        lanzamientoLine:
          this.lanzamientoLine == undefined ? 0 : this.lanzamientoLine,
        estructurasJuego:
          this.estructurasJuego == undefined ? 0 : this.estructurasJuego,
        paseNueve: this.paseNueve == undefined ? 0 : this.paseNueve,
        reglamento: this.reglamento == undefined ? 0 : this.reglamento,
      },
      jugadores: this.jugadoresAsistencia,
    };

    this.entrenamientos
      .edit(this.id, data)
      .then(() => {
        this.alert.success(
          "Entrenamiento actualizado correctamente!",
          false,
          5000,
          true
        );
        this.navigation.redirectTo("entrenamientos", "list");
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      })
      .finally(() => {
        stopLoading();
      });
  }
}

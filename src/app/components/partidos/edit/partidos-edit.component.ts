import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { initTextEditor } from "../../../helpers/posts.helper";
import { I18nService } from "../../../services/i18n.service";
import {
  convertirMinutosAHorasYMinutos,
  now,
  slugify,
} from "../../../helpers/functions.helper";
import { Category } from "../../../models/collections/category.model";
import { Observable, Subscription, Subject, VirtualTimeScheduler } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";
import { AlertService } from "../../../services/alert.service";
import { PartidosService } from "../../../services/collections/partidos.service";
import { NavigationService } from "../../../services/navigation.service";
import { ActivatedRoute } from "@angular/router";
import {
  Partido,
  PartidoStatus,
} from "../../../models/collections/partido.model";
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { JugadoresService } from "../../../services/collections/jugadores.service";
import { Jugador } from "../../../models/collections/jugador.model";
import { DataTableDirective } from "angular-datatables";
import { EquiposService } from "../../../services/collections/equipos.service";
import { Equipo } from "../../../models/collections/equipo.model";
import * as $ from "jquery";

@Component({
  selector: "fa-posts-edit",
  templateUrl: "./partidos-edit.component.html",
  styleUrls: ["./partidos-edit.component.css"],
})
export class PartidosEditComponent implements OnInit, AfterViewInit, OnDestroy {
  private id: string;
  editor: any;
  status: PartidoStatus;
  date: string;
  private image: File;
  imageSrc: string | ArrayBuffer;
  checkedCategories: string[] = [];
  categoriesObservable: Observable<Category[]>;
  newCategory: string;
  isSubmitButtonsDisabled: boolean = false;
  allStatus: object | any = {};
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();
  jugadores: any[] = [];
  materialAddForm: FormGroup = new FormGroup({});
  searchTerm = new Subject<string>();
  suscJugadores: any;
  allUsers: Observable<Jugador[]>;
  allUsersFormacion: Observable<Jugador[]>;
  selectedUser: Jugador = null;

  dataTableTriggerJugadores: Subject<void> = new Subject();
  dataTableTriggerFormacion: Subject<void> = new Subject();
  dataTableTriggerIncidencias: Subject<void> = new Subject();
  equipoSeleccionado: Promise<void>;
  nombreEquipoSeleccionado: any;
  partido: Partido;
  misJugadores: any[];

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings[] = [
    { responsive: true, lengthChange: false, paging: false, info: false },
    {
      responsive: true,
      lengthChange: false,
      searching: false,
      paging: false,
      info: false,
    },
    {
      responsive: true,
      info: false,
      lengthChange: false,
      searching: false,
      paging: false,
    },
  ];
  equipoSeleccioado: Equipo;

  constructor(
    private i18n: I18nService,
    private alert: AlertService,
    private partidos: PartidosService,
    private equipos: EquiposService,
    private jugadoresService: JugadoresService,
    public navigation: NavigationService,
    private route: ActivatedRoute // private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.allStatus = this.partidos.getAllStatus();
    this.isSubmitButtonsDisabled = true;
    this.route.params.subscribe((params: { id: string }) => {
      this.partidos
        .get(params.id)
        .pipe(take(1))
        .toPromise()
        .then((partido_: Partido) => {
          if (partido_) {
            this.partido = partido_;
            this.partido.incidencias =
              this.partido.incidencias == undefined
                ? [{ minuto: 0, incidencia: "", jugador: "" }]
                : this.partido.incidencias;

            this.date = new Date(partido_.date).toISOString().slice(0, 10);
            this.routeParamsChange.next();
            this.isSubmitButtonsDisabled = false;
            this.allUsers = this.jugadoresService.getAll().pipe(
              map((jugadores: any[]) => {
                this.misJugadores = jugadores;
                jugadores.forEach((a) => {
                  if (a != undefined) {
                    a.tiempoJuegoStr = convertirMinutosAHorasYMinutos(
                      a.tiempoJuego
                    );
                  } else {
                    a.tiempoJuegoStr = "00:00";
                  }
                });

                this.partido.jugadores.forEach((jugador_) => {
                  // esta propiedad para editar el tiempo de jugador y comparar con el que ya estaba
                  jugador_.tiempoJuegoEditar = jugador_.tiempoJuego;
                  jugadores.forEach((a) => {
                    if (a.id == jugador_.id) {
                      a.isChecked = true;
                      return;
                    }
                  });
                });
                return jugadores.sort(
                  (a: Jugador, b: Jugador) => b.createdAt - a.createdAt
                );
              })
              // takeUntil(this.routeParamsChange)
            );

            this.subscription.add(
              this.allUsers.subscribe((jugadores: any[]) => {
                this.misJugadores = jugadores;
                jugadores.forEach((a) => {
                  if (a != undefined) {
                    a.tiempoJuegoStr = convertirMinutosAHorasYMinutos(
                      a.tiempoJuego
                    );
                  } else {
                    a.tiempoJuegoStr = "00:00";
                  }
                });

                this.partido.jugadores.forEach((jugador_) => {
                  // esta propiedad para editar el tiempo de jugador y comparar con el que ya estaba
                  jugador_.tiempoJuegoEditar = jugador_.tiempoJuego;
                  jugadores.forEach((a) => {
                    if (a.id == jugador_.id) {
                      a.isChecked = true;
                      return;
                    }
                  });
                });

                jugadores.sort(
                  (a: Jugador, b: Jugador) => b.createdAt - a.createdAt
                );
                this.rerender();
              })
            );

            this.equipoSeleccionado = this.equipos
              .get(partido_.idEquipo)
              .pipe(take(1))
              .toPromise()
              .then((equipo: Equipo) => {
                if (equipo) {
                  this.nombreEquipoSeleccionado = equipo.title;
                  this.equipoSeleccioado = equipo;
                } else {
                  this.navigation.redirectTo("equipos", "list");
                }
              });
          } else {
            this.navigation.redirectTo("partidos", "list");
          }
        });
    });
  }

  changed(jugador: Jugador) {
    var exist = false;
    this.partido.jugadores.forEach((juga) => {
      if (juga.id == jugador.id) exist = true;
    });

    if (!exist) {
      let jugador_ = Object.assign({
        id: jugador.id,
        firstName: jugador.firstName,
        lastName: jugador.lastName,
        tiempoJuego: 0,
        puesto: jugador.posicion,
      });
      jugador_.tiempoJuego = 0;
      this.partido.jugadores.push(jugador_);
    } else {
      var index_ = this.partido.jugadores.findIndex(
        (_jugador) => _jugador.id == jugador.id
      );
      this.partido.jugadores.splice(index_, 1);
    }
  }

  addIncidencia() {
    this.partido.incidencias.push({ minuto: 0, jugador: "", incidencia: "" });
  }

  rerender(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance)
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
    });
    this.dataTableTriggerJugadores.next();
    this.dataTableTriggerFormacion.next();
    this.dataTableTriggerIncidencias.next();
  }

  eliminarIncidencia(index: any) {
    this.partido.incidencias.splice(index, 1);
  }

  ngAfterViewInit() {}

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  onImageChange(event: Event) {
    this.image = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result;
    };
    reader.readAsDataURL(this.image);
  }

  savePartido(event: Event) {
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

    // Edit partido
    const partido_: Partido = {
      rival: this.partido.rival,
      cancha: this.partido.cancha,
      incidencias: this.partido.incidencias,
      nombreEquipo: this.nombreEquipoSeleccionado,
      date: new Date(this.date).getTime(),
      idEquipo: this.partido.idEquipo,
      status: this.partido.status,
      jugadores: this.partido.jugadores,
      resultado: this.partido.resultado,
      resultadoRival: this.partido.resultadoRival,
      tackles: this.partido.tackles == undefined ? 0 : this.partido.tackles,
      lines: this.partido.lines == undefined ? 0 : this.partido.lines,
      amarillas:
        this.partido.amarillas == undefined ? 0 : this.partido.amarillas,
      rojas: this.partido.rojas == undefined ? 0 : this.partido.rojas,
      scrums: this.partido.scrums == undefined ? 0 : this.partido.scrums,
      penales: this.partido.penales == undefined ? 0 : this.partido.penales,
      rucks: this.partido.rucks == undefined ? 0 : this.partido.rucks,
      updatedAt: now(),
      // updatedBy: this.currentUser.id,
    };

    partido_.jugadores.forEach((jugadorPartido) => {
      this.misJugadores.forEach(async (jugador) => {
        if (jugador.id == jugadorPartido.id) {
          if (jugadorPartido.tiempoJuegoEditar !== jugadorPartido.tiempoJuego) {
            jugador.tiempoJuego =
              jugador.tiempoJuego +
              Number(jugadorPartido.tiempoJuegoEditar) -
              jugadorPartido.tiempoJuego;
            jugadorPartido.tiempoJuego = Number(
              jugadorPartido.tiempoJuegoEditar
            );
            await this.jugadoresService.editarTiemposJugadores(jugador);
          }
        }
      });
    });

    this.partidos
      .edit(this.partido.id, partido_)
      .then(() => {
        if (!this.equipoSeleccioado.partidos.includes(this.partido.id)) {
          this.equipoSeleccioado.partidos.push(this.partido.id);
        }
        this.equipos.edit(this.equipoSeleccioado.id, {
          title: this.equipoSeleccioado.title,
          divisionId: "",
          partidos: this.equipoSeleccioado.partidos,
        });

        this.alert.success(
          "Partido actualizado correctamente",
          false,
          5000,
          true
        );

        // this.jugadoresService.editarTiemposJugadores();
        this.navigation.redirectTo("partidos", "list");
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      })
      .finally(() => {
        stopLoading();
      });
  }
}

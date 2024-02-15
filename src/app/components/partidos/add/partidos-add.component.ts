import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { initTextEditor } from "../../../helpers/posts.helper";
import { I18nService } from "../../../services/i18n.service";
import { SettingsService } from "../../../services/settings.service";
import { slugify } from "../../../helpers/functions.helper";
import { Language } from "../../../models/language.model";
import { CategoriesService } from "../../../services/collections/categories.service";
import { Category } from "../../../models/collections/category.model";
import { Observable, Subject } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { AlertService } from "../../../services/alert.service";
import { PartidosService } from "../../../services/collections/partidos.service";
import { NavigationService } from "../../../services/navigation.service";
import { PartidoStatus } from "../../../models/collections/partido.model";
import { getEmptyImage } from "../../../helpers/assets.helper";
import { JugadoresService } from "../../../services/collections/jugadores.service";
import { EquiposService } from "../../../services/collections/equipos.service";
import { Equipo } from "../../../models/collections/equipo.model";

@Component({
  selector: "fa-posts-add",
  templateUrl: "./partidos-add.component.html",
  styleUrls: ["./partidos-add.component.css"],
})
export class PartidosAddComponent implements OnInit, AfterViewInit, OnDestroy {
  title: string;
  private status: PartidoStatus;
  selectedEquipo: string;
  date: string;
  equiposObservable: Observable<Equipo[]>;
  isSubmitButtonsDisabled: boolean = false;
  cancha: string;
  isLoading: any;
  idEquipo: string;
  allEquipos: Equipo[];

  constructor(
    private i18n: I18nService,
    private settings: SettingsService,
    private equipos: EquiposService,
    private alert: AlertService,
    private partidos: PartidosService,
    private navigation: NavigationService
  ) {}

  ngOnInit() {
    this.status = PartidoStatus.Draft;
    this.date = new Date().toISOString().slice(0, 10);
    this.equiposObservable = this.equipos.getAll().pipe(
      map((_equipo: Equipo[]) => {
        this.allEquipos = _equipo;
        return _equipo.sort(
          (a: Equipo, b: Equipo) => b.createdAt - a.createdAt
        );
      })
    );
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}

  async addPartido(event: Event, status?: PartidoStatus) {
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

    // Add post
    if (status) {
      this.status = status;
    }

    const nombreEquipoSeleccionado = this.allEquipos.find((equipo) => {
      return equipo.id == this.selectedEquipo;
    });

    
    this.partidos
      .add({
        rival: this.title,
        jugadores: [],
        incidencias: [{}],
        nombreEquipo: nombreEquipoSeleccionado.title,
        idEquipo: this.selectedEquipo,
        date: Date.parse(new Date(this.date).toISOString()),
        cancha: this.cancha,
        status: this.status,
        penales: 0,
        tackles: 0,
        rucks: 0,
        lines: 0,
        rojas:0,
        resultado: 0,
        resultadoRival: 0,
        amarillas:0,
        scrums: 0
      })
      .then((docId: any) => {
        nombreEquipoSeleccionado.partidos.push(docId)
        this.equipos.edit(this.selectedEquipo , {title: nombreEquipoSeleccionado.title, 
          divisionId: "",
          partidos: nombreEquipoSeleccionado.partidos, updatedBy:nombreEquipoSeleccionado.updatedBy});
        this.alert.success(
          "Partido agregado correctamente!",
          false,
          5000,
          true
        );
        this.navigation.redirectTo("partidos", "edit", docId);
      })
      .catch((error: Error) => {
        this.alert.error(error.message);
      })
      .finally(() => {
        stopLoading();
      });
  }

  publishPartido(event: Event) {
    this.addPartido(event, PartidoStatus.Published);
  }
}

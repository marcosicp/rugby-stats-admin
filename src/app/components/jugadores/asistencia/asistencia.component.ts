import { Component, OnInit } from "@angular/core";
import { getDefaultAvatar, getLogo } from "../../../helpers/assets.helper";
import { UserRole } from "../../../models/collections/user.model";
// import { UsersService } from '../../../services/collections/jugadores.service';
import { AlertService } from "../../../services/alert.service";
import { I18nService } from "../../../services/i18n.service";
import { NavigationService } from "../../../services/navigation.service";
import { JugadoresService } from "../../../services/collections/jugadores.service";
import { JugadorRole } from "../../../models/collections/jugador.model";
import * as Papa from "papaparse";
// import * as XLSX from "xlsx";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "fa-jugadores-asistencia",
  templateUrl: "./asistencia.component.html",
  styleUrls: ["./asistencia.component.css"],
})
export class AsistenciaComponent implements OnInit {
  logo: string = getLogo();

  error: string = null;
  private routeSubscription: Subscription = null;

  dni: string;
  idEntrenamiento: string;

  constructor(
    private jugadores: JugadoresService,
    private alert: AlertService,
    private i18n: I18nService,
    private route:ActivatedRoute,
    private navigation: NavigationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe( params =>{
      this.idEntrenamiento = params['identrenamiento']
    }
    )
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  onSubmit(event: Event, form: HTMLFormElement) {
    const target = event.target as any;

    const startLoading = () => {
      target.isDisabled = true;
      target.isLoading = true;
    };
    const stopLoading = () => {
      target.isDisabled = false;
      target.isLoading = false;
    };
    startLoading();

    this.jugadores
      .asistencia(this.dni, this.idEntrenamiento)
      .then((value) => {
        stopLoading();
        this.alert.success("Guardado correctamente")
      })
      .catch((error) => {
        stopLoading();
        this.alert.error("Error al guardar")
      });
  }
}

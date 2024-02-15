import { Component, OnInit } from "@angular/core";
import { getDefaultAvatar } from "../../../helpers/assets.helper";
import { UserRole } from "../../../models/collections/user.model";
// import { UsersService } from '../../../services/collections/jugadores.service';
import { AlertService } from "../../../services/alert.service";
import { I18nService } from "../../../services/i18n.service";
import { NavigationService } from "../../../services/navigation.service";
import { JugadoresService } from "../../../services/collections/jugadores.service";
import { JugadorRole } from "../../../models/collections/jugador.model";
import * as Papa from "papaparse";
import * as XLSX from "xlsx";

@Component({
  selector: "fa-jugadores-add",
  templateUrl: "./jugadores-add.component.html",
  styleUrls: ["./jugadores-add.component.css"],
})
export class JugadoresAddComponent implements OnInit {
  firstName: string;
  lastName: string;
  direccion: string;
  dni: string;
  fichaMedica: boolean;
  email: string;
  // password: string;
  birthDate: string;
  role: JugadorRole;
  allRoles: object | any = {};
  bio: string;
  private avatar: File;
  avatarSrc: string | ArrayBuffer;
  tackles: number;
  posicion: string;
  tiempoJuego: number;
  tarjetasAmarillas: number;
  csvData: any[] = [];
  obraSocial: string;
  datosFamiliares: {padre:"", madre:"", telefonoMadre:"", telefonoPadre:""};

  constructor(
    private jugadores: JugadoresService,
    private alert: AlertService,
    private i18n: I18nService,
    private navigation: NavigationService
  ) {}

  ngOnInit() {
    this.allRoles = this.jugadores.getAllRoles();
    this.role = JugadorRole.Guest;
    this.avatar = null;
    this.avatarSrc = getDefaultAvatar();
    this.bio = null;
  }

  onAvatarChange(event: Event) {
    this.avatar = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarSrc = reader.result;
    };
    reader.readAsDataURL(this.avatar);
  }

  onFileSelected(event: any): void {
  

    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error("Cannot use multiple files");
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: "binary" });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
      console.log(data); // Data will be logged in array format containing objects

      this.jugadores.addMany(data);
    };
  }

  addJugador(event: Event, form: HTMLFormElement) {
    form.isSubmitted = true;
    if (form.checkValidity()) {
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
      // Add user
      this.jugadores
        .add({
          firstName: this.firstName,
          lastName: this.lastName,
          email: "",
          lesionado: false,
          posicion: this.posicion,
          tackles: 0,
          tiempoJuego: 0,
          datosFamiliares: this.datosFamiliares,
          obraSocial: this.obraSocial,
          tarjetasAmarillas: 0,
          dni: this.dni,
          // password: this.password,
          birthDate: this.birthDate ? new Date(this.birthDate).getTime() : null,
          role: JugadorRole.Guest,
          bio: this.bio,
          avatar: "",
        })
        .then(() => {
          this.alert.success(this.i18n.get("UserAdded"), false, 5000, true);
          this.navigation.redirectTo("jugadores", "list");
        })
        .catch((error: Error) => {
          this.alert.error(error.message);
        })
        .finally(() => {
          stopLoading();
        });
    }
  }
}

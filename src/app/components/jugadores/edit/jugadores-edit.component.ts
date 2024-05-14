import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsersService } from '../../../services/collections/users.service';
import { I18nService } from '../../../services/i18n.service';
import { AlertService } from '../../../services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { NavigationService } from '../../../services/navigation.service';
import { Jugador, JugadorRole } from '../../../models/collections/jugador.model';
import { JugadoresService } from '../../../services/collections/jugadores.service';

@Component({
  selector: 'fa-users-edit',
  templateUrl: './jugadores-edit.component.html',
  styleUrls: ['./jugadores-edit.component.css']
})
export class JugadoresEditComponent implements OnInit, OnDestroy {

  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  role: JugadorRole;
  allRoles: object|any = {};
  bio: string;
  private avatar: File;
  avatarSrc: string|ArrayBuffer;
  private subscription: Subscription = new Subscription();
  userData: Jugador; // used to keep track of old user data
  tackles: number=0;
  tiempoJuego: number=0;
  tarjetasAmarillas: number=0;
  lesionado: boolean;
  posicion: string;
  division: string;
  obraSocial: string;
  datosFamiliares: {padre: string, madre:string, telefonoMadre:string, telefonoPadre:string};
  dni:string;
  padre: string;
  madre: string;
  telefonoMadre: string;
  telefonoPadre:string;

  constructor(
    // private users: UsersService,
    private i18n: I18nService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private jugadores: JugadoresService,
    public navigation: NavigationService
  ) { }

  ngOnInit() {
    this.allRoles = this.jugadores.getAllRoles();
    this.subscription.add(
      this.route.params.subscribe((params: { id: string }) => {
        // console.log(params);
        this.jugadores.get(params.id).pipe(take(1)).toPromise().then((user: Jugador) => {
          // console.log(user);
          if (user) {
            this.userData = user;
            this.id = params.id;
            this.firstName = user.firstName;
            this.lastName = user.lastName;
            this.email = user.email;
            this.lesionado= false;
            this.posicion= this.userData.posicion;
            this.tackles= this.tackles;
            this.tiempoJuego=this.tiempoJuego;
            this.tarjetasAmarillas= this.tarjetasAmarillas;
            this.obraSocial = this.userData.obraSocial;
            this.datosFamiliares = this.userData.datosFamiliares;
            this.madre=this.userData.datosFamiliares.madre;
            this.padre =this.userData.datosFamiliares.padre;
            this.telefonoMadre= this.userData.datosFamiliares.telefonoMadre;
            this.telefonoPadre = this.userData.datosFamiliares.telefonoPadre;
            this.birthDate = user.birthDate ? new Date(user.birthDate).toISOString().slice(0, 10) : null;
            this.role = user.role;
            this.bio = user.bio;
            this.dni=user.dni;
            this.avatar = null;
           
          } else {
            this.navigation.redirectTo('jugadores', 'list');
          }
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onAvatarChange(event: Event) {
    this.avatar = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarSrc = reader.result;
    };
    reader.readAsDataURL(this.avatar);
  }

  updateUser(event: Event, form: HTMLFormElement) {
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
      // Edit user

      const data: Jugador = {
        firstName: this.firstName,
        lastName: this.lastName,
        dni:this.dni,
        lesionado: false,
        posicion: this.posicion,
        divisionId: this.division,
        obraSocial: this.obraSocial,
        datosFamiliares: {padre: this.padre, madre: this.madre, telefonoMadre: this.telefonoMadre==undefined ? "":this.telefonoMadre, telefonoPadre: this.telefonoPadre ==undefined?"":this.telefonoPadre},
        tackles: this.tackles,
        tiempoJuego: this.tiempoJuego,
        tarjetasAmarillas: this.tarjetasAmarillas,
        
        email: this.email,
        birthDate: this.birthDate ? new Date(this.birthDate).getTime() : null,
        role: this.role,
        bio: this.bio
      };
      if (this.avatar) {
        data.avatar = this.avatar;
      }
      this.jugadores.edit(this.id, data, {
        email: this.userData.email
      }).then(() => {
        this.userData = {...this.userData, ...data}; // override old user data
        this.alert.success(this.i18n.get('UserUpdated'), false, 5000);
      }).catch((error: Error) => {
        this.alert.error(error.message);
      }).finally(() => {
        stopLoading();
      });
    }
  }

}

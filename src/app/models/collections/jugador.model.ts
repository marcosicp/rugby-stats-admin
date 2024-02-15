import { Observable } from 'rxjs';

export enum JugadorRole {
  Guest = 'guest'
}

export interface Jugador {
  id?: string; // document id == firebase user id
  firstName: string;
  lastName: string;
  dni:string;
  email: string;
  posicion: string;
  obraSocial: string;
  datosFamiliares: {padre: string, madre:string, telefonoMadre:string, telefonoPadre:string};
  tiempoJuego: number;
  tarjetasAmarillas: number;
  lesionado: boolean;
  tackles: number;
  // password: string;
  birthDate: number; // timestamp
  role: JugadorRole.Guest;
  bio: string;
  avatar?: File|string|Observable<string>|{ path: string|any, url: string|Observable<string> };
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string; // creator id
  creator?: string|Observable<string>; // used to fetch creator name without overriding createdBy field
  updatedBy?: string;
}


export enum JugadorStatus {
  Draft = 'draft',
  Published = 'published',
  Trash = 'trash',
  Minutos = 'minuntos',
  Id = 'id'

}
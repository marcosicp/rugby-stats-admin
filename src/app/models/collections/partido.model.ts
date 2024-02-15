import { Observable } from 'rxjs';
import { DocumentTranslation } from './document-translation';

export interface Partido {
  amarillas: number;
  id?: string;
  // lang: string;
  rival: string;
  rojas: number;
  date: number; // timestamp
  penales: number; 
  tackles: number; 
  rucks: number; 
  lines: number;
  scrums: number;
  resultado: number;  
  resultadoRival: number;
  incidencias: [{}];
  // image?: File|string|Observable<string>|{ path: string|any, url: string|Observable<string> };
  cancha: string;
  status: PartidoStatus;
  jugadores: any;
  idEquipo: string;
  nombreEquipo: string;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  author?: string|Observable<string>;
  updatedBy?: string;
  // translationId?: string;
  // translations?: PostTranslation; // used to store translations on object fetch
  // isTranslatable?: boolean;
}

export enum PartidoStatus {
  Draft = 'draft',
  Published = 'published',
  Trash = 'trash'
}

// export interface PostTranslation extends DocumentTranslation { }

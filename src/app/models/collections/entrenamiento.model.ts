import { Observable } from 'rxjs';
import { DocumentTranslation } from './document-translation';

export interface Entrenamiento {
  id?: string;
  titulo: string;
  date: number; // timestamp
  propiedades: any;
  jugadores: any;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  author?: string|Observable<string>;
  updatedBy?: string;
}

export enum EntrenamientoStatus {
  Draft = 'draft',
  Published = 'published',
  Trash = 'trash'
}

// export interface PostTranslation extends DocumentTranslation { }

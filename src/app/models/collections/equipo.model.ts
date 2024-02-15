import { DocumentTranslation } from './document-translation';
import { Observable } from 'rxjs';

export interface Equipo {
  id?: string;
  title: string;
  partidos?: string[]
  divisionId: string;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  // author?: string|Observable<string>;
  updatedBy?: string;
}

export interface PageBlock {
  key?: string;
  name: string;
  type: PageBlockType;
  content: string;
}

export enum PageBlockType {
  Text = 'text',
  HTML = 'html',
  JSON = 'json'
}

// export interface PageTranslation extends DocumentTranslation { }

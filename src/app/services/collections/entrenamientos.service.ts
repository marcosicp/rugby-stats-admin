import { Injectable } from "@angular/core";
import { DatabaseService } from "../database.service";
// import {
//   Entrenamiento,
//   PostTranslation,
//   PostStatus,
// } from "../../models/collections/partido.model";
import { now, guid, isFile } from "../../helpers/functions.helper";
import { StorageService } from "../storage.service";
import { map, take, mergeMap } from "rxjs/operators";
import { of, merge, Observable } from "rxjs";
import { getEmptyImage, getLoadingImage } from "../../helpers/assets.helper";
import { SettingsService } from "../settings.service";
import { Language } from "../../models/language.model";
import { UsersService } from "./users.service";
import { QueryFn } from "@angular/fire/firestore";
import { Entrenamiento } from "../../models/collections/entrenamiento.model";
// import { DocumentTranslationsService } from './abstract/document-translations.service';
// import { PartidoStatus, Entrenamiento } from '../../models/collections/partido.model';

@Injectable()
export class EntrenamientosService {
  private allStatus: object = {};
  private statusColors: object = {
    draft: "warning",
    published: "success",
    trash: "danger",
  };
  private imagesCache: object = {};

  constructor(
    protected db: DatabaseService,
    private storage: StorageService,
    private settings: SettingsService,
    private users: UsersService
  ) {
    
  }

  getAllStatus() {
    return this.allStatus;
  }

  getAllStatusWithColors() {
    return { labels: this.allStatus, colors: this.statusColors };
  }

  getStatus(statusKey: string) {
    return this.allStatus[statusKey];
  }

  add(data: Entrenamiento) {
    const entrenamiento: Entrenamiento = {
      titulo: data.titulo,
      jugadores: data.jugadores,
      date: data.date,
      propiedades: {},
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null,
    };

    return new Promise((resolve, reject) => {
      this.db
        .addDocument("entrenamientos", entrenamiento)
        .then((doc: any) => {
          resolve(doc.id);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  translate(data: Entrenamiento) {
    return this.add(data);
  }

  get(id: string) {
    return this.db.getDocument("entrenamientos", id).pipe(
      mergeMap(async (post: Entrenamiento) => {
        // const translations = await this.getTranslations(post.translationId).pipe(take(1)).toPromise();
        post.id = id;
        // post.translations = translations;
        return post;
      })
    );
  }

  private pipeEntrenamientos(postsObservable: Observable<Entrenamiento[]>) {
    return postsObservable.pipe(
      mergeMap(async (posts: Entrenamiento[]) => {
        
        // posts.forEach((post: Entrenamiento) => { // forEach loop doesn't seems to work well with async/await
        for (let post of posts) {
        
          post.author = post.createdBy
            ? this.users.getFullName(post.createdBy)
            : of(null);
      
        }

        return posts;
      })
    );
  }

  getAll() {
    return this.pipeEntrenamientos(this.db.getCollection("entrenamientos"));
  }

  getWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string,
    applyPipe: boolean = false
  ) {
    return this.getWhereFn(
      (ref) => ref.where(field, operator, value),
      applyPipe
    );
  }

  getWhereFn(queryFn: QueryFn, applyPipe: boolean = false) {
    const postsObservable = this.db.getCollection("entrenamientos", queryFn);
    return applyPipe ? this.pipeEntrenamientos(postsObservable) : postsObservable;
  }

  edit(id: string, data: Entrenamiento) {
    const entrenamiento: Entrenamiento = {
      titulo: data.titulo,
      jugadores: data.jugadores,
      date: data.date,
      propiedades: data.propiedades,
      updatedAt: now(),
      updatedBy: this.db.currentUser.id,
    };

    return new Promise<void>((resolve, reject) => {
      this.db
        .setDocument("entrenamientos", id, entrenamiento)
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  async delete(id: string) {
    return new Promise<void>((resolve, reject) => {
      this.db
        .deleteDocument("entrenamientos", id)
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  countAll() {
    return this.db.getDocumentsCount("entrenamientos");
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount("entrenamientos", queryFn);
  }

  countWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.countWhereFn((ref) => ref.where(field, operator, value));
  }
}

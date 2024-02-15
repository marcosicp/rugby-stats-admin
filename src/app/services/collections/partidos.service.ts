import { Injectable } from "@angular/core";
import { DatabaseService } from "../database.service";
// import {
//   Partido,
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
// import { DocumentTranslationsService } from './abstract/document-translations.service';
import { PartidoStatus, Partido } from "../../models/collections/partido.model";

@Injectable()
export class PartidosService {
  private allStatus: object = {};
  private statusColors: object = {
    draft: "warning",
    published: "success",
    trash: "danger",
  };
  private imagesCache: object = {};
  partidos: Partido[];

  constructor(
    protected db: DatabaseService,
    private storage: StorageService,
    private settings: SettingsService,
    private users: UsersService
  ) {
    // super(db, 'postTranslations');
    Object.keys(PartidoStatus).forEach((key: string) => {
      this.allStatus[PartidoStatus[key]] = key;
    });
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

  add(data: Partido) {
    const partido: Partido = {
      rival: data.rival,
      jugadores: [],
      date: data.date,
      incidencias: [{}],
      nombreEquipo: data.nombreEquipo,
      idEquipo: data.idEquipo,
      cancha: data.cancha,
      status: data.status,
      createdAt: now(),
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null,
      penales: data.penales,
      tackles: data.tackles,
      rucks: data.rucks,
      lines: data.lines,
      scrums: data.scrums,
      resultado: data.resultado,
      resultadoRival: data.resultadoRival,
      amarillas: data.amarillas,
      rojas: data.rojas,
    };

    return new Promise((resolve, reject) => {
      this.db
        .addDocument("partidos", partido)
        .then((doc: any) => {
          resolve(doc.id);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  translate(data: Partido) {
    return this.add(data);
  }

  private uploadImage(id: string, imageFile: File) {
    return new Promise<void>((resolve, reject) => {
      if (imageFile && isFile(imageFile)) {
        const imageName = guid() + "." + imageFile.name.split(".").pop();
        const imagePath = `partidos/${id}/${imageName}`;
        this.storage
          .upload(imagePath, imageFile)
          .then(() => {
            this.db
              .setDocument("partidos", id, { image: imagePath })
              .then(() => {
                resolve();
              })
              .catch((error: Error) => {
                reject(error);
              });
          })
          .catch((error: Error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    });
  }

  get(id: string) {
    return this.db.getDocument("partidos", id).pipe(
      mergeMap(async (partido: Partido) => {
        // const translations = await this.getTranslations(post.translationId).pipe(take(1)).toPromise();
        partido.id = id;
        // post.translations = translations;
        return partido;
      })
    );
  }

  // getTranslationLanguages(post: Partido) {
  //   const postLanguages = Object.keys(post.translations);
  //   return this.settings
  //     .getActiveSupportedLanguages()
  //     .filter((lang: Language) => postLanguages.indexOf(lang.key) === -1);
  // }

  getImageUrl(imagePath: string) {
    if (this.imagesCache[imagePath]) {
      return of(this.imagesCache[imagePath]);
    } else {
      return this.storage
        .get(imagePath)
        .getDownloadURL()
        .pipe(
          map((imageUrl: string) => {
            this.imagesCache[imagePath] = imageUrl;
            return imageUrl;
          })
        );
    }
  }

  private pipePartidos(postsObservable: Observable<Partido[]>) {
    return postsObservable.pipe(
      mergeMap(async (posts: Partido[]) => {
        const activeSupportedLanguages = this.settings
          .getActiveSupportedLanguages()
          .map((lang: Language) => lang.key);
        //posts.forEach((post: Partido) => { // forEach loop doesn't seems to work well with async/await
        for (let post of posts) {
          post.author = post.createdBy
            ? this.users.getFullName(post.createdBy)
            : of(null);
        }

        return posts;
      })
    );
  }

  getAllMaped() {
    return this.pipePartidos(this.db.getCollection("partidos")).pipe(
      map((partidos: any[]) => {
        this.partidos = partidos;
      })
    );
    // this.partidos =
    // return this.pipePartidos(this.db.getCollection("partidos"));
  }

  getAll() {
    return this.db.getCollection("partidos");
    
    // this.partidos =
    // return this.pipePartidos(this.db.getCollection("partidos"));
  }

  getAllPromise() {
    return this.db.getCollection("partidos");
    
    // this.partidos =
    // return this.pipePartidos(this.db.getCollection("partidos"));
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
    const postsObservable = this.db.getCollection("partidos", queryFn);
    return applyPipe ? this.pipePartidos(postsObservable) : postsObservable;
  }

  async getWhereFnAsync(queryFn: QueryFn, applyPipe: boolean = false) {
    const postsObservable = this.db
      .getCollection("partidos", queryFn)
      .toPromise();
    return await postsObservable;
  }

  edit(id: string, partido: Partido) {
    

    partido.updatedBy = this.db.currentUser.id;

    return new Promise<void>((resolve, reject) => {
      this.db
        .setDocument("partidos", id, partido)
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
        .deleteDocument("partidos", id)
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  setStatus(id: string, status: PartidoStatus) {
    return this.db.setDocument("partidos", id, { status: status });
  }

  countAll() {
    return this.db.getDocumentsCount("partidos");
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount("partidos", queryFn);
  }

  countWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.countWhereFn((ref) => ref.where(field, operator, value));
  }
}

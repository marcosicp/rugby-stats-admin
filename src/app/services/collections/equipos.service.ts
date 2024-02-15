import { Injectable } from "@angular/core";
import { DatabaseService } from "../database.service";
import { UsersService } from "./users.service";
import { DocumentTranslationsService } from "./abstract/document-translations.service";
// import { Page, PageBlock, PageTranslation } from '../../models/collections/page.model';
import { now } from "../../helpers/functions.helper";
import { mergeMap, take } from "rxjs/operators";
import { SettingsService } from "../settings.service";
import { Language } from "../../models/language.model";
import { Observable, of } from "rxjs";
import { QueryFn } from "@angular/fire/firestore";
import { Equipo } from "../../models/collections/equipo.model";
// import { PageBlock, Page } from '../../models/collections/page.model';

@Injectable()
export class EquiposService extends DocumentTranslationsService {
  constructor(
    protected db: DatabaseService,
    private settings: SettingsService,
    private users: UsersService
  ) {
    super(db, "pageTranslations");
  }

  add(data: Equipo, translationId?: string) {
    const equipo: Equipo = {
      title: data.title,
      // lang: data.lang,
      // slug: data.slug,
      divisionId: data.divisionId,
      partidos: data.partidos,
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null,
    };
    return new Promise<void>((resolve, reject) => {
      this.db
        .addDocument("equipos", equipo)
        .then((doc: any) => {
          resolve();         
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  get(id: string) {
    return this.db.getDocument("equipos", id).pipe(
      mergeMap(async (equipo: Equipo) => {
        equipo.id = id;
        return equipo;
      })
    );
  }

  private pipePages(pagesObservable: Observable<Equipo[]>) {
    return pagesObservable.pipe(
      mergeMap(async (equipo: Equipo[]) => {
        const activeSupportedLanguages = this.settings
          .getActiveSupportedLanguages()
          .map((lang: Language) => lang.key);
        //pages.forEach((page: Page) => { // forEach loop doesn't seems to work well with async/await
        // for (let page of equipo) {
        //   page.author = page.createdBy
        //     ? this.users.getFullName(page.createdBy)
        //     : of(null);
        // }
        return equipo;
      })
    );
  }

  getAll() {
    return this.pipePages(this.db.getCollection("equipos"));
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
    const pagesObservable = this.db.getCollection("equipos", queryFn);
    return applyPipe ? this.pipePages(pagesObservable) : pagesObservable;
  }

  edit(id: string, data: Equipo) {
    const equipo: Equipo = {
      title: data.title,
      partidos: data.partidos,
      divisionId: data.divisionId,
      updatedAt: now(),
      updatedBy: data.updatedBy,
    };

    return new Promise<void>((resolve, reject) => {
      this.db
        .setDocument("equipos", id, equipo)
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  delete(id: string) {
    return new Promise<void>((resolve, reject) => {
      // this.deleteTranslation(data.translationId, data.lang, data.translations).then(() => { // should be done before deleting document (pages observable will be synced before if not)
      this.db
        .deleteDocument("equipos", id)
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    }).catch((error: Error) => {
      reject(error);
    });
    // });
  }

  isSlugDuplicated(title: string, lang: string, id?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getWhereFn((ref) => ref.where("title", "==", title))
        .pipe(take(1))
        .toPromise()
        .then((equipo: Equipo[]) => {
          //console.log(pages, pages[0]['id']);
          resolve(
            equipo && equipo.length && (!id || (equipo[0]["id"] as any) !== id)
          );
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  countAll() {
    return this.db.getDocumentsCount("equipos");
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount("equipos", queryFn);
  }

  countWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.countWhereFn((ref) => ref.where(field, operator, value));
  }
}
function reject(error: Error) {
  throw new Error("Function not implemented.");
}

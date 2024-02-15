import { Injectable } from "@angular/core";
import { DatabaseService } from "../database.service";
import { UsersService } from "./users.service";
import { DocumentTranslationsService } from "./abstract/document-translations.service";
import { now } from "../../helpers/functions.helper";
import { mergeMap, take } from "rxjs/operators";
import { SettingsService } from "../settings.service";
import { Observable, of } from "rxjs";
import { QueryFn } from "@angular/fire/firestore";
import { Division } from "../../models/collections/division.model";


@Injectable()
export class DivisionesService extends DocumentTranslationsService {
  constructor(
    protected db: DatabaseService,
    private settings: SettingsService
    // private users: UsersService
  ) {
    super(db, "pageTranslations");
  }

  add(data: Division, translationId?: string) {
    const equipo: Division = {
      title: data.title,
      equipos: [],
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null,
    };
    return new Promise<void>((resolve, reject) => {
      this.db
        .addDocument("divisiones", equipo)
        .then((doc: any) => {
          // this.addTranslation(data.lang, doc.id, translationId).then((translation: any) => {
          //   doc.set({ translationId: translationId || translation.id}, { merge: true }).then(() => {
          resolve();
          //   }).catch((error: Error) => {
          //     reject(error);
          //   });
          // }).catch((error: Error) => {
          //   reject(error);
          // });
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  get(id: string) {
    return this.db.getDocument("divisiones", id).pipe(
      mergeMap(async (equipo: Division) => {
        equipo.id = id;
        return equipo;
      })
    );
  }

  private pipePages(pagesObservable: Observable<Division[]>) {
    return pagesObservable.pipe(
      mergeMap(async (divisiones_: Division[]) => {
        // const activeSupportedLanguages = this.settings
        //   .getActiveSupportedLanguages()
        //   .map((lang: Language) => lang.key);
        //pages.forEach((page: Page) => { // forEach loop doesn't seems to work well with async/await
        // for (let page of equipo) {
        //   page.author = page.createdBy
        //     ? this.users.getFullName(page.createdBy)
        //     : of(null);
        // }
        return divisiones_;
      })
    );
  }

  getAll() {
    return this.pipePages(this.db.getCollection("divisiones"));
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
    const pagesObservable = this.db.getCollection("divisiones", queryFn);
    return applyPipe ? this.pipePages(pagesObservable) : pagesObservable;
  }

  edit(id: string, data: Division) {
    const division: Division = {
      title: data.title,
      equipos: [],
      // slug: data.slug,
      updatedAt: now(),
      updatedBy: this.db.currentUser.id,
    };

    return new Promise<void>((resolve, reject) => {
      this.db
        .setDocument("divisiones", id, division)
        .then(() => {
          // replace blocks
          // this.db
          //   .updateDocument("equipos", id)
          //   .then(() => {
          resolve();
          //   })
          //   .catch((error: Error) => {
          //     reject(error);
          //   });
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
        .deleteDocument("divisiones", id)
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

  isSlugDuplicated(title: string, id?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getWhereFn((ref) => ref.where("title", "==", title))
        .pipe(take(1))
        .toPromise()
        .then((division_: Division[]) => {
          //console.log(pages, pages[0]['id']);
          resolve(
            division_ && division_.length && (!id || (division_[0]["id"] as any) !== id)
          );
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  countAll() {
    return this.db.getDocumentsCount("divisiones");
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount("divisiones", queryFn);
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

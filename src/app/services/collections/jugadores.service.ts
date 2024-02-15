import { Injectable } from "@angular/core";
import { DatabaseService } from "../database.service";
import { now, isFile, guid } from "../../helpers/functions.helper";
// import { Jugador, UserRole } from '../../models/collections/jugador.model';
import { StorageService } from "../storage.service";
// import { FirebaseUserService } from '../firebase-jugador.service';
import { getDefaultAvatar, getLoadingImage } from "../../helpers/assets.helper";
import { of, merge } from "rxjs";
import { map } from "rxjs/operators";
import { QueryFn } from "@angular/fire/firestore";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Jugador, JugadorRole } from "../../models/collections/jugador.model";
import { FirebaseUserService } from "../firebase-user.service";
import { AuthService } from "../auth.service";
import { FirebaseFunctions } from "@angular/fire";
import { FireAdminService } from "../../fire-admin.service";
import { AngularFireFunctions } from "@angular/fire/functions";

@Injectable()
export class JugadoresService {
  private allRoles: object = {};
  private imagesCache: object = {};
  private fullNameCache: object = {};
  private app: firebase.app.App;

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private firebaseUser: FirebaseUserService,
    private func: AngularFireFunctions,
    // private fas: FireAdminService,
    private auth: AuthService,
    private http: HttpClient
  ) {
    Object.keys(JugadorRole).forEach((key: string) => {
      this.allRoles[JugadorRole[key]] = key;
    });
  }

  getAllRoles() {
    return this.allRoles;
  }

  async add(data: Jugador) {
    const jugador: Jugador = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      lesionado: false,
      datosFamiliares: data.datosFamiliares,
      obraSocial: data.obraSocial,
      dni: data.dni,
      posicion: data.posicion,
      tackles: data.tackles,
      tiempoJuego: data.tiempoJuego,
      tarjetasAmarillas: data.tarjetasAmarillas,
      // password: data.password, // ToDo: add encryption for password (do not use hashing, since we need plain password on update/delete @see FirebaseUserService)
      birthDate: data.birthDate,
      role: data.role,
      bio: data.bio,
      avatar: null,
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null,
    };

    var token_ = await this.auth.firebaseUser.getIdToken();

    const data_ = { email: data.email, token: token_ };

    return new Promise<void>(async (resolve, reject) => {
      var funcCall = this.func.httpsCallable("createUser");
      funcCall(data_).subscribe((uid) => {
        this.uploadImageAfter(
          this.db.addDocument("jugadores", jugador, uid),
          jugador,
          data
        )
          .then(() => {
            resolve();
          })
          .catch((error: Error) => {
            reject(error);
          });
      });
    });
  }

  asistencia(email: string, idEntrenamiento: string) {
    const data_ = { dni: email, id: idEntrenamiento };

    return new Promise<void>(async (resolve, reject) => {
      this.func.functions.useFunctionsEmulator("http://localhost:5001");
      var funcCall = this.func.httpsCallable("asistenciaFn");

      funcCall(data_).subscribe((value) => {
        (success) => {
          // if(){}
          resolve();
        };
        (error) => {
          reject(error);
        };
      });
    });
  }

  async addMany(data: any[]) {
    data.forEach((element) => {
      const jugador: Jugador = {
        firstName:
          element["Apellido y Nombre"].split(",")[1] == undefined
            ? ""
            : element["Apellido y Nombre"].split(",")[1],
        lastName: element["Apellido y Nombre"].split(",")[0],
        dni: element["dni"] == undefined ? "" : element["dni"],
        email: "",
        lesionado: false,
        posicion: "",
        tackles: 0,
        datosFamiliares: {padre:"", madre:"", telefonoMadre:"", telefonoPadre:""},
        obraSocial: "",
        tiempoJuego: 0,
        tarjetasAmarillas: 0,
        birthDate: new Date(element["nacimiento"]).getTime(),
        role: JugadorRole.Guest,
        bio: "",
        avatar: null,
        createdAt: now(), // timestamp
        updatedAt: null,
        createdBy: this.db.currentUser.id,
        updatedBy: null,
      };
      this.db
        .addDocument("jugadores", jugador, jugador.dni.toString())
        .then(() => {
          return;
        })
        .catch((error: firebase.FirebaseError) => {
          // this.app.auth().signOut();
          return;
        });
    });

    // return new Promise<void>(async (resolve, reject) => {
    //   var funcCall = this.func.httpsCallable("createUser");
    //   funcCall(data_).subscribe((uid) => {
    //     this.uploadImageAfter(
    //       this.db.addDocument("jugadores", jugador, uid),
    //       jugador,
    //       data
    //     )
    //       .then(() => {
    //         resolve();
    //       })
    //       .catch((error: Error) => {
    //         reject(error);
    //       });
    //   });
    // });
  }

  // register(data: Jugador) {
  //   const jugador: Jugador = {
  //     firstName: data.firstName,
  //     lastName: data.lastName,
  //     email: data.email,
  //     // password: data.password, // ToDo: add encryption for password (do not use hashing, since we need plain password on update/delete @see FirebaseUserService)
  //     birthDate: data.birthDate,
  //     role: data.role,
  //     bio: data.bio,
  //     avatar: null,
  //     createdAt: now(), // timestamp
  //     updatedAt: null,
  //     createdBy: null,
  //     updatedBy: null,
  //   };
  //   return new Promise((resolve, reject) => {
  //     // this.db.addDocument('jugadores', userCredential.user.uid).then(() => {
  //     //   // this.app.firestore().collection('config').doc('registration').set({ enabled: false }, { merge: true }).then(() => {
  //     //   //   this.app.auth().signOut();
  //     //     resolve(userCredential.user.uid);
  //     //   // }).catch((error: firebase.FirebaseError) => {
  //     //   //   this.app.auth().signOut();
  //     //   //   reject(error);
  //     //   // });
  //     // }).catch((error: firebase.FirebaseError) => {
  //     //   this.app.auth().signOut();
  //     //   reject(error);
  //     // });
  //   });
  // }

  private uploadImageAfter(
    promise: Promise<any>,
    jugador: Jugador,
    data: Jugador
  ) {
    return new Promise<void>((resolve, reject) => {
      promise
        .then((doc: any) => {
          if (data.avatar && isFile(data.avatar)) {
            const id = doc ? doc.id : data.id;
            const imageFile = data.avatar as File;
            const imageName = guid() + "." + imageFile.name.split(".").pop();
            const imagePath = `jugadores/${id}/${imageName}`;
            this.storage
              .upload(imagePath, imageFile)
              .then(() => {
                jugador.avatar = imagePath;
                const savePromise: Promise<any> = doc
                  ? doc.set(jugador)
                  : this.db.setDocument("jugadores", id, jugador);
                savePromise.finally(() => {
                  resolve();
                });
              })
              .catch((error: Error) => {
                reject(error);
              });
          } else {
            resolve();
          }
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  get(id: string) {
    return this.db.getDocument("jugadores", id).pipe(
      map((jugador: Jugador) => {
        jugador.id = id;
        return jugador;
      })
    );
  }

  getFullName(id: string) {
    if (this.fullNameCache[id]) {
      return of(this.fullNameCache[id]);
    } else {
      return this.get(id).pipe(
        map((jugador: Jugador) => {
          const fullName = `${jugador.firstName} ${jugador.lastName}`;
          this.fullNameCache[id] = fullName;
          return fullName;
        })
      );
    }
  }

  getAll() {
    return this.db.getCollection("jugadores");
  }

  getAllPromise() {
    return this.db.getCollection("jugadores").toPromise();
  }

  getWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.getWhereFn((ref) => ref.where(field, operator, value));
  }

  getWhereFn(queryFn: QueryFn) {
    return this.db.getCollection("jugadores", queryFn);
  }

  getAvatarUrl(imagePath: string) {
    if (imagePath) {
      if (this.imagesCache[imagePath]) {
        return of(this.imagesCache[imagePath]);
      } else {
        return merge(
          of(getLoadingImage()),
          this.storage
            .get(imagePath)
            .getDownloadURL()
            .pipe(
              map((imageUrl: string) => {
                this.imagesCache[imagePath] = imageUrl;
                return imageUrl;
              })
            )
        );
      }
    } else {
      return of(getDefaultAvatar());
    }
  }

  edit(id: string, data: Jugador, oldData: { email: string }) {
    const jugador: Jugador = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      lesionado: false,
      dni: data.dni,
      obraSocial: data.obraSocial,
      datosFamiliares: data.datosFamiliares,
      posicion: data.posicion,
      tackles: data.tackles,
      tiempoJuego: data.tiempoJuego,
      tarjetasAmarillas: data.tarjetasAmarillas,
      // password: data.password,
      birthDate: data.birthDate,
      role: data.role,
      bio: data.bio,
      updatedAt: now(),
      updatedBy: this.db.currentUser.id,
    };
    if (/*data.avatar !== undefined && */ data.avatar === null) {
      jugador.avatar = null;
    }
    return new Promise<void>((resolve, reject) => {
      // this.updateEmail(oldData.email, oldData.password, data.email).then(() => {
      //   this.updatePassword(data.email, oldData.password).then(() => {
      this.uploadImageAfter(
        this.db.setDocument("jugadores", id, jugador),
        jugador,
        { ...data, id: id }
      )
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
      //   }).catch((error: Error) => {
      //     reject(error);
      //   });
      // }).catch((error: Error) => {
      //   reject(error);
      // });
    });
  }

  editarTiemposJugadores(data: Jugador) {
    return new Promise<void>((resolve, reject) => {
      this.db.updateDocumentProperty('jugadores', data.id, data.tiempoJuego).then
      (() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  private deleteImage(imagePath: string) {
    return new Promise<void>((resolve, reject) => {
      if (imagePath) {
        this.storage
          .delete(imagePath)
          .toPromise()
          .then(() => {
            resolve();
          })
          .catch((error: Error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    });
  }

  delete(id: string, data: { email: string; avatar: string }) {
    return new Promise<void>((resolve, reject) => {
      // this.firebaseUser.delete(data.email).then(() => {
      this.db
        .deleteDocument("jugadores", id)
        .then(() => {
          this.deleteImage(data.avatar)
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
      // }).catch((error: Error) => {
      //   reject(error);
      // });
    });
  }

  countAll() {
    return this.db.getDocumentsCount("jugadores");
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount("jugadores", queryFn);
  }

  countWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.countWhereFn((ref) => ref.where(field, operator, value));
  }
}

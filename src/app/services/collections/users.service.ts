import { Injectable } from "@angular/core";
import { DatabaseService } from "../database.service";
import { now, isFile, guid } from "../../helpers/functions.helper";
import { User, UserRole } from "../../models/collections/user.model";
import { StorageService } from "../storage.service";
import { FirebaseUserService } from "../firebase-user.service";
import { getDefaultAvatar, getLoadingImage } from "../../helpers/assets.helper";
import { of, merge } from "rxjs";
import { map } from "rxjs/operators";
import { QueryFn } from "@angular/fire/firestore";

@Injectable()
export class UsersService {
  private allRoles: object = {};
  private imagesCache: object = {};
  private fullNameCache: object = {};

  constructor(
    private db: DatabaseService,
    private storage: StorageService,
    private firebaseUser: FirebaseUserService
  ) {
    Object.keys(UserRole).forEach((key: string) => {
      this.allRoles[UserRole[key]] = key;
    });
  }

  getAllRoles() {
    return this.allRoles;
  }

  add(data: User) {
    const user: User = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      divisiones: data.divisiones,
      phone: data.phone,
      birthDate: data.birthDate,
      role: data.role,
      bio: data.bio,
      avatar: null,
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null,
    };
    return new Promise<void>((resolve, reject) => {
      this.firebaseUser.crearUsuario(data.email, data.firstName + " " + data.lastName ).subscribe((uid: string) => {
        if (uid.includes("Failed to create user")) {
          reject("Failed to create user");
        } else {
          // this.uploadImageAfter(
            this.db.addDocument("users", user, uid)
            .then(() => {
              resolve();
            })
            .catch((error: Error) => {
              reject(error);
            });
        }
      });
    });
  }

  register(data: User) {
    const user: User = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      divisiones: data.divisiones,
      phone: data.phone,
      birthDate: data.birthDate,
      role: data.role,
      bio: data.bio,
      avatar: null,
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: null,
      updatedBy: null,
    };
    return new Promise((resolve, reject) => {
      // this.firebaseUser.register(user).then(() => {
      //   resolve();
      // }).catch((error: Error) => {
      //   reject(error);
      // });
    });
  }

  private uploadImageAfter(promise: Promise<any>, user: User, data: User) {
    return new Promise<void>((resolve, reject) => {
      promise
        .then((doc: any) => {
          if (data.avatar && isFile(data.avatar)) {
            const id = doc ? doc.id : data.id;
            const imageFile = data.avatar as File;
            const imageName = guid() + "." + imageFile.name.split(".").pop();
            const imagePath = `users/${id}/${imageName}`;
            this.storage
              .upload(imagePath, imageFile)
              .then(() => {
                user.avatar = imagePath;
                const savePromise: Promise<any> = doc
                  ? doc.set(user)
                  : this.db.setDocument("users", id, user);
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
    return this.db.getDocument("users", id).pipe(
      map((user: User) => {
        user.id = id;
        return user;
      })
    );
  }

  getPromise(id: string): Promise<any> {
    return this.db.getDocument("users", id).toPromise()
    
  }

  getFullName(id: string) {
    if (this.fullNameCache[id]) {
      return of(this.fullNameCache[id]);
    } else {
      return this.get(id).pipe(
        map((user: User) => {
          const fullName = `${user.firstName} ${user.lastName}`;
          this.fullNameCache[id] = fullName;
          return fullName;
        })
      );
    }
  }

  getAll() {
    return this.db.getCollection("users");
  }

  getWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.getWhereFn((ref) => ref.where(field, operator, value));
  }

  getWhereFn(queryFn: QueryFn) {
    return this.db.getCollection("users", queryFn);
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

  // private updateEmail(email: string,  newEmail: string) {
  //   return new Promise((resolve, reject) => {
  //     if (newEmail !== email) {
  //       this.firebaseUser.updateEmail(email,  newEmail).then(() => {
  //         resolve();
  //       }).catch((error: Error) => {
  //         reject(error);
  //       });
  //     } else {
  //       resolve();
  //     }
  //   });
  // }

  edit(id: string, data: User, oldData: { email: string }) {
    const user: User = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      divisiones: data.divisiones,
      birthDate: data.birthDate,
      phone: data.phone,
      role: data.role,
      bio: data.bio,
      updatedAt: now(),
      updatedBy: this.db.currentUser.id,
    };
    if (/*data.avatar !== undefined && */ data.avatar === null) {
      user.avatar = null;
    }
    return new Promise<void>((resolve, reject) => {
      // this.updateEmail(oldData.email,  data.email).then(() => {
      // this.updatePassword(data.email, oldData.password, data.password).then(() => {
      this.uploadImageAfter(this.db.setDocument("users", id, user), user, {
        ...data,
        id: id,
      })
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
      // }).catch((error: Error) => {
      //   reject(error);
      // });
      // }).catch((error: Error) => {
      //   reject(error);
      // });
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
      // this.firebaseUser
      //   .delete(data.email)
      //   .then(() => {
      this.db
        .deleteDocument("users", id)
        .then(() => {
          // this.deleteImage(data.avatar)
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
    // .catch((error: Error) => {
    //   reject(error);
    // });
    // });
  }

  countAll() {
    return this.db.getDocumentsCount("users");
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount("users", queryFn);
  }

  countWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: string
  ) {
    return this.countWhereFn((ref) => ref.where(field, operator, value));
  }
}

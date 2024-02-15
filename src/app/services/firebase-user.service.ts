import { Injectable } from "@angular/core";
import { auth, initializeApp } from "firebase/app";
import { FireAdminService } from "../fire-admin.service";
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from "rxjs";

/**
 * This service is used to create/update users without signing out the current user
 * (otherwise, we'll need to use firebase functions or firebase-admin sdk)
 *
 * source idea: https://stackoverflow.com/a/38013551
 */

@Injectable()
export class FirebaseUserService {
  private app: firebase.app.App;

  constructor(private fas: FireAdminService, private func: AngularFireFunctions) {
    const config = FireAdminService.getFirebaseConfig(this.fas);
    // console.log(config);
    this.app = initializeApp(config, "FirebaseUserApp");
  }

  crearUsuario(email, displayName): Observable<any>{
    let calFunctionCreateUser =  this.func;
    // calFunctionCreateUser.functions.useFunctionsEmulator("http://localhost:5001");
    let funcCreateUser = calFunctionCreateUser.httpsCallable("createUser");
    
    // resolve(result);
    return funcCreateUser({"email": email, "displayName":displayName});
  }

  create(email: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.app
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential: auth.UserCredential) => {
          // console.log('User ' + userCredential.user.uid + ' created successfully!');
          this.app.auth().signOut();
          resolve(userCredential.user.uid);
        })
        .catch((error: firebase.FirebaseError) => {
          reject(error);
        });
    });
  }

  // register(user: User): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     this.app
  //       .auth()
  //       .createUserWithEmailAndPassword(user.email, user.password)
  //       .then((userCredential: auth.UserCredential) => {
  //         // console.log('User ' + userCredential.user.uid + ' created successfully!');
  //         this.app
  //           .firestore()
  //           .collection("users")
  //           .doc(userCredential.user.uid)
  //           .set(user)
  //           .then(() => {
  //             // this.app.firestore().collection('config').doc('registration').set({ enabled: false }, { merge: true }).then(() => {
  //             //   this.app.auth().signOut();
  //             resolve(userCredential.user.uid);
  //             // }).catch((error: firebase.FirebaseError) => {
  //             //   this.app.auth().signOut();
  //             //   reject(error);
  //             // });
  //           })
  //           .catch((error: firebase.FirebaseError) => {
  //             this.app.auth().signOut();
  //             reject(error);
  //           });
  //       })
  //       .catch((error: firebase.FirebaseError) => {
  //         reject(error);
  //       });
  //   });
  // }

  getTokenCurrentUser() {
    return this.app.auth().app.auth().currentUser.getIdToken();
  }

  // updateEmail(email: string,  newEmail: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.app
  //       .auth()
  //       .signInWithEmailAndPassword(email, password)
  //       .then(() => {
  //         this.app
  //           .auth()
  //           .currentUser.updateEmail(newEmail)
  //           .then(() => {
  //             resolve();
  //           })
  //           .catch((error: firebase.FirebaseError) => {
  //             reject(error);
  //           })
  //           .finally(() => {
  //             this.app.auth().signOut();
  //           });
  //       })
  //       .catch((error: firebase.FirebaseError) => {
  //         reject(error);
  //       });
  //   });
  // }

  
  delete(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // this.app.auth().signInWithEmailAndPassword(email, password).then(() => {
      //   this.app.auth().currentUser.delete().then(() => {
      // resolve();
      //   }).catch((error: firebase.FirebaseError) => {
      //     reject(error);
      //   }).finally(() => {
      //     this.app.auth().signOut();
      //   });
      // }).catch((error: firebase.FirebaseError) => {
      //   reject(error);
      // });
    });
  }
}

import functions = require("firebase-functions");
import admin = require("firebase-admin");
import { QueryDocumentSnapshot } from "firebase-functions/v1/firestore";
import { EventContext } from "firebase-functions";

const serviceAccount = require("./firebaseadminsdk.json");
//const serviceAccountDev = require("./");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// let db = admin.firestore();

const ListAllUsers = async (nextPageToken?: string) => {
  var AllUsers: admin.auth.UserRecord[] = [];
  const Res = await admin.auth().listUsers(1000, nextPageToken);

  AllUsers.push(...Res.users);

  if (Res.pageToken) {
    await ListAllUsers(Res.pageToken);
    return AllUsers;
  }
  return;
};

exports.getAllUsers = functions.https.onCall(
  async (_request: any, _context: any) => {
    var AllUsers = await ListAllUsers();

    const resultReturn = AllUsers!.map((user: admin.auth.UserRecord) => {
      const { uid, email, photoURL, displayName, disabled, metadata } = user;
      return {
        uid,
        email,
        photoURL,
        displayName,
        disabled,
        created: new Date(metadata.creationTime).toISOString(),
        lastLogin: new Date(metadata.lastSignInTime).toISOString(),
      };
    });
    return resultReturn;
  }
);

///DELETE USER
exports.deleteUser = functions.firestore
  .document("users/{userID}")
  .onDelete((snap: QueryDocumentSnapshot, _context: EventContext) => {
    // Get an object representing the document prior to deletion
    // e.g. {'name': 'Marie', 'age': 66}
    const deletedValue = snap.data();
    const uid = deletedValue.uid;
    admin
      .auth()
      .deleteUser(uid)
      .then(() => {
        console.log("Successfully deleted user");
        return;
      })
      .catch((error) => {
        console.log("Error deleting user:", error);
        return;
      });
  });

exports.asistenciaFn = functions.https.onCall(
  async (request: { dni: any; id: any }, response: any) => {
    console.log(request);
    console.log(request.dni);
    const dni = request.dni;
    const id = request.id;

    if (
      dni !== undefined &&
      dni !== null &&
      dni !== "" &&
      id !== null &&
      id !== "" &&
      id !== undefined
    ) {
      // TODO buscar entrenamiento primero para dar la asistencia
      // despues usar la sig func
      return admin
        .firestore()
        .collection("entrenamientos")
        .doc(id)
        .update({
          jugadores: admin.firestore.FieldValue.arrayUnion({id :dni}),
        });
     
    }
    return "Failed";

  }
);

exports.createUser = functions.https.onCall(
  (request: {
    displayName: any; email: any 
}, response: any) => {
    console.log(request);
    console.log(request.email);
    const email = request.email;
    const displayName = request.displayName;
    const password = "";
    // var asa = admin.app.UserRecord;
    if (email !== null && email !== "") {
      return admin
        .auth()
        .createUser({
          email: email,
          emailVerified: false,
          password: password,
          displayName: displayName,
          disabled: false,
        })
        .then((userRecord: { uid: any }) => {
          console.log(userRecord.uid);
          return userRecord.uid;
        })
        .catch((error: any) => {
          console.log(error);
          return "Failed to create user: ";
        });
    }
    return "Failed to create user: ";
    // }
  }
);

exports.getUserByEmail = functions.https.onCall(
  (data: { email: any }, context: any) => {
    try {
       return admin.auth().getUserByEmail(data.email).then((user)=>{
        return user.uid;
       });
     
    } catch (error) {
      return null;
    }
  }
);

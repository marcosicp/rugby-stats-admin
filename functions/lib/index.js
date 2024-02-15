"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseadminsdk.json");
//const serviceAccountDev = require("./");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
// let db = admin.firestore();
const ListAllUsers = async (nextPageToken) => {
    var AllUsers = [];
    const Res = await admin.auth().listUsers(1000, nextPageToken);
    AllUsers.push(...Res.users);
    if (Res.pageToken) {
        await ListAllUsers(Res.pageToken);
        return AllUsers;
    }
    return;
};
exports.getAllUsers = functions.https.onCall(async (_request, _context) => {
    var AllUsers = await ListAllUsers();
    const resultReturn = AllUsers.map((user) => {
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
});
// exports.crearUsuario = functions.https.onRequest((request, response) => {
//   response.set("Access-Control-Allow-Origin", "*");
//   response.set("Access-Control-Allow-Methods", "POST");
//   response.set("Access-Control-Allow-Headers", "*");
//   let body = request.body;
//   console.log(body.email);
//   const email = body.email;
//   if (email !== null && email !== "") {
//     admin
//       .auth()
//       .verifyIdToken(body.token)
//       .then((decode) => {
//         admin
//           .auth()
//           .getUserByEmail(email)
//           .then((userRecord) => {
//             console.log("Successfully fetched user data:", userRecord.toJSON());
//             if (userRecord.uid !== null && userRecord.uid !== "") {
//               console.log(userRecord);
//               console.log(userRecord.uid);
//               return response.status(200).send(userRecord.uid);
//             }
//             return;
//           })
//           .catch(async (error) => {
//             console.log("Error fetching user data:", error);
//             var tuser = await admin.auth().createUser({
//               email: email,
//               emailVerified: false,
//               password: "vamostalacarajo",
//               displayName: "jugador-tala",
//               disabled: false,
//             });
//             console.log("Json data parseado:", tuser.toJSON());
//             return response.status(200).send(tuser.uid);
//           });
//       });
//   }
// });
///DELETE USER
exports.deleteUser = functions.firestore
    .document("users/{userID}")
    .onDelete((snap, _context) => {
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
exports.asistenciaFn = functions.https.onCall(async (request, response) => {
    console.log(request);
    console.log(request.dni);
    const dni = request.dni;
    const id = request.id;
    if (dni !== undefined &&
        dni !== null &&
        dni !== "" &&
        id !== null &&
        id !== "" &&
        id !== undefined) {
        // TODO buscar entrenamiento primero para dar la asistencia
        // despues usar la sig func
        return admin
            .firestore()
            .collection("entrenamientos")
            .doc(id)
            .update({
            jugadores: admin.firestore.FieldValue.arrayUnion({ id: dni }),
        });
    }
    return "Failed";
});
exports.createUser = functions.https.onCall((request, response) => {
    console.log(request);
    console.log(request.email);
    const email = request.email;
    const displayName = request.displayName;
    const password = "vamostalacarajo";
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
            .then((userRecord) => {
            console.log(userRecord.uid);
            return userRecord.uid;
        })
            .catch((error) => {
            console.log(error);
            return "Failed to create user: ";
        });
    }
    return "Failed to create user: ";
    // }
});
exports.getUserByEmail = functions.https.onCall((data, context) => {
    try {
        return admin.auth().getUserByEmail(data.email).then((user) => {
            return user.uid;
        });
    }
    catch (error) {
        return null;
    }
});
//# sourceMappingURL=index.js.map
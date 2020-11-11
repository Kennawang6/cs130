const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const user = require("./user.js");
const friend = require("./friend.js");

exports.helloWorld = functions.https.onRequest((request, response) => {
    // call with HTTP
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello, world!");
});

exports.authHelloWorld = functions.https.onCall((data, context) => {
    // called with authentication from inside the app
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text:"No."};
    } else {
        functions.logger.info("Hello to " + context.auth.uid);
        return {text:"Hello, " + context.auth.uid + "!\n"};
    }
});

exports.appHelloWorld = functions.https.onCall((data, context) => {
    // called from inside the app (no auth needed)
    functions.logger.info("Hello to app");
    response.send("Hello, app");
});

exports.httpGet = functions.https.onRequest((request, response) => {
  // need to add to local db emulator
    db.collection('demo').doc('doc').get().then((doc) => {
        if (doc.exists) {
            functions.logger.info(doc.data()) + " from HTTP\n";
            response.send(doc.data());
        } else {
            functions.logger.info("document not found\n");
            response.send("Something went wrong\n");
        }
    }).catch((error) => {
        functions.logger.info("database get error " + error);
    });
});

// user endpoins
exports.ifFirstTimeUser = user.ifFirstTimeUser;
exports.addUserData = user.addUserData;
exports.getUserData = user.getUserData;
exports.updateUserData = user.updateUserData;

// friend endpoins
exports.addFriend = friend.addFriend;
exports.removeFriend = friend.removeFriend;
exports.getFriendsList = friend.getFriendsList;
exports.removeFriend = friend.removeFriend;
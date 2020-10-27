const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
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

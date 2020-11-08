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



exports.addFriend = functions.https.onCall(async (data, context) => {
    //data parameters: 
    //  friend_email: friend's email
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);
            const friendRecord = await admin.auth().getUserByEmail(data.friend_email);
            // See the UserRecord reference doc for the contents of userRecord.
            console.log('Successfully fetched friend data:', friendRecord.toJSON());

            const getUserInfo = await admin.firestore().collection('users').doc(context.auth.uid).get();

            if(getUserInfo.data()){
                console.log("User document is undefined");
                return {text: "User document is undefined"};
            }

            const userData = getUserInfo.data();

            if(friendsToAdd in userData){
                if(userData.friendsToAdd.includes(friendRecord.uid)){
                    await admin.firestore().collection('users').doc(context.auth.uid)
                        .update({
                            friendsToAdd: admin.firestore.FieldValue.arrayRemove(friendRecord.uid),
                            friends: admin.firestore.FieldValue.arrayUnion(friendRecord.uid)
                        });

                    await admin.firestore().collection('users').doc(friendRecord.uid)
                        .update({
                            friends: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
                        });

                    console.log("Successfully added friend back");
                    return {text: "Successfully added friend back"};
                }
            }

            await admin.firestore().collection('users').doc(friendRecord.uid)
                .update({
                    friendsToAdd: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
                });


            console.log("Successfully sent friend request");
            return {text: "Successfully sent friend request"};
        } catch (error) {
            console.log('Error fetching user data:', error);
            return  {text: "Firebase error while adding friend"};
        }
    }
});


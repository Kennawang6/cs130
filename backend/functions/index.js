const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

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


exports.addUserData = functions.https.onCall(async (data, context) => {
    //data parameters: 
    // None
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getUserInfo = await admin.firestore().collection('users').doc(context.auth.uid).get();

            if(!getUserInfo.exists){
                await admin.firestore().collection('users').doc(context.auth.uid)
                        .set({
                            name: "",
                            timeZone: 0, //This could encode hours relative to GMT
                            schedule: {},
                            events: [],
                            eventNotifications: [], 
                            friendsToAdd: [],
                            friends: []
                        });

                console.log("User data added");
                return {text: "User data added"};
            }

            console.log("User data already exists");
            return {text: "User data already exists"};
        } catch (error) {
            console.log('Error adding user data:', error);
            return  {text: "Firebase error while adding user"};
        }
    }
});

exports.getUserData = functions.https.onCall(async (data, context) => {
    //data parameters: 
    // None
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getUserInfo = await admin.firestore().collection('users').doc(context.auth.uid).get();

            if(!getUserInfo.exists){
                console.log("User data does not exist");
                return {text: "User data does not exist"};
            }

            console.log("User data found");
            return {
                text: "User data found",
                data: getUserInfo.data()
            };
        } catch (error) {
            console.log("Error getting user data");
            return  {text: "Error getting user data"};
        }
    }
});


exports.updateUserData = functions.https.onCall(async (data, context) => {
    //data parameters: 
    // userData: a JSON object which contains some or all of the fields of the user class, which are
    /*{
        name: ,  
        timeZone: , 
        schedule: ,
        events: ,
        eventNotifications: , 
        friendsToAdd: ,
        friends: 
    }*/
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getUserInfo = await admin.firestore().collection('users').doc(context.auth.uid).get();

            if(!getUserInfo.exists){
                console.log("User data does not exist");
                return {text: "User data does not exist"};
            }

            await admin.firestore().collection('users').doc(context.auth.uid)
                .update(data.userData);

            console.log("User data found");
            return {text: "User data updated"};
        } catch (error) {
            console.log("Error getting user data");
            return  {text: "Error getting user data"};
        }
    }
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

            if(!getUserInfo.exists){
                console.log("User document does not exist");
                return {text: "User document does not exist"};
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

exports.removeFriend = functions.https.onCall(async (data, context) => {
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

            if(!getUserInfo.exists){
                console.log("User document does not exist");
                return {text: "User document does not exist"};
            }

            const userData = getUserInfo.data();

            if(friendsToAdd in userData){
                if(userData.friendsToAdd.includes(friendRecord.uid)){
                    await admin.firestore().collection('users').doc(context.auth.uid)
                        .update({
                            friendsToAdd: admin.firestore.FieldValue.arrayRemove(friendRecord.uid)
                        });

                    console.log("Successfully removed friend request");
                    return {text: "Successfully removed friend request"};
                }
            }

            await admin.firestore().collection('users').doc(context.auth.uid)
                .update({
                    friends: admin.firestore.FieldValue.arrayRemove(friendRecord.uid)
                });

            await admin.firestore().collection('users').doc(friendRecord.uid)
                .update({
                    friends: admin.firestore.FieldValue.arrayRemove(context.auth.uid)
                });

            console.log("Successfully removed friend");
            return {text: "Successfully removed friend"};
        } catch (error) {
            console.log('Error fetching user data:', error);
            return  {text: "Firebase error while adding friend"};
        }
    }
});

exports.getFriendsList = functions.https.onCall(async (data, context) => {
    //data parameters: 
    //  None
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

            if(!getUserInfo.exists){
                console.log("User document does not exist");
                return {text: "User document does not exist"};
            }

            const userData = getUserInfo.data();

            if((friendsToAdd in userData) && (friends in userData)){
                console.log("Successfully got friends list");
                return {
                    text: "Successfully got friends list",
                    friendsToAdd: userData.friendsToAdd,
                    friends: userData.friends
                };
            }

            return {text: "Friends lists not found"};
        } catch (error) {
            console.log('Error fetching user data:', error);
            return  {text: "Firebase error while adding friend"};
        }
    }});
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

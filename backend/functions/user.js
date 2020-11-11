const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

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
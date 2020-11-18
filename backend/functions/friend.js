const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

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

            if('friendsToAdd' in userData){
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

            if('friendsToAdd' in userData){
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

            const getUserInfo = await admin.firestore().collection('users').doc(context.auth.uid).get();

            if(!getUserInfo.exists){
                console.log("User document does not exist");
                return {text: "User document does not exist"};
            }

            const userData = getUserInfo.data();

            if(!(('friendsToAdd' in userData) && ('friends' in userData))){
                console.log("Friends lists not found");
                return {text: "Friends lists not found"};
            }


            var friendToAddInfo = [];
            var friendInfo = [];

            for (friendToAdd in userData.friendsToAdd){
                const getFriendInfo = await admin.firestore().collection('users').doc(friendToAdd).get();

                if(!getFriendInfo.exists){
                    console.log("Friend data not found");
                    return {text: "Friend data not found"};
                }
                const friendData = getFriendInfo.data();
                friendToAddInfo.push(friendData);
            }

            for (friend in userData.friends){
                const getFriendInfo = await admin.firestore().collection('users').doc(friend).get();

                if(!getFriendInfo.exists){
                    console.log("Friend data not found");
                    return {text: "Friend data not found"};
                }
                const friendData = getFriendInfo.data();
                friendInfo.push(friendData);
            }

            console.log("Successfully got friends list");
            return {
                text: "Successfully got friends list",
                friendsToAdd: friendToAddInfo,
                friends: friendInfo,
            };
        } catch (error) {
            console.log('Error fetching user data:', error);
            return  {text: "Firebase error while adding friend"};
        }
    }
});
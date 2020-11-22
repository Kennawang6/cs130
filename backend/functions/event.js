const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

exports.createEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_name: event's name
    // description: (could be empty) description of event
    // invitees: (could be empty) list of friend IDs to add to event
    // start_date: start date
    // end_date: end date
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const eventRes = await admin.firestore().collection('events')
                .add({
                    name: data.event_name,
                    description: data.description,
                    hostID: context.auth.uid,
                    invitees: data.invitees,
                    members: [context.auth.uid], //host + friends who have accepted the invite
                    startDate: data.start_date,
                    endDate: data.end_date,
                    schedules: [],
                    commonSchedule: {},
                    decidedTime: "",
                    membersReady: [], // members who have confirmed their availability to meet at the given time
                });

            await admin.firestore().collection('users').doc(context.auth.uid)
                .update({
                    events: admin.firestore.FieldValue.arrayUnion(eventRes.id)
                });

            for (const invitee of data.invitees){
                await admin.firestore().collection('users').doc(invitee)
                    .update({
                        eventNotifications: admin.firestore.FieldValue.arrayUnion(eventRes.id) // send friend an invite
                    });
            }

            console.log("Event added");
            return {text: "Event added"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.getEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("Event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('members' in eventData) && (eventData.members.includes(context.auth.uid)))){
                console.log("User not member of event");
                return {text: "User not member of event"};
            }

            console.log("Get event successful");
            return {
                text: "Get event successful, check event_data object",
                event_data: eventData //you can find this object's structure in the above code when creating an event in the createEvent function
            };
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.updateEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    // eventData: a JSON object which contains some or all of these fields of the event class, which are
    /*{
        name: ,
        description: , 
        startDate: , 
        endDate: ,
    }*/
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('hostID' in eventData) && (eventData.hostID == context.auth.uid))){
                console.log("User not host of event");
                return {text: "User not host of event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update(data.eventData);

            console.log("Modified event");
            return {text: "Modified event"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});


exports.getUsersInEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('invitees' in eventData) && ('members' in eventData))){
                console.log("Users in event not found");
                return {text: "Users in event not found"};
            }

            var inviteeInfo = [];
            var memberInfo = [];

            for (const invitee of eventData.invitees){
                const getUserInfo = await admin.firestore().collection('users').doc(invitee).get();

                if(!getUserInfo.exists){
                    console.log("Invitee data in event not found");
                    return {text: "Invitee data in event not found"};
                }
                const userData = getUserInfo.data();
                inviteeInfo.push(userData);
            }

            for (const member of eventData.members){
                const getUserInfo = await admin.firestore().collection('users').doc(member).get();

                if(!getUserInfo.exists){
                    console.log("Member data in event not found");
                    return {text: "Member data in event not found"};
                }
                const userData = getUserInfo.data();
                memberInfo.push(userData);
            }

            
            console.log("Get event users successful");
            return {
                text: "Get event successful, check inviteesInfo and membersInfo object lists", 
                inviteesInfo: inviteeInfo, // These two are lists of User objects for all of the invitees and members of each list
                membersInfo: memberInfo, 
            };
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.setEventTime = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    // event_time: time to meet in TimeSlot format, that is, MM/DD/YY XX:XX <AM/PM>
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('hostID' in eventData) && (eventData.hostID == context.auth.uid))){
                console.log("User not host of event");
                return {text: "User not host of event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update({
                    decidedTime: data.event_time,
                    membersReady: [],
                });

            console.log("Set event time");
            return {text: "Set event time"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.setReadyForEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    // event_time: time to meet in TimeSlot format, that is, MM/DD/YY XX:XX <AM/PM>
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('members' in eventData) && (eventData.members.includes(context.auth.uid)))){
                console.log("User not member of event");
                return {text: "User not member of event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update({
                    membersReady: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
                });

            console.log("Set event time");
            return {text: "Set event time"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.inviteToEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    // invitees: (could be empty) list of friend IDs to add to event
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('members' in eventData) && (eventData.members.includes(context.auth.uid)))){
                console.log("User not member of event");
                return {text: "User not member of event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update({
                    invitees: admin.firestore.FieldValue.arrayUnion(...data.invitees),
                });

            for (const invitee of data.invitees){
                await admin.firestore().collection('users').doc(invitee)
                    .update({
                        eventNotifications: admin.firestore.FieldValue.arrayUnion(data.event_id)
                    });
            }

            console.log("Invitees added");
            return {text: "Invitees added"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.acceptEventInvite = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
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

            if(!(('eventNotifications' in userData) && (eventData.eventNotifications.includes(data.event_id)))){
                console.log("User not invited to event");
                return {text: "User not invited to event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update({
                    invitees: admin.firestore.FieldValue.arrayRemove(context.auth.uid),
                    members: admin.firestore.FieldValue.arrayUnion(context.auth.uid),
                });

            await admin.firestore().collection('users').doc(context.auth.uid)
                .update({
                    eventNotifications: admin.firestore.FieldValue.arrayRemove(data.event_id),
                    events: admin.firestore.FieldValue.arrayUnion(data.event_id),
                });

            console.log("Invite accepted");
            return {text: "Invite accepted"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});

exports.declineEventInvite = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
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

            if(!(('eventNotifications' in userData) && (eventData.eventNotifications.includes(data.event_id)))){
                console.log("User not invited to event");
                return {text: "User not invited to event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update({
                    invitees: admin.firestore.FieldValue.arrayRemove(context.auth.uid),
                });

            await admin.firestore().collection('users').doc(context.auth.uid)
                .update({
                    eventNotifications: admin.firestore.FieldValue.arrayRemove(data.event_id),
                });

            console.log("Invite accepted");
            return {text: "Invite accepted"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});


exports.removeFromEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_id: event's id
    // invitees: (could be empty) list of friend IDs to remove from event
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getEventInfo = await admin.firestore().collection('events').doc(data.event_id).get();

            if(!getEventInfo.exists){
                console.log("event document does not exist");
                return {text: "Event document does not exist"};
            }

            const eventData = getEventInfo.data();

            if(!(('hostID' in eventData) && (eventData.hostID == context.auth.uid))){
                console.log("User not host of event");
                return {text: "User not host of event"};
            }

            await admin.firestore().collection('events').doc(data.event_id)
                .update({
                    invitees: admin.firestore.FieldValue.arrayRemove(...data.invitees),
                });

            for (const invitee of data.invitees){
                await admin.firestore().collection('users').doc(invitee)
                    .update({
                        events: admin.firestore.FieldValue.arrayRemove(data.event_id),
                        eventNotifications: admin.firestore.FieldValue.arrayRemove(data.event_id)
                    });
            }

            console.log("Users removed from event");
            return {text: "Users removed from event"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});
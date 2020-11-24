const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

exports.createEvent = functions.https.onCall(async (data, context) => {
    //data parameters (all required): 
    // event_name: event's name
    // description: (could be empty) description of event
    // invitees: (could be empty) list of friend IDs to add to event
    // start_date: start date in format YYYY-MM-DD
    // end_date: end date in format YYYY-MM-DD
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
                    startDate: data.start_date, //in format YYYY-MM-DD
                    endDate: data.end_date, //in format YYYY-MM-DD
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
            return {
                text: "Event added, check event_id field",
                event_id: eventRes.id,
            };
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
        startDate: , (in format YYYY-MM-DD)
        endDate: , (in format YYYY-MM-DD)
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
                var userData = getUserInfo.data();
                userData.uid = invitee;
                inviteeInfo.push(userData);
            }

            for (const member of eventData.members){
                const getUserInfo = await admin.firestore().collection('users').doc(member).get();

                if(!getUserInfo.exists){
                    console.log("Member data in event not found");
                    return {text: "Member data in event not found"};
                }
                var userData = getUserInfo.data();
                userData.uid = member;
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

            if(!(('eventNotifications' in userData) && (userData.eventNotifications.includes(data.event_id)))){
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

            if(!(('eventNotifications' in userData) && (userData.eventNotifications.includes(data.event_id)))){
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


exports.addTimeslotToSchedule = functions.https.onCall(async (data, context) => {
    //data parameters (all required):
    //  timeslot: {
    //      start: <milliseconds since 1970/01/01, which can be found using Date.getTime>
    //      end: <end time in same format>,
    //      description: <description>
    //  }
    if (!context.auth) {
        functions.logger.info("Unauthenticated user");
        return {text: "Unauthenticated user"};
    } else {
        try {
            functions.logger.info("Hello to " + context.auth.uid);

            const getScheduleInfo = await admin.firestore().collection('schedules').doc(context.auth.uid).get();
            
            if(!getScheduleInfo.exists){
                console.log("User schedule does not exist");
                return {text: "User schedule does not exist"};
            }

            const scheduleData = getScheduleInfo.data();

            console.log(data)

            const startTime = data.timeslot.start;
            const endTime = data.timeslot.end;

            if(isNaN(startTime) || isNaN(endTime)){
                console.log("Time format incorrect, check endpoint specification for details");
                return {text: "Time format incorrect, check endpoint specification for details"};
            }

            if(startTime > endTime){
                console.log("Error, start time later than end time");
                return {text: "Error, start time later than end time"};
            }
            
            var finalTimeslots = [];
            var newTimeslot = {};
            var newTimeslotStarted = false;
            var newTimeslotEnded = false;
            var newTimeslotStart;
            newTimeslot.description = data.timeslot.description;

            for(const scheduleTimeslot of scheduleData.timeslots){
              const scheduleTimeslotStartTime = scheduleTimeslot.start;
              const scheduleTimeslotEndTime = scheduleTimeslot.end;

              if(!newTimeslotStarted){
                if(startTime <= scheduleTimeslotEndTime){
                  newTimeslotStart = 0;
                  if(startTime < scheduleTimeslotStartTime){
                    newTimeslotStart = data.timeslot.start;
                  } else {
                    newTimeslotStart = scheduleTimeslot.start;
                  }

                  if(endTime < scheduleTimeslotStartTime){
                      newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                      newTimeslot = {
                        start: newTimeslotStart,
                        end: data.timeslot.end,
                      }
                      finalTimeslots.push(newTimeslot);
                      finalTimeslots.push(scheduleTimeslot);
                      newTimeslotStarted = true;
                      newTimeslotEnded = true;
                  } else if(endTime <= scheduleTimeslotEndTime){
                      newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                      newTimeslot = {
                        start: newTimeslotStart,
                        end: scheduleTimeslot.end,
                      }
                      finalTimeslots.push(newTimeslot);
                      newTimeslotStarted = true;
                      newTimeslotEnded = true;
                  } else if(endTime > scheduleTimeslotEndTime){
                      newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                      newTimeslot.start = newTimeslotStart;
                      newTimeslotStarted = true;
                  }
                } else {
                  finalTimeslots.push(scheduleTimeslot);
                }
              } else if(!newTimeslotEnded){
                if(endTime < scheduleTimeslotStartTime){
                  newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                  newTimeslot.end = data.timeslot.end;
                  finalTimeslots.push(newTimeslot);
                  finalTimeslots.push(scheduleTimeslot);
                  newTimeslotEnded = true;
                } else if (endTime <= scheduleTimeslotEndTime){
                  newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                  newTimeslot.end = scheduleTimeslot.end;
                  finalTimeslots.push(newTimeslot);
                  finalTimeslots.push(scheduleTimeslot);
                  newTimeslotEnded = true;
                } else {
                  newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                }
              } else {
                finalTimeslots.push(scheduleTimeslot);
              }
            }

            if(!newTimeslotEnded){
              newTimeslot.start = newTimeslotStart;
              newTimeslot.end = data.timeslot.end;
              finalTimeslots.push(newTimeslot);
              newTimeslotEnded = true;
            }

            await admin.firestore().collection('schedules').doc(context.auth.uid).update({
              timeslots: finalTimeslots,
            });

            console.log("Successfully updated schedule with new timeslot");
            return {text: "Successfully updated schedule with new timeslot"};
        } catch (error) {
            console.log('Error:', error);
            return  {text: "Firebase error"};
        }
    }
});


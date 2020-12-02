const test = require('firebase-functions-test');
const admin = require('firebase-admin');
const assert = require('assert');
const sinon = require('sinon');

describe('Online Tests', () => {
  let functions, testOnline, uid1, uid2, user1Context, user2Context, eventId;

  before(() => {
    testOnline = require('firebase-functions-test')({
      databaseURL: 'https://letshang-test.firebaseio.com',
      storageBucket: 'letshang-test.appspot.com',
      projectId: 'letshang-test'
    }, './test/serviceAccountKey.json');

    functions = require('../index.js');
    
    uid1 = "Bu86P1GvwgNv3Wuaxzl4lUNgBh42";
    uid2 = "h3HcRMGZ55P1UW6JVXBvTMWdS8r2";
    
    user1Context = {auth: {uid: uid1, token: {name: "user1", email: "email@email.com", picture: "url1"}}};
    user2Context = {auth: {uid: uid2, token: {name: "user2", email: "email2@email.com", picture: "url2"}}};
  })

  after(() => {
    testOnline.cleanup();
    admin.firestore().collection("schedules").doc(uid1).delete()
      .catch((error) => console.log("Could not clean up schedules/uid1, " + error.message));
      admin.firestore().collection("schedules").doc(uid2).delete()
        .catch((error) => console.log("Could not clean up schedules/uid2, " + error.message));
    admin.firestore().collection("users").doc(uid1).delete()
      .catch((error) => console.log("Could not clean up users collection, " + error.message));
    admin.firestore().collection("events").doc(eventId).delete()
      .catch((error) => console.log("Could not clean up events collection, " + error.message));
  });

  describe('User Functions', () => {
    let addUserData, getUserData, updateUserData, getUserInfo;

    before(() => {
      addUserData = testOnline.wrap(functions.addUserData);
      getUserData = testOnline.wrap(functions.getUserData);
      updateUserData = testOnline.wrap(functions.updateUserData);
      getUserInfo = testOnline.wrap(functions.getUserInfo);
    });

    it('should add a default user object', async () => {
      let result = await addUserData({}, user1Context);
      assert(result.text);
      assert(result.text == "User data added");
      
      result = await getUserData({}, user1Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.name);
      assert(result.data.name == "user1");
      assert(result.data.email);
      assert(result.data.email == "email@email.com");
      assert(result.data.photoURL);
      assert(result.data.photoURL == "url1");
      assert(result.data.timeZone);
      assert(result.data.timeZone == "20");
      assert(result.data.schedule);
      assert(result.data.events);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications);
      assert(result.data.eventNotifications.length == 0);
      assert(result.data.friendsToAdd);
      assert(result.data.friendsToAdd.length == 0);
      assert(result.data.friends);
      assert(result.data.friends.length == 0);
    });
    
    it('should fail to add a user if the user already exists', async () => {
      let result = await addUserData({}, user1Context);
      assert(result.text);
      assert(result.text == "User data already exists");
    });
    
    it('should update only the fields that are specified', async () => {
      let result = await updateUserData({userData: {photoURL: "newUrl", timeZone: 19}}, user1Context);
      assert(result.text);
      assert(result.text == "User data updated");
      
      result = await getUserData({}, user1Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.name);
      assert(result.data.name == "user1");
      assert(result.data.email);
      assert(result.data.email == "email@email.com");
      assert(result.data.photoURL);
      assert(result.data.photoURL == "newUrl");
      assert(result.data.timeZone);
      assert(result.data.timeZone == "19");
      assert(result.data.schedule);
      assert(result.data.events);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications);
      assert(result.data.eventNotifications.length == 0);
      assert(result.data.friendsToAdd);
      assert(result.data.friendsToAdd.length == 0);
      assert(result.data.friends);
      assert(result.data.friends.length == 0);
    });

    it('should get user record from firebase authentication by uid', async () => {
      let result = await getUserInfo({uid: uid1}, {});
      assert(!result.text);
      assert(result.data);
      assert(result.data.uid);
      assert(result.data.email);
      assert(result.data.uid == "Bu86P1GvwgNv3Wuaxzl4lUNgBh42");
      assert(result.data.email == "email@email.com");
    });
  });
  
  describe('Friend Functions', () => {
    let addFriend, removeFriend, getFriendsList;
    
    before(() => {
      addFriend = testOnline.wrap(functions.addFriend);
      removeFriend = testOnline.wrap(functions.removeFriend);
      getFriendsList = testOnline.wrap(functions.getFriendsList);
    });
    
    it('should send a friend request if other user hasn\'t added this user yet', async () => {
      let result = await addFriend({friend_email: "email2@email.com"}, user1Context);
      assert(result.text);
      assert(result.text == "Successfully sent friend request");
      
      result = await getFriendsList({}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully got friends list");
      assert(result.friendsToAdd);
      assert(result.friendsToAdd.length == 1);
      assert(result.friendsToAdd[0].uid == uid1);
      assert(result.friends);
      assert(result.friends.length == 0);
    });
    
    it('should accept pending friend request', async () => {
      let result = await addFriend({friend_email: "email@email.com"}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully added friend back");
      
      result = await getFriendsList({}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully got friends list");
      assert(result.friendsToAdd);
      assert(result.friendsToAdd.length == 0);
      assert(result.friends);
      assert(result.friends.length == 1);
      assert(result.friends[0].uid == uid1);
    });
    
    it('should remove friend from both users\' friends lists', async () => {
      let result = await removeFriend({friend_email: "email2@email.com"}, user1Context);
      assert(result.text);
      assert(result.text == "Successfully removed friend");
      
      result = await getFriendsList({}, user1Context);
      assert(result.text);
      assert(result.text == "Successfully got friends list");
      assert(result.friendsToAdd);
      assert(result.friendsToAdd.length == 0);
      assert(result.friends);
      assert(result.friends.length == 0);
      
      result = await getFriendsList({}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully got friends list");
      assert(result.friendsToAdd);
      assert(result.friendsToAdd.length == 0);
      assert(result.friends);
      assert(result.friends.length == 0);
    });
  });

  describe('Schedule Functions', () => {
    let addSchedule, getSchedule, addTimeslotToSchedule, addTimeslotToScheduleandCombine, removeSchedule, addEventToSchedule;

    before(() => {
      addSchedule = testOnline.wrap(functions.addSchedule);
      getSchedule = testOnline.wrap(functions.getSchedule);
      addTimeslotToSchedule = testOnline.wrap(functions.addTimeslotToSchedule);
      addTimeslotToScheduleandCombine = testOnline.wrap(functions.addTimeslotToScheduleandCombine);
      removeSchedule = testOnline.wrap(functions.removeSchedule);
      addEventToSchedule = testOnline.wrap(functions.addEventToSchedule);
    });
    
    it('should get the same schedule it added', async () => {
      let result = await addSchedule({timeslots: [{start: 18000, end: 24000, id: 18000, description: "test"}]}, user1Context);
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, user1Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 1);
      assert(result.schedule.timeslots[0].start == 18000);
      assert(result.schedule.timeslots[0].end == 24000);
      assert(result.schedule.timeslots[0].id == 18000);
      assert(result.schedule.timeslots[0].description == 'test');
    });

    it('should find an empty schedule after removing the schedule', async () => {
      let result = await removeSchedule(null, user1Context);
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, user1Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 0);
    });

    it('should add timeslot to schedule in order', async () => {
      let result = await addSchedule({timeslots: [
        {start: 6000, end: 12000, id: 6000, description: "before"}, 
        {start: 48000, end: 60000, id: 48000, description: "after"}
      ]}, user2Context);
      assert(result.status == "ok");
      assert(!result.text);

      result = await addTimeslotToSchedule({timeslot: {start: 30000, end: 36000, id: 30000, description: "new"}}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully updated schedule with new timeslot");

      result = await getSchedule(null, user2Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 3);
      assert(result.schedule.timeslots[0].start == 6000);
      assert(result.schedule.timeslots[0].end == 12000);
      assert(result.schedule.timeslots[0].id == 6000);
      assert(result.schedule.timeslots[0].description == 'before');
      assert(result.schedule.timeslots[1].start == 30000);
      assert(result.schedule.timeslots[1].end == 36000);
      assert(result.schedule.timeslots[1].id == 30000);
      assert(result.schedule.timeslots[1].description == 'new');
      assert(result.schedule.timeslots[2].start == 48000);
      assert(result.schedule.timeslots[2].end == 60000);
      assert(result.schedule.timeslots[2].id == 48000);
      assert(result.schedule.timeslots[2].description == 'after');
      
      result = await addTimeslotToSchedule({timeslot: {start: 18000, end: 24000, id: 18000, description: "test"}}, user1Context);
      assert(result.text);
      assert(result.text == "Successfully updated schedule with new timeslot");

      result = await getSchedule(null, user1Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 1);
      assert(result.schedule.timeslots[0].start == 18000);
      assert(result.schedule.timeslots[0].end == 24000);
      assert(result.schedule.timeslots[0].id == 18000);
      assert(result.schedule.timeslots[0].description == 'test');
    });

    it('should add timeslot to schedule in order and combine overlapping timeslots', async () => {
      let result = await addTimeslotToScheduleandCombine({timeslot: {start: 54000, end: 66000, id: 54000, description: "combine"}}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully updated schedule with new timeslot");

      result = await getSchedule(null, user2Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 3);
      assert(result.schedule.timeslots[0].start == 6000);
      assert(result.schedule.timeslots[0].end == 12000);
      assert(result.schedule.timeslots[0].id == 6000);
      assert(result.schedule.timeslots[0].description == 'before');
      assert(result.schedule.timeslots[1].start == 30000);
      assert(result.schedule.timeslots[1].end == 36000);
      assert(result.schedule.timeslots[1].id == 30000);
      assert(result.schedule.timeslots[1].description == 'new');
      assert(result.schedule.timeslots[2].start == 48000);
      assert(result.schedule.timeslots[2].end == 66000);
      assert(result.schedule.timeslots[2].id == 48000);
      assert(result.schedule.timeslots[2].description == 'combine, after');
    });

    it('should get a modified schedule after adding an event to that schedule', async () => {
      let result = await addEventToSchedule({uid: uid1, timeslot: {start: 30000, end: 36000, id: 30000, description: "new"}});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, user1Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 2);
      assert(result.schedule.timeslots[0].start == 18000);
      assert(result.schedule.timeslots[0].end == 24000);
      assert(result.schedule.timeslots[0].id == 18000);
      assert(result.schedule.timeslots[0].description == 'test');
      assert(result.schedule.timeslots[1].start == 30000);
      assert(result.schedule.timeslots[1].end == 36000);
      assert(result.schedule.timeslots[1].id == 30000);
      assert(result.schedule.timeslots[1].description == 'new');
    });
    
    it('should merge overlapping timeslots when adding event to schedule', async () => {
      let result = await addEventToSchedule({uid: uid1, timeslot: {start: 30000, end: 42000, id: 30000, description: "merge"}}, {});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, user1Context);
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 2);
      assert(result.schedule.timeslots[0].start == 18000);
      assert(result.schedule.timeslots[0].end == 24000);
      assert(result.schedule.timeslots[0].id == 18000);
      assert(result.schedule.timeslots[0].description == 'test');
      assert(result.schedule.timeslots[1].start == 30000);
      assert(result.schedule.timeslots[1].end == 42000);
      assert(result.schedule.timeslots[1].id == 30000);
      assert(result.schedule.timeslots[1].description == 'new, merge');
    });
  });

  describe('Event Functions', () => {
    let createEvent, getEvent, updateEvent, getUsersInEvent, setEventTime, finalizeEventTime, setReadyForEvent, setNotReadyForEvent, inviteToEvent, acceptEventInvite, declineEventInvite, removeFromEvent, leaveEvent, addUserScheduleToEvent, computeNextEarliestAvailableTime;
    let getUserData;

    before(() => {
      createEvent = testOnline.wrap(functions.createEvent);
      getEvent = testOnline.wrap(functions.getEvent);
      updateEvent = testOnline.wrap(functions.updateEvent);
      getUsersInEvent = testOnline.wrap(functions.getUsersInEvent);
      setEventTime = testOnline.wrap(functions.setEventTime);
      finalizeEventTime = testOnline.wrap(functions.finalizeEventTime);
      setReadyForEvent = testOnline.wrap(functions.setReadyForEvent); // TODO
      setNotReadyForEvent = testOnline.wrap(functions.setNotReadyForEvent); // TODO
      inviteToEvent = testOnline.wrap(functions.inviteToEvent);
      acceptEventInvite = testOnline.wrap(functions.acceptEventInvite);
      declineEventInvite = testOnline.wrap(functions.declineEventInvite);
      removeFromEvent = testOnline.wrap(functions.removeFromEvent);
      leaveEvent = testOnline.wrap(functions.leaveEvent);
      addUserScheduleToEvent = testOnline.wrap(functions.addUserScheduleToEvent);
      computeNextEarliestAvailableTime = testOnline.wrap(functions.computeNextEarliestAvailableTime);
      
      getUserData = testOnline.wrap(functions.getUserData);
    });
    
    it('should construct a default event object', async () => {
      let result = await createEvent({
        event_name: "event", 
        description: "description", 
        invitees: [uid2], 
        start_date: 0, 
        end_date: 60000,
        duration: 1
      }, user1Context);
      assert(result.text);
      assert(result.text == "Event added, check event_id field");
      eventId = result.event_id;
      assert(eventId);
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.name == "event");
      assert(result.event_data.description == "description");
      assert(result.event_data.hostID == uid1);
      assert(result.event_data.invitees.length == 1);
      assert(result.event_data.invitees[0] == uid2);
      assert(result.event_data.members.length == 1);
      assert(result.event_data.members[0] == uid1);
      assert(result.event_data.startDate == 0);
      assert(result.event_data.endDate == 60000);
      assert(result.event_data.duration == 1);
      assert(result.event_data.commonSchedule.length == 0);
      assert(result.event_data.computedTime == 0);
      assert(result.event_data.decidedTime == 0);
      assert(result.event_data.finalTime == 0);
      assert(result.event_data.membersReady.length == 0);
      assert(result.event_data.membersNotReady.length == 0);
      
      result = await getUserData({}, user1Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 1);
      assert(result.data.events[0] == eventId);
      assert(result.data.eventNotifications.length == 0);
      
      result = await getUserData({}, user2Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications.length == 1);
      assert(result.data.eventNotifications[0] == eventId);
    });
    
    it('should update the event object as specified', async () => {
      let result = await updateEvent({event_id: eventId, eventData: {name: "name2", description: "description2"}}, user1Context);
      assert(result.text);
      assert(result.text == "Modified event");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.name == "name2");
      assert(result.event_data.description == "description2");
    });
    
    it('removes user from invitees and event from notifications if user rejects event invite', async () => {
      let result = await declineEventInvite({event_id: eventId}, user2Context);
      assert(result.text);
      assert(result.text == "Invite accepted");
      
      result = await getUserData({}, user2Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications.length == 0);
      
      result = await getUsersInEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check inviteesInfo and membersInfo object lists");
      assert(result.inviteesInfo.length == 0);
      assert(result.membersInfo.length == 1);
    });
    
    it('adds user to invitees and event to notifications if event member invites user', async () => {
      let result = await inviteToEvent({event_id: eventId, invitees: [uid2]}, user1Context);
      assert(result.text);
      assert(result.text == "Invitees added");
      
      result = await getUserData({}, user2Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications.length == 1);
      assert(result.data.eventNotifications[0] == eventId);
      
      result = await getUsersInEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check inviteesInfo and membersInfo object lists");
      assert(result.inviteesInfo.length == 1);
      assert(result.membersInfo.length == 1);
    });
    
    it('should remove the event from the event list and the user from the members list if host removes the user from the event', async () => {
      let result = await removeFromEvent({event_id: eventId, invitees: [uid2]}, user1Context);
      assert(result.text);
      assert(result.text == "Users removed from event");
      
      result = await getUserData({}, user2Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications.length == 0);
      
      result = await getUsersInEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check inviteesInfo and membersInfo object lists");
      assert(result.inviteesInfo.length == 0);
      assert(result.membersInfo.length == 1);
      
      result = await inviteToEvent({event_id: eventId, invitees: [uid2]}, user1Context);
      assert(result.text);
      assert(result.text == "Invitees added");
    });
    
    it('should move the user to the members and the event to events if the user accepts the invitation', async () => {
      let result = await acceptEventInvite({event_id: eventId}, user2Context);
      assert(result.text);
      assert(result.text == "Invite accepted");
      
      result = await getUserData({}, user2Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 1);
      assert(result.data.eventNotifications.length == 0);
      
      result = await getUsersInEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check inviteesInfo and membersInfo object lists");
      assert(result.inviteesInfo.length == 0);
      assert(result.membersInfo.length == 2);
    });

    it('should add user schedule to event and combine timeslots if necessary', async () => {
      let result = await addUserScheduleToEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Successfully updated event schedule with user schedules");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      console.log(result.event_data.commonSchedule);
      
      result = await addUserScheduleToEvent({event_id: eventId}, user2Context);
      assert(result.text);
      assert(result.text == "Successfully updated event schedule with user schedules");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      console.log(result.event_data.commonSchedule);
      assert(false);
    });
    
    it('should compute available times and correctly choose next available times', async () => {
      let result = await computeNextEarliestAvailableTime({event_id: eventId}, user1Context);
      console.log(result.text);
      console.log(result.eventEndTime);
      assert(false);
    });
    
    it('should set the decided time and empty the ready and not ready lists when an event time is proposed', async () => {
      let result = await setEventTime({event_id: eventId, event_time: 30000}, user1Context);
      assert(result.text);
      assert(result.text == "Set event time");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.decidedTime == 30000);
      assert(result.event_data.membersReady.length == 0);
      assert(result.event_data.membersNotReady.length == 0);
    });
    
    it('should add users to the not ready list if requested', async () => {
      let result = await setNotReadyForEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Set event time");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.membersNotReady.length == 1);
      assert(result.event_data.membersNotReady[0] == uid1);
    });
    
    it('should add users to the ready list if requested', async () => {
      let result = await setReadyForEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Set event time");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.membersReady.length == 1);
      assert(result.event_data.membersReady[0] == uid1 || result.event_data.membersReady[1] == uid1);
      
      result = await setReadyForEvent({event_id: eventId}, user2Context);
      assert(result.text);
      assert(result.text == "Set event time");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.membersReady.length == 2);
      assert(result.event_data.membersReady[0] == uid2 || result.event_data.membersReady[1] == uid2);
    });
    
    it('should set final time when the decided time is finalized', async () => {
      let result = await finalizeEventTime({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Decided event time");
      
      result = await getEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.finalTime == 30000);
    });
    
    it('should remove the event from the event list and the user from the members list if the user leaves the event', async () => {
      let result = await leaveEvent({event_id: eventId}, user2Context);
      assert(result.text);
      assert(result.text == "Left event");
      
      result = await getUserData({}, user2Context);
      assert(result.text);
      assert(result.text == "User data found");
      assert(result.data);
      assert(result.data.events.length == 0);
      assert(result.data.eventNotifications.length == 0);
      
      result = await getUsersInEvent({event_id: eventId}, user1Context);
      assert(result.text);
      assert(result.text == "Get event successful, check inviteesInfo and membersInfo object lists");
      assert(result.inviteesInfo.length == 0);
      assert(result.membersInfo.length == 1);
    });
  });
});

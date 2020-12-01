const test = require('firebase-functions-test');
const admin = require('firebase-admin');
const assert = require('assert');
const sinon = require('sinon');

describe('Online Tests', () => {
  let functions, testOnline, uid1, uid2, user1Context, user2Context;

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
    admin.firestore().collection("users").doc(uid1).delete()
      .catch((error) => console.log("Could not clean up users collection, " + error.message));
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
    let addSchedule, getSchedule, removeSchedule, addEventToSchedule;

    before(() => {
      addSchedule = testOnline.wrap(functions.addSchedule);
      getSchedule = testOnline.wrap(functions.getSchedule);
      removeSchedule = testOnline.wrap(functions.removeSchedule);
      addEventToSchedule = testOnline.wrap(functions.addEventToSchedule);
    });
    
    it('should get the same schedule it added', async () => {
      let result = await addSchedule({timeslots: [{start: 3, end: 4, id: 3, description: "test"}]}, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 1);
      assert(result.schedule.timeslots[0].start == 3);
      assert(result.schedule.timeslots[0].end == 4);
      assert(result.schedule.timeslots[0].description == 'test');
    });

    it('should get a modified schedule after adding a timeslot to that schedule', async () => {
      let result = await addEventToSchedule({uid: "2", timeslot: {start: 5, end: 6, id: 5, description: "new"}});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 2);
      assert(result.schedule.timeslots[0].start == 3);
      assert(result.schedule.timeslots[0].end == 4);
      assert(result.schedule.timeslots[0].id == 3);
      assert(result.schedule.timeslots[0].description == 'test');
      assert(result.schedule.timeslots[1].start == 5);
      assert(result.schedule.timeslots[1].end == 6);
      assert(result.schedule.timeslots[1].id == 5);
      assert(result.schedule.timeslots[1].description == 'new');
    });
    
    it('should merge overlapping timeslots when adding event to schedule', async () => {
      let result = await addEventToSchedule({uid: "2", timeslot: {start: 5, end: 7, id: 5, description: "merge"}}, {});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 2);
      assert(result.schedule.timeslots[0].start == 3);
      assert(result.schedule.timeslots[0].end == 4);
      assert(result.schedule.timeslots[0].id == 3);
      assert(result.schedule.timeslots[0].description == 'test');
      assert(result.schedule.timeslots[1].start == 5);
      assert(result.schedule.timeslots[1].end == 7);
      assert(result.schedule.timeslots[1].id == 5);
      assert(result.schedule.timeslots[1].description == 'new, merge');
    });

    it('should find an empty schedule after removing the schedule', async () => {
      let result = await removeSchedule(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getSchedule(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 0);
    });
  });
});

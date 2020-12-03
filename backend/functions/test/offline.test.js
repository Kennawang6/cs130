const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const assert = require('assert');
const sinon = require('sinon');

describe('Offline Tests', () => {
  let adminInitStub, adminFirestoreStub, adminAuthStub, getterFunction, getterValue, getStub, addStub, setStub, updateStub, dataStub, getUserStub, getUserByEmailStub, test, sampleContext;

  before(() => {
    adminInitStub = sinon.stub(admin, 'initializeApp');
    test = require('firebase-functions-test')();

    getStub = sinon.stub();
    addStub = sinon.stub();
    setStub = sinon.stub();
    updateStub = sinon.stub();
    dataStub = sinon.stub();
    getUserStub = sinon.stub();
    getUserByEmailStub = sinon.stub();
    
    getterFunction = function() {
      return function() {
        return {
          collection: sinon.stub().returns({
            doc: sinon.stub().returns({
              withConverter: sinon.stub().returns({
                get: getStub,
                set: setStub
              }),
              get: getStub,
              set: setStub,
              update: updateStub
            }),
            add: addStub
          })
        }
      }
    }
    
    getterValue = function() {
      return {
        FieldValue: {
          arrayRemove: sinon.stub(),
          arrayUnion: sinon.stub()
        }
      }
    };
    
    adminFirestoreStub = sinon.stub(admin, 'firestore').get(getterFunction);
// TODO use something like onNthCall to replace the firestores
    adminAuthStub = sinon.stub(admin, 'auth').get(
      function() {
        return function(){
          return {
            getUser: getUserStub,
            getUserByEmail: getUserByEmailStub
          }
        };
      }
    );

    functions = require('../index.js');

    sampleContext = {auth: {uid: "1", token: {name: "name", email: "email@email.com", picture: "url.com"}}};
  });

  after(() => {
    adminInitStub.restore();
    adminFirestoreStub.restore();
    adminAuthStub.restore();
    test.cleanup();
  });

  describe('User Functions', () => {
    describe('addUserData', () => {
      let addUserData;
      before(() => {
          addUserData = test.wrap(functions.addUserData);
      });

      afterEach(() => {
        getStub.resetHistory();
        setStub.resetHistory();
      })

      it('should fail if the user is not authenticated', async () => {
        let result = await addUserData(null, {});
        assert(getStub.notCalled);
        assert(setStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      })

      it('should fail if get() throws an error', async () => {
        getStub.rejects({message: "error"});
        let result = await addUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(setStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error while adding user");
      });

      it('should fail if data for this user already exists in the database', async () => {
        getStub.resolves({exists: true});
        let result = await addUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(setStub.notCalled);
        assert(result.text);
        assert(result.text == "User data already exists");
      });

      it('should fail if set() throws an error', async () => {
        getStub.resolves({exists: false});
        setStub.rejects({message: "error"});
        let result = await addUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(setStub.calledOnce);
        assert(result.text);
        assert(result.text == "Firebase error while adding user");
      });

      it('should succeed if get() and set() execute without errors and the user has no existing data', async () => {
        getStub.resolves({exists: false});
        setStub.resolves();
        let result = await addUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(setStub.calledOnce);
        assert(result.text);
        assert(result.text == "User data added");
      });
    });

    describe('getUserData', () => {
      let getUserData;

      before(() => {
        getUserData = test.wrap(functions.getUserData);
      });

      afterEach(() => {
        getStub.resetHistory();
        dataStub.resetHistory();
      });

      it('should fail when the request is not authenticated', async () => {
        let result = await getUserData(null, {});
        assert(getStub.notCalled);
        assert(dataStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when get() throws an error', async () => {
        getStub.rejects({message: "error"});
        let result = await getUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(result.text);
        assert(result.text == "Error getting user data");
      });

      it('should fail when no user data is found', async () => {
        getStub.resolves({exists: false});
        let result = await getUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(result.text);
        assert(result.text == "User data does not exist");
      });

      it('should return the user data if it is found', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns("I am data");
        let result = await getUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(result.text);
        assert(result.text == "User data found");
        assert(result.data);
        assert(result.data == "I am data");
      });
    });

    describe('updateUserData', () => {
      let updateUserData;

      before(() => {
        updateUserData = test.wrap(functions.updateUserData);
      });

      afterEach(() => {
        getStub.resetHistory();
        updateStub.resetHistory();
      });

      it('should fail when the request is not authenticated', async () => {
        let result = await updateUserData(null, {});
        assert(getStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when get() throws an error', async () => {
        getStub.rejects({message: "error"});
        let result = await updateUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Error getting user data");
      });

      it('should fail when no user data is found', async () => {
        getStub.resolves({exists: false});
        let result = await updateUserData(null, sampleContext);
        assert(getStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "User data does not exist");
      });

      it('should fail when update() throws an error', async () => {
        getStub.resolves({exists: true});
        updateStub.rejects({message: "error"});
        let result = await updateUserData({userData: null}, sampleContext);
        assert(getStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Error getting user data");
      });

      it('should succeed when get() and update() execute without error', async () => {
        getStub.resolves({exists: true});
        updateStub.resolves();
        let result = await updateUserData({userData: null}, sampleContext);
        assert(getStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "User data updated");
      });
    });

    describe('getUserInfo', () => {
      let getUserInfo;

      before(() => {
        getUserInfo = test.wrap(functions.getUserInfo);
      });

      afterEach(() => {
        getUserStub.resetHistory();
      })

      it('should fail if no user id is provided', async () => {
        let result = await getUserInfo({}, null);
        assert(getUserStub.notCalled);
        assert(result.text);
        assert(result.text == "No user id provided");
        assert(!result.data)
      });

      it('should fail if getUser() fails', async () => {
        getUserStub.rejects({message: "test error"});
        let result = await getUserInfo({uid: "1"}, null);
        assert(getUserStub.calledOnce);
        assert(result.text);
        assert(result.text == "test error");
        assert(!result.data)
      });

      it('should fail if the requested user record does not exist', async () => {
        getUserStub.resolves(null);
        let result = await getUserInfo({uid: "1"}, null);
        assert(getUserStub.calledOnce);
        assert(result.text);
        assert(result.text == "User does not exist");
        assert(!result.data)
      });

      it('should succeed if the requested user record is found', async () => {
        getUserStub.resolves("data");
        let result = await getUserInfo({uid: "1"}, null);
        assert(getUserStub.calledOnce);
        assert(!result.text);
        assert(result.data);
        assert(result.data == "data");
      });
    });
  });

  describe('Friend Functions', () => {
    let friendRecordStub;

    before(() => {
      friendRecordStub = {toJSON: sinon.stub(), uid: "2"};
    });

    describe('addFriend', () => { // TODO incomplete
      let addFriend, includesStub;

      before(() => {
        addFriend = test.wrap(functions.addFriend);
        includesStub = sinon.stub();
      });

      afterEach(() => {
        getUserByEmailStub.resetHistory();
        getStub.resetHistory();
        dataStub.resetHistory();
        updateStub.resetHistory();
      })

      it('should fail when the request is unauthenticated', async () => {
        let result = await addFriend({}, {});
        assert(getUserByEmailStub.notCalled);
        assert(getStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when getUserByEmail() fails', async () => {
        getUserByEmailStub.rejects({message: "error"});
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error while adding friend");
      });

      it('should fail when get() fails', async () => {
        getUserByEmailStub.resolves(friendRecordStub);
        getStub.rejects({message: "error"});
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error while adding friend");
      });

      it('should fail when no user data is found', async () => {
        getUserByEmailStub.resolves(friendRecordStub);
        getStub.resolves({exists: false});
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "User document does not exist");
      });

      it('should fail when update() fails', async () => { // TODO
        getUserByEmailStub.resolves(friendRecordStub);
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({});
        updateStub.rejects({message: "error"});
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Firebase error while adding friend");
      });

      it('should succeed with sending friend request if friend does not have any pending friend requests', async () => {
        getUserByEmailStub.resolves(friendRecordStub);
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({});
        updateStub.resolves();
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Successfully sent friend request");
      });

      it('should succeed with sending friend request if friend does not have a pending friend request to the user', async () => {
        getUserByEmailStub.resolves(friendRecordStub);
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({friendsToAdd: {includes: includesStub}});
        updateStub.resolves();
        includesStub.returns(false);
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Successfully sent friend request");
      });

      it('should succeed with sending friend request if friend does have a pending friend request to the user', async () => {
        getUserByEmailStub.resolves(friendRecordStub);
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({friendsToAdd: {includes: includesStub}});
        updateStub.resolves();
        includesStub.returns(true);
        let result = await addFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.calledTwice);
        assert(result.text);
        assert(result.text == "Successfully sent friend request");
      }); // TODO fieldvalue
    });

    describe('removeFriend', () => { // TODO incomplete
      let removeFriend;

      before(() => {
        removeFriend = test.wrap(functions.removeFriend);
      });

      afterEach(() => {
        getUserByEmailStub.resetHistory();
        getStub.resetHistory();
        updateStub.resetHistory();
      });

      it('should fail when the request is not authenticated', async () => {
        let result = await removeFriend({}, {});
        assert(getUserByEmailStub.notCalled);
        assert(getStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when getUserByEmail() throws an error', async () => {
        getUserByEmailStub.rejects({message: "error"});
        let result = await removeFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error while adding friend");
      });

      it('should fail when get() throws an error', async () => {
        getUserByEmailStub.resolves({toJSON: sinon.stub()});
        getStub.rejects({message: "error"});
        let result = await removeFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error while adding friend");
      });

      it('should fail when user info is not found', async () => {
        getUserByEmailStub.resolves({toJSON: sinon.stub()});
        getStub.resolves({exists: false});
        let result = await removeFriend({friend_email: "email"}, sampleContext);
        assert(getUserByEmailStub.calledOnce);
        assert(getStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "User document does not exist");
      });
    });

    describe('getFriendsList', () => {
      let getFriendsList;

      before(() => {
        getFriendsList = test.wrap(functions.getFriendsList);
      });

      afterEach(() => {
        getStub.resetHistory();
        dataStub.resetHistory();
      });

      it('should fail if the request is not authenticated', async () => {
        let result = await getFriendsList({}, {});
        assert(getStub.notCalled);
        assert(dataStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail if get() throws an error', async () => {
        getStub.rejects({message: "error"});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error while adding friend");
      });

      it('should fail if the user data is not found', async () => {
        getStub.resolves({exists: false});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(result.text);
        assert(result.text == "User document does not exist");
      });

      it('should fail if the user data does not contain friendsToAdd', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({friends: []});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(result.text);
        assert(result.text == "Friends lists not found");
      });

      it('should fail if the user data does not contain friends', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({friendsToAdd: []});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(result.text);
        assert(result.text == "Friends lists not found");
      });

      it('should return empty lists if user\'s lists are empty', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({friendsToAdd: [], friends: []});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(result.text);
        assert(result.text == "Successfully got friends list");
        assert(result.friendsToAdd);
        assert(result.friendsToAdd.length == 0);
        assert(result.friends);
        assert(result.friends.length == 0);
      });

      it('should ignore friends that are missing user data', async () => {
        getStub.onCall(0).resolves({exists: true, data: dataStub});
        getStub.onCall(1).resolves({exists: false});
        getStub.onCall(2).resolves({exists: false});
        dataStub.returns({friendsToAdd: ['2'], friends: ['3']});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.calledThrice);
        assert(dataStub.calledOnce);
        assert(result.text);
        assert(result.text == "Successfully got friends list");
        assert(result.friendsToAdd);
        assert(result.friendsToAdd.length == 0);
        assert(result.friends);
        assert(result.friends.length == 0);
      });

      it('should return all friends in friends lists with user data', async () => {
        getStub.onCall(0).resolves({exists: true, data: dataStub});
        getStub.onCall(1).resolves({exists: false});
        getStub.onCall(2).resolves({exists: true, data: dataStub});
        getStub.onCall(3).resolves({exists: false});
        getStub.onCall(4).resolves({exists: true, data: dataStub});
        dataStub.onCall(0).returns({friendsToAdd: ['2', '3'], friends: ['4', '5']});
        dataStub.onCall(1).returns({data: "friend 3"});
        dataStub.onCall(2).returns({data: "friend 5"});
        let result = await getFriendsList({}, sampleContext);
        assert(getStub.callCount == 5);
        assert(dataStub.calledThrice);
        assert(result.text);
        assert(result.text == "Successfully got friends list");
        assert(result.friendsToAdd);
        assert(result.friendsToAdd.length == 1);
        assert(result.friendsToAdd[0].uid == "3")
        assert(result.friendsToAdd[0].data == "friend 3")
        assert(result.friends);
        assert(result.friends.length == 1);
        assert(result.friends[0].uid == "5")
        assert(result.friends[0].data == "friend 5")
      });
    });
    
  });

  describe('Schedule Functions', () => {

    describe('getSchedule', () => {
      let getSchedule;

      before(() => {
        getSchedule = test.wrap(functions.getSchedule);
      });

      afterEach(() => {
        getStub.resetHistory();
      });

      it('should fail when the caller is not authenticated', async () => {
        let result = await getSchedule(null, {});
        assert(getStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");

        result = await getSchedule(null, {auth: {other: "other"}});
        assert(getStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when the requested schedule does not exist', async () => {
        getStub.resolves({exists: false});
        let result = await getSchedule(null, sampleContext);
        assert(getStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == "No schedule found for user");
      });

      it('should fail when firestore throws an error', async () => {
        getStub.rejects(new Error('test error'));
        let result = await getSchedule(null, sampleContext);
        assert(getStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == 'test error');
      });

      it('should return the schedule object when the request is authenticated and the requested schedule is found', async () => {
        getStub.resolves({exists: true, data: () => [{start: 1, end: 2}]});
        let result = await getSchedule(null, sampleContext);
        assert(getStub.calledOnce);
        assert(result.status == "ok");
        assert(!result.text);
        assert(result.schedule);
        assert(result.schedule.length == 1);
        assert(result.schedule[0].start == 1);
        assert(result.schedule[0].end == 2);
      });
    });

    describe('addSchedule', () => {
      let addSchedule;

      before(() => {
        addSchedule = test.wrap(functions.addSchedule);
      });

      afterEach(() => {
        setStub.resetHistory();
      });

      it('should fail when the caller is not authenticated', async () => {
        let result = await addSchedule({}, {});
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");

        result = await addSchedule({}, {auth: {other: "other"}});
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when no data is provided', async () => {
        let result = await addSchedule(null, {auth: {uid: "1"}});
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "addSchedule called without schedule data");

        result = await addSchedule({}, {auth: {uid: "1"}});
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "addSchedule called without schedule data");
      });

      it('should fail when firestore throws an error', async () => {
        setStub.rejects(new Error('test error'));
        let result = await addSchedule({timeslots: []}, {auth: {uid: "1"}});
        assert(setStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == "test error");
      });

      it('should return ok if the request is authenticated and the provided schedule is stored successfully', async() => {
        setStub.resolves(null);
        let result = await addSchedule({timeslots: [{start: 1, end: 2, description: "test"}]}, {auth: {uid: "1"}});
        assert(setStub.calledOnce);
        assert(result.status == "ok");
        assert(!result.text);
      });
    });

    describe('addTimeslotToSchedule', () => {
      let addTimeslotToSchedule;

      before(() => {
        addTimeslotToSchedule = test.wrap(functions.addTimeslotToSchedule);
      });

      afterEach(() => {
        getStub.resetHistory();
        dataStub.resetHistory();
        updateStub.resetHistory();
      });

      it('should fail when the caller is not authenticated', async () => {
        let result = await addTimeslotToSchedule(null, {});
        assert(getStub.notCalled);
        assert(dataStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when get() throws an error', async () => {
        getStub.rejects({message: "error"});
        let result = await addTimeslotToSchedule(null, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error");
      });

      it('should fail when the user\'s schedule is not found', async () => {
        getStub.resolves({exists: false});
        let result = await addTimeslotToSchedule(null, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "User schedule does not exist");
      });

      it('should fail if the timeslot start is not a number', async () => {
        getStub.resolves({exists: true, data: dataStub});
        let result = await addTimeslotToSchedule({timeslot: {start: "text", end: 1}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Time format incorrect, check endpoint specification for details");
      });

      it('should fail if the timeslot end is not a number', async () => {
        getStub.resolves({exists: true, data: dataStub});
        let result = await addTimeslotToSchedule({timeslot: {start: 1, end: "text"}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Time format incorrect, check endpoint specification for details");
      });

      it ('should fail if the timeslot start is greater than the timeslot end', async () => {
        getStub.resolves({exists: true, data: dataStub});
        let result = await addTimeslotToSchedule({timeslot: {start: 1, end: 0}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Error, start time later than end time");
      });

      it ('should fail when update() throws an error', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({timeslots: []});
        updateStub.rejects({message: "error"});
        let result = await addTimeslotToSchedule({timeslot: {start: 0, end: 1, description: "test"}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Firebase error");
      });

      it ('should succeed when the timeslot is correctly formatted and firebase throws no errors', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({timeslots: []});
        updateStub.resolves();
        let result = await addTimeslotToSchedule({timeslot: {start: 2, end: 3, description: "test"}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Successfully updated schedule with new timeslot");
      });
    });

    describe('addTimeslotToScheduleandCombine', () => {
      let addTimeslotToScheduleandCombine;

      before(() => {
        addTimeslotToScheduleandCombine = test.wrap(functions.addTimeslotToScheduleandCombine);
      });

      afterEach(() => {
        getStub.resetHistory();
        dataStub.resetHistory();
        updateStub.resetHistory();
      });

      it('should fail when the caller is not authenticated', async () => {
        let result = await addTimeslotToScheduleandCombine(null, {});
        assert(getStub.notCalled);
        assert(dataStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when get() throws an error', async () => {
        getStub.rejects({message: "error"});
        let result = await addTimeslotToScheduleandCombine(null, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error");
      });

      it('should fail when the user\'s schedule is not found', async () => {
        getStub.resolves({exists: false});
        let result = await addTimeslotToScheduleandCombine(null, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "User schedule does not exist");
      });

      it('should fail if the timeslot start is not a number', async () => {
        getStub.resolves({exists: true, data: dataStub});
        let result = await addTimeslotToScheduleandCombine({timeslot: {start: "text", end: 1}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Time format incorrect, check endpoint specification for details");
      });

      it('should fail if the timeslot end is not a number', async () => {
        getStub.resolves({exists: true, data: dataStub});
        let result = await addTimeslotToScheduleandCombine({timeslot: {start: 1, end: "text"}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Time format incorrect, check endpoint specification for details");
      });

      it ('should fail if the timeslot start is greater than the timeslot end', async () => {
        getStub.resolves({exists: true, data: dataStub});
        let result = await addTimeslotToScheduleandCombine({timeslot: {start: 1, end: 0}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Error, start time later than end time");
      });

      it ('should fail when update() throws an error', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({timeslots: []});
        updateStub.rejects({message: "error"});
        let result = await addTimeslotToScheduleandCombine({timeslot: {start: 0, end: 1, description: "test"}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Firebase error");
      });

      it ('should succeed when the timeslot is correctly formatted and firebase throws no errors', async () => {
        getStub.resolves({exists: true, data: dataStub});
        dataStub.returns({timeslots: []});
        updateStub.resolves();
        let result = await addTimeslotToScheduleandCombine({timeslot: {start: 2, end: 3, description: "test"}}, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(updateStub.calledOnce);
        assert(result.text);
        assert(result.text == "Successfully updated schedule with new timeslot");
      });
    });

    describe('removeSchedule', () => {
      let removeSchedule;

      before(() => {
        removeSchedule = test.wrap(functions.removeSchedule);
      });

      afterEach(() => {
        updateStub.resetHistory();
      });

      it('should fail when the caller is not authenticated', async () => {
        let result = await removeSchedule(null, {});
        assert(updateStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");

        result = await removeSchedule(null, {auth: {other: "other"}});
        assert(updateStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when firestore throws an error', async () => {
        updateStub.rejects(new Error('test error'));
        let result = await removeSchedule(null, {auth: {uid: "1"}});
        assert(updateStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == "test error");
      });

      it('should return ok if the request is authenticated and the update executes successfully', async() => {
        updateStub.resolves(null);
        let result = await removeSchedule(null, {auth: {uid: "1"}});
        assert(updateStub.calledOnce);
        assert(result.status == "ok");
        assert(!result.text);
      });
    });

    describe('addEventToSchedule', () => {
      let addEventToSchedule, scheduleStub, addTimeslotStub;

      before(() => {
        addEventToSchedule = test.wrap(functions.addEventToSchedule);
        constructorStub = sinon.stub();
        addTimeslotStub = sinon.stub();
        scheduleStub = {
          addTimeslot: addTimeslotStub
        };
      });

      afterEach(() => {
        getStub.resetHistory();
        setStub.resetHistory();
        dataStub.resetHistory();
        addTimeslotStub.resetHistory();
      });

      it('should fail when uid or timeslot is not provided', async () => {
        let result = await addEventToSchedule({}, null);
        assert(getStub.notCalled);
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "No uid provided\n");

        result = await addEventToSchedule({uid: 1}, null);
        assert(getStub.notCalled);
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "No event timeslot provided\n");
      });

      it('should fail when timeslot is incorrectly formatted', async () => {
        let result = await addEventToSchedule({uid: 1, timeslot: {start: "text", end: 2}}, null);
        assert(result.status == "not ok");
        assert(result.text == "Time format incorrect, check endpoint specification for details");

        result = await addEventToSchedule({uid: 1, timeslot: {start: 1, end: "text"}}, null);
        assert(result.status == "not ok");
        assert(result.text == "Time format incorrect, check endpoint specification for details");

        result = await addEventToSchedule({uid: 1, timeslot: {start: 2, end: 1}}, null);
        assert(result.status == "not ok");
        assert(result.text == "Start time later than end time");

        assert(getStub.notCalled);
        assert(setStub.notCalled);
      });

      it('should fail when firestore get() throws an error', async () => {
        getStub.rejects({message: "get test error"});
        let result = await addEventToSchedule({uid: 1, timeslot: {start: 3, end: 4}}, null);
        assert(getStub.calledOnce);
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "get test error");
      });

      it('should fail if no schedule is found by get()', async () => {
        getStub.resolves({exists: false});
        let result = await addEventToSchedule({uid: 1, timeslot: {start: 3, end: 4}}, null);
        assert(getStub.calledOnce);
        assert(setStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "No schedule found for user with uid 1\n");
      });

      it('should fail when firestore set() throws an error', async () => {
        getStub.resolves({exists: true, data: dataStub});
        setStub.rejects({message: "add test error"});
        dataStub.returns(scheduleStub);

        let result = await addEventToSchedule({uid: 1, timeslot: {start: 3, end: 4}}, null);
        console.log(result.text);
        assert(getStub.calledOnce);
        assert(setStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == "add test error");
      });

      it('should succeed if both get() and set() execute without error', async () => {
        getStub.resolves({exists: true, data: dataStub});
        setStub.resolves();
        dataStub.returns(scheduleStub);

        let result = await addEventToSchedule({uid: 1, timeslot: {start: 3, end: 4}}, null);
        console.log(result.text);
        assert(getStub.calledOnce);
        assert(setStub.calledOnce);
        assert(dataStub.calledOnce);
        assert(result.status == "ok");
        assert(!result.text);
      });
    });
  });

  describe('Event Functions', () => {
    describe('createEvent', () => {
      let createEvent, sampleData;

      before(() => {
        createEvent = test.wrap(functions.createEvent);
        sampleData = {
          event_name: "name",
          description: "description",
          invitees: [],
          start_date: 1,
          end_date: 3,
          duration: 1
        };
      });

      afterEach(() => {
        addStub.resetHistory();
        updateStub.resetHistory();
      });

      it('should fail when the request is not authenticated', async () => {
        let result = await createEvent({}, {});
        assert(addStub.notCalled);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Unauthenticated user");
      });

      it('should fail if add() throws an error', async () => {
        addStub.reject({message: "error"});
        let result = await createEvent(sampleData, sampleContext);
        assert(addStub.calledOnce);
        assert(updateStub.notCalled);
        assert(result.text);
        assert(result.text == "Firebase error");
      });
      // TODO fieldstore
    });

    describe('getEvent', () => {
      let getEvent;

      before(() => {
        getEvent = test.wrap(functions.getEvent);
      });

      afterEach(() => {
        getStub.resetHistory();
      });

      it('should fail if the request is not authenticated', () => {

      });
    });
  });
});

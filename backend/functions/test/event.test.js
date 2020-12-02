const test = require('firebase-functions-test')();
const assert = require('assert');
const sinon = require('sinon');

const admin = require('firebase-admin');
const firestore = admin.Firestore;

describe('Event Functions', () => {
  let adminStub, adminFirestoreStub, getStub, addStub, functions, createEvent, getEvent, updateEvent, getUsersInEvent, setEventTime;
  let finalizeEventTime, setReadyForEvent, setNotReadyForEvent, inviteToEvent, acceptEventInvite, declineEventInvite, removeFromEvent, leaveEvent;
  let addUserScheduleToEvent, computeNextEarliestAvailableTime;

  before(() => {
    getStub = sinon.stub();
    addStub = sinon.stub();

    adminFirestoreStub = sinon.stub(admin, 'firestore').get(
      function() {
        return function() {
          return {
            collection: sinon.stub().withArgs('events').returns({
              doc: sinon.stub().withArgs('1').returns({
                withConverter: sinon.stub().returns({
                  get: getStub,
                  set: addStub
                })
              })
            })
          }
        }
      }
    );

    functions = require('../index');
    createEvent = test.wrap(functions.createEvent);
    getEvent = test.wrap(functions.getEvent);
    updateEvent = test.wrap(functions.updateEvent);
    getUsersInEvent = test.wrap(functions.getUsersInEvent);
    setReadyForEvent = test.wrap(functions.setReadyForEvent);
    inviteToEvent = test.wrap(functions.inviteToEvent);
    leaveEvent = test.wrap(functions.leaveEvent);
    addUserScheduleToEvent = test.wrap(functions.addUserScheduleToEvent);
    computeNextEarliestAvailableTime = test.wrap(functions.computeNextEarliestAvailableTime);
  });

  afterEach(() => {
    getStub.resetHistory();
    addStub.resetHistory();
  })

  after(() => {
    sinon.restore();
    test.cleanup();

  });

  describe('getEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await getEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await getEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await getEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should return event when the requested event is found', async () => {
      getStub.resolves({exists: true, data: () => {name: "Event name"}});
      let result = await getSchedule(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Get event successful, check event_data object");
      assert(result.event_data);
      assert(result.event_data.name == "Event name");
    });
  });

  describe('createEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await createEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await createEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await createEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if event is created', async() => {
      addStub.resolves(null);
      let result = await createEvent({
                    name: "Event name",
                    description: "",
                    duration: 60, //duration of event in minutes
                    invitees: [],
                    start_date: 1,
                    end_date: 2,
                },  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Event added, check event_id field");
    });
  });

  describe('updateEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await updateEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await updateEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await updateEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if event is updated', async() => {
      addStub.resolves(null);
      let result = await updateEvent({event_id: 1, eventData: {
                    name: "Sample Event",
                    description: "",
                    start_date: 1,
                    end_date: 2,
                }},  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Modified event");
    });
  });

  describe('getUsersInEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await getUsersInEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await getUsersInEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await getUsersInEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if users are returned', async() => {
      getStub.resolves({exists: true, data: () => {name: "Event name", members: [1], invitees:[]}});
      let result = await getUsersInEvent({event_id: 1},  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Get event successful, check inviteesInfo and membersInfo object lists");
      assert(result.inviteesInfo.length == 0);
      assert(result.memberssInfo.length == 1);
    });
  });

  describe('setReadyForEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await setReadyForEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await setReadyForEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await setReadyForEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if ready is set', async() => {
      addStub.resolves(null);
      let result = await setReadyForEvent({event_id: 1},  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Set event time");
    });
  });

  describe('inviteToEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await inviteToEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await inviteToEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await inviteToEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if user is invited', async() => {
      addStub.resolves(null);
      let result = await inviteToEvent({event_id: 1, invitees: [2]},  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Invitees added");
    });
  });

  describe('addUserScheduleToEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await addUserScheduleToEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await addUserScheduleToEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await addUserScheduleToEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if event schedule is updated', async() => {
      addStub.resolves(null);
      let result = await addUserScheduleToEvent({event_id: 1},  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Successfully updated event schedule with user schedules");
    });
  });

  describe('computeNextEarliestAvailableTime', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await computeNextEarliestAvailableTime(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await computeNextEarliestAvailableTime(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await computeNextEarliestAvailableTime(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should return event when the computed time is found', async () => {
      getStub.resolves(null);
      let result = await computeNextEarliestAvailableTime({event_id: 1}, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Earliest time computed, check computedTime field");
      assert(result.computedTime == 2);
    });
  });

  describe('leaveEvent', () => {
    it('should fail when the caller is not authenticated', async () => {
      let result = await leaveEvent(null, {});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");

      result = await leaveEvent(null, {auth: {other: "other"}});
      assert(getStub.notCalled);
      assert(result.text == "Unauthenticated user");
    });

    it('should fail when firestore throws an error', async () => {
      getStub.rejects(new Error('test error'));
      let result = await leaveEvent(null, {auth: {uid: "1"}});
      assert(getStub.calledOnce);
      assert(result.text == "Firebase error");
    });

    it('should succeed if user leaves event', async() => {
      addStub.resolves(null);
      let result = await leaveEvent({event_id: 1},  {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.text == "Left event");
    });
  });
});

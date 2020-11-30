const test = require('firebase-functions-test')();
const admin = require('firebase-admin');
const assert = require('assert');
const sinon = require('sinon');

describe('Offline Tests', () => {
  let adminInitStub, getStub, setStub, updateStub, dataStub, test;

  before(() => {
    adminInitStub = sinon.stub(admin, 'initializeApp');
    test = require('firebase-functions-test')();

    getStub = sinon.stub();
    setStub = sinon.stub();
    updateStub = sinon.stub();
    dataStub = sinon.stub();
  });

  after(() => {
    adminInitStub.restore();
    test.cleanup();
  });

  describe('Schedule Functions', () => {
    let adminFirestoreStub, functions;

    before(() => {
      adminFirestoreStub = sinon.stub(admin, 'firestore').get(
        function() {
          return function() {
            return {
              collection: sinon.stub().withArgs('schedules').returns({
                doc: sinon.stub().withArgs('1').returns({
                  withConverter: sinon.stub().returns({
                    get: getStub,
                    set: setStub
                  }),
                  get: getStub,
                  set: setStub,
                  update: updateStub
                })
              })
            }
          }
        }
      );

      functions = require('../index.js');
    });

    after(() => {
      adminFirestoreStub.restore();
    });

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
        let result = await getSchedule(null, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == "No schedule found for user");
      });

      it('should fail when firestore throws an error', async () => {
        getStub.rejects(new Error('test error'));
        let result = await getSchedule(null, {auth: {uid: "1"}});
        assert(getStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == 'test error');
      });

      it('should return the schedule object when the request is authenticated and the requested schedule is found', async () => {
        getStub.resolves({exists: true, data: () => [{start: 1, end: 2}]});
        let result = await getSchedule(null, {auth: {uid: "1"}});
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
});

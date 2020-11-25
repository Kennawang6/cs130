const test = require('firebase-functions-test');
const admin = require('firebase-admin');
const assert = require('assert');
const sinon = require('sinon');

describe('Schedule Functions', () => {
  describe('Offline Tests', () => {
    let functions, adminInitStub, adminFirestoreStub, getStub, addStub, updateStub, addSchedule, getSchedule, schedulesStub, testOffline;

    before(() => {
      getStub = sinon.stub();
      addStub = sinon.stub();
      updateStub = sinon.stub();

      adminInitStub = sinon.stub(admin, 'initializeApp');

      adminFirestoreStub = sinon.stub(admin, 'firestore').get(
        function() {
          return function() {
            return {
              collection: sinon.stub().withArgs('schedules').returns({
                doc: sinon.stub().withArgs('1').returns({
                  withConverter: sinon.stub().returns({
                    get: getStub,
                    set: addStub
                  }),
                  update: updateStub
                })
              })
            }
          }
        }
      );

      testOffline = require('firebase-functions-test')();

      functions = require('../index.js');

      addSchedule = testOffline.wrap(functions.addSchedule);
      getSchedule = testOffline.wrap(functions.getSchedule);
      removeSchedule = testOffline.wrap(functions.removeSchedule);
    });

    after(() => {
      adminInitStub.restore();
      adminFirestoreStub.restore();
      testOffline.cleanup();
    });

    describe('getSchedule', () => {
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
      afterEach(() => {
        addStub.resetHistory();
      });

      it('should fail when the caller is not authenticated', async () => {
        let result = await addSchedule({}, {});
        assert(addStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");

        result = await addSchedule({}, {auth: {other: "other"}});
        assert(addStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "Unauthenticated user");
      });

      it('should fail when no data is provided', async () => {
        let result = await addSchedule(null, {auth: {uid: "1"}});
        assert(addStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "addSchedule called without schedule data");

        result = await addSchedule({}, {auth: {uid: "1"}});
        assert(addStub.notCalled);
        assert(result.status == "not ok");
        assert(result.text == "addSchedule called without schedule data");
      });

      it('should fail when firestore throws an error', async () => {
        addStub.rejects(new Error('test error'));
        let result = await addSchedule({timeslots: []}, {auth: {uid: "1"}});
        assert(addStub.calledOnce);
        assert(result.status == "not ok");
        assert(result.text == "test error");
      });

      it('should return ok if the request is authenticated and the provided schedule is stored successfully', async() => {
        addStub.resolves(null);
        let result = await addSchedule({timeslots: [{start: 1, end: 2, description: "test"}]}, {auth: {uid: "1"}});
        assert(addStub.calledOnce);
        assert(result.status == "ok");
        assert(!result.text);
      });
    });

    describe('removeSchedule', () => {
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
  });

  describe('Online Tests', () => {
    let functions, addScheduleOnline, getScheduleOnline, removeScheduleOnline, testOnline;

    before(() => {
      testOnline = require('firebase-functions-test')({
        databaseURL: 'https://letshang-test.firebaseio.com',
        storageBucket: 'letshang-test.appspot.com',
        projectId: 'letshang-test'
      }, './test/serviceAccountKey.json');

      functions = require('../index.js');

      addScheduleOnline = testOnline.wrap(functions.addSchedule);
      getScheduleOnline = testOnline.wrap(functions.getSchedule);
      removeScheduleOnline = testOnline.wrap(functions.removeSchedule);
    })

    after(() => {
      testOnline.cleanup();
      //admin.database().ref('schedules').remove();
    });

    it('should get the same schedule it added', async () => {
      let result = await addScheduleOnline({timeslots: [{start: 3, end: 4, description: "test"}]}, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getScheduleOnline(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 1);
      assert(result.schedule.timeslots[0].start == 3);
      assert(result.schedule.timeslots[0].end == 4);
      assert(result.schedule.timeslots[0].description == 'test');
    });

    it('should find an empty schedule after removing the schedule', async () => {
      let result = await removeScheduleOnline(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);

      result = await getScheduleOnline(null, {auth: {uid: "2"}});
      assert(result.status == "ok");
      assert(!result.text);
      assert(result.schedule);
      assert(result.schedule.timeslots);
      assert(result.schedule.timeslots.length == 0);
    });
  });
});

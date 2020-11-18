const test = require('firebase-functions-test')();
const assert = require('assert');
const sinon = require('sinon');

const admin = require('firebase-admin');
const firestore = admin.Firestore;

describe('Schedule Functions', () => {
  let adminStub, adminFirestoreStub, getStub, addStub, functions, addSchedule, getSchedule, schedulesStub;

  before(() => {
    getStub = sinon.stub();
    addStub = sinon.stub();

    adminFirestoreStub = sinon.stub(admin, 'firestore').get(
      function() {
        return function() {
          return {
            collection: sinon.stub().withArgs('schedules').returns({
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
    addSchedule = test.wrap(functions.addSchedule);
    getSchedule = test.wrap(functions.getSchedule);
  });

  afterEach(() => {
    getStub.resetHistory();
    addStub.resetHistory();
  })

  after(() => {
    sinon.restore();
    test.cleanup();

  });

  describe('getSchedule', () => {
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
      let result = await addSchedule({timeslots: []}, {auth: {uid: "1"}});
      assert(addStub.calledOnce);
      assert(result.status == "ok");
      assert(!result.text);
    });
  });
});

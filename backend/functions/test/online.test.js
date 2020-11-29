const test = require('firebase-functions-test');
const admin = require('firebase-admin');
const assert = require('assert');
const sinon = require('sinon');

describe('Online Tests', () => {
  let functions, testOnline;

  before(() => {
    testOnline = require('firebase-functions-test')({
      databaseURL: 'https://letshang-test.firebaseio.com',
      storageBucket: 'letshang-test.appspot.com',
      projectId: 'letshang-test'
    }, './test/serviceAccountKey.json');

    functions = require('../index.js');
  })

  after(() => {
    testOnline.cleanup();
    //admin.database().ref('schedules').remove();
  });

  describe('Schedule Functions', () => {
    let addSchedule, getSchedule, removeSchedule;

    before(() => {
      addSchedule = testOnline.wrap(functions.addSchedule);
      getSchedule = testOnline.wrap(functions.getSchedule);
      removeSchedule = testOnline.wrap(functions.removeSchedule);
      addEventToSchedule = testOnline.wrap(functions.addEventToSchedule);
    });
    it('should get the same schedule it added', async () => {
      let result = await addSchedule({timeslots: [{start: 3, end: 4, description: "test"}]}, {auth: {uid: "2"}});
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
      let result = await addEventToSchedule({uid: "2", timeslot: {start: 5, end: 6, description: "new"}});
      console.log(result.status);
      console.log(result.text);
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
      assert(result.schedule.timeslots[0].description == 'test');
      assert(result.schedule.timeslots[1].start == 5);
      assert(result.schedule.timeslots[1].end == 6);
      assert(result.schedule.timeslots[1].description == 'new');
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

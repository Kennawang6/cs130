const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

class Schedule {
  constructor (timeslots) {
    this.timeslots = timeslots;
  }
}

var scheduleConverter = {
  toFirestore: function(schedule) {
    return {
      timeslots: schedule.timeslots
    }
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data(options);
    return new Schedule(data.timeslots);
  }
}

exports.addSchedule = functions.https.onCall((data, context) => {
  if (!context.auth) {
    functions.logger.info("Unauthenticated user");
    return {status: "not ok", text: "Unauthenticated user"};
  } else {
    const id = context.auth.uid;
    functions.logger.info("saving schedule of user with id " + id + "\n");

    db.collection('schedules').doc(id).withConverter(scheduleConverter).set(new Schedule(data)).then(() => {
      functions.logger.info("Saved schedule for user " + id + "\n");
      return {status: "ok"};
    }).catch((error) => {
      functions.logger.info("could not save schedule of user with id " + id + ", error: " + error);
      return {status: "not ok", text: error};
    });
  }
});

exports.getSchedule = functions.https.onCall((data, context) => {
  if (!context.auth) {
    functions.logger.info("Unauthenticated user");
    return {status: "not ok", text: "Unauthenticated user"};
  } else {
    const id = context.auth.uid
    functions.logger.info("Getting schedule for user with id " + id + "\n");

    db.collection('schedules').doc(id).withConverter(scheduleConverter).get().then((doc) => {
      if (doc.exists) {
        return {status: "ok", schedule: doc.data()};
      } else {
        return {status: "not ok", text: "No schedule found for user"}
      }
    }).catch((error) => {
      functions.logger.info("Could not get schedule for user with id " + id + ", error: " + error + "\n");
      return {status: "not ok", text: error};
    });
  }
});

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const schedules = admin.firestore().collection('schedules');

class Timeslot {
  // start: int
  // end: int
  // description: string
  // id: int
  constructor(start, end, id, description = "") {
    this.start = start;
    this.end = end;
    this.id = id;
    this.description = description;
  }

  serialize() {
    return {start: this.start, end: this.end, id: this.id, description: this.description};
  }

  static compare(timeslot1, timeslot2) {
    // parameters:
    // timeslot1: Timeslot
    // timeslot2: Timeslot
    // returns:
    // -1: timeslot1 is entirely before timeslot2
    // 0: timeslot1 and timeslot2 intersect
    // 1: timeslot1 is entirely after timeslot2
    if (timeslot1.end < timeslot2.start) {
      return -1;
    } else if (timeslot1.start > timeslot2.end) {
        return 1;
    } else {
      return 0;
    }
  }

  static merge(timeslot1, timeslot2) {
    // merges 2 timeslots and returns the result
    let start = Math.min(timeslot1.start, timeslot2.start);
    let end = Math.max(timeslot2.end, timeslot2.end);
    let id = Math.min(timeslot1.id, timeslot2.id);
    let description = timeslot1.description + ", " + timeslot2.description;
    return new Timeslot(start, end, id, description);
  }
}

class Schedule {
  // timeslots: array of objects with start and end fields (like Timeslot)
  constructor (timeslotList = []) {
    let timeslots = [];
    timeslotList.forEach((timeslot) => {
      timeslots.push(new Timeslot(timeslot.start, timeslot.end, timeslot.id, timeslot.description));
    });
    this.timeslots = timeslots;
  }

  serialize() {
    let serializedTimeslots = [];
    this.timeslots.forEach((timeslot) => {
      serializedTimeslots.push(timeslot.serialize());
    })
    return {timeslots: serializedTimeslots};
  }

  addTimeslot(newTimeslot) {
    // parameters:
    // newTimeslot: Timeslot
    // inserts the newTimeslot in order
    // if newTimeslot intersects in time with another timeslot in the array,
    // this function merges the two and inserts the merged timeslot
    let result = [], newTimeslotAdded = false;
    this.timeslots.sort(Timeslot.compare);

    for (let currentTimeslot of this.timeslots) {
      if (newTimeslotAdded) {
      } else {
        switch (Timeslot.compare(newTimeslot, currentTimeslot)) {
          case -1:
            result.push(newTimeslot);
            result.push(currentTimeslot);
            newTimeslotAdded = true;
            break;
          case 0:
            result.push(Timeslot.merge(newTimeslot, currentTimeslot));
            newTimeslotAdded = true;
            break;
          case 1:
            result.push(currentTimeslot);
            break;
        }
      }
    }
    if (!newTimeslotAdded) {
      result.push(newTimeslot);
    }

    this.timeslots = result;
  }
}

var scheduleConverter = {
  toFirestore: function(schedule) {
    return schedule.serialize();
  },
  fromFirestore: function(snapshot, options) {
    const data = snapshot.data(options);
    return new Schedule(data.timeslots);
  }
}

exports.addSchedule = functions.https.onCall(async (data, context) => {
  // data parameters:
  // timeslots: JSON list of timeslots representing busy times
  //{
  //  timeslots: [
  //    {
  //      start: 1/1/21 12:00 AM,
  //      end: 1/1/21 12:00 PM
  //    },
  //    {
  //      start: 1/1/21 1:00 PM,
  //      end: 1/1/21 2:00 PM
  //    }
  //  ]
  //}
  // returns:
  // ok/not ok status
  // an error message if not ok status
  if (!context.auth || !context.auth.uid) {
    functions.logger.info("Unauthenticated user\n");
    return {status: "not ok", text: "Unauthenticated user"};
  } else {
    const id = context.auth.uid;
    functions.logger.info("saving schedule of user with id " + id + "\n");

    if (!data || !data.timeslots) {
      functions.logger.info("User did not provide schedule for addSchedule\n");
      return {status: "not ok", text: "addSchedule called without schedule data"};
    }

    try {
      await schedules.doc(id).withConverter(scheduleConverter).set(new Schedule(data.timeslots));
      functions.logger.info("Saved schedule for user " + id + "\n");
      return {status: "ok"};
    } catch (error) {
      functions.logger.error("could not save schedule of user with id " + id + ", error: " + error.message + "\n");
      return {status: "not ok", text: error.message};
    }
  }
});

exports.getSchedule = functions.https.onCall(async (data, context) => {
  // data parameters:
  // none
  // returns:
  // ok/not ok status
  // if successful, the schedule object with ok status
  // otherwise an error message and not ok status
  if (!context.auth || !context.auth.uid) {
    functions.logger.info("Unauthenticated user\n");
    return {status: "not ok", text: "Unauthenticated user"};
  } else {
    const id = context.auth.uid;
    functions.logger.info("Getting schedule for user with id " + id + "\n");

    try {

      const schedule = await schedules.doc(id).withConverter(scheduleConverter).get();

      if (schedule.exists) {
        return {status: "ok", schedule: schedule.data()};
      } else {
        return {status: "not ok", text: "No schedule found for user"}
      }
    } catch (error) {
      functions.logger.error("Could not get schedule for user with id " + id + ", error: " + error.message + "\n");
      return {status: "not ok", text: error.message};
    }
  }
});

exports.addTimeslotToSchedule = functions.https.onCall(async (data, context) => {
    //data parameters (all required):
    //  timeslot: {
    //      start: <milliseconds since 1970/01/01, which can be found using Date.getTime>
    //      end: <end time in same format>,
    //      id: <id>,
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

            if(isNaN(data.timeslot.start) || isNaN(data.timeslot.end)){
                console.log("Time format incorrect, check endpoint specification for details");
                return {text: "Time format incorrect, check endpoint specification for details"};
            }

            if(data.timeslot.start > data.timeslot.end){
                console.log("Error, start time later than end time");
                return {text: "Error, start time later than end time"};
            }

            var finalTimeslots = [];
            var newTimeslotAdded = false;

            for(const scheduleTimeslot of scheduleData.timeslots){
              if(!newTimeslotAdded && scheduleTimeslot.start > data.timeslot.start){
                finalTimeslots.push({
                  start: data.timeslot.start,
                  end: data.timeslot.end,
                  id: data.timeslot.id,
                  description: data.timeslot.description,
                });
                finalTimeslots.push(scheduleTimeslot);
                newTimeslotAdded = true;
              } else {
                finalTimeslots.push(scheduleTimeslot);
              }
            }

            if(!newTimeslotAdded){
              finalTimeslots.push({
                start: data.timeslot.start,
                end: data.timeslot.end,
                id: data.timeslot.id,
                description: data.timeslot.description,
              });
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

exports.addTimeslotToScheduleandCombine = functions.https.onCall(async (data, context) => {
    //data parameters (all required):
    //  timeslot: {
    //      start: <milliseconds since 1970/01/01, which can be found using Date.getTime>
    //      end: <end time in same format>,
    //      id: <id>,
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
            newTimeslot.description = data.timeslot.description;
            newTimeslot.start = data.timeslot.start;
            newTimeslot.id = data.timeslot.id;

            for(const scheduleTimeslot of scheduleData.timeslots){
              const scheduleTimeslotStartTime = scheduleTimeslot.start;
              const scheduleTimeslotEndTime = scheduleTimeslot.end;

              if(!newTimeslotStarted){
                if(startTime <= scheduleTimeslotEndTime){
                  const newTimeslotStart = "";
                  if(startTime < scheduleTimeslotStartTime){
                    newTimeslotStart = data.timeslot.start;
                  } else {
                    newTimeslotStart = scheduleTimeslot.start;
                  }

                  if(endTime < scheduleTimeslotStartTime){
                      newTimeslot = {
                        start: newTimeslotStart,
                        end: data.timeslot.end,
                      }
                      newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                      finalTimeslots.push(newTimeslot);
                      finalTimeslots.push(scheduleTimeslot);
                      newTimeslotStarted = true;
                      newTimeslotEnded = true;
                  } else if(endTime <= scheduleTimeslotEndTime){
                      newTimeslot = {
                        start: newTimeslotStart,
                        end: scheduleTimeslot.end,
                      }
                      newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
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
                  newTimeslotEnded = true;
                } else {
                  newTimeslot.description = newTimeslot.description.concat(", ", scheduleTimeslot.description);
                }
              } else {
                finalTimeslots.push(scheduleTimeslot);
              }
            }

            if(!newTimeslotEnded){
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

exports.removeSchedule = functions.https.onCall(async (data, context) => {
  // data parameters:
  // none
  // returns:
  // ok/not ok status
  if (!context.auth || !context.auth.uid) {
    functions.logger.info("Unauthenticated user\n");
    return {status: "not ok", text: "Unauthenticated user"};
  } else {
    const id = context.auth.uid;
    functions.logger.info("Emptying schedule of user with id " + id + "\n");

    try {
      await schedules.doc(id).update({timeslots: []});
      functions.logger.info("Emptied schedule for user " + id + "\n");
      return {status: "ok"};
    } catch (error) {
      functions.logger.error("could empty schedule of user with id " + id + ", error: " + error.message + "\n");
      return {status: "not ok", text: error.message};
    }
  }
});

exports.addEventToSchedule = functions.https.onCall(async (data, context) => {
  // data parameters:
  // uid: string
  // timeslot: Timeslot
  // returns:
  // ok/not ok status
  // error message if not ok
  let uid = data.uid;
  let timeslot = data.timeslot;
  if (!uid) {
    return {status: "not ok", text: "No uid provided\n"};
  } else if (!timeslot) {
    return {status: "not ok", text: "No event timeslot provided\n"};
  } else if (isNaN(timeslot.start) || isNaN(timeslot.end)) { // TODO test cases
    return {status: "not ok", text: "Time format incorrect, check endpoint specification for details"};
  } else if (timeslot.start > timeslot.end) {
    return {status: "not ok", text: "Start time later than end time"};
  } else {
    try {
      const result = await schedules.doc(uid).withConverter(scheduleConverter).get();
      if (!result.exists) {
        return {status: "not ok", text: "No schedule found for user with uid " + uid + "\n"};
      }

      let schedule = result.data();
      schedule.addTimeslot(new Timeslot(timeslot.start, timeslot.end, timeslot.id, timeslot.description));

      await schedules.doc(uid).withConverter(scheduleConverter).set(schedule);

      return {status: "ok"};
    } catch (error) {
      functions.logger.error(error.message);
      return {status: "not ok", text: error.message};
    }
  }
});

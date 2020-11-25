const functions = require('firebase-functions');
const admin = require('firebase-admin');
const schedules = admin.firestore().collection('schedules');

class Timeslot {
  // start: int
  // end: int
  // description: string
  // availability: integer
  constructor(start, end, description = "", availability = 1) {
    this.start = start;
    this.end = end;
    this.description = description;
    this.availability = availability;
  }

  serialize() {
    return {start: this.start, end: this.end, description: this.description, availability: this.availability};
  }
}

class Schedule {
  // timeslots: list of objects with start and end fields (like Timeslot)
  constructor (timeslotList = []) {
    let timeslots = [];
    timeslotList.forEach((timeslot) => {
      timeslots.push(new Timeslot(timeslot.start, timeslot.end, timeslot.description, timeslot.availability));
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

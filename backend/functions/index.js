const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const user = require("./user.js");
const friend = require("./friend.js");
const schedule = require("./schedule.js");
const event = require("./event.js");

// user endpoints
exports.addUserData = user.addUserData;
exports.getUserData = user.getUserData;
exports.updateUserData = user.updateUserData;
exports.getUserInfo = user.getUserInfo;

// friend endpoints
exports.addFriend = friend.addFriend;
exports.removeFriend = friend.removeFriend;
exports.getFriendsList = friend.getFriendsList;

// schedule endpoints
exports.addSchedule = schedule.addSchedule;
exports.getSchedule = schedule.getSchedule;
exports.addTimeslotToSchedule = schedule.addTimeslotToSchedule;
exports.addTimeslotToScheduleandCombine = schedule.addTimeslotToScheduleandCombine;
exports.removeSchedule = schedule.removeSchedule;
exports.addEventToSchedule = schedule.addEventToSchedule;

// event endpoints
exports.createEvent = event.createEvent;
exports.getEvent = event.getEvent;
exports.addUserScheduleToEvent = event.addUserScheduleToEvent;
exports.computeNextEarliestAvailableTime = event.computeNextEarliestAvailableTime;

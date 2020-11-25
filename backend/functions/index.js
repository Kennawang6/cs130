const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const user = require("./user.js");
const friend = require("./friend.js");
const schedule = require("./schedule.js");

// user endpoins
exports.addUserData = user.addUserData;
exports.getUserData = user.getUserData;
exports.updateUserData = user.updateUserData;
exports.getUserName = user.getUserName;

// friend endpoins
exports.addFriend = friend.addFriend;
exports.removeFriend = friend.removeFriend;
exports.getFriendsList = friend.getFriendsList;
exports.removeFriend = friend.removeFriend;

// schedule endpoints
exports.addSchedule = schedule.addSchedule;
exports.getSchedule = schedule.getSchedule;
exports.removeSchedule = schedule.removeSchedule;

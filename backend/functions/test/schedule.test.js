const test = require('firebase-functions-test');
const functions = require('../index.js');

const addSchedule = test.wrap(functions.addSchedule);

const getSchedule = test.wrap(functions.getSchedule);

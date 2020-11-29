import {ADD_SCHEDULE, REPLACE_SCHEDULE, REMOVE_SCHEDULE} from './types'
export const addScheduleEvent = (event) =>(
{
	type: ADD_SCHEDULE,
	description: event.description,
    start: event.start,
    end: event.end,
    id: event.id,
    //TODO: add fields for weekly calendar
});

export const replaceSchedule = (events) =>(
{
	type: REPLACE_SCHEDULE,
	events: events,
});

export const removeScheduleEvent = (eventID) =>(
{
	type: REMOVE_SCHEDULE,
	eventID: eventID,
});

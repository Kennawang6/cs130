import {ADD_SCHEDULE, EDIT_SCHEDULE, REMOVE_SCHEDULE} from './types'
export const addScheduleEvent = (eventPair) =>(
{
	type: ADD_SCHEDULE,
	eventID: eventPair.eventID,
	eventInfo: eventPair.eventInfo,
});

/*export const editSchedule = (event) =>(
{
	type: EDIT_SCHEDULE,
	eventID: eventPair.eventID,
    eventInfo: eventPair.eventInfo,
});
*/

export const removeScheduleEvent = (eventID) =>(
{
	type: REMOVE_SCHEDULE,
	eventID: eventID,
});

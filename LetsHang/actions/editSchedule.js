import {ADD_SCHEDULE, EDIT_SCHEDULE, REMOVE_SCHEDULE} from './types'
export const addSchedule = (eventPair) =>(
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

export const removeSchedule = (eventID) =>(
{
	type: REMOVE_SCHEDULE,
	eventID: eventID,
});

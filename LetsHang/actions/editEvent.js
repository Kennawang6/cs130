import {ADD_EVENT, REMOVE_EVENT, CUR_EVENT} from './types'
export const addEvent = (event) =>(
{
	type:"ADD_EVENT",
	eventInfo: event.eventInfo,
	eventID: event.eventID
});

export const removeEvent = (eventID) =>(
{
	type:"REMOVE_EVENT",
	eventID: eventID
});

export const editCurEvent = (event) =>(
{
	type:"CUR_EVENT",
	curEvent: event.curEvent
});


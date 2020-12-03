import {SET_EVENT, ADD_EVENT, REMOVE_EVENT, CUR_EVENT, EVEN_REQUEST} from './types'

export const setEvent = (eventPair) =>(
{
	type:"SET_EVENT",
	eventPair: eventPair,
});

export const addEvent = (eventPair) =>(
{
	type:"ADD_EVENT",
	eventID: eventPair.eventID,
	eventInfo: eventPair.eventInfo,
	ifUser: eventPair.ifUser,
});

export const removeEvent = (event) =>(
{
	type:"REMOVE_EVENT",
	eventID: event.eventID,
});

export const editCurEvent = (event) =>(
{
	type:"CUR_EVENT",
	curEvent: event.curEvent,
});

export const setEventRequest = (eventRequest) =>(
{	type: "EVEN_REQUEST",
	eventRequest: eventRequest,
});


import {SET_EVENT, ADD_EVENT, REMOVE_EVENT, CUR_EVENT} from './types'

export const setEvent = (eventPair) =>(
{
	type:"SET_EVENT",
	eventPair: eventPair,
});

export const addEvent = (eventPair) =>(
{
	type:"ADD_EVENT",
	eventPair: eventPair,
});

export const removeEvent = (eventID) =>(
{
	type:"REMOVE_EVENT",
	eventID: eventID,
});

export const editCurEvent = (event) =>(
{
	type:"CUR_EVENT",
	curEvent: event.curEvent,
});


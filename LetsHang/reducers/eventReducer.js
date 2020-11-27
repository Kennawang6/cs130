import {SET_EVENT, ADD_EVENT, REMOVE_EVENT, CUR_EVENT} from '../actions/types'
const initialState = {
  curEvent: {friendInvited: []},
  eventList: [],
};
const eventReducer = (state = initialState, action) => {
  switch(action.type){
  	case "SET_EVENT" :{
  	return{
	  ...state,
	  curEvent: {friendInvited: []},
	  eventList: action.eventPair,
	}}
  	case "ADD_EVENT" :{
  	return{
	  ...state,
	  curEvent: {friendInvited: []},
	  eventList: state.eventList.concat({
	  	eventID: action.eventID,
	  	eventInfo: action.eventInfo,
	  	ifUser: action.ifUser,
	  	ifDecidedButton: false,
	  	ifFinalizedButton: false,
	  })}

	}
	case "REMOVE_EVENT" :{
  	return{
	  ...state,
	  curEvent: {friendInvited: []},
	  eventList: state.eventList.filter((event) => event.eventID !== action.eventID),
	  }
	}
	case "CUR_EVENT" :{
	return{
	  ...state,
	  curEvent: action.curEvent,
	  eventList: state.eventList,
	  }
	}
	default:{
		return state;
	}
  }
}

export default eventReducer;
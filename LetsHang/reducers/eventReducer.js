import {SET_EVENT, ADD_EVENT, REMOVE_EVENT, CUR_EVENT} from '../actions/types'
const initialState = {
  curEvent: {friendInvited: []},
  eventList: [],
  eventRequest: 0,
};
const eventReducer = (state = initialState, action) => {
  switch(action.type){
  	case "SET_EVENT" :{
  	return{
	  ...state,
	  curEvent: {friendInvited: []},
	  eventList: action.eventPair,
	  eventRequest: state.eventRequest,
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
	  }),
	  eventRequest: state.eventRequest,
	}

	}
	case "REMOVE_EVENT" :{
  	return{
	  ...state,
	  curEvent: {friendInvited: []},
	  eventList: state.eventList.filter((event) => event.eventID !== action.eventID),
	  eventRequest: state.eventRequest,
	  }
	}
	case "CUR_EVENT" :{
	return{
	  ...state,
	  curEvent: action.curEvent,
	  eventList: state.eventList,
	  eventRequest: state.eventRequest,
	  }
	}
	case "EVEN_REQUEST":{
	return{
		...state,
		curEvent: state.curEvent,
		eventList: state.eventList,
		eventRequest: action.eventRequest,

	}
	}
	default:{
		return state;
	}
  }
}

export default eventReducer;
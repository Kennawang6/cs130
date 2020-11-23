import {ADD_EVENT, REMOVE_EVENT, CUR_EVENT} from '../actions/types'
const initialState = {
  curEvent: {friendInvited: []},
  eventList: [],
};
const eventReducer = (state = initialState, action) => {
  switch(action.type){
  	case "ADD_EVENT" :{
  	return{
	  ...state,
	  curEvent: [],
	  eventList: state.eventList.concat({
	  	eventInfo: action.eventInfo,
	  	eventID: action.eventID,
	  })}

	}
	case "REMOVE_EVENT" :{
  	return{
	  ...state,
	  curEvent: [],
	  eventList: state.eventList.filter((event) => event.eventID !== eventID),
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
import {EDIT_NAME} from '../actions/types'
const initialState = {
  uName: ""
};
const UserNameReducer = (state = initialState , action) => {
  switch(action.type){
  	case "EDIT_NAME" :{
  	return{
	  ...state,
	  uName : action.uName}
	}
	default:{
		return state;
	}
  }
}

export default UserNameReducer;
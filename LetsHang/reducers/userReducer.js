import {EDIT_USER} from '../actions/types'
const initialState = {
  userInfo: {}
};
const UserReducer = (state = initialState , action) => {
  switch(action.type){
  	case "EDIT_USER" :{
  	return{
	  ...state,
	  userInfo: action.userInfo}
	}
	default:{
		return state;
	}
  }
}

export default UserReducer;
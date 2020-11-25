import {ADD_FRIEND, REMOVE_FRIEND} from '../actions/types'

const initialState = {
    friends: []
};

const friendsListReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_FRIEND: {
            return {
                ...state,
                friends: state.friends.concat({
                    email: action.email,
                })
            };
        }
        case REMOVE_FRIEND: {
            return {
                ...state,
                friends: state.friends.filter((event) => event.email !== action.email),
            };
        }
        default: {
            return state;
        }
    }
}

export default friendsListReducer;
import {SAVE_FRIENDS, REMOVE_FRIEND, ACCEPT_FRIEND, REJECT_FRIEND} from '../actions/types'

const initialState = {
    friends: [],
    friendRequests: [],
};

const friendsListReducer = (state = initialState, action) => {
    switch (action.type) {
        case SAVE_FRIENDS: {
            return {
                ...state,
                friends: action.friends,
                friendRequests: action.friendRequests
            };
        }
        case ACCEPT_FRIEND: {
            return {
                ...state,
                friends: state.friends.concat({
                    friend: action.friend,
                }),
                friendRequests: state.friendRequests.filter((person) => person.email !== action.friend.email)
            };
        }
        case REJECT_FRIEND: {
            return {
                ...state,
                friends: state.friends,
                friendRequests: state.friendRequests.filter((person) => person.email !== action.friend.email)
            };
        }
        case REMOVE_FRIEND: {
            return {
                ...state,
                friends: state.friends.filter((person) => person.email !== action.friend.email),
                friendRequests: state.friendRequests,
            };
        }
        default: {
            return state;
        }
    }
}

export default friendsListReducer;



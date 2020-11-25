import {ADD_FRIEND, REMOVE_FRIEND} from './types'

export const addFriend = (email) => ({
    type: ADD_FRIEND,
    email: email,
});

export const removeFriend = (email) =>({
    type: REMOVE_FRIEND,
    email: email,
});
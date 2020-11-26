import {SAVE_FRIENDS, ACCEPT_FRIEND, REMOVE_FRIEND, REJECT_FRIEND} from './types'

export const saveFriends = (friends, friendRequests) => ({
    type: SAVE_FRIENDS,
    friends: friends,
    friendRequests: friendRequests,
});

export const acceptFriend = (friend) => ({
    type: ACCEPT_FRIEND,
    friend,
});

export const removeFriend = (friend) =>({
    type: REMOVE_FRIEND,
    friend,
});

export const rejectFriend = (friend) =>({
    type: REJECT_FRIEND,
    friend,
});
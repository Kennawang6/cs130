import React, {useState, Component} from 'react';
import functions from '@react-native-firebase/functions';
import { View, Text } from 'react-native'
import { Icon, Badge, withBadge } from 'react-native-elements'

import { connect } from 'react-redux';
import { saveFriends, acceptFriend, removeFriend, rejectFriend } from '../../actions/editFriendsList'

class FriendsTabBadge extends Component{
    constructor(props) {
        super(props);
    }

        render() {
            let BadgedIcon = withBadge(this.props.friendRequests.length)(Icon)
            if (this.props.friendRequests.length === 0)
                BadgedIcon = (Icon)
            return (
              <BadgedIcon name="people" />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        friends: state.friendsListReducer.friends,
        friendRequests: state.friendsListReducer.friendRequests,
}};

const mapDispatchToProps = (dispatch) => {
    return {
        reduxSaveFriends:(friends, friendRequests) => dispatch(saveFriends(friends, friendRequests)),
        reduxAcceptFriend:(friend) => dispatch(acceptFriend(friend)),
        reduxRemoveFriend:(friend) => dispatch(removeFriend(friend)),
        reduxRejectFriend:(friend) => dispatch(rejectFriend(friend)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(FriendsTabBadge);
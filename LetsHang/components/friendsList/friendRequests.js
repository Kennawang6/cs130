import React, {useState, Component} from 'react';
import { View, Text, Alert } from 'react-native'
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon, Divider } from 'react-native-elements';
import styles from './styles';

import { connect } from 'react-redux';
import { saveFriends, acceptFriend, removeFriend, rejectFriend } from '../../actions/editFriendsList'

class FriendRequests extends Component{
    constructor(props) {
        super(props);
        this.state = {
            text: "",
        }
        this.accept = this.accept.bind(this);
        this.reject = this.reject.bind(this);
    }

    accept = async(friend, email) => {
        console.log(email);
        console.log("accept button pressed")
        const data = await functions().httpsCallable('addFriend')({friend_email: email});
        this.setState({text: data.data.text}, () => {
            this.notifyUser(this.state.text);
        });
        this.props.reduxAcceptFriend(friend);
    }

    reject = async(friend, email) => {
        console.log(email);
        console.log("reject button pressed");
        const data = await functions().httpsCallable('removeFriend')({friend_email: email});
        this.setState({text: data.data.text}, () => {
            this.notifyUser(this.state.text);
        });
        this.props.reduxRejectFriend(friend);
    }

    notifyUser = (text) => {
       alert(text);
    }

    shouldComponentUpdate(nextProps, nextState) {
        console.log('Should I update?');
        console.log("new friend requests length: ", nextProps.friendRequests.length);
        console.log("old friends requests length: ", this.props.friendRequests.length);
        if (nextProps.friendRequests.length !== this.props.friendRequests.length)
            return true;
        else
            return false;
    }

    componentDidUpdate(prevProps) {
        console.log("Re-rendering... in friend requests");
    }

    render() {
        const friendsToAdd = this.props.friendRequests.map(i =>
            <View key={i.email} bottomDivider style = {{padding: 1,}}>
                <ListItem>
                    <Avatar
                        size="medium"
                        rounded
                        source={{uri: i.photoURL}}
                     />
                    <ListItem.Content>
                        <ListItem.Title>{i.name}</ListItem.Title>
                        <ListItem.Subtitle>{i.email}</ListItem.Subtitle>
                    </ListItem.Content>
                    <View style={{flexDirection: 'row', width: 100,
                                justifyContent: 'space-around'}}>
                      <Icon onPress={() => this.accept(i, i.email)} color="green" name="done" />
                      <Icon onPress={() => this.reject(i, i.email)} color="red" name="clear" />
                    </View>
                </ListItem>
            </View>
         );
        if ((Array.isArray(this.props.friendRequests) && this.props.friendRequests.length > 0))
            return(
                <View>
                    {friendsToAdd}
                </View>
            );
        else if ((Array.isArray(this.props.friendRequests) && this.props.friendRequests.length == 0))
            return(
                <View style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#fff'
                      }}>
                    <Text style={{fontSize: 16}}>
                        You do not have any pending friend requests.
                    </Text>
                </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(FriendRequests);

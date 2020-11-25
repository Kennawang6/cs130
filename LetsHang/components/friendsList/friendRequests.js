import React, {useState, Component} from 'react';
import { View, Text, Alert } from 'react-native'
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon, Divider } from 'react-native-elements';
import styles from './styles';

import { connect } from 'react-redux';
import { addFriend, removeFriend } from '../../actions/editFriendsList'

class FriendRequests extends Component{
    constructor(props) {
        super(props);
        this.state = {
            friendsToAdd: this.props.route.params.friendsToAdd,
            text: "",
        }
        this.accept = this.accept.bind(this);
        this.reject = this.reject.bind(this);
    }

    accept = async(email) => {
        console.log(email);
        const data = await functions().httpsCallable('addFriend')({friend_email: email});
        this.setState({text: data.data.text}, () => {
            this.notifyUser(this.state.text);
        });
    }

    reject = async(email) => {
        console.log(email);
        const data = await functions().httpsCallable('removeFriend')({friend_email: email});
        this.setState({text: data.data.text}, () => {
            this.notifyUser(this.state.text);
        });
    }

    notifyUser = (text) => {
       alert(text);
    }

    render() {
        const friendsToAdd = this.state.friendsToAdd.map(i =>
            <View key={i.uid} bottomDivider style = {{padding: 1,}}>
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
                      <Icon onPress={() => this.accept(i.email)} color="green" name="done" />
                      <Icon onPress={() => this.reject(i.email)} color="red" name="clear" />
                    </View>
                </ListItem>
            </View>
         );
        if ((Array.isArray(this.state.friendsToAdd) && this.state.friendsToAdd.length > 0))
            return(
                <View>
                    {friendsToAdd}
                </View>
            );
        else if ((Array.isArray(this.state.friendsToAdd) && this.state.friendsToAdd.length == 0))
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
}};

const mapDispatchToProps = (dispatch) => {
    return {
        reduxAddFriend:(email) => dispatch(addFriend(email)),
        reduxRemoveFriend:(email) => dispatch(removeFriend(email)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(FriendRequests);
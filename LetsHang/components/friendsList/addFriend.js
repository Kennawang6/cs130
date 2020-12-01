import React, {useState, Component} from 'react';
import { View, Text, TouchableOpacity, TextInput, Button, Alert } from 'react-native'
import functions from '@react-native-firebase/functions';
import styles from './styles';
import Spinner from 'react-native-loading-spinner-overlay';

import { connect } from 'react-redux';
import { saveFriends, acceptFriend, removeFriend, rejectFriend } from '../../actions/editFriendsList'

class AddFriend extends Component{
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            email: "",
            friendsAdded: [],
            friendsEmail: "",
            spinner: false
        };
        this.sendFriendRequest = this.sendFriendRequest.bind(this);
    }

    componentDidMount() {
        this.setState({ spinner: true });
        for (const friend of this.props.friends)
            this.state.friendsAdded.push(friend.email);
        console.log(this.state.friendsAdded);
        this.getUserData();
        this.setState({ spinner: false });
    }

    getUserData = async() => {
        const data = await functions().httpsCallable('getUserData')({});
        console.log("User's email is fetched");
        let ownEmail = data.data.data.email;
        this.setState({ email: ownEmail });
        console.log(this.state.email);
    }

    sendFriendRequest = async() => {
        const data = await functions().httpsCallable('addFriend')({friend_email: this.state.friendsEmail});
        console.log("addFriend function has been called");
        this.setState({text: data.data.text}, () => {
            console.log(data.data.text);
            this.notifyUser(this.state.text);
        });
    }

    handlePress = () => {
        console.log("Button was pressed");
        console.log(this.state.friendsEmail);
        this.setState({ spinner: true });
        if (this.state.friendsEmail === this.state.email)
            this.notifyUser("You cannot add yourself");
        else if (this.state.friendsAdded.includes(this.state.friendsEmail))
            this.notifyUser("Friend already added")
        else
            this.sendFriendRequest();
    }

    notifyUser = (text) => {
       this.setState({ spinner: false });
       alert(text);
    }

    render() {
        return (
          <View style={styles.addFriendContainer}>
            {this.state.spinner === true &&
                  <View style={styles.loading}>
                  <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={styles.spinnerTextStyle}
                  />
                  </View>
            }
            <TextInput style = {styles.input}
                   underlineColorAndroid = "transparent"
                   placeholder = "Email"
                   placeholderTextColor = "#1f44f4"
                   autoCapitalize = "none"
                   onChangeText={(TextInputValue) => this.setState({friendsEmail: TextInputValue})}
             />
                <TouchableOpacity
                   style = {styles.buttonStyle}
                   onPress = {this.handlePress}>
                   <Text style = {styles.submitButtonText}> Send Friend Request </Text>
                </TouchableOpacity>
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

export default connect(mapStateToProps, mapDispatchToProps)(AddFriend);

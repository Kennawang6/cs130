import React, {useState, Component} from 'react';
import { View, Text, TouchableOpacity, TextInput, Button, Alert } from 'react-native'
import functions from '@react-native-firebase/functions';
import styles from './styles';

class AddFriend extends Component{
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            friendsEmail: ""
        };
        this.sendFriendRequest = this.sendFriendRequest.bind(this);
    }

    sendFriendRequest = async() => {
        const data = await functions().httpsCallable('addFriend')({friend_email: this.state.friendsEmail});
        console.log("addFriend function has been called");
        console.log(data);
        this.setState({text: data.data.text}, () => {
            console.log(data.data.text);
            this.notifyUser(this.state.text);
        });
    }

/*    shouldComponentUpdate(nextProps, nextState) {
        console.log('Should I update?');
        console.log(this.state.friendsEmail);
        if (nextState.friendsEmail !== "") {
            return true;
        } else
            return false;
    }

    componentDidUpdate() {
      console.log('Component re-rendered.');
      this.sendFriendRequest;
    }*/

    handlePress = () => {
        console.log("Button was pressed");
        console.log(this.state.friendsEmail);
        this.sendFriendRequest();
    }

    notifyUser = (text) => {
       alert(text);
    }

    render() {
        return (
          <View style={styles.addFriendContainer}>
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

export default AddFriend;
import React, {useState, Component} from 'react';
import {View, Text} from 'react-native';
import functions from '@react-native-firebase/functions';

class FriendsList extends Component{
    constructor(props) {
        super(props);
        this.state = {
          text: "",
          friendsToAdd: "",
          friends: ""
        };
    }


  getUserData = async() => {
    const data = await functions().httpsCallable('getFriendsList')({});
    console.log("Friend's list is fetched");
    console.log(data);
    this.setState({text: data.data.text,
                   friendsToAdd: data.data.friendsToAdd,
                   friends: data.data.friends}, () => {
        console.log(data.data.text);
    });
  }

  componentDidMount() {
     this.getUserData();
  }

    render() {
        return (
            <View>
                <Text>{this.state.text}</Text>
            </View>
        );
    }
}

export default FriendsList;
import React, {useState, Component} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import functions from '@react-native-firebase/functions';
import styles from './styles';

class FriendsList extends Component{
    constructor(props) {
        super(props);
        this.state = {
          text: "",
          friendsToAdd: [],
          friends: []
        };
    }


    getFriendData = async() => {
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
        this.getFriendData();
    }

    render() {
        if (this.state.friends.length < 1){
            return (
                <View style = {styles.container}>
                    <Text style = {styles.textStyle}>No friends have been added.</Text>
                  <Button style={styles.buttonStyle}
                    title="Add Friend"
                    onPress={()=>this.props.navigation.navigate('Add Friend')}
                  />
                </View>
            );
        }
        else {
            return (
                <View>
                    <Text>{this.state.text}</Text>
                </View>
            );
        }
    }
}

export default FriendsList;
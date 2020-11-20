import React, {useState, Component} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem } from 'react-native-elements';
import styles from './styles';

class NoFriends extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <View style = {styles.noFriendsContainer}>
            <Text>{console.log("friends list is not undefined")}</Text>
            <Text style = {styles.textStyle}>No friends have been added.</Text>
            <Button style={styles.buttonStyle}
                title="Add Friend"
                onPress={()=>this.props.navigation.navigate('Add Friend')}
            />
        </View>
        );
    }
}

class HaveFriends extends Component{
    constructor(props) {
        super(props);
        this.onPressed = this.onPressed.bind(this);
    }

    onPressed(person){
        this.props.navigation.navigate( 'Friend Info', {
           photo: person.photoURL,
           name: person.name,
           email: person.email,
           timeZone: person.timeZone
        });
     }

    render() {
        const friends = this.props.friends.map(i =>
            <View>
              <ListItem key={i.email} bottomDivider onPress={() => this.onPressed(i)}>
                <Avatar
                  size="medium"
                  rounded
                  source={{uri: i.photoURL}} />
                <ListItem.Content>
                  <ListItem.Title>{i.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron size={30} color="#808080"/>
              </ListItem>
            </View>
         );
        return (
        <View>
            <Button style={styles.buttonStyle}
                title="Add Friend"
                onPress={()=>this.props.navigation.navigate('Add Friend')}
            />
            {friends}
        </View>
        );
    }
}

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
        console.log("Friends list is fetched");
        console.log(data);
        this.setState({text: data.data.text,
                       friendsToAdd: data.data.friendsToAdd,
                       friends: data.data.friends}, () => {
            console.log(this.state.text);
            console.log(this.state.friends);
            console.log(this.state.friendsToAdd);
        });
    }

    componentDidMount() {
        this.getFriendData();
    }


    render() {
        if (Array.isArray(this.state.friends) && this.state.friends.length < 1){
            return (
                <NoFriends navigation={this.props.navigation}/>
            );
        }
        else if (Array.isArray(this.state.friends)) {
            return (
                <HaveFriends friends={this.state.friends} navigation={this.props.navigation}/>
            );
        }
        else {
            return (
                <View>
                    <Text>{console.log("friends list is undefined")} {this.state.text}</Text>
                </View>
            );
        }
    }
}

export default FriendsList;
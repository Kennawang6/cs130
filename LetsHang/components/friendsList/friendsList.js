import React, {useState, Component} from 'react';
import {View, Text, Button, TouchableOpacity, Alert, ScrollView} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon, Divider } from 'react-native-elements';
import styles from './styles';
import Spinner from 'react-native-loading-spinner-overlay';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import { connect } from 'react-redux';
import { saveFriends, acceptFriend, removeFriend, rejectFriend } from '../../actions/editFriendsList'

class NoFriends extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <View>
            <Text>{console.log("friends list is not undefined")}</Text>
            <Divider style={{ margin: 15, }} />
            <Text style={{fontSize: 16, textAlign:'center', textAlignVertical:'center',
                            backgroundColor:'white', height: 60}}>
                No friends have been added.
            </Text>
        </View>
        );
    }
}

class HaveFriends extends Component{
    constructor(props) {
        super(props);
        this.getFriendInfo = this.getFriendInfo.bind(this);
    }

    getFriendInfo(person){
        this.props.navigation.navigate( 'Friend Info', {
           person: person,
           photo: person.photoURL,
           name: person.name,
           email: person.email,
           timeZone: person.timeZone
        });
     }

    render() {
        const friends = this.props.friends.map(i =>
            <View key={i.uid} bottomDivider style = {{padding: 1,}}>
              <ListItem onPress={() => this.getFriendInfo(i)}>
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
        <ScrollView>
            <Divider style={{ margin: 15, }} />
            <View>
                {friends}
            </View>
        </ScrollView>
        </View>
        );
    }
}

class FriendsList extends Component{
    constructor(props) {
        super(props);
        this.state = {
          text: "",
          spinner: false
        };
        this.addOrSeeRequests = this.addOrSeeRequests.bind(this);

        this.subscriber = firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .onSnapshot(documentSnapshot => {
              console.log("Fetch friends and friend requests");
              let oldFriendListSize = this.props.friends.length;
              let newFriendListSize = documentSnapshot._data.friends.length;
              let oldFriendRequestsSize = this.props.friendRequests.length;
              let newFriendRequestsSize = documentSnapshot._data.friendsToAdd.length;
              if (oldFriendListSize !== newFriendListSize || oldFriendRequestsSize !== newFriendRequestsSize){
                console.log("Friends List or requests size has changed")
                this.getFriendData();
              }
        });
    }

     addOrSeeRequests(location){
        this.props.navigation.navigate(location);
     }

    getFriendData = async() => {
        const data = await functions().httpsCallable('getFriendsList')({});
        console.log("Friends list is fetched");
        console.log(data);
        let friends = data.data.friends;
        let friendRequests = data.data.friendsToAdd;
        this.setState({text: data.data.text,}, () => {
            this.setState({ spinner: false });

        if (Array.isArray(friends) && Array.isArray(friendRequests))
            this.props.reduxSaveFriends(friends, friendRequests);
        });
    }

    componentDidMount() {
        this.setState({ spinner: true });
        this.getFriendData();
    }

    componentDidUpdate(prevProps) {
        console.log('Re-rendering... in friends list');
    }

    render() {
        const list = [
          {
            title: 'Add Friend',
            icon: 'person-add-alt-1',
          },
          {
            title: 'Friend Requests',
            icon: 'notifications',
        }];

        return (
        <View>
            {this.state.spinner === true &&
                  <View style={styles.loading}>
                  <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={styles.spinnerTextStyle}
                  />
                  </View>
            }
            <View>
              {
                list.map((item, i) => (
                  <ListItem key={i} bottomDivider onPress={() => this.addOrSeeRequests(item.title)}>
                    <Icon name={item.icon} />
                    <ListItem.Content>
                      <ListItem.Title>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron size={30} color="#808080"/>
                  </ListItem>
                ))
              }
            </View>
            {(Array.isArray(this.props.friends) && this.props.friends.length < 1) &&
                <NoFriends />
            }
            {(Array.isArray(this.props.friends)) &&
                <HaveFriends friends={this.props.friends}
                             friendsToAdd={this.props.friendRequests}
                             navigation={this.props.navigation}/>
            }
            {(Array.isArray(this.props.friends) == false) &&
                <View>
                    <Text>{console.log("friends list is undefined")} {this.state.text}</Text>
                </View>
            }
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

export default connect(mapStateToProps, mapDispatchToProps)(FriendsList);
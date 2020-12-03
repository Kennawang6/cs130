import React, {useState, Component} from 'react';
import {View, Text, Button, TouchableOpacity, Alert, ScrollView} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon, Divider, Badge } from 'react-native-elements';
import styles from './styles';
import Spinner from 'react-native-loading-spinner-overlay';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import TouchableScale from 'react-native-touchable-scale'; // https://github.com/kohver/react-native-touchable-scale
import LinearGradient from 'react-native-linear-gradient'; // Only if no expo

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
            <View key={i.email} bottomDivider style = {{padding: 1,}}>
              <ListItem onPress={() => this.getFriendInfo(i)}
                Component={TouchableScale}
                friction={90} //
                tension={100} // These props are passed to the parent component (here TouchableScale)
                activeScale={0.95} //
              >
                <Avatar
                  size="small"
                  rounded
                  source={{uri: i.photoURL}} />
                <ListItem.Content>
                  <ListItem.Title style={{ color: 'black' }}>{i.name}</ListItem.Title>
                  <ListItem.Subtitle>{i.email}</ListItem.Subtitle>
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

        this.subscriber = firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .onSnapshot(documentSnapshot => {
              if (documentSnapshot._data) {
                  console.log("Fetch friends and friend requests");
                  let oldFriendListSize = this.props.friends.length;
                  let newFriendListSize = documentSnapshot._data.friends.length;
                  let oldFriendRequestsSize = this.props.friendRequests.length;
                  let newFriendRequestsSize = documentSnapshot._data.friendsToAdd.length;
                  if (oldFriendListSize !== newFriendListSize || oldFriendRequestsSize !== newFriendRequestsSize){
                    console.log("Friends List or requests size has changed")
                    this.getFriendData();
                }
              }
        });
    }

    getFriendData = async() => {
        const data = await functions().httpsCallable('getFriendsList')({});
        console.log("Friends list is fetched");
        console.log(data);
        let friends = data.data.friends.sort((a, b) => a.name.localeCompare(b.name));
        let friendRequests = data.data.friendsToAdd.sort((a, b) => a.name.localeCompare(b.name));
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

    componentWillUnmount() {
        this.subscriber();
    }

    render() {
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

                <ListItem key={'Add Friend'} bottomDivider onPress={() => this.props.navigation.navigate('Add Friend')}>
                  <Icon name='person-add-alt-1' />
                  <ListItem.Content>
                    <ListItem.Title>Add Friend</ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron size={30} color="#808080"/>
                </ListItem>
                <ListItem key={'Friend Requests'} bottomDivider onPress={() => this.props.navigation.navigate('Friend Requests')}>
                  <Icon name='notifications' />
                  <ListItem.Content>
                    <ListItem.Title>Friend Requests</ListItem.Title>
                  </ListItem.Content>
                  {(this.props.friendRequests.length > 0) &&
                  <Badge
                    value={this.props.friendRequests.length}
                    badgeStyle={{ backgroundColor: 'red' }}
                    textStyle={{ color: 'white' }}
                  />
                  }
                  <ListItem.Chevron size={30} color="#808080"/>
                </ListItem>

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
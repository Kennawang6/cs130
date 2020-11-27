import React, {useState, Component} from 'react';
import {View, Text, Button, TouchableOpacity, Alert, ScrollView} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon, Divider } from 'react-native-elements';
import styles from './styles';

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
          friendsToAdd: [],
          friends: []
        };
        this.addOrSeeRequests = this.addOrSeeRequests.bind(this);
    }

     addOrSeeRequests(location){
        this.props.navigation.navigate(location, {
            friendsToAdd: this.state.friendsToAdd,
            navigation: this.props.navigation
        });
     }

    getFriendData = async() => {
        const data = await functions().httpsCallable('getFriendsList')({});
        console.log("Friends list is fetched");
        console.log(data);
        this.setState({text: data.data.text,
                       friendsToAdd: data.data.friendsToAdd,
                       friends: data.data.friends}, () => {
            let friends = [];
            if (Array.isArray(this.state.friends))
                for (let friend of this.state.friends)
                    friends.push(friend);

            let friendRequests = [];
            if (Array.isArray(this.state.friendsToAdd))
                for (let request of this.state.friendsToAdd)
                    friendRequests.push(request);

            this.props.reduxSaveFriends(friends, friendRequests);
        });


    }

    componentDidMount() {
        this.getFriendData();
    }

    componentDidUpdate(prevProps) {
        console.log('Should I update?');
        console.log("new friends length: ", this.props.friends.length);
        console.log("old friends length: ", prevProps.friends.length);
        if (this.props.friends.length !== prevProps.friends.length ||
            this.props.friendRequests.length !== prevProps.friendRequests.length){
            console.log('Re-rendering...');
            this.getFriendData();
        }
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
            {(Array.isArray(this.state.friends) && this.state.friends.length < 1) &&
                <NoFriends />
            }
            {(Array.isArray(this.state.friends)) &&
                <HaveFriends friends={this.state.friends}
                             friendsToAdd={this.state.friendsToAdd}
                             navigation={this.props.navigation}/>
            }
            {(Array.isArray(this.state.friends) == false) &&
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
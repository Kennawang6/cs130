import React, {useState, Component} from 'react';
import {View, Text, Button, TouchableOpacity, Alert, ScrollView} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon, Divider } from 'react-native-elements';
import styles from './styles';

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
            console.log(this.state.text);
            console.log(this.state.friends);
            console.log(this.state.friendsToAdd);
        });
    }

    componentDidMount() {
        this.getFriendData();
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

export default FriendsList;
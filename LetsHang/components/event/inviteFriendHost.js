import React, {useState, Component} from 'react';
import {View, Text, Button, Alert, ScrollView} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem, Icon } from 'react-native-elements';


export default class InviteFriendHost extends Component{
    constructor(props) {
        super(props);
        this.state = {
          eventID: this.props.route.params.eventID,
          membersAttending: this.props.route.params.membersAttending,
          friends: [],
          ifFriend: true,
        };
    }
    componentDidMount() {
        this.getFriendData();
    }

    getFriendData = async() => {
        const data = await functions().httpsCallable('getFriendsList')({});
        console.log("Friends list is fetched");
        const friendInfo = data.data.friends;
        console.log(friendInfo);
        
        var friendList = friendInfo;
        var membersAttending = this.state.membersAttending;
        console.log(membersAttending);
        for (var i = 0; i < membersAttending.length; i++) {
            friendList = friendList.filter(friend=>friend.uid!==membersAttending[i]);
        }
        if(!(friendList&&friendList.length)){
            this.setState({ifFriend: false,
            }, () => {});
        }
        var newFriendList = [];
        for (var i = 0; i < friendList.length; i++) {
            newFriendList.push({friendInfo: friendList[i], checked: false})
        }
        console.log(newFriendList);
        this.setState({friends: newFriendList
        }, () => {
            console.log(this.state.friends);
        });
        
    }

    handleCheck = (email) => {
        var friends = this.state.friends;
        friends.forEach(friend => {
          if (friend.friendInfo.email === email){
            friend.checked =  !friend.checked;
          }
        });
        this.setState({friends: friends});
    }

    inviteFriends = async() => {
        var friendsToInvite = [];
        var friends = this.state.friends;
        friends.forEach(friend => {
          if (friend.checked){
            friendsToInvite.push(friend.friendInfo.uid);
          }
        });
        const data = await functions().httpsCallable('inviteToEvent')({event_id: this.state.eventID, invitees: friendsToInvite});
        console.log("Invitations have been sent.");
    }

    render() {
        if(this.state.ifFriend){
            return (
                  <View>
                  <View>
                  <ScrollView>
                    {
                    this.state.friends.map(i =>
                        <View key ={i.friendInfo.email}>
                          <ListItem bottomDivider onPress={()=>this.handleCheck(i.friendInfo.email)}>
                            <Avatar
                              rounded
                              source={{uri: i.friendInfo.photoURL}} />
                            <ListItem.Content>
                              <ListItem.Title>{i.friendInfo.name}</ListItem.Title>
                              <ListItem.Subtitle>{i.friendInfo.email}</ListItem.Subtitle>
                            </ListItem.Content>
                            <View>
                            {i.checked? <Icon name='check-square-o' type="font-awesome"/>:<Icon name='square-o' type="font-awesome"/>}
                            </View>
                          </ListItem>
                        </View>
                    )}
                    </ScrollView>
                    </View>
                    <View>
                    <Text> </Text>
                    <Button
                    title = 'Invite'
                    onPress={()=>{
                        this.inviteFriends();
                        alert("Invitations have been sent!");
                        this.props.navigation.navigate('EventDetailHost');
                    }}
                    />
                    </View>
                  </View>
            );
            
        }
        else {
            return (
                <View>
                    <Text>{console.log("You do not have more friends to invite")}</Text>
                    {alert("You have invited all your friends!")}
                </View>
            );
        }
    }
}

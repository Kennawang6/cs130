import React, {useState, Component} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem } from 'react-native-elements';
import { CheckBox } from 'react-native-elements'


class InviteFriend extends Component{
    constructor(props) {
        super(props);
        this.state = {
          friends: [],
        };
    }

    getFriendData = async() => {
        const data = await functions().httpsCallable('getFriendsList')({});
        console.log("Friends list is fetched");
        console.log(data);
        const friendInfo = data.data.friends;
        const newFriendList = [];
        for (var i = friendInfo.length - 1; i >= 0; i--) {
            newFriendList.push({cur: friendInfo[i], checked: false});
        }
        this.setState({friends: newFriendList,
        }, () => {
            console.log(this.state.friends);
        });
        
    }

    componentDidMount() {
        this.getFriendData();
    }
    handleCheck = (email) => {
        var friends = this.state.friends;
        friends.forEach(friend => {
        if (friend.cur.email === email)
          friend.checked =  !friend.checked;
        });
        this.setState({friends: friends});
  }

    render() {
        if(this.state.friends && this.state.friends.length){
            return (
                  <View>
                    {
                    this.state.friends.map(i =>
                        <View>
                          <CheckBox
                            title={i.cur.name}
                            checked={i.checked}
                            onPress={() => {
                                this.handleCheck(i.cur.email);
                            }}
                          >
                          </CheckBox>
                        </View>
                    )}
                  </View>
            );
            
        }
        else {
            return (
                <View>
                    <Text>{console.log("friends list is not undefined")}</Text>
                    <Text>No friends have been added.</Text>
                </View>
            );
        }
    }
}

export default InviteFriend;
import React, {useState, Component} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import functions from '@react-native-firebase/functions';
import { Avatar, ListItem } from 'react-native-elements';
import { CheckBox } from 'react-native-elements'

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class InviteFriend extends Component{
    constructor(props) {
        super(props);
        this.state = {
          friends: [],
          ifFriend: true,
          curEvent: [],
        };
    }
    componentDidMount() {
        this.getFriendData();
    }

    getFriendData = async() => {
        const data = await functions().httpsCallable('getFriendsList')({});
        console.log("Friends list is fetched");
        console.log(data);
        const friendInfo = data.data.friends;
        if(!(friendInfo&&friendInfo.length)){
            this.setState({ifFriend: false,
            }, () => {});
        }
        const newFriendList = [];
        var curEventRedux = this.props.curEvent.friendInvited;
        for (var i = friendInfo.length - 1; i >= 0; i--) {
            var ifFind = curEventRedux.find(cur => cur.email == friendInfo[i].email);
            if(typeof ifFind === "undefined"){
                newFriendList.push({cur: friendInfo[i], checked: false});
            }
            else{
                newFriendList.push({cur: friendInfo[i], checked: true});
            }
            
        }
        this.setState({friends: newFriendList, curEvent: this.props.curEvent
        }, () => {
            console.log(this.state.friends);
        });
        
    }

    handleCheck = (email) => {
        var friends = this.state.friends;
        friends.forEach(friend => {
          if (friend.cur.email === email){
            friend.checked =  !friend.checked;

            var curEventRedux = this.props.curEvent;
            if(friend.checked){
              curEventRedux.friendInvited.push(friend.cur);
              
            }
            else{
              curEventRedux.friendInvited = curEventRedux.friendInvited.filter((f)=>f.email!=friend.cur.email);

            }
            console.log(curEventRedux);
            this.setState({curEvent:curEventRedux}, () => {                              
                console.log(this.state.curEvent);
            });
            //this.props.reduxEditCurEvent({curEvent: curEventRedux});
            //console.log("Redux successfully");
          
        }
        });

        this.setState({friends: friends});
    }

    setReduxInvitedFriend(){
        this.props.reduxEditCurEvent({curEvent: {friendInvited: this.state.curEvent.friendInvited}});
    }


    render() {
        if(this.state.ifFriend){
            return (
                  <View>
                    {
                    this.state.friends.map(i =>
                        <View key ={i.cur.email}>
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
                    <View>
                    <Button
                    title = 'Finish'
                    onPress={()=>{
                        this.setReduxInvitedFriend();
                        this.props.navigation.navigate('CreateEvent');
                    }}
                    />
                    </View>
                  </View>
            );
            
        }
        else {
            return (
                <View>
                    <Text>{console.log("friends list is not undefined")}</Text>
                    {alert("You need to add friends before inviting friends!")}
                </View>
            );
        }
    }
}

const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList}};

const mapDispatchToProps = (dispatch) => {
  return{
    reduxSetEvent:(eventPair) => dispatch(setEvent(eventPair)),
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editCurEvent(event)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(InviteFriend);
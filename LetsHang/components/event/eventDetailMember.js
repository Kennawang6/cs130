import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input, ListItem, Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class EventDetailMember extends Component{
  constructor(props) {
    super(props);
    this.state = {
      eventID: this.props.route.params.eventID,
      memberList: [],
      membersIDs: [],
      hostInfo:[],
      thisEvent: [],
    };
  }

  componentDidMount(){
    this.getMemberList();
  }
  
  getMemberList = async() =>{
    var eventInfo = this.props.eventList;
    var thisEvent = eventInfo.filter(i=>i.eventID==this.state.eventID);
    this.setState({thisEvent:thisEvent});
    var hostID = thisEvent[0].eventInfo.hostID;
    var membersIDs = thisEvent[0].eventInfo.members.filter(member => member !== firebase.auth().currentUser.uid);
    membersIDs = membersIDs.filter(member => member !== hostID);
    this.setState({membersIDs: membersIDs});
    var memberList = [];
    var hostInfo =[];
    var host = await functions().httpsCallable('getUserInfo')({uid: hostID});
    hostInfo.push({userInfo:host.data.data});
    this.setState({hostInfo: hostInfo});
    for (var i = 0; i <  membersIDs.length; i++) {
      var userInfo = await functions().httpsCallable('getUserInfo')({uid: membersIDs[i]});
      memberList.push({userInfo: userInfo.data.data});
    }
    this.setState({memberList:memberList});
    console.log("hello");
    console.log(this.state.hostInfo);
    
  }

  leaveEvent = async() => {
      var userInfo = await functions().httpsCallable('leaveEvent')({event_id: this.state.eventID});
      this.props.reduxRemoveEvent({eventID: this.state.eventID});
      console.log("Leave Event");
  }

  render() {
        
        var memberList;

        if(this.state.memberList&&this.state.memberList.length){
          memberList = this.state.memberList.map(i =>
              <View key={i.userInfo.uid}>
                <ListItem bottomDivider>
                  <Avatar
                    rounded
                    source={{uri: i.userInfo.providerData[0].photoURL}} />
                  <ListItem.Content>
                    <ListItem.Title>{i.userInfo.displayName}</ListItem.Title>
                    <ListItem.Subtitle>{i.userInfo.email}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              </View>
              );
        }
        else{
          memberList = 
              <View>
              </View>
            ;
        }
        var hostInfo;
        if(this.state.hostInfo&&this.state.hostInfo.length){
            hostInfo = 
            <View>
            <ListItem bottomDivider>
                <Avatar
                  rounded
                  source={{uri: this.state.hostInfo[0].userInfo.providerData[0].photoURL}} />
                <ListItem.Content>
                    <ListItem.Title>@Host: {this.state.hostInfo[0].userInfo.displayName}</ListItem.Title>
                    <ListItem.Subtitle>{this.state.hostInfo[0].userInfo.email}</ListItem.Subtitle>
                  </ListItem.Content>
            </ListItem>
            </View>;
        }
        else{
            hostInfo = 
              <View>
              </View>
            ;
        }
        if(this.state.thisEvent&&this.state.thisEvent.length){
        return (
          <View>
            <View>
                <ListItem bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title>Event Name</ListItem.Title>
                    <ListItem.Subtitle>{this.state.thisEvent[0].eventInfo.name}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
                <ListItem bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title>Event Description</ListItem.Title>
                    <ListItem.Subtitle>{this.state.thisEvent[0].eventInfo.description}</ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
            </View>

            <Text> </Text>
            <Text>Member List</Text>
            <View>
              <ScrollView>
                {hostInfo}
                {memberList}
              </ScrollView>
            </View>
            <View>
            <Text> </Text>
                <Button
                title="Leave Event"
                onPress={()=>{
                    this.leaveEvent();
                    alert("You have left the event");
                    this.props.navigation.navigate('EventList');
                }}
              />
            </View>
          </View>
            
        );
    }
    else{
        return(
            <View>
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

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailMember);

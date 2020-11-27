import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Avatar, Text, Input, ListItem } from 'react-native-elements';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class EventDetailHost extends Component{
	constructor(props) {
      super(props);
      this.state = {
      	eventID: this.props.route.params.eventID,
        memberList: [],
      };
  }
  componentDidMount(){
    this.getMemberList();
  }
  
  getMemberList = async() =>{
    var eventInfo = this.props.eventList;
    var thisEvent = eventInfo.filter(i=>i.eventID==this.state.eventID);
    var membersIDs = thisEvent[0].eventInfo.members.filter(member => member !== thisEvent[0].eventInfo.hostID);
    var memberList = [];
    for (var i = 0; i <  membersIDs.length; i++) {
      var userInfo = await functions().httpsCallable('getUserInfo')({uid: membersIDs[i]});
      memberList.push({userInfo: userInfo.data.data});
    }
    console.log(memberList);
    this.setState({memberList:memberList});
  }
    
  render() {
        var eventInfo = this.props.eventList;
        var thisEvent = eventInfo.filter(i=>i.eventID==this.state.eventID);
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
        return (
            <View>
              <View>
                <ListItem bottomDivider onPress={()=>this.props.navigation.navigate('EditEventName', 
                                {eventID: this.state.eventID, eventName: thisEvent[0].eventInfo.name})}>
                  <ListItem.Content>
                    <ListItem.Title>Event Name</ListItem.Title>
                    <ListItem.Subtitle>{thisEvent[0].eventInfo.name}</ListItem.Subtitle>
                  </ListItem.Content>
                  <ListItem.Chevron size={30} color="#808080"/>
                </ListItem>
                <ListItem bottomDivider onPress={()=>this.props.navigation.navigate('EditEventDescription', 
                         {eventID: this.state.eventID, eventDescription: thisEvent[0].eventInfo.description})}>
                  <ListItem.Content>
                    <ListItem.Title>Event Description</ListItem.Title>
                    <ListItem.Subtitle>{thisEvent[0].eventInfo.description}</ListItem.Subtitle>
                  </ListItem.Content>
                  <ListItem.Chevron size={30} color="#808080"/>
                </ListItem>
              </View>
              <View>
              {this.state.memberList&&this.state.memberList.length?<Text>Member List</Text>: <Text> </Text>}
              </View>
              {memberList}
            </View>
            
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(EventDetailHost);

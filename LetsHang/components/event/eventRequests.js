import React, { Component } from 'react';
import { StyleSheet, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input, Text, ListItem, Icon } from 'react-native-elements';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';


class EventRequests extends Component{
  constructor(props) {
      super(props);
      this.state = {eventNotiPair: []};
      this.subscriber = firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .onSnapshot(snapshot => {
              console.log("hello");
              var noti = snapshot.data().eventNotifications;
              var eventNotiPair = [];
              this.getEventNoti(noti);
            });
      
  }
  /*componentDidMount(){
  	this.getEventNotification();
  }*/

  getEventNoti = async(eventNotiIDs) =>{
    console.log("hello1");
    var eventNotiPair = [];
    for (var i = eventNotiIDs.length - 1; i >= 0; i--) {
      var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventNotiIDs[i]});

      var userInfo = await functions().httpsCallable('getUserInfo')({uid: eventInfo.data.event_data.hostID});
      eventNotiPair.push({eventID: eventNotiIDs[i], eventInfo: eventInfo.data.event_data, hostInfo: userInfo.data.data});
    }
    this.setState({eventNotiPair: eventNotiPair});
    console.log(eventNotiPair);
  }

  /*getEventNotification = async() => {
  	const data = await functions().httpsCallable('getUserData')({});
	  var eventNotiIDs = data.data.data.eventNotifications;
    
    var eventNotiPair = [];
    for (var i = eventNotiIDs.length - 1; i >= 0; i--) {
    	var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventNotiIDs[i]});

      var userInfo = await functions().httpsCallable('getUserInfo')({uid: eventInfo.data.event_data.hostID});
    	eventNotiPair.push({eventID: eventNotiIDs[i], eventInfo: eventInfo.data.event_data, hostInfo: userInfo.data.data});
    }
    this.setState({eventNotiPair: eventNotiPair});
    console.log(eventNotiPair);
  }*/

  acceptEventRequest = async(eventID) => {
  	const data = await functions().httpsCallable('acceptEventInvite')({event_id: eventID});
  	console.log("accept");
  	console.log(data);
  	var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventID});
  	var eventPair = [];
  	eventPair.push({eventID: eventID, eventInfo: eventInfo.data.event_data, ifUser: false});
    //this.props.reduxAddEvent(eventPair[0]);
  }
  rejectEventRequest = async(eventID) => {
    const data = await functions().httpsCallable('declineEventInvite')({event_id: eventID});
    console.log("decline");
    console.log(data);
  }

  // render
  render(){
    if(this.state.eventNotiPair&&this.state.eventNotiPair.length){
      return(
        <View>
          {
            this.state.eventNotiPair.map(i => 
              <View key={i.eventID} style = {{padding: 1,}}>
                  <ListItem bottomDivider>
                    <ListItem.Content>
                      <ListItem.Title>{i.eventInfo.name}</ListItem.Title>
                      <ListItem.Subtitle>Description: {i.eventInfo.description} @HostName: {i.hostInfo.displayName} @HostEmail: {i.hostInfo.email} </ListItem.Subtitle>
                    </ListItem.Content>
                    
                    <View style={{flexDirection: 'row', width: 100,
                                  justifyContent: 'space-around'}}>
                      <Icon onPress={() => {
                        this.acceptEventRequest(i.eventID); 
                        alert("You are now the member of the event!");}} color="green" name="done" />
                      <Icon onPress={() => {this.rejectEventRequest(i.eventID);}} color="red" name="clear" />
                    </View>
                  </ListItem>
                </View>
            )
          }
        </View>
      );
    }
    else{
      return(
        <View>
          <Text>No event requests </Text>
        </View>
      );
    }
  	
  }

}



const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList}};

const mapDispatchToProps = (dispatch) => {
  return{
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editCurEvent(event)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(EventRequests);
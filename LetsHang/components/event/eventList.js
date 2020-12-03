import React, { Component, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input } from 'react-native-elements';
import { Icon } from 'react-native-elements'
import { Button, ListItem, Divider, Badge } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment/min/moment-with-locales';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent, setEventRequest} from '../../actions/editEvent';
import { addScheduleEvent, replaceSchedule, removeScheduleEvent} from '../../actions/editSchedule';

class EventList extends Component{
	constructor(props) {
    super(props);
    this.state = {eventPair:[], curEvent: {}, timeZoneString: "", ifNeedRecomputed: false};
    //this.getUserData = this.getUserData.bind(this);

    this.subscriber = firestore()
        .collection('events')
        .onSnapshot(snapshot => {
          var eventList = [];
          //console.log(snapshot);
          snapshot.forEach(doc => {
            var curEvent = doc.data();
            //console.log(curEvent);
            //console.log(curEvent.commonSchedule);
            var curEventID = doc.ref._documentPath._parts[1];
            var ifmembers = curEvent.members.filter(curM=>curM===firebase.auth().currentUser.uid);
            if(ifmembers&&ifmembers.length){
              this.getCurEvent(curEvent, curEventID);
              eventList.push(this.state.curEvent);
            }
          });
          console.log("Fetch Event List");
          console.log(eventList);
          this.setState({eventPair:eventList}, () => {                              
            //console.log(this.state.eventPair);
          });
          
          //console.log(this.props.eventList);
          this.props.reduxSetEvent(eventList);
    });
                     
  }

  componentDidMount() {
    this.getUserTimeZone();
  }

  getUserTimeZone = async() => {
    const data = await functions().httpsCallable('getUserData')({});
    var notifications = data.data.data.eventNotifications.length;
    this.props.reduxSetEventRequest(notifications);
    var timeZone = data.data.data.timeZone;
    if(timeZone<-12||timeZone>12){
      timeZone = 0;
    }
    var timeZoneString = timeZone.toString();
    console.log(timeZoneString);
    this.setState({timeZoneString: timeZoneString});
  }

 
  getCurEvent = async(eventData, eventID) => {
    const userID = firebase.auth().currentUser.uid;
    // logic for ifDecidedButton and ifFinalizedButton
    // exist not Ready
    if(eventData.membersNotReady && eventData.membersNotReady.length){
      if(this.state.ifNeedRecomputed){
        this.reComputeTime(eventID);
      }
      else{
        this.setDecidedTime(eventID, eventData.computedTime);
      }
      
      if(eventData.hostID == userID){
        console.log("host: exist not Ready");
        this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
        ifDecidedButton: true, ifFinalizedButton: false}});
      }
      else{
        console.log("member: exist not Ready");
        this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
        ifDecidedButton: true, ifFinalizedButton: false}});
      }
    }
    // no not Ready
    else{
      //no not Ready, final time
      if(eventData.finalTime !== 0){
        if(eventData.hostID == userID){
          console.log("host: no not Ready, final time");
          this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
            ifDecidedButton: false, ifFinalizedButton: false}});
        }
        else{
          console.log("member: no not Ready, final time");
          this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
            ifDecidedButton: false, ifFinalizedButton: false}});
        }
      }
      //no not Ready, no final time
      else{
        var ifFinalizedButton = false; //ifFinalizedButton = endpoints if the membersReady == all members;
        // no not Ready, no final time, all members ready
        if(eventData.members.length===eventData.membersReady.length){
          if(eventData.hostID == userID){
            console.log("host: no not Ready, no final time, all members ready");
            this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
            ifDecidedButton: false, ifFinalizedButton: true}});
          }
          else{
            console.log("member: no not Ready, no final time, all members ready");
            this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
            ifDecidedButton: false, ifFinalizedButton: false}});
          }
        }
        // no notReady, no final time, not all members ready
        else{
          // no not Ready, no final time, some members ready
          if(eventData.membersReady && eventData.membersReady.length){
            var ifReady = eventData.membersReady.filter(uid=> uid===userID);
            // no not Ready, no final time, some members ready, the current user is ready
            if(ifReady && ifReady.length){
              if(eventData.hostID == userID){
                console.log("host: no not Ready, no final time, some members ready, the current user is ready");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
                  ifDecidedButton: false, ifFinalizedButton: false}});
              }
              else{
                console.log("member: no not Ready, no final time, some members ready, the current user is ready");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
                  ifDecidedButton: false, ifFinalizedButton: false}});
              }
            }
            // no not Ready, no final time, some members ready, the current user is not ready
            else{
              if(eventData.hostID == userID){
                console.log("host: no not Ready, no final time, some members ready, the current user is not ready");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
                  ifDecidedButton: true, ifFinalizedButton: false}});
              }
              else{
                console.log("member: no not Ready, no final time, some members ready, the current user is not ready");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
                  ifDecidedButton: true, ifFinalizedButton: false}});
              }
            }
          }
          //no not Ready, no final time, no members ready
          else{
            // no not Ready, no final time, no members ready, exist invitees
            if(eventData.invitees&&eventData.invitees.length){
              if(eventData.hostID == userID){
                console.log("host: no not Ready, no final time, no members ready, exist invitees");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
                  ifDecidedButton: false, ifFinalizedButton: false}});
              }
              else{
                console.log("member: no not Ready, no final time, no members ready, exist invitees");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
                  ifDecidedButton: false, ifFinalizedButton: false}});
              }
            }
            // no not Ready, no final time, no members ready, no invitees
            else{
              if(eventData.decidedTime == 0){
                this.setDecidedTime(eventID, eventData.computedTime);
              }
              if(eventData.hostID == userID){
                console.log("host: no not Ready, no final time, no members ready, no invitees");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: true, 
                  ifDecidedButton: true, ifFinalizedButton: false}});
              }
              else{
                console.log("member: no not Ready, no final time, no members ready, no invitees");
                this.setState({curEvent: {eventID: eventID, eventInfo: eventData, ifUser: false, 
                  ifDecidedButton: true, ifFinalizedButton: false}});
              }
            }
          }
        }
      }
    }
    // End of logic for Buttons
  }

/*
	getEvent = async() => {
    //Get the event IDs of all events
		const data = await functions().httpsCallable('getUserData')({});
		console.log("Data is fetched(eventID)");
		var eventIDs = data.data.data.events;
    const userID = firebase.auth().currentUser.uid;
    //var eventList=[];
    //eventPair is a map: where the key will be the eventID, and the value will be the eventInfo
    var eventPair=[];
    //console.log(eventIDs);
    if(eventIDs!=[]){
      var i;
      for(i=0; i<eventIDs.length;i++){
        var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventIDs[i]});
        //get event details
        console.log(eventIDs[i]);
        var eventData = eventInfo.data.event_data;
        //console.log(eventData);
        //
        //
        // logic for ifDecidedButton and ifFinalizedButton
        // exist not Ready
        if(eventData.membersNotReady && eventData.membersNotReady.length){
          this.computeTime();
          this.modifyReadyMember();
          if(eventData.hostID == userID){
            console.log("host: exist not Ready");
            eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
              ifDecidedButton: true, ifFinalizedButton: false});
          }
          else{
            console.log("member: exist not Ready");
            eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
              ifDecidedButton: true, ifFinalizedButton: false});
          }
        }
        // no not Ready
        else{
          var ifFinalizedButton = false; //= endpoints if the membersReady == all members;
          //no not Ready, final time
          if(eventData.finalTime !== 0){
            if(eventData.hostID == userID){
              console.log("host: no not Ready, final time");
              eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
              ifDecidedButton: false, ifFinalizedButton: false});
            }
            else{
              console.log("member: no not Ready, final time");
              eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
              ifDecidedButton: false, ifFinalizedButton: false});
            }
          }
          //no not Ready, no final time
          else{
            var ifFinalizedButton = false; //ifFinalizedButton = endpoints if the membersReady == all members;
            // not not Ready, no final time, all members ready
            if(ifFinalizedButton){
              if(eventData.hostID == userID){
                console.log("host: not not Ready, no final time, all members ready");
                eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
                ifDecidedButton: false, ifFinalizedButton: true});
              }
              else{
                console.log("member: not not Ready, no final time, all members ready");
                eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
                ifDecidedButton: false, ifFinalizedButton: false});
              }
            }
            // no notReady, no final time, not all members ready
            else{
              // no not Ready, no final time, some members ready
              if(eventData.membersReady && eventData.membersReady.length){
                var ifReady = eventData.membersReady.filter(uid=> uid===userID);
                // no not Ready, no final time, some members ready, the current user is ready
                if(ifReady && ifReady.length){
                  if(eventData.hostID == userID){
                    console.log("host: no not Ready, no final time, some members ready, the current user is ready");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
                    ifDecidedButton: false, ifFinalizedButton: false});
                  }
                  else{
                    console.log("member: no not Ready, no final time, some members ready, the current user is ready");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
                    ifDecidedButton: false, ifFinalizedButton: false});
                  }
                }
                // no not Ready, no final time, some members ready, the current user is not ready
                else{
                  if(eventData.hostID == userID){
                    console.log("host: no not Ready, no final time, some members ready, the current user is not ready");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
                    ifDecidedButton: true, ifFinalizedButton: false});
                  }
                  else{
                    console.log("member: no not Ready, no final time, some members ready, the current user is not ready");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
                    ifDecidedButton: true, ifFinalizedButton: false});
                  }
                }
              }
              //no not Ready, no final time, no members ready
              else{
                // no not Ready, no final time, no members ready, exist invitees
                if(eventData.invitees&&eventData.invitees.length){
                  if(eventData.hostID == userID){
                    console.log("host: no not Ready, no final time, no members ready, exist invitees");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
                    ifDecidedButton: false, ifFinalizedButton: false});
                  }
                  else{
                    console.log("member: no not Ready, no final time, no members ready, exist invitees");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
                    ifDecidedButton: false, ifFinalizedButton: false});
                  }
                }
                // no not Ready, no final time, no members ready, no invitees
                else{
                  this.computeTime();
                  if(eventData.hostID == userID){
                    console.log("host: no not Ready, no final time, no members ready, no invitees");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: true, 
                    ifDecidedButton: true, ifFinalizedButton: false});
                  }
                  else{
                    console.log("member: no not Ready, no final time, no members ready, no invitees");
                    eventPair.push({eventID: eventIDs[i], eventInfo: eventData, ifUser: false, 
                    ifDecidedButton: true, ifFinalizedButton: false});
                  }
                }
              }
            }
          }
        }
        // End of logic for Buttons
      }
      // end of for loop
      
      //console.log(eventPair);
      this.setState({eventPair:eventPair}, () => {                              
        console.log(this.state.eventPair);
      });
      
      //console.log(this.props.eventList);
      this.props.reduxSetEvent(eventPair);
      //console.log(this.props.eventList);

    }
    //console.log(eventList);
	}
*/

  reComputeTime = async(eventID) => {
    // call computeNextEarliestAvailableTime and setEventTime
    console.log("Recomputing time");
    const data2 = await functions().httpsCallable('computeNextEarliestAvailableTime')({event_id: eventID});
    this.setState({ifNeedRecomputed:false});
  }

  setDecidedTime = async(eventID, computedTime) => {
    const data = await functions().httpsCallable('setEventTime')({event_id: eventID, event_time: computedTime});
  }

  // use redux add schedule
  clickReadyButton = async(eventID) => {
    const data = await functions().httpsCallable('setReadyForEvent')({event_id: eventID});
    console.log("You have been ready");
  }

  clickNotReadyButton = async(eventID) => {
    const data = await functions().httpsCallable('setNotReadyForEvent')({event_id: eventID});
    this.setState({ifNeedRecomputed: true});
    console.log("You select not ready");
  }

  clickFinalizeButton = async(eventID, eventInfo) => {
    // add the logic of adding the event to all the members in the schedule
    var members = eventInfo.members;
    var description = eventInfo.name;
    var start = eventInfo.decidedTime;
    var end = start + eventInfo.duration*60000;

    for(var i=0; i<members.length; i++){
      const data = await functions().httpsCallable('addEventToSchedule')({uid: members[i], timeslot: {start: start, end:end, description: description, id: start}});
    }
    this.props.addScheduleEvent({description: description, start:start, end: end, id: start});

    //finalized
    const data = await functions().httpsCallable('finalizeEventTime')({event_id: eventID});
    console.log("The event has been finalized");

  }

	render() {
    //var eventList = this.props.eventList;
    var eventList = this.state.eventPair;
    if(eventList && eventList.length){
      return(
        <View>
          <View>
          <ListItem bottomDivider onPress={()=>this.getUserTimeZone().then(()=>{
                this.props.reduxEditCurEvent({curEvent: {friendInvited: []}});
                this.props.navigation.navigate('CreateEvent', {timeZoneString: this.state.timeZoneString});})}>
            <Icon name='add' />
            <ListItem.Content>
              <ListItem.Title>Create Event</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron size={30} color="#808080"/>
          </ListItem>
          <ListItem bottomDivider onPress={()=>this.props.navigation.navigate('EventRequests')}>
            <Icon name='notifications' />
            <ListItem.Content>
              <ListItem.Title>Event Requests</ListItem.Title>
            </ListItem.Content>
            {(this.props.eventRequest > 0) &&
                  <Badge
                    value={this.props.eventRequest}
                    badgeStyle={{ backgroundColor: 'red' }}
                    textStyle={{ color: 'white' }}
                  />
                  }
            <ListItem.Chevron size={30} color="#808080"/>
          </ListItem>
         </View>
         <View>

         <ScrollView>
         <Text> </Text>
         <Text> Event List</Text>
          {eventList.map(i =>
            <View key={i.eventID}>
            <ListItem key={i.eventID} bottomDivider onPress=
              {()=>{
                if(i.ifUser){
                  this.props.navigation.navigate('EventDetailHost', {eventID: i.eventID});
                }
                else{
                  this.props.navigation.navigate('EventDetailMember', {eventID: i.eventID});
                }
                }}>
              <ListItem.Content>
                <ListItem.Title>{i.eventInfo.name}</ListItem.Title>
                <ListItem.Subtitle>{i.ifUser?"Host":"Member"} @Meeting time: {i.eventInfo.decidedTime===0||this.state.timeZoneString===""?
                                                      "--": new Date(i.eventInfo.decidedTime).getFullYear() + "-" +
                                                      ("0" + (new Date(i.eventInfo.decidedTime).getMonth() + 1)).slice(-2) + "-" +
                                                      ("0"+new Date(i.eventInfo.decidedTime).getDate()).slice(-2) + " " +
                                                      ("0" + new Date(i.eventInfo.decidedTime).getHours()).slice(-2) + ":" +
                                                      ("0" + new Date(i.eventInfo.decidedTime).getMinutes()).slice(-2)
                                                      } @Duration: {i.eventInfo.duration} minutes</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron size={30} color="#808080"/>
            </ListItem>
            {i.ifFinalizedButton?
              <View>
              <Button title="Finalized" type="outline" onPress={()=>{
                                                         this.clickFinalizeButton(i.eventID, i.eventInfo);}}
                titleStyle= {{ color: 'black'}} 
                buttonStyle={{ borderColor: 'grey', borderRadius: 0 }} 
                containerStyle={{ backgroundColor: 'white' }}/>
              </View>
              :<View></View>}
            {i.ifDecidedButton?
              <View style={{flexDirection: 'row' }}>
                <View style={{flex: 1}}>             
                  <Button title="Ready" type="outline" onPress={()=>{
                                                    this.clickReadyButton(i.eventID);}}
                    titleStyle= {{ color: 'black'}} 
                    buttonStyle={{ borderColor: 'grey', borderRadius: 0 }} 
                    containerStyle={{ backgroundColor: 'white' }}/>
                </View>
                <View style={{flex: 1}}>
                  <Button title="Not Ready" type="outline" onPress={()=>{
                                                      this.clickNotReadyButton(i.eventID);}}
                    titleStyle= {{ color: 'black'}} 
                    buttonStyle={{ borderColor: 'grey', borderRadius: 0 }} 
                    containerStyle={{ backgroundColor: 'white' }}/>
                </View>
              </View>
              :<View></View>}
              
          </View>)}
          </ScrollView>
          </View>
          
        </View>

      );
    }
    else{
      return (
        <View>
          <View>
          <ListItem bottomDivider onPress={()=>this.getUserTimeZone().then(()=>{
                this.props.reduxEditCurEvent({curEvent: {friendInvited: []}});
                this.props.navigation.navigate('CreateEvent', {timeZoneString: this.state.timeZoneString});})}>
            <Icon name='add' />
            <ListItem.Content>
              <ListItem.Title>Create Event</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron size={30} color="#808080"/>
          </ListItem>
          <ListItem bottomDivider onPress={()=>this.props.navigation.navigate('EventRequests')}>
            <Icon name='notifications' />
            <ListItem.Content>
              <ListItem.Title>Event Requests</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron size={30} color="#808080"/>
          </ListItem>
         </View>
          <View>
            <Text>{console.log("Event list is empty")}</Text>
          </View>

        
        </View>
     
    );}
	}
}

const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList, eventRequest: state.eventReducer.eventRequest, scheduledEvents: state.scheduleReducer.scheduledEvents}};

const mapDispatchToProps = (dispatch) => {
  return{
    addScheduleEvent: (schedule) => dispatch(addScheduleEvent(schedule)),
    reduxSetEvent:(eventPair) => dispatch(setEvent(eventPair)),
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editCurEvent(event)),
    reduxSetEventRequest: (eq) => dispatch(setEventRequest(eq)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(EventList);

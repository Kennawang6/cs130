import React, { Component } from 'react';
import { StyleSheet, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';
import { Input, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-elements';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class CreateEvent extends Component{
  constructor(props) {
      super(props);
      this.state = { eventName: "", eventDescription: "", startDate: null, endDate:null, timeZoneString:""};
  }
  componentDidMount(){
    this.getUserTimeZone();
  }
  
  getUserTimeZone = async() => {
    const data = await functions().httpsCallable('getUserData')({});
    var timeZone = data.data.data.timeZone;
    if(timeZone<-12||timeZone>12){
      timeZone = 0;
    }
    var timeZoneString = timeZone.toString();
    console.log(timeZoneString);
    this.setState({timeZoneString: timeZoneString});
  }

  handleTimeZone = (newTimeString) => {
    this.setState({timeZoneString: newTimeString}, () => {                       
        console.log(this.state.timeZoneString);
    });
  }

  setTimeZone = async(newTime) =>{
    const data = await functions().httpsCallable('updateUserData')({
      userData: {
        timeZone: newTime
      }
    });
    console.log("Time Zone is set");
  }

  createEvent = async() =>{
      var eventName = this.state.eventName;
      var eventDescription = this.state.eventDescription;
      var invitees = [];
      var startDate = this.state.startDate;
      var endDate = this.state.endDate;
      var friendInvited = this.props.curEvent.friendInvited;
      for (var i = friendInvited.length - 1; i >= 0; i--) {
        invitees.push(friendInvited[i].uid);
      }
      
      const data = await functions().httpsCallable('createEvent')({
          event_name: eventName,
          description: eventDescription,
          invitees: invitees,
          start_date: startDate,
          end_date: endDate
      });
      
      var createdEventID = data.data.event_id;
      this.generateEventPair(createdEventID);
      console.log("Event is created");
  }

  generateEventPair = async(eventID) => {
    var eventPair = [];
    var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventID});
    
    eventPair.push({eventID: eventID, eventInfo: eventInfo.data.event_data, ifUser: true});
    
    this.props.reduxAddEvent(eventPair[0]);
  }

  render() {
    return (
      <View>
        <View>
          <Text>Event Name</Text>
          <Input
            placeholder='Event Name'
            onChangeText={name => this.setState({ eventName: name })}
        />
        <Text>Event Description (Optional)</Text>
          <Input
            placeholder='Event Description'
            onChangeText={description => this.setState({ eventDescription: description })}
        />
        <Text>Your Time Zone</Text>
          <Input
            placeholder={this.state.timeZoneString}
            value={this.state.timeZoneString}
            onChangeText={this.handleTimeZone}
        />
        </View>
        <View>
        <Text> Friends Invited </Text>
        {
          this.props.curEvent.friendInvited.map(i =>
            <View key={i.email}>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>{i.email}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            </View>
          )
        }
        </View>
        <View>
        <Button
            title="Invite Friends"
            onPress={()=>this.props.navigation.navigate('InviteFriend')}
        />
        </View>
        <Text></Text>
        <View>
        <Button
            title="Create Event"
            onPress={()=>{
              var timeZone = parseInt(this.state.timeZoneString, 10);
              if(timeZone >= -12 && timeZone<=12){
                this.setTimeZone(timeZone);
                this.createEvent();
                this.props.navigation.navigate('EventList');
              }
              else{
                alert("Invalid Input: Time zone should range from -12 to 12");
              }
              
            }}
        />
        </View>
      </View>
    );
  }
}


const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList}};

const mapDispatchToProps = (dispatch) => {
  return{
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editCurEvent(event)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
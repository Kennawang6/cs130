import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input } from 'react-native-elements';
import { Icon } from 'react-native-elements'
import { Button, ListItem } from 'react-native-elements';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class EventList extends Component{
	constructor(props) {
    super(props);
    this.state = {eventPair:[]};
    	//this.getUserData = this.getUserData.bind(this);
  	}
  	componentDidMount() {
    	this.getEvent();
  	}
	getEvent = async() => {
    //Get the event IDs of all events
		const data = await functions().httpsCallable('getUserData')({});
		console.log("Data is fetched(eventID)");
		var eventIDs = data.data.data.events;
    console.log(eventIDs);
    const userID = firebase.auth().currentUser.uid;
    //var eventList=[];
    //eventPair is a map: where the key will be the eventID, and the value will be the eventInfo
    var eventPair=[];
    if(eventIDs!=[]){
      var i;
      for(i=0; i<eventIDs.length;i++){
        var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventIDs[i]});
        //get event details
        //eventList.push(eventInfo.data.event_data);
        if(eventInfo.data.event_data.hostID == userID){
          eventPair.push({eventID: eventIDs[i], eventInfo: eventInfo.data.event_data, ifUser: true});
        }
        else{
          eventPair.push({eventID: eventIDs[i], eventInfo: eventInfo.data.event_data, ifUser: false});
        }
        
      }
      this.setState({eventPair:eventPair}, () => {                              
        console.log(this.state.eventPair);
      });
      
      //console.log(this.props.eventList);
      this.props.reduxSetEvent(eventPair);
      //console.log(this.props.eventList);

    }
    //console.log(eventList);
	}

	render() {
    var eventList = this.props.eventList;
    if(eventList && eventList.length){
      return(
        <View>
        {eventList.map(i =>
          <View>
            <ListItem key={i} bottomDivider onPress=
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
                <ListItem.Subtitle>{i.ifUser?"Host":"Member"}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron size={30} color="#808080"/>
            </ListItem>
          </View>)}
          <View style = {{left: 140}}>
             <Icon
              name='add'
              type='Content'
              color='#517fa4'
              size={65}
              onPress={()=>{
                this.props.reduxEditCurEvent({curEvent: {friendInvited: []}});
                this.props.navigation.navigate('CreateEvent');}}
             />
          </View>
        </View>

      );
    }
    else{
      return (
        <View>
          <View>
            <Text>{console.log("Event list is empty")}</Text>
          </View>

        <View style = {{left: 140}}>
          <Icon
              name='add'
              type='Content'
              color='#517fa4'
              size={65}
              onPress={()=>{
                this.props.reduxEditCurEvent({curEvent: {friendInvited: []}});
                this.props.navigation.navigate('CreateEvent');}}
            />
          </View>
        </View>
     
    );}
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

export default connect(mapStateToProps, mapDispatchToProps)(EventList);

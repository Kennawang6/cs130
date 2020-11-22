import React, { Component } from 'react';
import { StyleSheet, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input, Text } from 'react-native-elements';
import Icon from 'react-native-elements';
import { Button } from 'react-native-elements';



import { connect } from 'react-redux';
import { addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class CreateEvent extends Component{
	constructor(props) {
    	super(props);
    	this.state = { eventName: "", eventDescription: "", invitees: [], startDate: null, endDate:null, };
  	}

  	componentDidMount() {
  	}
  	createEvent = async() =>{
  		var eventName = this.state.eventName;
    	var eventDescription = this.state.eventDescription;
    	var invitees = this.state.invitees;
    	var startDate = this.state.startDate;
    	var endDate = this.state.endDate;
    	const data = await functions().httpsCallable('createEvent')({
      		event_name: eventName,
      		invitees: invitees,
      		start_date: startDate,
      		end_date: endDate
    	});
    	console.log("Event is created");
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
  				  placeholder='Time Zone'
				/>
				
				<Button
  				  title="Invite Friends"
				/>
				<Button
  				  title="Create Event"
  				  onPress={()=>{
  				  	this.createEvent();
  				  }}
				/>
			  </View>
			</View>
		);
	}
}

const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList}}

const mapDispatchToProps = (dispatch) => {
  return{
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editEvent(event)),
}}

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
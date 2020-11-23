import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';



export default class EventDetail extends Component{
	constructor(props) {
        super(props);
        this.state = {
        	eventID: this.props.route.params.eventID,
            eventInfo: this.props.route.params.eventInfo,
        };
    }
    removeEvent = async() =>{
    	const data = await functions().httpsCallable('removeFromEvent')({});
    	
    }
	render() {
		return (
			<View>
				<Text> helloWorld </Text>
			</View>
			
		);
	}
}

/*
const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList}}

const mapDispatchToProps = (dispatch) => {
  return{
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editEvent(event)),
}}

export default connect(mapStateToProps, mapDispatchToProps)(EventDetail);*/
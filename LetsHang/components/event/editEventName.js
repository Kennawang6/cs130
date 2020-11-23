import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Text, Input, ListItem } from 'react-native-elements';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class EditEventName extends Component{
	constructor(props) {
        super(props);
        this.state = {
        	eventID: this.props.route.params.eventID,
        	eventName: this.props.route.params.eventName,
        };
    }
    handleEventName = (newName) => {
    	this.setState({eventName: newName}, () => {                              
        	console.log(this.state.eventName);
    	});
  	}
    setEventName = async() =>{
    	var eventInfo = this.props.eventList;
        var updateEvent = [];
        var res = eventInfo.map(i=>{
        	if(i.eventID==this.state.eventID){
        		var modified = i;
        		modified.eventInfo.name=this.state.eventName;
        		updateEvent.push(modified);
        	}
        	else{
        		updateEvent.push(i);
        	}
        })
        this.props.reduxSetEvent(updateEvent);
        const data = await functions().httpsCallable('updateEvent')({
        	event_id: this.state.eventID,
      		eventData: {
        		name: this.state.eventName,
      		}
    	}, ()=>console.log("Event name is updated."));
    }
	render(){
	  return(
	    <View>
		  <Input
            placeholder={this.state.eventName}
            value={this.state.eventName}
            onChangeText={this.handleEventName}
          />
         <Button
          title="Submit"
          onPress = {() => 
          {
            this.setEventName();
            this.props.navigation.navigate('EventDetailHost');
          }}
         />
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

export default connect(mapStateToProps, mapDispatchToProps)(EditEventName);
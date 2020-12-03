import React, { Component } from 'react';
import { StyleSheet, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input, Text, ListItem, Icon, Badge, withBadge } from 'react-native-elements';
import { Button } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent, setEventRequest} from '../../actions/editEvent';



class EventsTabBadge extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        let BadgedIcon = withBadge(this.props.eventRequest)(Icon)
        if (this.props.eventRequest === 0)
            BadgedIcon = (Icon)
        return (
          <BadgedIcon name="meeting-room" />
    	);
	}
}



const mapStateToProps = (state) => {return {curEvent:state.eventReducer.curEvent, eventList: state.eventReducer.eventList, eventRequest: state.eventReducer.eventRequest,}};

const mapDispatchToProps = (dispatch) => {
  return{
    reduxAddEvent:(event) => dispatch(addEvent(event)),
    reduxRemoveEvent: (eventID) => dispatch(removeEvent(eventID)),
    reduxEditCurEvent: (event) => dispatch(editCurEvent(event)),
    reduxSetEventRequest: (eq) => dispatch(setEventRequest(eq)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(EventsTabBadge);
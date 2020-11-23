import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';

class EventDetailHost extends Component{
	constructor(props) {
        super(props);
        this.state = {
        	eventID: this.props.route.params.eventID,
        };
    }
    
    render() {
        
        return (
            <View>
                <Text>Member</Text>
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

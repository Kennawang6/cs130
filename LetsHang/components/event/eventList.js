import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';
import { Input } from 'react-native-elements';
import { Icon } from 'react-native-elements'
import { Button, ListItem } from 'react-native-elements';

//import { connect } from 'react-redux';
//import { addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';


class NoEvent extends Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <View>
          <View>
            <Text>{console.log("Event list is not empty")}</Text>
          </View>

        <View style = {{left: 140}}>
          <Icon
              name='add'
              type='Content'
              color='#517fa4'
              size={65}
              onPress={()=>this.props.navigation.navigate('CreateEvent')}
            />
          </View>
        </View>
       );
    }
}
class HaveEvents extends Component{
    constructor(props) {
      super(props);

    }

    render() {
        const eventPair = this.props.eventPair.map(i =>
          <View>
            <ListItem key={i.eventID} bottomDivider onPress=
              {()=>this.props.navigation.navigate('EventDetail', {eventID: i.eventID, eventInfo: i.eventInfo})}>
              <ListItem.Content>
                <ListItem.Title>{i.eventInfo.name}</ListItem.Title>
                <ListItem.Subtitle>{i.eventID}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron size={30} color="#808080"/>
            </ListItem>
          </View>);
        return (
        <View>
          {eventPair}
          <View style = {{left: 140}}>
             <Icon
              name='add'
              type='Content'
              color='#517fa4'
              size={65}
              onPress={()=>this.props.navigation.navigate('CreateEvent')}
             />
          </View>
        </View>
       );
    }
}

export default class EventList extends Component{
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
    //var eventList=[];
    //eventPair is a map: where the key will be the eventID, and the value will be the eventInfo
    var eventPair=[];
    if(eventIDs!=[]){
      var i;
      for(i=0; i<eventIDs.length;i++){
        var eventInfo = await functions().httpsCallable('getEvent')({event_id: eventIDs[i]});
        //get event details
        //eventList.push(eventInfo.data.event_data);
        eventPair.push({eventID: eventIDs[i], eventInfo: eventInfo.data.event_data});
      }
      this.setState({eventPair:eventPair}, () => {                              
        console.log(this.state.eventPair);
      });

    }
    //console.log(eventList);
	}

	render() {
    if(this.state.eventPair && this.state.eventPair.length){
      return(<HaveEvents eventPair={this.state.eventPair} navigation={this.props.navigation}/>);
    }
    else{
      return (<NoEvent navigation={this.props.navigation}/>);
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(EventList);*/
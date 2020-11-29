import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView} from 'react-native';
import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';
import { Input, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-elements';
import { Button } from 'react-native-elements';

import {SET_EVENT, ADD_EVENT, REMOVE_EVENT, CUR_EVENT} from '../../actions/types'
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { connect } from 'react-redux';
import { setEvent, addEvent, removeEvent, editCurEvent} from '../../actions/editEvent';


const CreateEvent = props => {
  //const [timeZoneString, setTimeZoneString] = useState(props.route.params.timeZoneString);
  const [timeZoneString, setTimeZoneString] = useState(props.route.params.timeZoneString);
  const curEvent = useSelector(state => state.eventReducer);
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationS, setDurationS] = useState('');
  function useInput() {
      const [date, setDate] = useState(new Date());
      const [mode, setMode] = useState('date');
      const [show, setShow] = useState(false);

      const showMode = (currentMode) => {
          setShow(true);
          setMode(currentMode);
      };
      const showDatepicker = () => {
        showMode('date');
      };
      const showTimepicker = () => {
        showMode('time');
      };

      const onChange = (event, selectedDate) => {
          const currentDate = selectedDate || date
          setShow(Platform.OS === 'ios');
          setDate(currentDate);
      }
      return {
          date,
          showDatepicker,
          showTimepicker,
          show,
          mode,
          onChange
      }
  };


  const createEvent = async() => {
    var ifValidCreate = true;

    // check name
    if(name == ''){
      ifValidCreate = false;
      alert("Invalid Name: Name can not be empty");
    }

    // check time zone
    if(timeZoneString==''){
      ifValidCreate = false;
      alert("Invalid Time Zone: Time zone should range from -12 to 12");
    }

    var timeZone;
    if(ifValidCreate){
      timeZone = parseInt(timeZoneString, 10);
      if(timeZone < -12 || timeZone>12){
        ifValidCreate = false;
        alert("Invalid Time Zone: Time zone should range from -12 to 12");
      }
      else{
        setTimeZone(timeZone);
      }
    }
    
    //check start and end date
    

    var startDate = start.date.getTime();
    var endDate = end.date.getTime();
    
    if(endDate<=startDate){
      ifValidCreate = false;
      alert("End Date must be after the Start Date");
    }
    
    //check duration
    var duration;
    if(durationS==''){
      ifValidCreate = false;
      alert("Duration can not be empty");
    }
    else{
      duration = parseInt(durationS, 10);
      if(duration<=0){
        ifValidCreate = false;
        alert("Duration(minutes) must be a positive number");
      }
    }

    //get invitees list
    var invitees = [];
    var friendInvited = curEvent.curEvent.friendInvited;
    for (var i = friendInvited.length - 1; i >= 0; i--) {
      invitees.push(friendInvited[i].uid);
    }


    if(ifValidCreate){
      console.log(name);
      console.log(description);
      console.log(timeZone);
      console.log(startDate);
      console.log(endDate);
      console.log(duration);
      console.log(invitees);
      const data = await functions().httpsCallable('createEvent')({
        event_name: name,
        description: description,
        invitees: invitees,
        duration: duration,
        start_date: startDate,
        end_date: endDate
      });
      console.log("event is created");
      props.navigation.navigate('EventList');
    }
    
  };

  const setTimeZone = async(newTime) =>{
    const data = await functions().httpsCallable('updateUserData')({
      userData: {
        timeZone: newTime
      }
    });
    console.log("Time Zone is set");
  }

  const start = useInput(new Date());
  const end = useInput(new Date());
  var startDate = start.date.toDateString();
  var endDate = end.date.toDateString();

  return (
    <View>
      <ScrollView>
        <View>
          <Text>Event Name</Text>
          <Input
            placeholder=''
            onChangeText={name => {
              setName(name);         
            }}
          />
        </View>
        <View>
          <Text>Event Description(Optional)</Text>
          <Input
            placeholder=''
            onChangeText={des => {
              setDescription(des);         
            }}
          />
        </View>
        
        <View>
          <Text>Your Time Zone</Text>
          <Input
            placeholder={timeZoneString}
            value={timeZoneString}
            onChangeText={ts => {setTimeZoneString(ts);}}
          />
        </View>

        <View>
          <Button onPress={start.showDatepicker} title = {"Start Date: "+startDate}>
          </Button>
          {start.show && (
            <DateTimePicker
              testID="startDateTimePicker"
              value={start.date}
              mode={start.mode}
              display="default"
              onChange={start.onChange}
            />
          )}
        </View>
        <View>
          <Button onPress={end.showDatepicker} title = {"End Date: "+endDate}>
          </Button>
          {end.show && (
          <DateTimePicker
            testID="endDateTimePicker"
            value={end.date}
            mode={end.mode}
            display="default"
            onChange={end.onChange}
          />
        )}
        </View>

        <View>
          <Text>Duration (minutes)</Text>
          <Input
            placeholder={durationS}
            value={durationS}
            onChangeText={ds => {setDurationS(ds);}}
          />
        </View>

        <View>
        <Text> Friends Invited </Text>
        <ScrollView>
        {
          curEvent.curEvent.friendInvited.map(i =>
            <View key={i.email}>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>{i.email}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            </View>
          )
        }
        </ScrollView>
        </View>
        <View>
        <Button
            title="Invite Friends"
            onPress={()=>props.navigation.navigate('InviteFriend')}
        />
        </View>
        <Text></Text>

        <View>
          <Button onPress={createEvent} title="Create Event">
          </Button>
        </View>
      </ScrollView>
    </View>
      
    );

}

export default CreateEvent;



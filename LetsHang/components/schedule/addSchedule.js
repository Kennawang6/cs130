import React, { Component, useState, useEffect } from 'react';
// style
import { View, Platform, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import { Button, Input, Text, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './styles';

// datetimepicker
import DateTimePicker from '@react-native-community/datetimepicker';

//redux
import { useSelector, useDispatch } from 'react-redux';
import { addScheduleEvent } from '../../actions/editSchedule'
import { ADD_SCHEDULE } from '../../actions/types'

//firebase
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const addSchedule = props => {
  // redux
  const schedule = useSelector(state => state.scheduleReducer);
  const dispatch = useDispatch();
  // state
  const [description, setDescription] = useState('');

  //initialize variable
  const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var timeZone = 0;
  var EventList = [];
  var inputInvalidFormat = true;
  var inputOverlap = true;
  var eventConflict = true;
  var timeslot = {'start':0, 'end':0, 'id':0, 'description':''}
  var timeslots = [];

  // snapshot to get user's timezone
  var subscribe = firestore().collection("users").onSnapshot(snapshot => {
        var curUser = firebase.auth().currentUser.uid;
        snapshot.forEach(doc => {
            var userInfo = doc.data();
            var curID = doc.ref._documentPath._parts[1];
            if (curID==curUser){
                timeZone = userInfo.timeZone;
                EventList = userInfo.events;
            }
        });
        console.log('timeZone');
        console.log(timeZone);
  });

  // useInput for dateTimePucker
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
  }

  // set start and end
  const start = useInput(new Date())
  const end = useInput(new Date())

  // firebase: addTimeslotToSchedule
  const sendScheduleEvent = async() => {
      const data = await functions().httpsCallable('addTimeslotToSchedule')({
              timeslot: timeslot
      });
      console.log("addTimeslotToSchedule function has been called");
      console.log(data);
  }

  handlePress = () => {
      console.log("Button was pressed");
      console.log(description);
      timeslot.description = description;

      InputValidation(start.date,end.date);
      CheckOverlap();
      if(inputInvalidFormat||inputOverlap){
          console.log('Not added.')
      }else{
        //update redux
        dispatch({
          type: ADD_SCHEDULE,
          start: timeslot.start,
          end: timeslot.end,
          description: timeslot.description,
          id: timeslot.id
        });
        console.log("Dispatched to store: " + JSON.stringify(schedule.scheduledEvents));

        // Add timeslots to firebase
        sendScheduleEvent();

        //Update Event Schedule
        UpdateEvents();

        // Back to Schedule
        props.navigation.navigate('Schedule');
      }

  }

  InputValidation = (s,e) => {
      console.log('Input Validation');
      //Check description not empty
      if(description == ""){
        alert('Description should not be empty.');
      }else{
          console.log(s.toString());
          console.log(e.toString());
          //Check START and END time
          // - Check if start < end, otherwise, alert
          if (s.getTime() >= e.getTime()){ //
             alert('End time should be larger than start time.');
          }else{
              //Set seconds to 0 for start and end
              s.setSeconds(0);
              e.setSeconds(0);
              //Set Time Zone
              // - format: 'July 20, 69 00:20:18 UTC+07:00'
              // - access user time zone from firebase
              subscribe(); // get UserTimeZone
              if (timeZone>=10){
                var start_string = monthName[s.getMonth()] + ' ' + s.getDate() + ', ' + s.getFullYear() + ' ' + s.getHours() + ':' + s.getMinutes() + ':00 UTC+' + timeZone + ':00';
                var end_string = monthName[e.getMonth()] + ' ' + e.getDate() + ', ' + e.getFullYear() + ' ' + e.getHours() + ':' + e.getMinutes() + ':00 UTC+' + timeZone + ':00';
              }else if (timeZone>=0){
                var start_string = monthName[s.getMonth()] + ' ' + s.getDate() + ', ' + s.getFullYear() + ' ' + s.getHours() + ':' + s.getMinutes() + ':00 UTC+0' + timeZone + ':00';
                var end_string = monthName[e.getMonth()] + ' ' + e.getDate() + ', ' + e.getFullYear() + ' ' + e.getHours() + ':' + e.getMinutes() + ':00 UTC+0' + timeZone + ':00';
              }else if (timeZone > -10){
                var start_string = monthName[s.getMonth()] + ' ' + s.getDate() + ', ' + s.getFullYear() + ' ' + s.getHours() + ':' + s.getMinutes() + ':00 UTC-0' + Math.abs(timeZone) + ':00';
                var end_string = monthName[e.getMonth()] + ' ' + e.getDate() + ', ' + e.getFullYear() + ' ' + e.getHours() + ':' + e.getMinutes() + ':00 UTC-0' + Math.abs(timeZone) + ':00';
              }else{
                var start_string = monthName[s.getMonth()] + ' ' + s.getDate() + ', ' + s.getFullYear() + ' ' + s.getHours() + ':' + s.getMinutes() + ':00 UTC' + timeZone + ':00';
                var end_string = monthName[e.getMonth()] + ' ' + e.getDate() + ', ' + e.getFullYear() + ' ' + e.getHours() + ':' + e.getMinutes() + ':00 UTC' + timeZone + ':00';
              }
              console.log(start_string)
              console.log(end_string)
              var temp_s = new Date(start_string);
              var temp_e = new Date(end_string);
              timeslot.start = temp_s.getTime();
              timeslot.id = temp_s.getTime();
              timeslot.end = temp_e.getTime();
              console.log(timeslot);
              inputInvalidFormat = false;
          }
      }
  }

  CheckOverlap = () => {
    console.log('CheckOverlap')
    console.log(schedule.scheduledEvents)
    var size = schedule.scheduledEvents.length;
    inputOverlap = false;
    //console.log(size);
    for(var i =0; i < size;i++){
        existedTimeslot = schedule.scheduledEvents[i];
        console.log(existedTimeslot)
        if(timeslot.start > existedTimeslot.end || timeslot.end < existedTimeslot.start){
            console.log(i+': not overlapped')
        }else{
            inputOverlap = true;
            alert('This schedule overlap with other schedule.');
        }
    }
  }
  //Coordinate with Event
  // need to consider various cases
  // access user event list
  // go through all the event
  // cases:
  //    event.start_date - event.end_date not overlap with timeslot => NO NEED TO CHANGE
  //    event.start_date - event.end_date overlap with timeslot (3 cases)
  //        event finalize
  //        event update
  //
  UpdateEvents = () =>{
    for(var i =0; i < EventList.length ;i++){
        var eventID = EventList[i];
        UpdateUserSchedule(eventID);
        //getEvent(eventID)
        //check time conflict
        //addUserScheduleToEvent(eventID)
        //computedNextEarliestAvailableTime
    }
  }

  const UpdateUserSchedule = async(eventID) => {
    const eventInfo = await functions().httpsCallable('getEvent')({event_id: eventID});
    console.log("getEvent function has been called");
    console.log(eventInfo);
    const data1 = await functions().httpsCallable('addUserScheduleToEvent')({event_id: eventID});
    console.log("addUserScheduleToEvent function has been called");
    const data2  = await functions().httpsCallable('computedNextEarliestAvailableTime')({event_id: eventID});
    console.log("computedNextEarliestAvailableTime function has been called");
    const newEventInfo = await functions().httpsCallable('getEvent')({event_id: eventID});
    console.log("getEvent function has been called");
    console.log(newEventInfo);
  }


    // display format for datetimepicker
    var startDate = start.date.toDateString();
    var s_minutes = ("0" + start.date.getMinutes()).slice(-2);
    var startTime = start.date.getHours() + ":" + s_minutes;
    var endDate = end.date.toDateString();
    var e_minutes = ("0" + end.date.getMinutes()).slice(-2);
    var endTime = end.date.getHours() + ":" + e_minutes;

    return (
      <View>
        <ScrollView>
            <View>
              <Text>Description</Text>
              <Input
                placeholder=''
                onChangeText={value => {
                  setDescription(value);
                }}
              />
            </View>

            <View>
              <Text>Start</Text>
              <Button type="outline" onPress={start.showDatepicker}
                    title = {startDate}
                    titleStyle= {{ color: 'black'}}
                    buttonStyle={{ borderColor: 'grey', borderRadius: 0 }}
                    containerStyle={{ backgroundColor: 'white' }}
              />
              <Button type="outline" onPress={start.showTimepicker}
                  title = {startTime}
                  titleStyle= {{ color: 'black'}}
                  buttonStyle={{ borderColor: 'grey', borderRadius: 0 }}
                  containerStyle={{ backgroundColor: 'white' }}
              />
              {start.show && (
                <DateTimePicker
                  testID="startDateTimePicker"
                  value={start.date}
                  mode={start.mode}
                  is24Hour={true}
                  display="default"
                  onChange={start.onChange}
                />
              )}
              </View>
              <Text></Text>
              <View>
              <Text>End</Text>
              <Button type="outline" onPress={end.showDatepicker}
                    title = {endDate}
                    titleStyle= {{ color: 'black'}}
                    buttonStyle={{ borderColor: 'grey', borderRadius: 0 }}
                    containerStyle={{ backgroundColor: 'white' }}
              />
              <Button type="outline" onPress={end.showTimepicker}
                  title = {endTime}
                  titleStyle= {{ color: 'black'}}
                  buttonStyle={{ borderColor: 'grey', borderRadius: 0 }}
                  containerStyle={{ backgroundColor: 'white' }}
              />
              {end.show && (
                <DateTimePicker
                  testID="endDateTimePicker"
                  value={end.date}
                  mode={end.mode}
                  is24Hour={true}
                  display="default"
                  onChange={end.onChange}
                />
              )}
            </View>
            <Text></Text>
            <View>
              <Button onPress={handlePress} title="Add Event"></Button>
            </View>
        </ScrollView>
      </View>
    );
}

export default addSchedule;
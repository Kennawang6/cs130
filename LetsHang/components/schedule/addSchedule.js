import React, { Component, useState, useEffect } from 'react';
import { Button, View, Platform, Text, TextInput, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import functions from '@react-native-firebase/functions';
import { useSelector, useDispatch } from 'react-redux';
import { addScheduleEvent } from '../../actions/editSchedule'
import { ADD_SCHEDULE } from '../../actions/types'
import styles from './styles';

const SECOND_IN_MILLISECONDS = 1000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;

const addSchedule = props => {
  // redux
  const schedule = useSelector(state => state.scheduleReducer);
  const dispatch = useDispatch();
  // state
  const [description, setDescription] = useState('');

  //initialize
  var original_timeslot = {'start':0, 'end':0};
  var timeslots = []; //{'start':0, 'end':0, 'id':0, 'description':''}
  var timeslots_dispatch = []; //{type: ADD_SCHEDULE, start:0, end:0, description:'',id: 0}

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

  const sendScheduleEvent = async() => {
       // might need to loop thorough timeslots
      const data = await functions().httpsCallable('addTimeslotToSchedule')({
              timeslot: {
                description: description,
                start: start.date.getTime(),
                end: end.date.getTime(),
                id: start.date.getTime()
                }
      });
      console.log("addTimeslotToSchedule function has been called");
      console.log(data);
      //alert('Event added to schedule.');
  }

  handlePress = () => {
      console.log("Button was pressed");
      console.log(description);
      original_timeslot.start = start.date;
      original_timeslot.end = end.date;

      InputValidation(original_timeslot.start,original_timeslot.end);
      /*
      SplitEvent();
      //might need to loop through timeslots_dispatch
      dispatch({
        type: ADD_SCHEDULE,
        start: start.date.getTime(),
        end: end.date.getTime(),
        description: description,
        id: start.date.getTime()
      });
      console.log("Dispatched to store: " + JSON.stringify(schedule));
      // Add timeslots to firebase
      sendScheduleEvent();
      // Back to Schedule
      props.navigation.navigate('Schedule');
      */
  }

  InputValidation = (s,e) => {
      console.log('Input Validation');
      console.log(timeslot.start.toString());
      console.log(timeslot.end.toString());
      //TODO:Check START and END time
      //Set seconds to 0 for start and end
      s.setSeconds(0);
      e.setSeconds(0);
      console.log(timeslot.start.toString());
      console.log(timeslot.end.toString());
      //TODO:Set Time Zone
      // - access user time zone from firebase
      // - event.toString() expected output format: Tue Aug 19 1975 23:15:30 GMT+0200 (CEST)


      //Check if start < end, otherwise, alert
      if (s.getTime() < e.getTime()){
        original_timeslot.start = s.getTime();
        original_timeslot.end = e.getTime();
      }
  }
  SplitEvent = () => {
  // TODO: if the events is overnight, divide the event
  // using original_timeslot to check
  // save the result to timeslots and timeslots_dispatch
  }

  //TODO: Coordinate with Event
  // need to consider various cases
  // access user event list
  // go through all the event
  // cases:
  //    event.start_date - event.end_date not overlap with timeslot => NO NEED TO CHANGE
  //    event.start_date - event.end_date overlap with timeslot (3 cases)
  //        event finalize
  //        event update
  //

    return (
      <View>
        <TextInput style = {styles.input}
          underlineColorAndroid = "transparent"
          placeholder = "Description"
          placeholderTextColor = "#1f44f4"
          autoCapitalize = "none"
          onChangeText={(value) => {
                         setDescription(value);
                         //setSearching(value == '' ? false : true) // value is latest
                       }}
        />
        <Text>Start</Text>
        <View>
          <TouchableOpacity onPress={start.showDatepicker}>
            <Text>{start.date.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={start.showTimepicker}>
            <Text>{start.date.toTimeString()}</Text>
          </TouchableOpacity>
        </View>
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
        <Text>End</Text>
        <View>
          <TouchableOpacity onPress={end.showDatepicker}>
            <Text>{end.date.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity onPress={end.showTimepicker}>
            <Text>{end.date.toTimeString()}</Text>
          </TouchableOpacity>
        </View>
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
        <TouchableOpacity
          style = {styles.buttonStyle}
          onPress = {handlePress}>
          <Text style = {styles.submitButtonText}> Add Event </Text>
        </TouchableOpacity>
      </View>
    );
}

export default addSchedule;
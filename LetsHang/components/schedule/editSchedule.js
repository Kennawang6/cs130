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

//TODO LIST:
// 1) handle start and end initial value
//      for the end, we have to find the latest end time among the events with same id
// 2) handle edit part - firebase: removeSchedule and addSchedule with complete schedule
//    handle edit part - redux: replace with the complete schedule, or remove then add
// 3) handle remove part - firebase: removeSchedule and addSchedule with complete schedule
//    handle remove part - redux: remove

const editSchedule = props => {
  const event = props.route.params;
  const schedule = useSelector(state => state.scheduleReducer);
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');

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

  const sendScheduleEvent = async() => {
      /*const data = await functions().httpsCallable('addSchedule')(
        {timeslots:[{
          description: description,
          start: start.date.getTime(),
          end: end.date.getTime()}]}
      );*/
      const data = await functions().httpsCallable('addTimeslotToSchedule')({
              timeslot: {
                description: description,
                start: start.date.getTime(),
                end: end.date.getTime()}
      });
      console.log("addTimeslotToSchedule function has been called");
      console.log(data);
      alert('Event added to schedule.');
  }

  /*
  toDoubleDigit = (num) => {
    if ((num / 10 >> 0 ) > 0) {
      return num.toString();
    } else {
      return "0" + num.toString();
    }
  }


  calculateDuration = (start, end) => {
    total = end - start;
    return toDoubleDigit(total / HOUR_IN_MILLISECONDS >> 0) + ":"
            + toDoubleDigit((total % HOUR_IN_MILLISECONDS) / MINUTE_IN_MILLISECONDS >> 0) + ":"
            + toDoubleDigit(((total % HOUR_IN_MILLISECONDS) % MINUTE_IN_MILLISECONDS) / SECOND_IN_MILLISECONDS >> 0);
  }*/

  handleEditPress = () => {
      console.log("Button was pressed");
      console.log(description);
      dispatch({
        type: ADD_SCHEDULE,
        start: start.date.getTime(),
        end: end.date.getTime(),
        description: description,
        // TODO: change after splitEvent function implementation
        id: start.date.getTime(),
      });
      console.log("Dispatched to store: " + JSON.stringify(schedule));
      sendScheduleEvent();
      props.navigation.navigate('Schedule');
  }

  handleRemovePress = () => {
        console.log("Button was pressed");
        console.log(description);
        dispatch({
          type: ADD_SCHEDULE,
          start: start.date.getTime(),
          end: end.date.getTime(),
          description: description,
          // TODO: change after splitEvent function implementation
          id: start.date.getTime(),
        });
        console.log("Dispatched to store: " + JSON.stringify(schedule));
        sendScheduleEvent();
        props.navigation.navigate('Schedule');
    }
  const start = useInput(new Date(event.start))
  const end = useInput(new Date(event.end))

    return (
      <View>
        <TextInput style = {styles.input}
          underlineColorAndroid = "transparent"
          placeholder = {event.description}
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
          onPress = {handleEditPress}>
          <Text style = {styles.submitButtonText}> Update Event </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style = {styles.buttonStyle}
          onPress = {handleRemovePress}>
          <Text style = {styles.submitButtonText}> Remove Event </Text>
        </TouchableOpacity>
      </View>
    );
    /*
    return(
      <View>
        <Text>{event.description}</Text>
        <Text>{event.start}</Text>
        <Text>{event.end}</Text>
      </View>
    );*/
}

export default editSchedule;
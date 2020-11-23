import React, { Component, useState, useEffect } from 'react';
import { Button, View, Platform, Text, TextInput, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import functions from '@react-native-firebase/functions';
import styles from './styles';

export const addSchedule = props => {
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
      const data = await functions().httpsCallable('addSchedule')(
        {timeslots: [{
          description: description,
          start: start.date.getTime(),
          end: end.date.getTime()}]
        }
      );
      console.log("addSchedule function has been called");
      console.log(data);
      alert('Event added to schedule.');
  }

  handlePress = () => {
      console.log("Button was pressed");
      console.log(description);
      sendScheduleEvent();
  }

  const start = useInput(new Date())
  const end = useInput(new Date())

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
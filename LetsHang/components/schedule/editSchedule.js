import React, { Component, useState, useEffect } from 'react';
import { View, Platform, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import functions from '@react-native-firebase/functions';
import { useSelector, useDispatch } from 'react-redux';
import { addScheduleEvent } from '../../actions/editSchedule'
import { ADD_SCHEDULE, REMOVE_SCHEDULE } from '../../actions/types'
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
  //const schedule = useSelector( state  => state.scheduleReducer);
  var schedule = [];
  const dispatch = useDispatch();
  const [description, setDescription] = useState('');

  const getScheduleData = async() => {
      const data = await functions().httpsCallable('getSchedule')({});
      console.log("Schedule is fetched");
      console.log(data.data);
      // check if the user contains schedules on firebase
      if (data.data.status=='ok'){
          schedule.concat(data.data.schedule.timeslots);
          console.log(JSON.stringify(schedule));
      }
  }

  useEffect(() => {
     getScheduleData();
  }, [])

  function useInput(dateInput) {
      const [date, setDate] = useState(dateInput);
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

  const sendEditEvent = async() => {
        const data_remove = await functions().httpsCallable('removeSchedule')({});
        console.log("removeSchedule function has been called in sendEditEvent");
        console.log(data_remove);
        const newSchedule = schedule.filter((event) => event.id!== action.eventID).concat({
              start: start.date.getTime(),
              end: end.date.getTime(),
              description: description,
              id: start.date.getTime(),
           })
        await console.log("await after remove: " + JSON.stringify(newSchedule));

        const data = await functions().httpsCallable('addSchedule')({
          timeslots: newSchedule
        });
        console.log("addSchedule function has been called");
        console.log(data);
        props.navigation.navigate('Schedule');
    }

    const sendRemoveEvent = async() => {
          const data_remove = await functions().httpsCallable('removeSchedule')({});
          console.log("removeSchedule function has been called");
          console.log(data_remove);

          const data = await functions().httpsCallable('addSchedule')({
            timeslots: schedule.filter((event) => event.id!== action.eventID)
          });
          console.log("addSchedule function has been called");
          console.log(data);
          props.navigation.navigate('Schedule');
      }

    handleEditPress = () => {
        console.log("Button was pressed");
        console.log(description);
        dispatch({
          type: REMOVE_SCHEDULE,
          eventID: event.id,
        });
        dispatch({
          type: ADD_SCHEDULE,
          start: start.date.getTime(),
          end: end.date.getTime(),
          description: description,
          id: start.date.getTime(),
        });
        //console.log("Dispatched to store: " + JSON.stringify(schedule));
        sendEditEvent();
    }

    handleRemovePress = () => {
          console.log("Button was pressed");
          console.log(description);
          dispatch({
            type: REMOVE_SCHEDULE,
            eventID: event.id,
          });
          //console.log("Dispatched to store: " + JSON.stringify(schedule));
          sendRemoveEvent();
      }

  const start = useInput(new Date(event.start))
  const end = useInput(new Date(event.end))

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
            placeholder={event.description}
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
          <Button onPress={handleEditPress} title="Update Event"></Button>
        </View>
        <Text></Text>
        <View>
          <Button onPress={handleRemovePress} title="Remove Event"></Button>
        </View>
      </ScrollView>
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
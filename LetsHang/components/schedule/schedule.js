import React, {Component} from 'react';
import {Alert, StyleSheet, Text, View, TouchableOpacity, Button, Dimensions} from 'react-native';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import ApiCalendar from 'react-google-calendar-api';
import WeeklyCalendar from 'react-native-weekly-calendar';
const windowHeight = Dimensions.get('window').height;

const sampleEvents = [
    { 'start': '2020-11-15 09:00:00', 'duration': '00:20:00', 'note': 'Walk my dog' },
    { 'start': '2020-11-16 14:00:00', 'duration': '01:00:00', 'note': 'Doctor\'s appointment' },
    { 'start': '2020-11-17 08:00:00', 'duration': '00:30:00', 'note': 'Morning exercise' },
    { 'start': '2020-11-17 14:00:00', 'duration': '02:00:00', 'note': 'Meeting with client' },
    { 'start': '2020-11-18 23:00:00', 'duration': '01:00:00', 'note': 'Dinner with family' },
    { 'start': '2020-11-19 00:00:00', 'duration': '02:00:00', 'note': 'Schedule 1' },
    { 'start': '2020-11-20 11:00:00', 'duration': '02:00:00', 'note': 'Schedule 2' },
    { 'start': '2020-11-20 15:00:00', 'duration': '01:30:00', 'note': 'Schedule 3' },
    { 'start': '2020-11-21 18:00:00', 'duration': '02:00:00', 'note': 'Schedule 4' },
    { 'start': '2020-03-26 22:00:00', 'duration': '01:00:00', 'note': 'Schedule 5' }
  ]

export default class Schedule extends Component{

    constructor(props) {
        super(props);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.state = {
          items: {}
        };
     }

    handleItemClick(name: string): void {
        if (name === 'sign-in') {
          if (ApiCalendar.sign)
              ApiCalendar.listUpcomingEvents(10)
                .then(({result}: any) => {
                  console.log(result.items);
           });

        } else if (name === 'sign-out') {
          ApiCalendar.handleSignoutClick();
        }
      }

    render() {
      return (
        <View style={styles.container}>
          <WeeklyCalendar events={sampleEvents} style={{ height: windowHeight*0.83 }} />
        </View>
      );
    }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

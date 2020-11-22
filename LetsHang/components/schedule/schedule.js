import React, {Component} from 'react';
import {Alert, StyleSheet, Text, View, TouchableOpacity, Button, Dimensions} from 'react-native';
import WeeklyCalendar from 'react-native-weekly-calendar';
import moment from 'moment/min/moment-with-locales';
import styles from './styles';

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
     }

    render() {
      return (
        <View>
          <WeeklyCalendar
            events={sampleEvents}
            renderEvent={(event, j) => {
              let startTime = moment(event.start).format('LT').toString()
              let duration = event.duration.split(':')
              let seconds = parseInt(duration[0]) * 3600 + parseInt(duration[1]) * 60 + parseInt(duration[2])
              let endTime = moment(event.start).add(seconds, 'seconds').format('LT').toString()
              return (
                <View key={j}>
                  <View style={styles.event}>
                    <View style={styles.eventDuration}>
                      <View style={styles.durationContainer}>
                        <View style={styles.durationDot} />
                        <Text style={styles.durationText}>{startTime}</Text>
                      </View>
                      <View style={{ paddingTop: 10 }} />
                      <View style={styles.durationContainer}>
                        <View style={styles.durationDot} />
                        <Text style={styles.durationText}>{endTime}</Text>
                      </View>
                      <View style={styles.durationDotConnector} />
                    </View>
                    <View style={styles.eventNote}>
                      <Text style={styles.eventText}>{event.note}</Text>
                    </View>
                  </View>
                  <View style={styles.lineSeparator} />
                </View>
              )
            }}
            renderLastEvent={(event, j) => {
              let startTime = moment(event.start).format('LT').toString()
              let duration = event.duration.split(':')
              let seconds = parseInt(duration[0]) * 3600 + parseInt(duration[1]) * 60 + parseInt(duration[2])
              let endTime = moment(event.start).add(seconds, 'seconds').format('LT').toString()
              return (
                <View key={j}>
                  <View style={styles.event}>
                    <View style={styles.eventDuration}>
                      <View style={styles.durationContainer}>
                        <View style={styles.durationDot} />
                        <Text style={styles.durationText}>{startTime}</Text>
                      </View>
                      <View style={{ paddingTop: 10 }} />
                      <View style={styles.durationContainer}>
                        <View style={styles.durationDot} />
                        <Text style={styles.durationText}>{endTime}</Text>
                      </View>
                      <View style={styles.durationDotConnector} />
                    </View>
                    <View style={styles.eventNote}>
                      <Text style={styles.eventText}>{event.note}</Text>
                    </View>
                  </View>
                </View>
              )
            }}
            renderDay={(eventViews, weekdayToAdd, i) => (
              <View key={i.toString()} style={styles.day}>
                <View style={styles.dayLabel}>
                  <Text style={[styles.monthDateText, { color: 'steelblue' }]}>{weekdayToAdd.format('M/D').toString()}</Text>
                  <Text style={[styles.dayText, { color: 'steelblue' }]}>{weekdayToAdd.format('ddd').toString()}</Text>
                </View>
                <View style={[styles.allEvents, eventViews.length === 0 ? { width: '100%', backgroundColor: 'whitesmoke' } : {}]}>
                  {eventViews}
                </View>
              </View>
            )}
            onDayPress={(weekday, i) => {
              console.log(weekday.format('ddd') + ' is selected! And it is day ' + (i+1) + ' of the week!')
            }}
            themeColor='steelblue'
            style={{ height: windowHeight*0.83 }}
            titleStyle={{ color: 'black' }}
            dayLabelStyle={{ color: 'black' }}
          />
        </View>
      );
    }

}
/*
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});*/

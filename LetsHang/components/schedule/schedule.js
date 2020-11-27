import React, {Component} from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Button, Dimensions} from 'react-native';
import WeeklyCalendar from 'react-native-weekly-calendar';
import moment from 'moment/min/moment-with-locales';
import styles from './styles';
import { useState, useEffect } from 'react';

import functions from '@react-native-firebase/functions';

const windowHeight = Dimensions.get('window').height;

const SECOND_IN_MILLISECONDS = 1000;
const MINUTE_IN_MILLISECONDS = 60 * SECOND_IN_MILLISECONDS;
const HOUR_IN_MILLISECONDS = 60 * MINUTE_IN_MILLISECONDS;

import { connect } from 'react-redux';
import { addScheduleEvent, replaceSchedule, removeScheduleEvent} from '../../actions/editSchedule';


/*function weeklyCalendar(){
  useEffect(() => {
  fetchSomething();
}, []);
}
*/

class Schedule extends Component{

    constructor(props) {
        super(props);
        this.state = {
          timeslots: [],
          displaySchedule: [],
          ifLoading: true,
          testEvents: [{"description": "test02", "duration": "01:00:00", "end": "2020-11-25 10:24:33", "start": "2020-11-25 09:24:33"}, {"description": "test 04", "duration": "01:18:00", "end": "2020-11-25 11:18:51", "start": "2020-11-25 10:00:51"}, {"description": "test3", "duration": "10:00:00", "end": "2020-11-26 19:39:06", "start": "2020-11-26 09:39:06"}]
        };
    }
    componentDidMount() {
      this.getScheduleData();
      
    }
    /*componentDidUpdate(prevProps, prevState) {
      // only update chart if the data has changed
      if(prevProps.scheduledEvents !== this.props.scheduledEvents){
        this.setState({ifLoading:true});
        console.log(this.state.ifLoading);
        this.getScheduleData();
      }
    }*/

    getScheduleData = async() => {
        const data = await functions().httpsCallable('getSchedule')({});
        console.log("Schedule is fetched");
        console.log(data.data);
        // check if the user contains schedules on firebase
        if (data.data.status=='ok'){
            this.props.replaceSchedule(data.data.schedule.timeslots);
            this.setState({
                displaySchedule: data.data.schedule.timeslots
            },() => {
              console.log("state.displaySchedule");
              console.log(this.state.displaySchedule);
            });
            
            console.log(this.state.displaySchedule);
            //this.convertToSchedule();
        }else{
            console.log('initialize')
            const data_initialized = await functions().httpsCallable('addSchedule')({timeslots:[]});
        }
        //this.forceUpdate();
        // assuming id is stored in firebase
        //this.props.replaceSchedule(this.state.timeslots);
        this.setState({ifLoading: false});
        this.setState((prevState)=>{
          return{
            displaySchedule: this.state.displaySchedule
          }
        })
        this.test();
    }

    convertToSchedule = () =>{
        console.log("Convert timeslots to displaySchedule");
        var new_schedule = [];
        for (var i=0;i<this.state.timeslots.length;i++) {
            //console.log(this.state.timeslots[i]);
            /*
            var s = new Date(this.state.timeslots[i].start);
            var s_date = ("0" + s.getDate()).slice(-2);
            var s_month = ("0" + (s.getMonth() + 1)).slice(-2);
            var s_year = s.getFullYear();
            var s_hours = ("0" + s.getHours()).slice(-2);
            var s_minutes = ("0" + s.getMinutes()).slice(-2);
            var s_seconds = ("0" + s.getSeconds()).slice(-2);
            var e = new Date(this.state.timeslots[i].end);
            var e_date = ("0" + e.getDate()).slice(-2);
            var e_month = ("0" + (e.getMonth() + 1)).slice(-2);
            var e_year = e.getFullYear();
            var e_hours = ("0" + e.getHours()).slice(-2);
            var e_minutes = ("0" + e.getMinutes()).slice(-2);
            var e_seconds = ("0" + e.getSeconds()).slice(-2);
            var event = {'start': s_year + "-" + s_month + "-" + s_date + " " + s_hours + ":" + s_minutes + ":" + s_seconds,
                         'end': e_year + "-" + e_month + "-" + e_date + " " + e_hours + ":" + e_minutes + ":" + e_seconds,
                         'description': this.state.timeslots[i].description
                        };*/
            var event = {'start':this.state.timeslots[i].start,
                         'end':this.state.timeslots[i].end,
                         'description': this.state.timeslots[i].description,
                         'id':this.state.timeslots[i].start,
                        }
            //console.log(event);
            new_schedule.push(event);
        }
        // TODO: HANDLE SPLIT EVENT
        this.setState({
            displaySchedule: new_schedule
        });
        console.log(this.state.displaySchedule);
    }

    toDoubleDigit = (num) => {
        if ((num / 10 >> 0 ) > 0) {
            return num.toString();
        } else {
            return  "0" + num.toString();
        }
    }

    calculateDuration = (start, end) => {
        var total = end - start;
        return this.toDoubleDigit(total / HOUR_IN_MILLISECONDS >> 0) + ":"
                + this.toDoubleDigit((total % HOUR_IN_MILLISECONDS) / MINUTE_IN_MILLISECONDS >> 0) + ":"
                + this.toDoubleDigit(((total % HOUR_IN_MILLISECONDS) % MINUTE_IN_MILLISECONDS) / SECOND_IN_MILLISECONDS >> 0);
      }

    test = () =>{
        console.log("Try redux");
        console.log(this.props.scheduledEvents);
    }

    

    // TODO: check why not presenting the events
    render() {
      console.log('in render why');
      
      const events = this.props.scheduledEvents;
      const events1 = this.state.displaySchedule;
      //console.log(events);
      //console.log(events);
      //console.log("state");
      //console.log(this.state.displaySchedule);
      //if(this.props.scheduledEvents&&this.props.scheduledEvents.length){
      
      if(this.state.ifLoading){
        return(
          <View>
            <Text> Loading </Text>
          </View>
        );
      }
      else{
      return (
        <View>
          <WeeklyCalendar
            events= {this.props.scheduledEvents}
            renderEvent={(event, j) => {
              var s = new Date(event.start);
              var s_date = ("0" + s.getDate()).slice(-2);
              var s_month = ("0" + (s.getMonth() + 1)).slice(-2);
              var s_year = s.getFullYear();
              var s_hours = ("0" + s.getHours()).slice(-2);
              var s_minutes = ("0" + s.getMinutes()).slice(-2);
              var s_seconds = ("0" + s.getSeconds()).slice(-2);
              var start_string = s_year + "-" + s_month + "-" + s_date + " " + s_hours + ":" + s_minutes + ":" + s_seconds;
              var e = new Date(event.end);
              var e_date = ("0" + e.getDate()).slice(-2);
              var e_month = ("0" + (e.getMonth() + 1)).slice(-2);
              var e_year = e.getFullYear();
              var e_hours = ("0" + e.getHours()).slice(-2);
              var e_minutes = ("0" + e.getMinutes()).slice(-2);
              var e_seconds = ("0" + e.getSeconds()).slice(-2);
              var end_string =  e_year + "-" + e_month + "-" + e_date + " " + e_hours + ":" + e_minutes + ":" + e_seconds;
              let startTime = moment(start_string).format('LT').toString()
              let endTime = moment(end_string.end).format('LT').toString()

              //let startTime = moment(event.start).format('LT').toString()
              //let duration = event.duration.split(':')
              //let seconds = parseInt(duration[0]) * 3600 + parseInt(duration[1]) * 60 + parseInt(duration[2])
              //let endTime = moment(event.start).add(seconds, 'seconds').format('LT').toString()
              //let endTime = moment(event.end).format('LT').toString()

              return (
                <View key={j}>
                  <TouchableOpacity style={styles.event} onPress={()=>this.props.navigation.navigate('EditSchedule',{'start': event.start,'end':event.end,'description':event.description})}>
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
                      <Text style={styles.eventText}>{event.description}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.lineSeparator} />
                </View>
              )
            }}
            renderLastEvent={(event, j) => {
              var s = new Date(event.start);
              var s_date = ("0" + s.getDate()).slice(-2);
              var s_month = ("0" + (s.getMonth() + 1)).slice(-2);
              var s_year = s.getFullYear();
              var s_hours = ("0" + s.getHours()).slice(-2);
              var s_minutes = ("0" + s.getMinutes()).slice(-2);
              var s_seconds = ("0" + s.getSeconds()).slice(-2);
              var start_string = s_year + "-" + s_month + "-" + s_date + " " + s_hours + ":" + s_minutes + ":" + s_seconds;
              var e = new Date(event.end);
              var e_date = ("0" + e.getDate()).slice(-2);
              var e_month = ("0" + (e.getMonth() + 1)).slice(-2);
              var e_year = e.getFullYear();
              var e_hours = ("0" + e.getHours()).slice(-2);
              var e_minutes = ("0" + e.getMinutes()).slice(-2);
              var e_seconds = ("0" + e.getSeconds()).slice(-2);
              var end_string =  e_year + "-" + e_month + "-" + e_date + " " + e_hours + ":" + e_minutes + ":" + e_seconds;
              let startTime = moment(start_string).format('LT').toString()
              let endTime = moment(end_string.end).format('LT').toString();

              //let startTime = moment(event.start).format('LT').toString()
              //let duration = event.duration.split(':')
              //let seconds = parseInt(duration[0]) * 3600 + parseInt(duration[1]) * 60 + parseInt(duration[2])
              //let endTime = moment(event.start).add(seconds, 'seconds').format('LT').toString()
              //let endTime = moment(event.end).format('LT').toString()

              return (
                <View key={j}>
                  <TouchableOpacity style={styles.event} onPress={()=>this.props.navigation.navigate('EditSchedule',{'start': event.start,'end':event.end,'description':event.description})}>
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
                      <Text style={styles.eventText}>{event.description}</Text>
                    </View>
                  </TouchableOpacity>
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
}

const mapStateToProps = (state) => {
  return { scheduledEvents: state.scheduleReducer.scheduledEvents }
};

const mapDispatchToProps = (dispatch) => {
  return{
    replaceSchedule:(schedule) => dispatch(replaceSchedule(schedule)),
    addScheduleEvent: (schedule) => dispatch(addScheduleEvent(schedule)),
    removeScheduleEvent: (start) => dispatch(removeScheduleEvent(start)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(Schedule);
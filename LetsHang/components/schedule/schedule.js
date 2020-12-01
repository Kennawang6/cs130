import React, {Component} from 'react';
import { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Button, Dimensions} from 'react-native';
// weekly calendar
import WeeklyCalendar from 'react-native-weekly-calendar';
import moment from 'moment/min/moment-with-locales';
import styles from './styles';
// firebase
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';

// redux
import { connect } from 'react-redux';
import { addScheduleEvent, replaceSchedule, removeScheduleEvent} from '../../actions/editSchedule';

// CONST
const windowHeight = Dimensions.get('window').height;

class Schedule extends Component{
    // TODO: change to snapshot
    constructor(props) {
        super(props);
        this.state = {
          timeslots: [],
          displaySchedule: [],
          ifLoading: true,
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
        }else{
            console.log('initialize')
            const data_initialized = await functions().httpsCallable('addSchedule')({timeslots:[]});
        }
        this.setState({ifLoading: false});
        this.setState((prevState)=>{
          return{
            displaySchedule: this.state.displaySchedule
          }
        })
        this.test();
    }

    //
    test = () =>{
        console.log("Try redux");
        console.log(this.props.scheduledEvents);
    }

    render() {
      //console.log('in render');
      
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
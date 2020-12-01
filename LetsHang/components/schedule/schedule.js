import React, {Component} from 'react';
import { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, Button, Dimensions} from 'react-native';
// weekly calendar
import WeeklyCalendar from 'react-native-weekly-calendar';
//import moment from 'moment/min/moment-with-locales';
import styles from './styles';
// firebase
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

// redux
import { connect } from 'react-redux';
import { addScheduleEvent, replaceSchedule, removeScheduleEvent} from '../../actions/editSchedule';

import Spinner from 'react-native-loading-spinner-overlay';

// CONST
const windowHeight = Dimensions.get('window').height;

class Schedule extends Component{
    constructor(props) {
        super(props);
        this.state = {
          timeslots: [],
          displaySchedule: [],
          ifLoading: true,
          timeZoneLoading: true,
          timeZone: null
        };
        this.subscriber = firestore().collection('schedules').onSnapshot(snapshot => {
            console.log('snapshot');
           // console.log(snapshot);
            var curUser = firebase.auth().currentUser.uid;
            //console.log('curUser');
            //console.log(curUser);

            var existInFirebase = false;
            snapshot.forEach(doc => {
                var curTimeslots = doc.data();
                console.log('curTimeslots')
                console.log(curTimeslots.timeslots);
                var curID = doc.ref._documentPath._parts[1];
                //console.log('curID');
                //console.log(curID);
                if (curID==curUser){
                    existInFirebase = true;
                    this.props.replaceSchedule(curTimeslots.timeslots);
                    console.log('this.props.scheduledEvents')
                    console.log(this.props.scheduledEvents)

                    this.setState({
                      displaySchedule: curTimeslots.timeslots,
                      ifLoading: false
                    },() => {
                    console.log("state.displaySchedule");
                    console.log(this.state.displaySchedule);
                    });
                }
            });

            if(!existInFirebase){
                this.getScheduleData();
            }
        });
    }

    // access user timezone
    componentDidMount() {
        this.getUserTimeZone();
    }

    // access user timezone
    getUserTimeZone = async() => {
        const data = await functions().httpsCallable('getUserData')({});
        var timeZone = data.data.data.timeZone;
        if(timeZone<-12||timeZone>12){
          timeZone = null;
        }
        this.setState({timeZone: timeZone, timeZoneLoading:false});
     }

     //TODO: Double check this part

    componentDidUpdate(prevProps, prevState) {
      // only update chart if the data has changed
      if(prevProps.scheduleEvents !== this.props.scheduleEvents){
        this.setState({ifLoading:true});
        console.log(this.state.ifLoading);
        this.getScheduleData();
      }
    }
    /*
    componentDidUpdate(prevProps) {
        //console.log('Should I update?');
        //console.log("new friends length: ", this.props.friends.length);
        //console.log("old friends length: ", prevProps.friends.length);
        if (this.props.scheduledEvents != prevProps.scheduledEvents){
            this.setState({ifLoading: true});
            console.log('Re-rendering...');
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
        //this.test();
    }

    /*
    //test redux
    test = () =>{
        console.log("Try redux");
        console.log(this.props.scheduledEvents);
    }*/


    render() {
      //console.log('in render');
      //TODO: Handle Split Events here

      const displayEvents = [];
      for(var i=0;i++;i<this.props.scheduledEvents.length){


      }


      if(this.state.ifLoading||this.state.timeZoneLoading){
        return(
            <View style={styles.loading}>
            <Spinner
                visible={this.state.ifLoading||this.state.timeZoneLoading}
                textContent={'Loading...'}
                textStyle={styles.spinnerTextStyle}
            />
            </View>
        );
      }else{
      return (
        <View>
          <WeeklyCalendar
            events= {this.props.scheduledEvents}
            renderEvent={(event, j) => {
              //console.log('in render Event')
              var s = new Date(event.start);
              //console.log('s')
              //console.log(s.toString())
              var s_minutes = ("0" + s.getMinutes()).slice(-2);
              var e = new Date(event.end);
              //console.log('e')
              //console.log(e.toString())
              var e_minutes = ("0" + e.getMinutes()).slice(-2);
              //console.log(this.state.timeZone);
              var s_hours = s.getUTCHours() + this.state.timeZone;
              //console.log(s_hours);
              if(s.getHours()<12){
                var startTime = s.getHours() + ":" + s_minutes + ' AM';
              }else{
                var startTime = s.getHours()-12 + ":" + s_minutes + ' PM';
              }
              if(e.getHours()<12){
                var endTime = e.getHours() + ":" + e_minutes + ' AM';
              }else{
                var endTime = e.getHours()-12 + ":" + e_minutes + ' PM';
              }
              //console.log(start_string);
              //console.log(startTime);
              //console.log(end_string);
              //console.log(endTime);

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
              //console.log('in render lastEvent')
              var s = new Date(event.start);
              //console.log('s')
              //console.log(s.toString())
              var s_minutes = ("0" + s.getMinutes()).slice(-2);
              var e = new Date(event.end);
              //console.log('e')
              //console.log(e.toString())
              var e_minutes = ("0" + e.getMinutes()).slice(-2);
              //console.log(this.state.timeZone);
              var s_hours = s.getUTCHours() + this.state.timeZone;
              //console.log(s_hours);
              if(s.getHours()<12){
                var startTime = s.getHours() + ":" + s_minutes + ' AM';
              }else{
                var startTime = s.getHours()-12 + ":" + s_minutes + ' PM';
              }
              if(e.getHours()<12){
                var endTime = e.getHours() + ":" + e_minutes + ' AM';
              }else{
                var endTime = e.getHours()-12 + ":" + e_minutes + ' PM';
              }
              //console.log(start_string);
              //console.log(startTime);
              //console.log(end_string);
              //console.log(endTime);

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
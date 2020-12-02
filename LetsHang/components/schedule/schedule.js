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
const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/*
const timeZoneList = {-12: '',-11:'',-10:'',-9:'',-8:'',
                      -7:'',-6:'',-5:'',-4:'',-3:'',
                      -2:'',-1:'',0:'',1:'',2:'',
                      3:'',4:'',5:'',6:'',7:'',
                      8:'',9:'',10:'',11:'',12:''}*/
class Schedule extends Component{
    constructor(props) {
        super(props);
        this.state = {
          timeslots: [],
          ifLoading: true,
          timeZoneLoading: true,
          timeZone: 0
        };

        this.subscriber = firestore().collection('schedules').onSnapshot(snapshot => {
            console.log('snapshot');
           // console.log(snapshot);


            var curUser = firebase.auth().currentUser.uid;
            //console.log('curUser');
            //console.log(curUser);

            var existInFirebase = false;
            //this.setState({ifLoading:true,timeZoneLoading:true});
            this.setState({ifLoading:true});
            snapshot.forEach(doc => {
                var curTimeslots = doc.data();
                //console.log('curTimeslots')
                //console.log(curTimeslots.timeslots);
                var curID = doc.ref._documentPath._parts[1];
                //console.log('curID');
                //console.log(curID);
                if (curID==curUser){
                    this.getUserTimeZone();
                    existInFirebase = true;
                    this.props.replaceSchedule(curTimeslots.timeslots);
                    console.log('this.props.scheduledEvents')
                    console.log(this.props.scheduledEvents)

                    this.setState({
                      timeslots: curTimeslots.timeslots,
                      ifLoading: false
                    },() => {
                      console.log("state.timeslots");
                      console.log(this.state.timeslots);
                    });
                    //this.getUserTimeZone();
                }
            });

            if(!existInFirebase){
                existInFirebase = true;
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
          timeZone = 0;
        }
        this.setState({timeZone: timeZone, timeZoneLoading:false});
        this.splitEvent();
     }

    /*
    componentDidUpdate(prevProps, prevState) {
      // only update chart if the data has changed
      if(prevProps.scheduleEvents !== this.props.scheduleEvents){
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
                timeslots: data.data.schedule.timeslots
            },() => {
              console.log("state.timeslots");
              console.log(this.state.timeslots);
            });
        }else{
            console.log('initialize')
            const data_initialized = await functions().httpsCallable('addSchedule')({timeslots:[]});
        }
        this.setState({ifLoading: false});
        this.setState((prevState)=>{
          return{
            timeslots: this.state.timeslots
          }
        })
        //this.test();

    }
    leapYear = (year) =>{
        var result;
        if (year/400){
          result = true
        }
        else if(year/100){
          result = false
        }
        else if(year/4){
          result= true
        }
        else{
          result= false
        }
        return result
     }

    splitEvent = () =>{
        //TODO: Handle Split Events here
        // This function only handle two-day schedule only, to handle more days, add while loop

        console.log('splitEvent');
        var displaySchedule = [];

        // go thru each event
        for(var i=0; i<this.state.timeslots.length; i++){
            var event = this.state.timeslots[i];
            console.log(i+':');
            var s = new Date(event.start);
            console.log('s');
            console.log('gmt+8')
            console.log(s.toString());
            console.log('gmt')
            //console.log(s.toUTCString());
            console.log('this.state.timeZone')
            console.log(this.state.timeZone)
            // - format: 'July 20, 1969 00:20:00 UTC+07:00'
            var s_year = s.getUTCFullYear();
            var s_month = s.getUTCMonth()+1;
            var s_date = s.getUTCDate();
            var s_hours = s.getUTCHours() + this.state.timeZone;

            var e = new Date(event.end);
            console.log('e')
            console.log(e.toString());
            //console.log(e.toUTCString());
            var e_year = e.getUTCFullYear();
            var e_month = e.getUTCMonth()+1;
            var e_date = e.getUTCDate();
            var e_hours = e.getUTCHours() + this.state.timeZone;
            //while()
            //{
            if(s_hours>=24){
                s_hours -= 24;
                //Handle Feb
                if(this.leapYear(s_year)&&s_month==2&&s_date==29){ // check if leap year and at the end of Feb
                    s_month += 1;
                    s_date = 1;
                }else if(s_month==2&&s_date==28){
                    s_month += 1;
                    s_date = 1;
                //Handle Dec
                }else if(s_month==12&&s_date==31){
                    s_year += 1;
                    s_month = 1;
                    s_date = 1;
                //Handle Mon, Mar, May, July, Aug, Oct
                }else if((s_month==1||s_month==3||s_month==5||s_month==7||s_month==8||s_month==10)&&s_date==31){
                    s_month += 1;
                    s_date = 1;
                }else if((s_month==4||s_month==6||s_month==9||s_month==11)&&s_date==30){
                    s_month += 1;
                    s_date = 1;
                }else{
                    s_date += 1;
                }
            }else if(s_hours<0){
                s_hours += 24;
                if(s_month==1&&s_date==1){
                    s_year -= 1;
                    s_month = 12;
                    s_date = 31;
                }else if((s_month==2||s_month==4||s_month==6||s_month==8||s_month==9||s_month==11)&&s_date==1){
                    s_month -= 1;
                    s_date = 31;
                }else if((s_month==3||s_month==5||s_month==7||s_month==10||s_month==12)&&s_date==1){
                    s_month -= 1;
                    s_date = 30;
                }else{
                    s_date -= 1;
                }
            }

            if(e_hours>=24){
                e_hours -= 24;
                //Handle Feb
                if(this.leapYear(e_year)&&e_month==2&&e_date==29){ // check if leap year and at the end of Feb
                    e_month += 1;
                    e_date = 1;
                }else if(e_month==2&&e_date==28){
                    e_month += 1;
                    e_date = 1;
                //Handle Dec
                }else if(e_month==12&&e_date==31){
                    e_year += 1;
                    e_month = 1;
                    e_date = 1;
                //Handle Mon, Mar, May, July, Aug, Oct
                }else if((e_month==1||e_month==3||e_month==5||e_month==7||e_month==8||e_month==10)&&e_date==31){
                    e_month += 1;
                    e_date = 1;
                }else if((e_month==4||e_month==6||e_month==9||e_month==11)&&e_date==30){
                    e_month += 1;
                    e_date = 1;
                }else{
                    e_date += 1;
                }
            }else if(e_hours<0){
                e_hours += 24;
                if(e_month==1&&e_date==1){
                    e_year -= 1;
                    e_month = 12;
                    e_date = 31;
                }else if((e_month==2||e_month==4||e_month==6||e_month==8||e_month==9||e_month==11)&&e_date==1){
                    e_month -= 1;
                    e_date = 31;
                }else if((e_month==3||e_month==5||e_month==7||e_month==10||e_month==12)&&e_date==30){
                    e_month -= 1;
                    e_date = 30;
                }else{
                     e_date -= 1;
                 }
            }
            if (this.state.timeZone>=10){
                var start_end_string = monthName[s_month-1] + ' ' + s_date + ', ' + s_year + ' 23:59:00 UTC+' + this.state.timeZone + ':00';
                var end_start_string = monthName[e_month-1] + ' ' + e_date + ', ' + e_year + ' 00:00:00 UTC+' + this.state.timeZone + ':00';
            }else if (this.state.timeZone>=0){
                var start_end_string = monthName[s_month-1] + ' ' + s_date + ', ' + s_year + ' 23:59:00 UTC+0' + this.state.timeZone + ':00';
                var end_start_string = monthName[e_month-1] + ' ' + e_date + ', ' + e_year + ' 00:00:00 UTC+0' + this.state.timeZone + ':00';
            }else if (this.state.timeZone > -10){
                var start_end_string = monthName[s_month-1] + ' ' + s_date + ', ' + s_year + ' 23:59:00 UTC-0' + Math.abs(this.state.timeZone) + ':00';
                var end_start_string = monthName[e_month-1] + ' ' + e_date + ', ' + e_year + ' 00:00:00 UTC-0' + Math.abs(this.state.timeZone) + ':00';
            }else{
                var start_end_string = monthName[s_month-1] + ' ' + s_date + ', ' + s_year + ' 23:59:00 UTC' + this.state.timeZone + ':00';
                var end_start_string = monthName[e_month-1] + ' ' + e_date + ', ' + e_year + ' 00:00:00 UTC' + this.state.timeZone + ':00';
            }
            //console.log(monthName[s_month-1] + ' ' + s_date + ', ' + s_year + ' ' + s_hours +':'+s.getMinutes());
            //console.log(monthName[e_month-1] + ' ' + e_date + ', ' + e_year + ' ' + e_hours +':'+e.getMinutes());
            if(e_date!=s_date){
                var temp_s_end = new Date(start_end_string);
                var temp_e_start = new Date(end_start_string);
                var event1 = {start: event.start,
                              end: temp_s_end.getTime(),
                              id: event.id,
                              description: event.description
                             };
                var event2 = {start: temp_e_start.getTime(),
                              end: event.end,
                              id: event.id,
                              description: event.description
                             };
                displaySchedule.push(event1);
                displaySchedule.push(event2);
            }else{
                displaySchedule.push(event);
            }

            //}// end while
        }// end for
        console.log('displaySchedule');
        console.log(displaySchedule);
        return displaySchedule;
    }


    render() {
      //console.log('in render');

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
            events= {this.splitEvent()}
            renderEvent={(event, j) => {
              //console.log('in render Event')
              var s = new Date(event.start);
              //console.log('s')
              //console.log(s.toString())
              var s_minutes = ("0" + s.getMinutes()).slice(-2);
              var e = new Date(event.end);
              //console.log('e')
              console.log(e.toString())
              var e_minutes = ("0" + e.getMinutes()).slice(-2);
              //console.log(this.state.timeZone);
              var s_hours = s.getUTCHours() + this.state.timeZone;
              var e_hours = e.getUTCHours() + this.state.timeZone;
              //console.log(s.getHours());
              //console.log(e.getHours());
              //console.log(s.getUTCHours());
              //console.log(e.getUTCHours());
              //console.log(s_hours);
              //console.log(e_hours);

              if(s_hours<12){
                  var startTime = s_hours + ":" + s_minutes + ' AM';
              }else if(s_hours<24){
                  var startTime = s_hours-12 + ":" + s_minutes + ' PM';
              }else{
                  if(s_hours-24<12){
                    var startTime = s_hours-24 + ":" + s_minutes + ' AM';
                  }else{
                    var startTime = s_hours-36 + ":" + s_minutes + ' PM';
                  }
              }

              if(e_hours<12){
                  var endTime = e_hours + ":" + e_minutes + ' AM';
              }else if(e_hours<24){
                  var endTime = e_hours-12 + ":" + e_minutes + ' PM';
              }else{
                  if(e_hours-24<12){
                     var endTime = e_hours-24 + ":" + e_minutes + ' AM';
                  }else{
                     var endTime = e_hours-36 + ":" + e_minutes + ' PM';
                  }
              }
              console.log(startTime);
              console.log(endTime);

              return (
                <View key={j}>
                  <TouchableOpacity style={styles.event} onPress={()=>this.props.navigation.navigate('EditSchedule',{'start': event.start,'end':event.end,'description':event.description,'id':event.id})}>
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
              console.log(e.toString())
              var e_minutes = ("0" + e.getMinutes()).slice(-2);
              //console.log(this.state.timeZone);
              var s_hours = s.getUTCHours() + this.state.timeZone;
              var e_hours = e.getUTCHours() + this.state.timeZone;
              //console.log(s.getHours());
              //console.log(e.getHours());
              //console.log(s.getUTCHours());
              //console.log(e.getUTCHours());
              //console.log(s_hours);
              //console.log(e_hours);

              if(s_hours<12){
                  var startTime = s_hours + ":" + s_minutes + ' AM';
              }else if(s_hours<24){
                  var startTime = s_hours-12 + ":" + s_minutes + ' PM';
              }else{
                  if(s_hours-24<12){
                    var startTime = s_hours-24 + ":" + s_minutes + ' AM';
                  }else{
                    var startTime = s_hours-36 + ":" + s_minutes + ' PM';
                  }
              }

              if(e_hours<12){
                  var endTime = e_hours + ":" + e_minutes + ' AM';
              }else if(e_hours<24){
                  var endTime = e_hours-12 + ":" + e_minutes + ' PM';
              }else{
                  if(e_hours-24<12){
                     var endTime = e_hours-24 + ":" + e_minutes + ' AM';
                  }else{
                     var endTime = e_hours-36 + ":" + e_minutes + ' PM';
                  }
              }
              console.log(startTime);
              console.log(endTime);

              return (
                <View key={j}>
                  <TouchableOpacity style={styles.event} onPress={()=>this.props.navigation.navigate('EditSchedule',{'start': event.start,'end':event.end,'description':event.description,'id':event.id})}>
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
            style={{ height: windowHeight*0.78 }}
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
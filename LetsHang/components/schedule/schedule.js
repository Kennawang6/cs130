import React, {Component} from 'react';
import {Alert, StyleSheet, Text, View, TouchableOpacity, Button} from 'react-native';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import ApiCalendar from 'react-google-calendar-api';
import WeeklyCalendar from 'react-native-weekly-calendar';

const testIDs = require('./testID');
const sampleEvents = [
    { 'start': '2020-11-15 09:00:00', 'duration': '00:20:00', 'note': 'Walk my dog' },
    { 'start': '2020-11-16 14:00:00', 'duration': '01:00:00', 'note': 'Doctor\'s appointment' },
    { 'start': '2020-11-17 08:00:00', 'duration': '00:30:00', 'note': 'Morning exercise' },
    { 'start': '2020-11-17 14:00:00', 'duration': '02:00:00', 'note': 'Meeting with client' },
    { 'start': '2020-11-18 23:00:00', 'duration': '01:00:00', 'note': 'Dinner with family' },
    { 'start': '2020-11-19 00:00:00', 'duration': '02:00:00', 'note': 'Schedule 1' },
    { 'start': '2020-03-26 11:00:00', 'duration': '02:00:00', 'note': 'Schedule 2' },
    { 'start': '2020-03-26 15:00:00', 'duration': '01:30:00', 'note': 'Schedule 3' },
    { 'start': '2020-03-26 18:00:00', 'duration': '02:00:00', 'note': 'Schedule 4' },
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
          <WeeklyCalendar events={sampleEvents} style={{ height: 400 }} />
        </View>
      );
        /*
        return (
                  <Agenda
                           testID={testIDs.agenda.CONTAINER}
                           items={this.state.items}
                           loadItemsForMonth={this.loadItems.bind(this)}
                           selected={'2017-05-16'}
                           renderItem={this.renderItem.bind(this)}
                           renderEmptyDate={this.renderEmptyDate.bind(this)}
                           rowHasChanged={this.rowHasChanged.bind(this)}
                   />
                );
                */
        /*
        return (
          <View>
            <Button
                title="sign-in"
                onPress={() => this.handleItemClick("sign-in")}
            />
            <Button
                title="sign-out"
                onPress={() => this.handleItemClick("sign-out")}
            />
          </View>
        );
        */
    }

    loadItems(day) {
        setTimeout(() => {
          for (let i = -15; i < 85; i++) {
            const time = day.timestamp + i * 24 * 60 * 60 * 1000;
            const strTime = this.timeToString(time);
            if (!this.state.items[strTime]) {
              this.state.items[strTime] = [];
              const numItems = Math.floor(Math.random() * 3 + 1);
              for (let j = 0; j < numItems; j++) {
                this.state.items[strTime].push({
                  name: 'Item for ' + strTime + ' #' + j,
                  height: Math.max(50, Math.floor(Math.random() * 150))
                });
              }
            }
          }
          const newItems = {};
          Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
          this.setState({
            items: newItems
          });
        }, 1000);
    }

      renderItem(item) {
        return (
          <TouchableOpacity
            testID={testIDs.agenda.ITEM}
            style={[styles.item, {height: item.height}]}
            onPress={() => Alert.alert(item.name)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        );
      }

      renderEmptyDate() {
        return (
          <View style={styles.emptyDate}>
            <Text>This is empty date!</Text>
          </View>
        );
      }

      rowHasChanged(r1, r2) {
        return r1.name !== r2.name;
      }

      timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
      }
}
/*
const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex:1,
    paddingTop: 30
  }
});
*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

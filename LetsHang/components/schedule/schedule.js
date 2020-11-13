import React, {useState, Component } from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
//import {Card, Avatar} from 'react-native-paper';
import { Card} from 'react-native-elements';

import { connect } from 'react-redux';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

class Schedule extends Component {
    constructor(props) {
        super(props);
        const [items, setItems] = useState({});
    }

    loadItems = (day) => {
        setTimeout(() => {
            for (let i = -15; i < 85; i++) {
                const time = day.timestamp + i * 24 * 60 * 60 * 1000;
                const strTime = timeToString(time);
                if (!items[strTime]) {
                    items[strTime] = [];
                    const numItems = Math.floor(Math.random() * 3 + 1);
                    for (let j = 0; j < numItems; j++) {
                        items[strTime].push({
                            name: 'Item for ' + strTime + ' #' + j,
                        height: Math.max(50, Math.floor(Math.random() * 150)),
                        });
                    }
                }
            }
            const newItems = {};
            Object.keys(items).forEach((key) => {
                newItems[key] = items[key];
            });
            setItems(newItems);
        }, 1000);
    };

    renderItem = (item) => {
        return (
            <TouchableOpacity style={{marginRight: 10, marginTop: 17}}>
                <Card>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };
    render() {
        return (
            <View>
                <Agenda
                    items={items}
                    loadItemsForMonth={loadItems}
                    selected={'2017-05-16'}
                    renderItem={renderItem}
                />
            </View>
        );
    }
}
/*
const Schedule: React.FC = () => {
  const [items, setItems] = useState({});

  const loadItems = (day) => {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        if (!items[strTime]) {
          items[strTime] = [];
          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime + ' #' + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
            });
          }
        }
      }
      const newItems = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };

  const renderItem = (item) => {
    return (
      <TouchableOpacity style={{marginRight: 10, marginTop: 17}}>
        <Card>
           <View
             style={{
               flexDirection: 'row',
               justifyContent: 'space-between',
               alignItems: 'center',
             }}>
           </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={'2017-05-16'}
        renderItem={renderItem}
      />
    </View>
  );
};*/
const mapStateToProps = (state) => {return {userInfo: state.userReducer.userInfo}}
const mapDispatchToProps = (dispatch) => {
    return{
        reduxSaveUserInfo:(userInfo) => dispatch(saveUserInfo(userInfo))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Schedule);
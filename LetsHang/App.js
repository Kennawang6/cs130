/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';

import { Icon } from 'react-native-elements'

import {Provider} from 'react-redux';
import configureStore from './store';

const store = configureStore();

import Signin from './components/signin/signin';
import Profile from './components/profile/profile';
import EditName from './components/profile/editName';
import EditTimeZone from './components/profile/editTimeZone';
import Schedule from './components/schedule/schedule';
import AddSchedule from './components/schedule/addSchedule';
import EditSchedule from './components/schedule/editSchedule';
import FriendsList from './components/friendsList/friendsList';
import AddFriend from './components/friendsList/addFriend';
import FriendRequests from './components/friendsList/friendRequests';
import FriendInfo from './components/friendsList/friendInfo';
import EventList from './components/event/eventList';
import CreateEvent from './components/event/createEvent';
import EventDetailHost from './components/event/eventDetailHost';
import EventDetailMember from './components/event/eventDetailMember';
import InviteFriend from './components/event/inviteFriend';
import EditEventName from './components/event/editEventName';
import EditEventDescription from './components/event/editEventDescription';
import EventRequests from './components/event/eventRequests';
import InviteFriendHost from './components/event/inviteFriendHost';
// For signIn
const Stack = createStackNavigator();
// For tab
const Tab = createBottomTabNavigator();

// Schedule
const ScheduleStack = createStackNavigator();
function ScheduleStackScreen(){
  return (
    <ScheduleStack.Navigator>
      <ScheduleStack.Screen
        name="Schedule"
        component={Schedule}
        options={({ navigation }) => ({
          headerRight: () => (
            <Icon
              name='add'
              onPress={() => navigation.navigate('AddSchedule')}
            />
          )
        })}
      />
      <ScheduleStack.Screen
          name="AddSchedule"
          component={AddSchedule}
      />
      <ScheduleStack.Screen
          name="EditSchedule"
          component={EditSchedule}
      />
    </ScheduleStack.Navigator>
  );
}

// Profile
const ProfileStack = createStackNavigator();
function ProfileStackScreen(){
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="Profile" 
        component={Profile} 
      />
      <ProfileStack.Screen 
        name="EditName" 
        component={EditName} 
        options={{ title: 'Name' }}
      />
      <ProfileStack.Screen 
        name="EditTimeZone" 
        component={EditTimeZone} 
        options={{ title: 'Time Zone' }}
      />
    </ProfileStack.Navigator>
  );
}

// Friends List
const FriendsListStack = createStackNavigator();
function FriendsListStackScreen(){
  return (
    <FriendsListStack.Navigator>
      <FriendsListStack.Screen
        name="Friends List"
        component={FriendsList}
      />
      <FriendsListStack.Screen
        name="Add Friend"
        component={AddFriend}
      />
      <FriendsListStack.Screen
        name="Friend Requests"
        component={FriendRequests}
      />
      <FriendsListStack.Screen
        name="Friend Info"
        component={FriendInfo}
      />
    </FriendsListStack.Navigator>
  );
}

// Event
const EventStack = createStackNavigator();
function EventStackScreen(){
  return (
    <EventStack.Navigator>
      <EventStack.Screen
        name="EventList"
        component={EventList}
        options={{ title: 'Events' }}
      />
      <EventStack.Screen
        name="CreateEvent"
        component={CreateEvent}
        options={{ title: 'Create Event' }}
      />
      <EventStack.Screen
        name="InviteFriend"
        component={InviteFriend}
        options={{ title: 'Invite Friends' }}
      />
      <EventStack.Screen
        name="EventDetailHost"
        component={EventDetailHost}
        options={{ title: 'Event Detail' }}
      />
      <EventStack.Screen
        name="EventDetailMember"
        component={EventDetailMember}
        options={{ title: 'Event Detail' }}
      />
      <EventStack.Screen
        name="EditEventName"
        component={EditEventName}
        options={{ title: 'Event Name' }}
      />
      <EventStack.Screen
        name="EditEventDescription"
        component={EditEventDescription}
        options={{ title: 'Event Description' }}
      />
      <EventStack.Screen
        name="EventRequests"
        component={EventRequests}
        options={{ title: 'Event Requests' }}
      />
      <EventStack.Screen
        name="InviteFriendHost"
        component={InviteFriendHost}
        options={{ title: 'Invite Friends' }}
      />
    </EventStack.Navigator>
  );
}


function LoginApp() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;
  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="Signin"
          component={Signin} 
          options={{ title: 'Welcome' }}
        />  
      </Stack.Navigator>
    );
  }
  else {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Schedule" component={ScheduleStackScreen} />
        <Tab.Screen name="Event" component={EventStackScreen} />
        <Tab.Screen name="Friend's List" component={FriendsListStackScreen} />
        <Tab.Screen name="Profile" component={ProfileStackScreen} />
      </Tab.Navigator>
    );
  }
  
}


export default function App() {
  return (
  <Provider store={store}>
    <NavigationContainer>
      <LoginApp />
    </NavigationContainer>
  </Provider>
  );
}

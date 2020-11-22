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

import {Button} from 'react-native'

import {Provider} from 'react-redux';
import configureStore from './store';

const store = configureStore();


import Signin from './components/signin/signin';
import Profile from './components/profile/profile';
import EditName from './components/profile/editName';
import Schedule from './components/schedule/schedule';
import AddSchedule from './components/schedule/addSchedule';
import FriendsList from './components/friendsList/friendsList';
import AddFriend from './components/friendsList/addFriend';
import FriendInfo from './components/friendsList/friendInfo';


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
          name="AddSchedule"
          component={AddSchedule}
      />
      <ScheduleStack.Screen 
        name="Schedule" 
        component={Schedule}
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
    </ProfileStack.Navigator>
  );
}

// Friend's List
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
        name="Friend Info"
        component={FriendInfo}
      />
    </FriendsListStack.Navigator>
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
        <Tab.Screen name="Profile" component={ProfileStackScreen} />
        <Tab.Screen name="Friend's List" component={FriendsListStackScreen} />
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

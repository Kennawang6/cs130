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

import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import functions from '@react-native-firebase/functions';


import {Provider} from 'react-redux';
import configureStore from './store';

const store = configureStore();


import Signin from './components/signin/signin';
import Profile from './components/profile/profile';
import EditName from './components/profile/editName';

const Stack = createStackNavigator();

function LoginApp() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
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
      <Stack.Navigator>
        <Stack.Screen 
          name="Profile" 
          component={Profile} 
        />      
        <Stack.Screen 
          name="EditName" 
          component={EditName} 
          options={{ title: 'User Name' }}
        />    
      </Stack.Navigator>
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
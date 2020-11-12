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

import {Provider} from 'react-redux';
import configureStore from './store';

const store = configureStore();


import Signin from './components/signin/signin';
import Profile from './components/profile/profile';
import EditName from './components/profile/editName';

const Stack = createStackNavigator();


function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Signin"
        component={Signin} 
        options={{ title: 'Welcome' }}
      />  
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

export default function App() {
  return (
  <Provider store={store}>
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  </Provider>
  );
}
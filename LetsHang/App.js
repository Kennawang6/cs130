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

import Signin from './components/signin/signin';
import Profile from './components/profile/profile';
import Schedule from './components/profile/schedule';

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
              name="Schedule"
              component={Schedule}
            />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}
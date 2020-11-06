import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';


export default class Setting extends Component {
  
  render() {   
    return (
      <View style={styles.container}>
        <Text style = {styles.textStyle}>
          Hello!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 35,
    backgroundColor: '#fff'
  },
  textStyle: {
    fontSize: 15,
    marginBottom: 20
  }
});
import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import styles from './styles';
import functions from '@react-native-firebase/functions';
import { useState, useEffect } from 'react';
const user = firebase.auth().currentUser;


export default class Setting extends Component {
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    this.state = { userName: "", userTimeZone: 100};
    //this.getUserData = this.getUserData.bind(this);
  }

  getUserData = async() => {
    const data = await functions().httpsCallable('getUserData')({});
    console.log("Data is fetched");
    console.log(data);
    this.setState({userName: data.data.data.name, userTimeZone: data.data.data.timeZone}, () => {                              
        console.log(this.state.userName);
        console.log(this.state.userTimeZone);
    });
  }
  handleUserName = (newName) => {
    this.setState({userName: newName}, () => {                              
        console.log(this.state.userName);
    });
  }
  setUserName = async(newName) => {
    const data = await functions().httpsCallable('updateUserData')({
      userData: {
        name: newName
      }
    });
    console.log("Name is set");
  }
  
  componentDidMount() {
    this.getUserData();
  }

  logoff = async() => {
    auth()
    .signOut()
    .then(() => console.log('User signed out!'));
  }

  render() {
    var curTimeZone = this.state.userTimeZone;
    return (
      <View style={styles.container}>
        <Text style = {styles.textStyle}>
          name: {this.state.userName} {"\n"}{"\n"}
          photoURL: {user.photoURL} {"\n"}{"\n"}
          timeZone: {curTimeZone==100?' ': curTimeZone} {"\n"}{"\n"}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={this.state.userName}
            maxLength={20}
            onBlur={Keyboard.dismiss}
            value={this.state.userName}
            onChangeText={this.handleUserName}
          />
        </View>
        <TouchableOpacity onPress = {() => this.setUserName(this.state.userName)}>
          <Text> Submit </Text>
        </TouchableOpacity>
        <Button
          title="Log Off"
          onPress={()=>this.logoff().then(() => this.props.navigation.navigate('Signin'))}
        />
      </View>
    );
  }
}


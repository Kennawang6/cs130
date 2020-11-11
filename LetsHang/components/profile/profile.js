import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import styles from './styles';

const user = firebase.auth().currentUser;

export default class Setting extends Component {
  editProfile = () => {
  	console.log("Editing");
  }
  render() {   
    return (
      <View style={styles.container}>
        <Text style = {styles.textStyle}>
          Email: {user.email} {"\n"}{"\n"}
          displayName: {user.displayName} {"\n"}{"\n"}
          photoURL: {user.photoURL} {"\n"}{"\n"}
          uid: {user.uid} {"\n"}{"\n"}
        </Text>

      	<Button
          title="Edit"
          onPress={this.editProfile}
        />
      </View>
    );
  }
}


import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import styles from './styles';
import functions from '@react-native-firebase/functions';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { saveUserInfo } from '../../actions/saveUserInfo';

class EditName extends Component {
  constructor(props) {
    super(props);
    this.state = {userName: ""};
  }
  handleUserName = (newName) => {
    this.setState({userName: newName}, () => {                              
        console.log(this.state.userName);
    });
  }
  setUserName = async(newName) => {
    var timeZone = this.props.userInfo.uTimeZone;
    var photo = this.props.userInfo.uPhoto;
    var email = this.props.userInfo.uEmail;
    this.props.reduxSaveUserInfo({uName: this.state.userName, uTimeZone: timeZone, uPhoto: photo, uEmail: email});
    const data = await functions().httpsCallable('updateUserData')({
      userData: {
        name: newName
      }
    });
    console.log("Name is set");
  }
  
  render() {
    var curTimeZone = this.state.userTimeZone;
    return (
        <View style={styles.editName}>
          <Input
            style={styles.textInput}
            placeholder={this.props.userInfo.uName}
            maxLength={20}
            onBlur={Keyboard.dismiss}
            value={this.state.userName}
            onChangeText={this.handleUserName}
          />
         <Button
          title="Submit"
          onPress = {() => 
          {
            this.setUserName(this.state.userName);
            this.props.navigation.navigate('Profile');}}
         />
      </View>
    );
  }
}

const mapStateToProps = (state) => {return {userInfo: state.userReducer.userInfo}}

const mapDispatchToProps = (dispatch) => {
  return{
    reduxSaveUserInfo:(userInfo) => dispatch(saveUserInfo(userInfo))
}}

export default connect(mapStateToProps, mapDispatchToProps)(EditName);
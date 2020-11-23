import React, { Component } from 'react';
import { StyleSheet, View,} from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import styles from './styles';
import functions from '@react-native-firebase/functions';
import { Text, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { saveUserInfo } from '../../actions/saveUserInfo';

class EditTimeZone extends Component {
  constructor(props) {
    super(props);
    this.state = {timeZoneString: this.props.route.params.timeZone.toString()};
  }
  handleTimeZone = (newTimeString) => {
    this.setState({timeZoneString: newTimeString}, () => {                       
        console.log(this.state.timeZoneString);
    });
  }
  setTimeZone = async(newTime) => {
    var name = this.props.userInfo.uName;
    var photo = this.props.userInfo.uPhoto;
    var email = this.props.userInfo.uEmail;
    this.props.reduxSaveUserInfo({uName: name, uTimeZone: newTime, uPhoto: photo, uEmail: email});
    const data = await functions().httpsCallable('updateUserData')({
      userData: {
        timeZone: newTime
      }
    });
    console.log("Time Zone is set");
  }
  
  render() {
    return (
        <View>
          <Input
            placeholder={this.state.timeZoneString}
            value={this.state.timeZoneString}
            onChangeText={this.handleTimeZone}
          />
         <Button
          title="Submit"
          onPress = {() => 
          {
            var timeZone = parseInt(this.state.timeZoneString, 10);
            if(timeZone >= -12 && timeZone<=12){
              this.setTimeZone(timeZone);
              this.props.navigation.navigate('Profile');
            }
            else{
              alert("Invalid Input: Time zone should range from -12 to 12");
            }
            
          }}
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

export default connect(mapStateToProps, mapDispatchToProps)(EditTimeZone);
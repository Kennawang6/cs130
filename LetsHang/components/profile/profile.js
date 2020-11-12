import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import styles from './styles';
import functions from '@react-native-firebase/functions';
import { ListItem, Avatar } from 'react-native-elements'


import { connect } from 'react-redux';
import { saveUserName } from '../../actions/saveUserName';

//export default 
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = { userName: "", userTimeZone: 100, photoURL: "", email: ""};
    //this.getUserData = this.getUserData.bind(this);
  }

  componentDidMount() {
    this.getUserData();
  }

  /*componentDidUpdate(prevProps, prevState) {
    if (prevState.userName !== this.state.userName) {
      console.log('user name has changed.');
      console.log(this.state.userName);
    }
    if (prevState.userTimeZone !== this.state.userTimeZone){
      console.log('user timeZone has changed.');
      console.log(this.state.userName);

    }
  }*/

  getUserData = async() => {
    const data = await functions().httpsCallable('getUserData')({});
    console.log("Data is fetched");
    console.log(data);
    this.setState({userName: data.data.data.name, 
                   userTimeZone: data.data.data.timeZone,
                   photoURL: data.data.data.photoURL,
                   email: data.data.data.email}, () => {                              
        console.log(this.state.userName);
        console.log(this.state.userTimeZone);
    });
    this.props.reduxSaveUserName(this.state.userName);
    console.log(this.props.uName);
  }
  
  logoff = async() => {
    auth()
    .signOut()
    .then(() => console.log('User signed out!'));
  }

  render() {
    var curTimeZone = this.state.userTimeZone;
    var curUserName = this.props.uName;
    return (

      <View style={styles.container}>
        <Text style = {styles.textStyle}>
          name: {curUserName==""?' ': curUserName} {"\n"}{"\n"}
          timeZone: {curTimeZone==100?' ': curTimeZone} {"\n"}{"\n"}
        </Text>
        <Button
          title = "editName"
          onPress = {()=>this.props.navigation.navigate('EditName')}
        />
        <Button
          title="Log Off"
          onPress={()=>this.logoff().then(() => this.props.navigation.navigate('Signin'))}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {return {uName: state.userNameReducer.uName}}

const mapDispatchToProps = (dispatch) => {
  return{
    reduxSaveUserName:(uName) => dispatch(saveUserName(uName))
}}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, TextInput, TouchableOpacity, Keyboard, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import styles from './styles';
import functions from '@react-native-firebase/functions';
import { ListItem, Avatar, Icon } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';

import { connect } from 'react-redux';
import { saveUserInfo } from '../../actions/saveUserInfo';


//export default 
class Profile extends Component {
  constructor(props) {
    super(props);
    //this.state = { userName: "", userTimeZone: 100, photoURL: "", email: ""};
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
/*

<ListItem
          title="Name"
          subtitle= {this.props.userInfo.uName}
          rightAvatar={{ title: '>', onPress: ()=>this.props.navigation.navigate('EditName')}}
        />
*/
  getUserData = async() => {
    const data = await functions().httpsCallable('getUserData')({});
    console.log("Data is fetched");
    console.log(data);
    /*this.setState({userName: data.data.data.name, 
                   userTimeZone: data.data.data.timeZone,
                   photoURL: data.data.data.photoURL,
                   email: data.data.data.email}, () => {                              
        console.log(this.state.userName);
        console.log(this.state.userTimeZone);
    });*/
    var name = data.data.data.name;
    var timeZone = data.data.data.timeZone;
    var photo = data.data.data.photoURL;
    var email = data.data.data.email;
    this.props.reduxSaveUserInfo({uName: name, uTimeZone: timeZone, uPhoto: photo, uEmail: email});
    console.log(this.props.userInfo);
  }
  
  logoff = async() => {
    auth()
    .signOut()
    .then(() => console.log('User signed out!'));
  }

  setPhoto = async(uri) => {
    const data = await functions().httpsCallable('updateUserData')({
      userData: {
        photoURL: uri
      }
    });
    console.log("photo is updated");
  }

  selectFile = async() => {
    

    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
        privateDirectory: true
      },
    };

    ImagePicker.showImagePicker(options, res => {
      console.log('Response = ', res);

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else {
        console.log("The new photo is :");
        let source = res;
        console.log(source);
        var name = this.props.userInfo.uName;
        var timeZone = this.props.userInfo.uTimeZone;
        var email = this.props.userInfo.uEmail;
        this.props.reduxSaveUserInfo({uName: name, uTimeZone: timeZone, uPhoto: source.uri, uEmail: email});
        this.setPhoto(this.props.userInfo.uPhoto);
      }
    
    });

  };

  render() {
    const list = [
    {
      title: 'Name',
      icon: 'av-timer',
      subtitle: this.props.userInfo.uName
    },
    {
      title: 'Email',
      icon: 'flight-takeoff',
      subtitle: this.props.userInfo.uEmail
    },
    {
      title: 'Time Zone',
      icon: 'av-timer',
      subtitle: this.props.userInfo.uTimeZone
    }];

    return (

      <View>
        <Avatar
          size="large"
          rounded
          source={{
          uri: this.props.userInfo.uPhoto
          }}
        />

        <View>
        {
          list.map((l, i) => (
          <ListItem key={i} bottomDivider>
          <Avatar source={{uri: l.avatar_url}} />
          <ListItem.Content>
          <ListItem.Title>{l.title}</ListItem.Title>
          <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
          </ListItem.Content>
          </ListItem>
          ))
         }
        </View>

        <Button
          title = "editName"
          onPress = {()=>this.props.navigation.navigate('EditName')}
        />
        <Button
          title="Log Off"
          onPress={()=>this.logoff()}
        />
        <TouchableOpacity onPress={()=>{
            this.selectFile();
            }}>
              <Text style={styles.buttonText}>Select File</Text>
          </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => {return {userInfo: state.userReducer.userInfo}}

const mapDispatchToProps = (dispatch) => {
  return{
    reduxSaveUserInfo:(userInfo) => dispatch(saveUserInfo(userInfo))
}}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

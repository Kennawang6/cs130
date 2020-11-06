/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import firebase from '@react-native-firebase/app';
import { Button } from 'react-native';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

GoogleSignin.configure({
  scopes: ['email'],
  webClientId: '788957977133-11kf53kgqlla41v5r5sgagj09pn4u9vd.apps.googleusercontent.com',
  offlineAccess: true,
});


type Props = {};


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
      <View>
        <Text>Login</Text>
      </View>
    );
  }
  else {
    return (  
      <View>
        <Text>Welcome {user.email}</Text>
      </View>
    );
  }
  
}
//onPress={() => this.onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
//          onPress={() => this.onGoogleButtonPress().then(() => this.props.navigation.navigate('Setting'))}

export default class Signin extends Component<Props>{

  onGoogleButtonPress = async() => {

    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);  
  }

  logoff = async() => {
    auth()
    .signOut()
    .then(() => console.log('User signed out!'));
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={flattenStyle}>Let's Hang</Text>
        <LoginApp />
        
        {!firebase.apps.length && (
          <Text style={styles.instructions}>
            {`\nYou currently have no Firebase apps registered, this most likely means you've not downloaded your project credentials. Visit the link below to learn more. \n\n ${firebaseCredentials}`}
          </Text>
        )}

        <GoogleSigninButton
          style={{width: 192, height: 48}}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => this.onGoogleButtonPress().then(() => this.props.navigation.navigate('Setting'))}
        />
        
        <Button
          title="Log Off"
          onPress={this.logoff}
        />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
const typography = StyleSheet.create({
  header: {
    color: "#000000",
    fontSize: 30,
    marginBottom: 36
  }
});


const flattenStyle = StyleSheet.flatten([
  styles.text,
  typography.header
]);


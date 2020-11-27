import React, {useState, Component} from 'react';
import functions from '@react-native-firebase/functions';
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { ListItem, Item, Avatar, Icon, Accessory } from 'react-native-elements'
import styles from './styles';
import Spinner from 'react-native-loading-spinner-overlay';

import { connect } from 'react-redux';
import { saveFriends, acceptFriend, removeFriend, rejectFriend } from '../../actions/editFriendsList'

class FriendInfo extends Component{
    constructor(props) {
        super(props);
        console.log(this.props.route.params.name);
        this.state = {
            person: this.props.route.params.person,
            photo: this.props.route.params.photo,
            name: this.props.route.params.name,
            email: this.props.route.params.email,
            timeZone: this.props.route.params.timeZone,
            spinner: false
        }
    }

    removeFriend = async() => {
        this.setState({ spinner: true });
        const data = await functions().httpsCallable('removeFriend')({friend_email: this.state.email});
        console.log("removeFriend function has been called");
        this.setState({text: data.data.text}, () => {
            console.log(data.data.text);
            this.notifyUser(this.state.text);
            this.props.reduxRemoveFriend(this.state.person);
        });
    }

    handlePress = () => {
        console.log("Delete Button was pressed");
        console.log(this.state.email);
        this.twoButtonAlert();
    }

    twoButtonAlert = () => {
        Alert.alert(
          "Alert",
          "Are you sure you want to remove this person?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {  text: "OK",
               onPress: () => this.removeFriend()
            }
          ],
          { cancelable: true }
        );
    }

    notifyUser = (text) => {
        this.setState({ spinner: false });
        alert(text);
    }

  render() {
    const list = [
    {
      title: 'Name',
      icon: 'user',
      type: 'font-awesome',
      subtitle: this.state.name
    },
    {
      title: 'Email',
      icon: 'email',
      type: '',
      subtitle: this.state.email
    },
    {
      title: 'Time Zone',
      icon: 'schedule',
      type: '',
      subtitle: this.state.timeZone
    }];

    return (
      <View>
        {this.state.spinner === true &&
              <View style={styles.loading}>
              <Spinner
                visible={this.state.spinner}
                textContent={'Loading...'}
                textStyle={styles.spinnerTextStyle}
              />
              </View>
        }
        <View style={{marginTop: 20, marginLeft: 10}}>
            <Avatar
              size="large"
              rounded
              source={{
              uri: this.state.photo
              }}
            >
            </Avatar>
        </View>
        <View style ={{marginTop:10}}>
            {
              list.map((item, i) => (
                <ListItem key={i} bottomDivider>
                <Icon name={item.icon} type={item.type} />
                <ListItem.Content>
                  <ListItem.Title>{item.title}</ListItem.Title>
                  <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
                </ListItem.Content>
                </ListItem>
              ))
             }
        </View>
        <View>
            <TouchableOpacity
               style = {styles.deleteButtonStyle}
               onPress = {this.handlePress}>
               <Text style = {styles.submitButtonText}> REMOVE FROM FRIENDS LIST </Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }
}


const mapStateToProps = (state) => {
    return {
        friends: state.friendsListReducer.friends,
        friendRequests: state.friendsListReducer.friendRequests,
}};

const mapDispatchToProps = (dispatch) => {
    return {
        reduxSaveFriends:(friends, friendRequests) => dispatch(saveFriends(friends, friendRequests)),
        reduxAcceptFriend:(friend) => dispatch(acceptFriend(friend)),
        reduxRemoveFriend:(friend) => dispatch(removeFriend(friend)),
        reduxRejectFriend:(friend) => dispatch(rejectFriend(friend)),
}};

export default connect(mapStateToProps, mapDispatchToProps)(FriendInfo);

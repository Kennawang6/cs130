import React, {useState, Component} from 'react';
import functions from '@react-native-firebase/functions';
import { View, Text, TouchableOpacity } from 'react-native'
import { ListItem, Item, Avatar, Icon, Accessory } from 'react-native-elements'
import styles from './styles';

class FriendInfo extends Component{
    constructor(props) {
        super(props);
        console.log(this.props.route.params.name);
        this.state = {
            photo: this.props.route.params.photo,
            name: this.props.route.params.name,
            email: this.props.route.params.email,
            timeZone: this.props.route.params.timeZone
        }
    }

    removeFriend = async() => {
        const data = await functions().httpsCallable('removeFriend')({friend_email: this.state.email});
        console.log("removeFriend function has been called");
        console.log(data);
        this.setState({text: data.data.text}, () => {
            console.log(data.data.text);
            this.notifyUser(this.state.text);
        });
    }

    handlePress = () => {
        console.log("Delete Button was pressed");
        console.log(this.state.email);
        this.removeFriend();
    }

    notifyUser = (text) => {
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

export default FriendInfo;
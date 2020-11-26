import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: 'space-around',
    //alignItems: 'center',
    //padding: 35,
    backgroundColor: '#fff'
  },
  addFriendContainer: {
    padding: 23,
  },
  textStyle: {
    fontSize: 15,
    marginBottom: 20
  },
  input: {
     margin: 15,
     height: 40,
     borderColor: '#0099ff',
     borderWidth: 1
  },
  buttonStyle: {
     backgroundColor: '#0099ff',
     padding: 10,
     margin: 15,
     height: 40,
  },
   requestButtonStyle: {
       backgroundColor: '#0099ff',
       padding: 10,
       //margin: 15,
       height: 40,
    },
    addButtonStyle: {
       backgroundColor: '#0099ff',
       padding: 10,
       //margin: 15,
       height: 40,
    },
  deleteButtonStyle: {
     backgroundColor: '#D12222',
     padding: 10,
     //margin: 15,
     height: 40,
     alignItems: 'center',
  },
  submitButtonText:{
     color: 'white'
  },
  requestsAndAddFriends:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    //backgroundColor: 'white'
  }
});
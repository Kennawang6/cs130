import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: 'center',
    alignItems: 'center',
    padding: 35,
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
     borderColor: '#1f44f4',
     borderWidth: 1
  },
  buttonStyle: {
     backgroundColor: '#1f44f4',
     padding: 10,
     margin: 15,
     height: 40,
  },
  submitButtonText:{
     color: 'white'
  }
});
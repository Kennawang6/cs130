import {createStore, combineReducers} from 'redux';
import userReducer from './reducers/userReducer';
import eventReducer from './reducers/eventReducer';
import friendsListReducer from './reducers/friendsListReducer'

const rootReducer = combineReducers({
  userReducer: userReducer,
  eventReducer: eventReducer,
  friendsListReducer: friendsListReducer,
})

const configureStore = () => createStore(rootReducer);

export default configureStore;

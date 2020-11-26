import {createStore, combineReducers} from 'redux';
import userReducer from './reducers/userReducer';
import eventReducer from './reducers/eventReducer';
import scheduleReducer from './reducers/scheduleReducer';

const rootReducer = combineReducers({
  userReducer: userReducer,
  eventReducer: eventReducer,
  scheduleReducer: scheduleReducer,
  friendsListReducer: friendsListReducer,
})

const configureStore = () => createStore(rootReducer);

export default configureStore;

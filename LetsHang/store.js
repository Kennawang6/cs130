import {createStore, combineReducers} from 'redux';
import userReducer from './reducers/userReducer';
import eventReducer from './reducers/eventReducer';

const rootReducer = combineReducers({
  userReducer: userReducer,
  eventReducer: eventReducer,
})

const configureStore = () => createStore(rootReducer);

export default configureStore;

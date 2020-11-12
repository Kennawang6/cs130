import {createStore, combineReducers} from 'redux';
import userReducer from './reducers/userReducer';

const rootReducer = combineReducers({
  userReducer: userReducer,
})

const configureStore = () => createStore(rootReducer);

export default configureStore;

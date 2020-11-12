import {createStore, combineReducers} from 'redux';
import userNameReducer from './reducers/userNameReducer';

const rootReducer = combineReducers({
  userNameReducer: userNameReducer
})

const configureStore = () => createStore(rootReducer);

export default configureStore;

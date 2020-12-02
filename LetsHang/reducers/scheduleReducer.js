import {ADD_SCHEDULE, REPLACE_SCHEDULE, REMOVE_SCHEDULE} from '../actions/types'
const initialState = {
  scheduledEvents: []
};

const scheduleReducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_SCHEDULE: {
            console.log("ADD_SCHEDULE called");
            console.log(JSON.stringify(action));
            return {
                ...state,
                scheduledEvents: [...state.scheduledEvents.concat({
                    description: action.description,
                    start: action.start,
                    end: action.end,
                    id: action.id,
                })]
            };
        }
        case REPLACE_SCHEDULE: {
            console.log("REPLACE_SCHEDULE called");
            console.log(JSON.stringify(action));
            return {
                ...state,
                scheduledEvents: action.events,
            };
        }
        case REMOVE_SCHEDULE: {
            console.log("REMOVE_SCHEDULE called");
            return {
                ...state,
                scheduledEvents: state.scheduledEvents.filter((event) => event.id!== action.eventID),
            }
        }
        default: {
             return state;
        }
    }
}

export default scheduleReducer;
import {ADD_SCHEDULE, EDIT_SCHEDULE, REMOVE_SCHEDULE} from '../actions/types'
const initialState = {
  scheduledEvents: {}
};

const scheduleReducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_SCHEDULE: {
            console.log("ADD_SCHEDULE called");
            console.log(JSON.stringify(action));
            return Object.assign({}, state, {
                ...state,
                scheduledEvents: {
                    ...state.scheduledEvents,
                    [action.eventID]: action.eventInfo,
                }
            });
        }
        case REMOVE_SCHEDULE: {
            if (!(action.eventID in state.scheduledEvents)) {
                alert("Error: event to remove does not exist.");
                break;
            }
            const { [action.eventID]: _, ...remainingSchedule } = state.scheduledEvents;
            return {
                ...state,
                scheduledEvents: remainingSchedule,
            }
        }
        default: {
             return state;
        }
    }
}

export default scheduleReducer;
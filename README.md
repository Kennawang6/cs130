# UCLA CS 130 Group Project - Let's Hang
Professor: Miryung Kim

TA: Jason Teoh

Team Members: Aaron Chang, Aseem Sane, Kenna Wang, Nikolas Thuy, Xiaotong Liu, Yu-Hsuan Liu

## How to run the application?
1. Set up the environment for Android simulator: https://reactnative.dev/docs/environment-setup. Make sure to select `React Native CLI Quickstart`. For Development OS, choose the one that you are using. For Target OS, choose `Android`.
2. Download or clone this repo.
3. Open terminal/command prompt, enter the `LetsHang` folder.
4. Use the command `$npm install` to install all the needed packages for the application.
5. Use the command `$npm run android` to run the application on android simulator.

## Directory Structure
- **backend** backend directory
  - **functions** directory for our firebase cloud functions
    - **event.js** contains the code for the event class.
    - **friend.js** contains the code for the friend class.
    - **index.js** initializes the functions.
    - **schedule.js** contains the code for the schedule and timeslot class.
    - **user.js** contains the code for the user class.
    - **test** directory for all backend test cases
      - **event.test.js** offline test cases for the event class.
      - **offline.test.js** offline test cases for the friend, schedule, and user classes.
      - **online.test.js** online test cases for all classes.
- **LetsHang** frontend directory
  - **android** directory for the set-up for the android environment, including icons
  - **ios** directory for the set-up for the ios environment, but this project does not run on ios platform
  - **actions** directory for action files for using react-redux package
    - **types.js** contains the code that defined all the types needed for the application in redux.
    - **saveUserInfo.js** contains the code that defines the actions that will use to update states related to user info in redux.
    - **editSchedule.js** contains the code that defines the actions that will use to edit states related to schedule in redux.
    - **editFriendsList.js** contains the code that defines the actions that will use to edit states related to frends list in redux.
    - **editEvent.js** contains the code that defines the actions that will use to edit states related to event in redux.
  - **reducers** directory for reducer files for using react-redux package. Reducer is the function that takes the current state and an action as arguments, and return a new state result
    - **userReducer.js** contains the code of functions to modify states related to user info in redux.
    - **scheduleReducer.js** contains the code of functions to modify states related to schedule in redux.
    - **friendsListReducer.js** contains the code of functions to modify states related to frends list info in redux.
    - **eventReducer.js** contains the code of functions to modify states related to event in redux.
  - **components** directory for implementation of the application
    - **signin** directory for signin page
      - **signin.js** contains the code for sign-in page. It handles the authentication to firebase.
      - **styles.js** contains the code to style sign-in page.
    - **profile** directory for profile page
      - **profile.js** contains the code for profile page. It uses react-native-image-picker package to allow user to change profile picture by uploading the photo from the android device or taking a picture using camera. 
      - **editName.js** contains the code for edit name page. It allows user to modify the name.
      - **editTimeZone.js** contains the code for edit time zone page. The time zone entered by the user here will be used in schedule and event component.
      - **styles.js** contains the code to style all the pages under profile directory.
    - **schedule** directory
      - **schedule.js** contains the code for schedule page. It accesses the time zone inside user info using the cloud function built by backend and accesses users' schedule by firebase snapshots. Then, it converts the schedule to users' time zone and utilizes react-native-weekly-calendar package to display users' schedule in weekly calendar. 
      - **addSchedule.js** contians the code for add schedule page. It uses react-native-community/datetimepicker packages to allow users to select time using android device's built-in date picker and time picker.
      - **editSchedule.js** contians the code for edit schedule page. The structure is similar to the addSchedule.js.
      - **styles.js** contains the code to style schedule page, especially for the weekly calendar.
    - **friendsList** directory
      - **friendsList.js** contians the code for friends list page. It uses firebase snapshot to access friends list of the user, and utilizes react-native-loading-spinner-overlay package to prevent users taking actions while the application is still loading.
      - **addFriend.js** contians the code for add friend page.
      - **friendInfo.js** contians the code for friend info page. It accesses the friends' info using the cloud function built by backend
      - **friendRequest.js** contians the code for friend request page.
      - **friendsTabBadge.js** contains the code for the tab badge notification.
      - **styles.js** contains the code to style all the pages under friendsList directory.
    - **event** directory
      - **eventList.js** contains the code for event list page. The structure is similar to friendsList.js.
      - **createEvent.js** contains the code for create event page. It uses react-native-community/datetimepicker packages to allow users to select time using android device's built-in date picker.
      - **inviteFriend.js** contains the code for invite friend page when the user creates a new event.
      - **eventDetailHost.js** contains the code for event detail page for the host.
      - **editEventName.js** contains the code for edit event name page for the host.
      - **editEventDescription.js** contains the code for edit event description page for the host.
      - **inviteFriendHost.js** contains the code for invite friend page when the host try to invite more friends to the event.
      - **eventDetailMember.js** contains the code for event detail page for the member. The difference between this file and eventDetailHost.js is that the member is not able to update the info of the event, but the user can choose to leave the event.
      - **eventRequests.js** contians the code for friend request page. The structure is similar to friendRequest.js.
      - **eventsTabBadge.js** contains the code for the tab badge notification. The structure is similar to friendsTabBadge.js.
  - **index.js** is the entry point file for the application, and it renders the main <App> component.
  - **App.js** is the main application component. It uses react-navigation package to handle the display of the app with navigation bar and five components under components directory.
  - **store.js** contains the code the brings together the state, actions, and reducers that are needed for using react-redux package.
  - **package.json** contains the list of packages needed for the application.
  - other files are the set-up for the react-native project.
  

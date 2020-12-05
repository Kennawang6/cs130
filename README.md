# UCLA CS 130 Group Project - Let's Hang
Professor: Miryung Kim

TA: Jason Teoh

Team Members: Aaron Chang, Aseem Sane, Kenna Wang, Nikolas Thuy, Xiaotong Liu, Yu-Hsuan Liu

## How to run the application?
1. Set up the environment for Android simulator: https://reactnative.dev/docs/environment-setup. Make sure to select `React Native CLI Quickstart`. For Development OS, choose the one that you are using. For Target OS, choose `Android`.
2. Download or clone this repo.
3. Open terminal/command prompt, enter the `LetsHang` folder.
4. Use the command `$npm run android` to run the application on android simulator.

## Directory Structure
- **backend** backend directory
  - **functions** directory for our firebase cloud functions
    - **event.js** contains the code for the event class
    - **friend.js** contains the code for the friend class
    - **index.js** initializes the functions
    - **schedule.js** contains the code for the schedule and timeslot class
    - **user.js** contains the code for the user class
    - **test** directory for all backend test cases
      - **event.test.js** offline test cases for the event class
      - **offline.test.js** offline test cases for the friend, schedule, and user classes
      - **online.test.js** online test cases for all classes
- **LetsHang** frontend directory
  - actions
  - android
  - components
  - ios
  - reducers
  

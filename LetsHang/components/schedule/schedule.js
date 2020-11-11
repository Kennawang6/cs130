import React, { Component, useState, useEffect } from 'react';
import { View, Text, Button, Platform } from 'react-native';

import ApiCalendar from 'react-google-calendar-api';

export default class DoubleButton extends React.Component {
      constructor(props) {
        super(props);
        this.handleItemClick = this.handleItemClick.bind(this);
      }

      public handleItemClick(event: SyntheticEvent<any>, name: string): void {
        if (name === 'sign-in') {
          ApiCalendar.handleAuthClick();
        } else if (name === 'sign-out') {
          ApiCalendar.handleSignoutClick();
        }
      }

      render(): ReactNode {
        return (
              <button
                  onClick={(e) => this.handleItemClick(e, 'sign-in')}
              >
                sign-in
              </button>
              <button
                  onClick={(e) => this.handleItemClick(e, 'sign-out')}
              >
                sign-out
              </button>
          );
      }
  }

  if (ApiCalendar.sign)
    ApiCalendar.listUpcomingEvents(10)
      .then(({result}: any) => {
        console.log(result.items);
      });

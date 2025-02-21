import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import AppNavigation from './src/navigations/AppNavigation';

import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import Resetpass1 from './src/screens/Resetpass1';
import Resetpass2 from './src/screens/Resetpass2';
import Newpass from './src/screens/Newpass';
import Updatedpass from './src/screens/Updatedpass';
import Createacc from './src/screens/Createacc';
import Editacc from './src/screens/Editacc';
import Changepass from './src/screens/Changepass';
import Dashboard from './src/screens/Dashboard';
import Search from './src/screens/Search';
import BottomTabNavigatoion from './src/navigations/BottomTabNavigation';
import Popularevents from './src/screens/Popularevents';
import Eventdetails from './src/screens/Eventdetails';
import Selecttickets from './src/screens/Selecttickets';
import Notifications from './src/screens/Notifications';
import Chats from './src/screens/Chats';
import Eventchat from './src/screens/Eventchat';
import Favourite from './src/screens/Favourite';
import Profile from './src/screens/Profile';
import Mytickets from './src/screens/Mytickets';
import Paymentdetails from './src/screens/Paymentdetails';
import Paymentverification from './src/screens/Paymentverification';

export default function App() {
  return (
    
      <AppNavigation />
      // <BottomTabNavigatoion />

    // <Splash />
    // <Login />
    // <Resetpass1 />
    // <Resetpass2 />
    // <Newpass />
    // <Updatedpass />

    // <Createacc/>
    // <Editacc />
    // <Changepass/>

    // <Search />
    // <Dashboard /> 
    // <Popularevents />
    // <Eventdetails />
    // <Selecttickets />
    // <Paymentdetails />
    
    // <Paymentverification />
    
    

    // <Notifications />
    // <Chats />
    // <Eventchat />
    // <Favourite />
    // <Profile />
    // <Mytickets />
    
     
  );
}
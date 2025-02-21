import { View, Text } from 'react-native'
import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Importing screens
import Changepass from '../screens/Changepass';
import Chats from '../screens/Chats';
import Createacc from '../screens/Createacc';
import Dashboard from '../screens/Dashboard';
import Editacc from '../screens/Editacc';
import Eventchat from '../screens/Eventchat';
import Eventdetails from '../screens/Eventdetails';
import Favourite from '../screens/Favourite';
import Login from '../screens/Login';
import Mytickets from '../screens/Mytickets';
import Newpass from '../screens/Newpass';
import Notifications from '../screens/Notifications';
import Popularevents from '../screens/Popularevents';
import Profile from '../screens/Profile';
import Resetpass1 from '../screens/Resetpass1';
import Resetpass2 from '../screens/Resetpass2';
import Search from '../screens/Search';
import Selecttickets from '../screens/Selecttickets';
import Splash from '../screens/Splash';
import Updatedpass from '../screens/Updatedpass';
import Paymentdetails from '../screens/Paymentdetails';
import Paymentverification from '../screens/Paymentverification';
import BottomTabNavigation from './BottomTabNavigation';
const Stack = createStackNavigator();

const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={
                {
                    headerShown: false // Hide the header by default for all screens
                }
            }>
                {/* Define each screen in the stack navigator */}
                <Stack.Screen name="Splash" component={Splash} />
                <Stack.Screen name="Login" component={Login} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid // Animation effect for screen transitions
                    }
                }/>
                <Stack.Screen name="Resetpass1" component={Resetpass1} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Resetpass2" component={Resetpass2} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Newpass" component={Newpass} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Updatedpass" component={Updatedpass} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Createacc" component={Createacc} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Editacc" component={Editacc} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Changepass" component={Changepass} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Dashboard" component={Dashboard} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Eventdetails" component={Eventdetails} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Popularevents" component={Popularevents} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Profile" component={Profile} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Selecttickets" component={Selecttickets} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Chats" component={Chats} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Eventchat" component={Eventchat} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Favourite" component={Favourite} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Mytickets" component={Mytickets} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Notifications" component={Notifications} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Search" component={Search} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Paymentdetails" component={Paymentdetails} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="Paymentverification" component={Paymentverification} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
                <Stack.Screen name="BottomTabNavigation" component={BottomTabNavigation} options={
                    {
                        cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                    }
                }/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigation

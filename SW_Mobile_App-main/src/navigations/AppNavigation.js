import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Importing screens
import Changepass from '../screens/Changepass';
import Chats from '../screens/Chats';
import Signup from '../screens/Signup';
import Dashboard from '../screens/Dashboard';
import Editacc from '../screens/Editacc';
import Stagedetails from '../screens/Stagedetails';
import Login from '../screens/Login';
import Newpass from '../screens/Newpass';
import Notifications from '../screens/Notifications';
import UpcommingStages from '../screens/UpcommingStages';
import ProfileScreen from '../screens/Profile';
import Resetpass1 from '../screens/Resetpass1';
import Resetpass2 from '../screens/Resetpass2';
import Splash from '../screens/Splash';
import Updatedpass from '../screens/Updatedpass';
import AddStageScreen from '../screens/AddStageScreen';
import OTPVerification from '../screens/OtpVerification';
import AddProject from '../screens/AddProject';
import ViewProjects from '../screens/ViewProjects';
import ProjectDetails from '../screens/ProjectDetails';
import AddMembersScreen from '../screens/AddMembers';
import ChatScreen from '../screens/ChatScreen';
// import SidebarNavigation from './SidebarNavigation';
import SettingsScreen from '../screens/Settings';

const Stack = createStackNavigator();

const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false // Hide the header for all screens
            }}>
                <Stack.Screen name="Splash" component={Splash} />
                <Stack.Screen name="Login" component={Login} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Resetpass1" component={Resetpass1} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Resetpass2" component={Resetpass2} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Newpass" component={Newpass} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Updatedpass" component={Updatedpass} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Signup" component={Signup} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="OtpVerification" component={OTPVerification} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Editacc" component={Editacc} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Changepass" component={Changepass} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Dashboard" component={Dashboard} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Stagedetails" component={Stagedetails} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="UpcommingStages" component={UpcommingStages} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Chats" component={Chats} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="Notifications" component={Notifications} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="AddStage" component={AddStageScreen} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="AddProject" component={AddProject} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="ViewProjects" component={ViewProjects} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="ProjectDetails" component={ProjectDetails} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="AddMembers" component={AddMembersScreen} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                <Stack.Screen name="ChatScreen" component={ChatScreen} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>
                {/* <Stack.Screen name="SidebarNavigation" component={SidebarNavigation} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/> */}
                <Stack.Screen name="Settings" component={SettingsScreen} options={{
                    cardStyleInterpolator: CardStyleInterpolators.forScaleFromCenterAndroid
                }}/>

            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigation;

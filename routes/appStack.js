import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Home from '../views/home';
import About from '../views/about';
import Terms from '../views/terms';
import Profile from '../views/profile';
import CollectStack from './collectStack';
import VideoStack from './videoStack';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="About"
        component={About}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Terms"
        component={Terms}
        options={{title: 'Terms and Conditions'}}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Collect"
        component={CollectStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Video"
        component={VideoStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AppStack;

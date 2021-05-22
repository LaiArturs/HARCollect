import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Porch from '../views/porch/porch';
import Login from '../views/porch/login';
import Register from '../views/porch/register';
import About from '../views/about';
import Terms from '../views/terms';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="Porch"
        component={Porch}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen
        name="Terms"
        component={Terms}
        options={{title: 'Terms and Conditions'}}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;

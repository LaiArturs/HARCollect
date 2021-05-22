import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ExerciseSetup from '../views/workout/exerciseSetup';
import ChooseExercise from '../views/workout/chooseExercise';
import Collect from '../views/workout/collect';
import WorkoutGallery from '../views/workout/workoutGallery';
import WorkoutData from '../views/workout/workoutData';

const Stack = createStackNavigator();

const CollectStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="ChooseExercise"
        component={ChooseExercise}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="ExerciseSetup"
        component={ExerciseSetup}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Collect"
        component={Collect}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="WorkoutGallery"
        component={WorkoutGallery}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="WorkoutData"
        component={WorkoutData}
      />
    </Stack.Navigator>
  );
};

export default CollectStack;

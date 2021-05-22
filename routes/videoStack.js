import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import VideoLobby from '../views/video/videoLobby';
import RecordVideo from '../views/video/recordVideo';
import VideoGallery from '../views/video/videoGallery';
import VideoPlayer from '../views/video/videoPlayer';
import VideoLabeler from '../views/video/videoLabeler';

const Stack = createStackNavigator();

const VideoStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="VideoLobby"
        component={VideoLobby}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="RecordVideo"
        component={RecordVideo}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="VideoGallery"
        component={VideoGallery}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="VideoPlayer"
        component={VideoPlayer}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="VideoLabeler"
        component={VideoLabeler}
      />
    </Stack.Navigator>
  );
};

export default VideoStack;

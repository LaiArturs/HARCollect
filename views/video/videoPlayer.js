import * as React from 'react';
import {StyleSheet, Text} from 'react-native';
import {Video} from 'expo-av';
import VP from 'expo-video-player';
import {useKeepAwake} from 'expo-keep-awake';

export default function VideoPlayer({route}) {
  useKeepAwake();

  if (!route.params || !route.params.uri) {
    return <Text>No video file</Text>;
  }
  const uri = route.params.uri;

  return (
    <VP
      videoProps={{
        shouldPlay: true,
        resizeMode: Video.RESIZE_MODE_CONTAIN,
        source: {
          uri: uri,
        },
      }}
      inFullscreen={true}
      showControlsOnLoad={true}
      playbackCallback={(callback) => {}}
      showFullscreenButton={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  video: {
    alignSelf: 'center',
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

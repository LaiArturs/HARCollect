import React from 'react';
import {StyleSheet, Text, View, Dimensions, Alert} from 'react-native';
import {Camera} from 'expo-camera';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Snackbar from 'react-native-snackbar';
import {useKeepAwake} from 'expo-keep-awake';

import Color from '../../config/colors';
import FSystem from '../../components/fsystem';
import FS from '../../components/fstore';
import Func from '../../components/functions';

export default function RecordVideo({route, navigation}) {
  const [hasPermission, setHasPermission] = React.useState(null);
  // const [type, setType] = React.useState(Camera.Constants.Type.back);
  const [cameraRef, setCameraRef] = React.useState(null);
  const [ratio, setRatio] = React.useState();
  const [state, setState] = React.useState();
  const [error, setError] = React.useState('');
  const [recordingStartTime, setRecordingStartTime] = React.useState();
  const [recordingDuration, setRecordingDuration] = React.useState('');

  var videoH;

  var workoutId = 'dummieWorkoutId';
  if (route.params && route.params.workoutId)
    workoutId = route.params.workoutId;

  const zeroPad = (num, places) => String(num).padStart(places, '0');
  const calcRecordingDuration = () => {
    if (!recordingStartTime) return '';
    const now = new Date();
    const time = Math.floor(
      (now.getTime() - recordingStartTime.getTime()) / 1000,
    );
    const m = Math.floor(time / 60);
    const s = time % 60;
    return m + ':' + zeroPad(s, 2);
  };

  React.useEffect(() => {
    (async () => {
      const {status} = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  React.useEffect(() => {
    if (cameraRef && !ratio) {
      cameraRef
        .getSupportedRatiosAsync()
        .then(ratios => {
          console.log('RecordVideo:', 'Ratios', ratios);
          if (ratios.includes('16:9')) {
            setRatio('16:9');
            const w = Dimensions.get('window').width;
            videoH = (16 * w) / 9;
          } else if (ratios.includes('4:3')) {
            setRatio('4:3');
          } else {
            setRatio('unknown');
          }
        })
        .catch(e => {
          console.log('RecordVideo:', e);
          setRatio('unknown');
        });
    }
  }, [cameraRef]);

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (state == 'F' || error) return;
        e.preventDefault();
        Alert.alert('Unsaved workout', 'Are you sure to cancel recording?', [
          {text: "Don't leave", style: 'cancel', onPress: () => {}},
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              FS.workout(workoutId).set(
                {
                  canceled: 'VideoPeer',
                },
                {
                  merge: true,
                },
              );
              stopRecording();
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [state, error],
  );

  const startRecording = () => {
    console.log('RecordVideo:', 'startRecording');
    if (cameraRef) {
      setError('');
      setState('R');
      cameraRef
        .recordAsync({
          quality: Camera.Constants.VideoQuality['480p'],
          mute: true,
        })
        .then(rec => {
          setState('F');
          console.log('RecordVideo:', 'startRecording stoped');
          Func.setWorkoutTime({
            workoutId: workoutId,
            key: 'videoStop',
          });
          // FS.workout(workoutId).set(
          //   {
          //     videoEnd: new Date(),
          //   },
          //   {
          //     merge: true,
          //   },
          // );
          FSystem.moveVideoToMemory(rec.uri, workoutId);
          setTimeout(() => {
            navigation.reset({
              index: 1,
              routes: [{name: 'VideoGallery'}],
            });
          }, 1000);
        })
        .catch(e => {
          setState('f');
          console.log('RecordVideo:', 'startRecording error', e);
          setError(e.message);
        });
      setRecordingStartTime(new Date());
      Func.setWorkoutTime({
        workoutId: workoutId,
        key: 'videoStart',
      });
      // FS.workout(workoutId).set(
      //   {
      //     videoStart: new Date(),
      //   },
      //   {
      //     merge: true,
      //   },
      // );
    }
  };

  React.useEffect(() => {
    if (state == 'R' && recordingStartTime) {
      const timer = setInterval(() => {
        setRecordingDuration(calcRecordingDuration());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state]);

  const stopRecording = () => {
    if (cameraRef) {
      setState('F');
      cameraRef.stopRecording();
    }
  };

  React.useEffect(() => {
    if (workoutId) {
      const subscriber = FS.workout(workoutId).onSnapshot(
        snap => {
          if (snap.exists) {
            const canceled = snap.data().canceled;
            if (canceled && canceled == 'MeasurementPeer') {
              stopRecording();
              setError('Recording peer canceled');
              // setTimeout(() => {
              navigation.reset({
                index: 1,
                routes: [{name: 'Home'}],
              });
              // }, 1000);
            }
          }
        },
        err => {
          console.log('VideoLobby:', `Encountered error: ${err}`);
        },
      );
      return () => subscriber();
    }
  }, []);

  useKeepAwake();

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={ref => {
          setCameraRef(ref);
        }}
        style={{...styles.camera, height: videoH ? videoH : '80%'}}
        type={Camera.Constants.Type.back}
        ratio={ratio && ratio != 'unknown' ? ratio : ''}
      />
      <View style={styles.controlContainer}>
        <View style={{...styles.controlContainer, flexDirection: 'row'}}>
          <Icon
            style={{marginHorizontal: 30}}
            name="microphone-off"
            size={60}
            color={Color.disabled}
            onPress={() => {
              Snackbar.show({
                text: 'Microphone is disabled, because not needed',
                duration: Snackbar.LENGTH_LONG,
              });
            }}
          />
          {state == 'R' ? (
            <Button mode="contained" onPress={stopRecording}>
              Stop Recording
            </Button>
          ) : (
            <Button mode="contained" onPress={startRecording}>
              Start Recording
            </Button>
          )}
          <Icon
            style={{marginHorizontal: 30}}
            name={state != 'R' ? 'pause-circle-outline' : 'record-rec'}
            size={60}
            color={state != 'R' ? Color.pause : 'red'}
            onPress={() => {
              Snackbar.show({
                text:
                  state != 'R'
                    ? 'Not recording: ready'
                    : 'Video recording in progress',
                duration: Snackbar.LENGTH_LONG,
              });
            }}
          />
        </View>
        <Text style={{color: 'red'}}>{error ? error : recordingDuration}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    height: '80%',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  controlContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

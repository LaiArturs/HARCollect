import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {Paragraph} from 'react-native-paper';

import FS from '../../components/fstore';
import FSystem from '../../components/fsystem';
import KotlinSensorCollector from '../../components/kotlinSensors';
import Color from '../../config/colors';
import Func from '../../components/functions';

const Collect = ({navigation, route}) => {
  const [recording, setRecording] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [startReceived, setStartReceived] = React.useState(false);
  const [workoutName, setWorkoutName] = React.useState('defaultName');

  const status = React.useRef();
  React.useEffect(() => {
    status.current = {
      recording: recording,
      done: done,
      startReceived: startReceived,
      workoutName: workoutName,
    };
  });

  var workoutId = null;
  var exercise = null;
  var measurement = null;
  if (route.params) {
    if (route.params.workoutId) workoutId = route.params.workoutId;
    if (route.params.exercise) exercise = route.params.exercise;
    if (route.params.measurement) measurement = route.params.measurement;
  }

  const accelStart = (workoutId) => {
    const {recording} = status.current;
    if (recording) return;
    setStartReceived(true);
    setWorkoutName(workoutId);
    console.log('Lets start Kotlin workoutId:', workoutId);
    const freq = exercise ? exercise.frequency : null;

    KotlinSensorCollector.start(workoutId, freq ? freq : 20, () => {
      console.log('Kotlin started');
      setRecording(true);
      Func.setWorkoutTime({
        workoutId: workoutId,
        key: 'collectStart',
      });
      if (exercise)
        FS.workout(workoutId).set(
          {
            frequency: exercise.frequency,
            position: measurement,
          },
          {
            merge: true,
          },
        );
    });
  };

  const accelStop = (param) => {
    const {recording, workoutName} = status.current;
    if (!recording) return;
    setDone(true);
    console.log('Lets stop Kotlin');

    KotlinSensorCollector.stop(() => {
      console.log('Kotlin stopped');
      setRecording(false);
      Func.setWorkoutTime({
        workoutId: workoutId,
        key: 'collectStop',
      });
      // FS.workout(workoutId).set(
      //   {
      //     collectEnd: new Date(),
      //   },
      //   {
      //     merge: true,
      //   },
      // );
      if (!param || param.destructive != true)
        FSystem.moveWorkoutDataToMemory(workoutName);
    });
  };

  React.useEffect(() => {
    if (workoutId) {
      const subscriber = FS.workout(workoutId).onSnapshot(
        (snap) => {
          if (snap.exists) {
            const canceled = snap.data().canceled;
            if (canceled && canceled == 'VideoPeer') {
              console.log('VideoPeer canceled');
              accelStop({destructive: true});
              navigation.reset({
                index: 1,
                routes: [{name: 'Home'}],
              });
            }

            const videoStarted = snap.data().videoStart;
            if (
              typeof videoStarted === 'object' &&
              !status.current.recording &&
              !status.current.done &&
              !status.current.startReceived
            ) {
              accelStart(workoutId);
            }

            const videoEnded = snap.data().videoStop;
            if (
              typeof videoEnded === 'object' &&
              status.current.recording &&
              status.current.startReceived &&
              !status.current.done
            ) {
              accelStop({destructive: false});
              setTimeout(() => {
                navigation.reset({
                  index: 1,
                  routes: [{name: 'WorkoutGallery'}],
                });
              }, 2000);
            }
          }
        },
        (err) => {
          console.log('VideoLobby:', `Encountered error: ${err}`);
        },
      );
      return () => subscriber();
    }
  }, []);

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (done) return;
        e.preventDefault();
        Alert.alert('Unsaved workout', 'Are you sure to cancel recording?', [
          {text: "Don't leave", style: 'cancel', onPress: () => {}},
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              FS.workout(workoutId).set(
                {
                  canceled: 'MeasurementPeer',
                },
                {
                  merge: true,
                },
              );
              accelStop({destructive: true});
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      }),
    [done],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Collect sensor data</Text>
      <Paragraph>
        {`Please don't leave this page. You can lock the screen and place device in position${
          measurement ? ': ' + measurement : `.`
        }`}
      </Paragraph>
      <Text
        style={{
          marginVertical: '10%',
          textAlign: 'center',
          fontSize: 30,
          backgroundColor: recording ? Color.primary : Color.secondary,
        }}>
        Recording movements: {recording ? 'Yes' : done ? 'Finished' : 'Waiting'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.bg,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  item: {
    marginTop: 24,
    padding: 30,
    backgroundColor: Color.primary,
    fontSize: 24,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    margin: 40,
    textAlign: 'center',
  },
});

export default Collect;

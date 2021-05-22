import React from 'react';
import {StyleSheet, FlatList, View, Alert} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Title,
  ActivityIndicator,
  HelperText,
  Appbar,
} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';

import Color from '../../config/colors';
import Func from '../../components/functions';
import FS from '../../components/fstore';

const ExerciseSetup = ({route, navigation}) => {
  const exercise = route.params;
  console.log(exercise);
  const [measurement, setMeasurement] = React.useState(exercise.measurement[0]);
  const [videoPeerId, setVideoPeerId] = React.useState();
  const [workoutId, setWorkoutId] = React.useState();
  const [showModal, setShowModal] = React.useState(false);
  const [error, setError] = React.useState();
  const [loading, setLoading] = React.useState(true);

  // Getting VideoPeerID
  React.useEffect(() => {
    console.log('ExerciseSetup:', 'useEffect, Getting VideoPeerID');
    if (!videoPeerId) {
      Func.getVideoPeerId({exerciseName: exercise.name})
        .then((resp) => {
          console.log('ExerciseSetup:', 'getVideoPeerId: resp:', resp);
          if (typeof resp.data.id != 'number')
            setError('Error connecting server');
          else {
            setVideoPeerId(resp.data.id);
          }
          setLoading(false);
        })
        .catch((e) => {
          if (e.code == Func.err.DEADLINE_EXCEEDED)
            setError('Could not connect to server');
          setLoading(false);
        });
    }
  }, [videoPeerId]);

  // Listening to changes on VideoPeerr
  React.useEffect(() => {
    console.log(
      'ExerciseSetup:',
      'useEffect, Listening to changes on VideoPeerr',
    );
    if (videoPeerId && !workoutId) {
      const subscriber = FS.videoPeer(videoPeerId.toString()).onSnapshot(
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            const wID = documentSnapshot.data().workoutId;
            if (wID && typeof wID == 'string') {
              setWorkoutId(wID);
              setShowModal(true);
            }
          }
        },
        (err) => {
          console.log('ExerciseSetup:', `Encountered error: ${err}`);
        },
      );
      return () => subscriber();
    }
  }, [videoPeerId, workoutId]);

  const showSnack = () => {
    Snackbar.show({
      text: 'Measurement Peer canceled',
      duration: Snackbar.LENGTH_LONG,
    });
  };

  // Listen on changes on Workout
  React.useEffect(() => {
    if (workoutId) {
      const subscriber = FS.workout(workoutId).onSnapshot(
        (snap) => {
          if (snap.exists) {
            const canceled = snap.data().canceled;
            if (canceled && canceled == 'VideoPeer') {
              setShowModal(false);
              setWorkoutId(undefined);
              setVideoPeerId(undefined);
              showSnack();
            }
            const videoStarted = snap.data().videoStart;
            if (videoStarted) {
              setShowModal(false);
              navigation.reset({
                index: 1,
                routes: [
                  {
                    name: 'Collect',
                    params: {
                      workoutId: workoutId,
                      measurement: measurement,
                      exercise: exercise,
                    },
                  },
                ],
              });
            }
          }
        },
        (err) => {
          console.log('VideoLobby:', `Encountered error: ${err}`);
        },
      );
      return () => subscriber();
    }
  }, [workoutId]);

  const meCancelWorkout = () => {
    setShowModal(false);
    FS.workout(workoutId).set(
      {
        canceled: 'MeasurementPeer',
      },
      {
        merge: true,
      },
    );
    navigation.goBack();
  };

  return (
    <View style={{flex: 1}}>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            if (workoutId)
              Alert.alert('Cancel?', 'Are you sure to cancel?', [
                {text: 'Yes', onPress: meCancelWorkout},
                {text: 'No'},
              ]);
            else navigation.goBack();
          }}
        />
        <Appbar.Content
          title={`Exercise: ${exercise.name}`}
          subtitle="Setup workout"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={{marginTop: 30}}>
          <Text>Phone placement: </Text>
          <FlatList
            data={exercise.measurement}
            keyExtractor={(item) => item}
            renderItem={({item}) => (
              <Text
                style={{
                  ...styles.item,
                  backgroundColor:
                    measurement == item ? Color.primary : Color.disabled,
                }}
                onPress={() => setMeasurement(item)}>
                {item}
              </Text>
            )}
          />
        </View>
        <View style={{marginTop: 30}}>
          <Text>Video peer id:</Text>
          <View
            style={{
              backgroundColor: 'gray',
              marginHorizontal: '8%',
              marginTop: 10,
              height: 50,
              justifyContent: 'center',
            }}>
            {!loading ? (
              <Text
                style={{
                  lineHeight: 50,
                  fontSize: 40,
                  textAlign: 'center',
                  color: 'white',
                }}>
                {error ? '😵' : videoPeerId}
              </Text>
            ) : (
              <ActivityIndicator />
            )}
          </View>

          <HelperText type={error ? 'error' : 'info'} visible={!loading}>
            {error
              ? error
              : typeof videoPeerId == 'number'
              ? 'Code is valid only 5 min'
              : ''}
          </HelperText>
        </View>
        <Portal>
          <Modal
            visible={showModal}
            onDismiss={() => {}}
            contentContainerStyle={{
              backgroundColor: 'white',
              padding: 30,
              borderRadius: 10,
              margin: 10,
            }}
            dismissable={false}>
            <Title>Video Peer connected</Title>
            <Text style={{marginVertical: 5}}>
              Another phone (Video Peer) connected to this workout recording.
              Sensor recording will start as soon as Video Peer starts recording
              video.
            </Text>
            <Text style={{marginVertical: 5}}>
              Please wait until Video Peer starts the recording. Then proceed to
              execute the workout:
            </Text>
            <Text style={{marginVertical: 2}}>
              1. Wait until this screen changes.
            </Text>
            <Text style={{marginVertical: 2}}>
              2. Place phone in selected placement: {measurement}.
            </Text>
            <Text style={{marginVertical: 2}}>
              3. Do exercise: {exercise.name}.
            </Text>
            <Button
              style={{marginTop: 50}}
              color="red"
              onPress={() => {
                Alert.alert('Cancel?', 'Are you sure to cancel?', [
                  {text: 'Yes', onPress: meCancelWorkout},
                  {text: 'No'},
                ]);
              }}>
              <Text style={{color: 'red', fontSize: 9}}>
                To cancel and exit press here.
              </Text>
            </Button>
          </Modal>
        </Portal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.bg,
    paddingHorizontal: 20,
  },
  item: {
    marginTop: 10,
    padding: 10,
    fontSize: 16,
    marginHorizontal: '8%',
  },
  title: {
    fontSize: 24,
    margin: 40,
  },
});

export default ExerciseSetup;

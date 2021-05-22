import React from 'react';
import {View, Text, StyleSheet, Alert, Keyboard} from 'react-native';
import {
  Modal,
  Portal,
  Appbar,
  Title,
  HelperText,
  TextInput,
  Button,
} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import {Camera} from 'expo-camera';
import {Audio} from 'expo-av';

import Color from '../../config/colors';
import Func from '../../components/functions';
import FS from '../../components/fstore';

const VideoLobby = ({navigation}) => {
  const [connId, setConnId] = React.useState();
  const [error, setError] = React.useState('');
  const [workoutId, setWorkoutId] = React.useState();
  const [showModal, setShowModal] = React.useState(false);
  const [hasPermission, setHasPermission] = React.useState(null);
  var numError = '';

  const hasErrors = () => {
    if (
      typeof connId != 'undefined' &&
      (isNaN(connId) || isNaN(parseFloat(connId)))
    )
      numError = 'Expecting number!';
    // Can't change State variable here, because it will result in infinite loop
    else numError = '';
    if (error.length || numError.length) return true;
    return false;
  };

  const connect = () => {
    if (isNaN(connId) || isNaN(parseFloat(connId))) return;
    setError('');
    Func.submitVideoPeerId({id: connId})
      .then(resp => {
        console.log('VideoLobby:', 'Video Peer ID submited successfully');
        console.log('VideoLobby:', resp);
        if (resp && resp.data && typeof resp.data.workoutId) {
          setWorkoutId(resp.data.workoutId);
          setShowModal(true);
          Keyboard.dismiss();
        } else setError('Application error! Contact developer!');
      })
      .catch(e => {
        console.log('VideoLobby:', e.message);
        setError(e.message);
      });
  };

  const showSnack = () => {
    Snackbar.show({
      text: 'Measurement Peer canceled',
      duration: Snackbar.LENGTH_LONG,
    });
  };

  const meCancelWorkout = () => {
    setShowModal(false);
    FS.workout(workoutId).set(
      {
        canceled: 'VideoPeer',
      },
      {
        merge: true,
      },
    );
    navigation.goBack();
  };

  React.useEffect(() => {
    (async () => {
      const respCamera = await Camera.requestPermissionsAsync();
      const respAudio = await Audio.requestPermissionsAsync();

      setHasPermission(
        respCamera.status === 'granted' && respAudio.status === 'granted',
      );
    })();
  }, []);

  React.useEffect(() => {
    if (workoutId) {
      const subscriber = FS.workout(workoutId).onSnapshot(
        documentSnapshot => {
          if (documentSnapshot.exists) {
            const canceled = documentSnapshot.data().canceled;
            if (canceled && canceled == 'MeasurementPeer') {
              setShowModal(false);
              setWorkoutId(undefined);
              setConnId(undefined);
              setError('Previous connection was canceled by Measurement Peer');
              showSnack();
            }
          }
        },
        err => {
          console.log('VideoLobby:', `Encountered error: ${err}`);
        },
      );
      return () => subscriber();
    }
  }, [workoutId]);

  const goToRecordVideo = () => {
    setShowModal(false);
    FS.workout(workoutId).set(
      {
        videoStart: true,
      },
      {
        merge: true,
      },
    );
    navigation.reset({
      index: 1,
      routes: [{name: 'RecordVideo', params: {workoutId: workoutId}}],
    });
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return (
      <View>
        <Text>No access to camera</Text>
        <Text>
          Video feature needs Camera and Audio permissions. To ask again, close
          app, then open it again.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Appbar.Header>
        <Appbar.Action
          icon="home"
          onPress={() => {
            navigation.navigate('Home');
          }}
        />
        <Appbar.Content title="Video" subtitle="Connect to exercise" />
        <Appbar.Action
          icon="image-multiple-outline"
          onPress={() => {
            navigation.navigate('VideoGallery');
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Text>
          Connect to exercise recording to video record the person with second
          phone that will perform the exercise.
        </Text>
        <View style={{height: '5%'}} />
        <Title>Enter code form peer phone:</Title>
        <TextInput
          label="Code"
          value={connId}
          onChangeText={newId => setConnId(newId)}
        />
        <HelperText type="error" visible={hasErrors()}>
          {numError ? numError : error}
        </HelperText>
        <Button mode="contained" onPress={connect}>
          Connect
        </Button>
      </View>
      {/* MODAL */}
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
            You successfully connected to another phone (Measurement Peer).
            Sensor recoring will start as soon as you start recording video.
            Sensor recording will stop when you stop recording video.
          </Text>
          <Text style={{marginVertical: 5}}>
            After you finish recording and exercise is done you will be able to
            label activities in categories - exercise and other. To continue to
            camera mode press continue.
          </Text>
          <Button
            style={{marginTop: 30}}
            mode="contained"
            onPress={goToRecordVideo}>
            Continue
          </Button>
          <Button
            style={{marginTop: 50}}
            color="red"
            onPress={() => {
              Alert.alert('Cancel?', 'Are you sure to cancel?', [
                {
                  text: 'Yes',
                  onPress: meCancelWorkout,
                },
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
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    backgroundColor: Color.bg,
    height: '100%',
  },
});

export default VideoLobby;

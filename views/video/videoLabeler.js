import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import {Video} from 'expo-av';
import {
  Title,
  Button,
  IconButton,
  Dialog,
  Portal,
  Paragraph,
  Snackbar,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {useKeepAwake} from 'expo-keep-awake';

import FS from '../../components/fstore';
import LableGestureBox from '../../components/labelGestureBox';

export default function VideoLabeler({route, navigation}) {
  const video = React.useRef(null);
  const [repetitions, setRepetitions] = React.useState([]);
  const [refLoaded, setRefLoaded] = React.useState(false);
  const [currentMillis, setCurrentMillis] = React.useState(0);
  const [durationMillis, setDurationMillis] = React.useState(10000000);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [SLDVisible, setSLDVisible] = React.useState(false);
  const [SLDData, setSLDData] = React.useState({
    lableString: '',
    workoutHasLables: false,
    exercisePeriods: 0,
    countPlaceholder: 'count',
    workoutId: '',
  });
  const [gestureControl, setGestureControl] = React.useState({
    prevState: null,
    rootMillis: null,
  });
  const [snackVisible, setSnackVisible] = React.useState(false);
  const [snackContent, setSnackContent] = React.useState('');
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  useKeepAwake();

  const getStatus = status => {
    setDurationMillis(status.durationMillis);
    setIsPlaying(status.isPlaying);
    setCurrentMillis(status.positionMillis);
    setFinished(status.didJustFinish);
  };

  const positionMillis = async () => {
    if (video && video.current) await video.current.getStatusAsync(getStatus);
    return currentMillis;
  };

  const getCurrentLabel = () => {
    // Lables:
    // gray - outside of any repetition
    // green - inside an finnished rpetition
    // yellow - inside on unfinished repetition
    var L = 'gray';
    for (let i = 0; i < repetitions.length; i++) {
      if (
        currentMillis >= repetitions[i][0] &&
        repetitions[i][1] !== null &&
        currentMillis <= repetitions[i][1]
      ) {
        L = 'green';
        break;
      } else if (
        currentMillis >= repetitions[i][0] &&
        repetitions[i][1] === null &&
        (i + 1 == repetitions.length || currentMillis <= repetitions[i + 1][0])
      ) {
        L = 'yellow';
        break;
      }
    }
    return L;
  };

  const skipPlayback = sec => {
    var newTime = currentMillis + sec * 1000;
    console.log('skipPlayback to ', newTime, sec);
    if (newTime < 0) newTime = 0;
    if (video && video.current) video.current.setPositionAsync(newTime);
  };

  const findRepIndex = time => {
    var i = 0;
    var found = false;
    for (i = 0; i < repetitions.length; i++) {
      if (repetitions[i][0] <= time && !found) {
        if (
          repetitions[i][1] === null &&
          (repetitions.length == i + 1 || repetitions[i + 1][0] > time)
        ) {
          found = true;
          break;
        } else if (repetitions[i][1] !== null && repetitions[i][1] > time) {
          found = true;
          break;
        }
      }
    }
    if (found) return i;
    else return -1;
  };

  const skipNext = async () => {
    const time = await positionMillis();
    var i = findRepIndex(time);
    if (i < 0) return;
    if (i + 1 < repetitions.length) {
      video.current.setPositionAsync(repetitions[i + 1][0]);
    }
  };

  const skipPrev = async () => {
    const time = await positionMillis();
    var i = findRepIndex(time);
    if (i < 0) return;
    if (i <= 1) {
      video.current.setPositionAsync(repetitions[i - 1][0]);
    }
  };

  const deleteTag = async () => {
    const time = await positionMillis();
    var i = 0;
    var found = false;
    var newReps = [];
    const index = findRepIndex(time);
    for (i = 0; i < repetitions.length; i++) {
      if (i == index) continue;
      newReps.push(repetitions[i]);
    }
    setRepetitions(newReps);
  };

  const clearAllTags = () => {
    Alert.alert('Clear all labels', 'Are you sure to clear all labels?', [
      {
        text: 'Yes',
        onPress: () => {
          setRepetitions([]);
        },
      },
      {
        text: 'Cancel',
      },
    ]);
  };

  const millis2time = millis => {
    const min = Math.floor(millis / 60000);
    const sec = Math.floor(millis / 1000) % 60;
    const mil = millis % 1000;
    return `${min}:${String(sec).padStart(2, 0)}.${String(mil).padStart(3, 0)}`;
  };

  const setSnack = message => {
    setSnackContent(message);
    setSnackVisible(true);
  };

  const saveLabels = async () => {
    console.log('saveLabels');
    console.log(repetitions);
    console.log(route.params.key);
    const workoutId = route.params.key;
    if (!workoutId) {
      console.log(`Error in saveLables - no workoutId`);
      setSnack('Error 1.');
      return;
    }
    const workoutSnap = await FS.workout(workoutId).get();
    if (!workoutSnap.exists) {
      console.log(`Error in saveLables - can't find workout in DB`);
      setSnack('Error 2.');
      return;
    }
    if (repetitions.length == 0) {
      setSnack('No repetitions labeled, nothing to save');
      return;
    }

    for (var i = 0; i < repetitions.length; i++) {
      if (repetitions[i][1] === null) {
        setSnack(`End not labeled on rep no. ${i + 1}`);
        return;
      }
    }

    const workoutData = workoutSnap.data();
    var workoutHasReps = true;
    if (!workoutData.videoReps) workoutHasReps = false;

    var lableString = `Repetitions: ${repetitions.length}`;
    repetitions.forEach(r => {
      lableString += `\n${millis2time(r[0])} - ${millis2time(
        r[1],
      )} (${millis2time(r[1] - r[0])})`;
    });

    setSLDData({
      lableString: lableString,
      workoutHasReps: workoutHasReps,
      repCount: repetitions.length,
      workoutId: workoutId,
    });
    console.log({
      lableString: lableString,
      workoutHasReps: workoutHasReps,
      repCount: repetitions.length,
      workoutId: workoutId,
    });
    setSLDVisible(true);
  };

  const onSaveLables = () => {
    console.log('onSaveLables', repetitions);
    setSLDVisible(false);
    var data = [];
    for (var i = 0; i < repetitions.length; i++) {
      data.push({
        start: repetitions[i][0],
        end: repetitions[i][1],
      });
    }
    FS.workout(SLDData.workoutId)
      .set(
        {
          videoReps: data,
        },
        {
          merge: true,
        },
      )
      .then(() => {
        navigation.reset({
          index: 1,
          routes: [{name: 'VideoGallery'}],
        });
      })
      .catch(e => {
        console.log(e);
        setSnack(e.message);
      });
  };

  React.useEffect(() => {
    if (video && video.current && !refLoaded) {
      setRefLoaded(true);
      video.current.setOnPlaybackStatusUpdate(getStatus);
    }
  }, []);

  if (!route.params || !route.params.uri) {
    return <Text>No video file</Text>;
  }
  if (!route.params.key) {
    return <Text>No associated workout</Text>;
  }
  if (route.params.canceled) {
    return <Text>Workout has been canceled</Text>;
  }

  const onGestureStart = async () => {
    if (isPlaying) video.current.pauseAsync();
    const time = await positionMillis();
    setGestureControl({
      prevState: isPlaying,
      rootMillis: time,
    });
  };

  const onGestureMove = x => {
    if (gestureControl.prevState === null) return;
    var newMilis = 2 * x + gestureControl.rootMillis;
    if (newMilis < 0) newMilis = 0;
    video.current.setPositionAsync(Math.floor(newMilis));
  };

  const onGestureEnd = () => {
    // if (gestureControl.prevState) video.current.playAsync();
    setGestureControl({
      prevState: null,
      rootMillis: null,
    });
  };

  const setLable = async lType => {
    // lType can be 'start', 'end', 'start end'

    var newReps = repetitions;
    const c = await positionMillis();
    const i = findRepIndex(c);
    console.log(`setLable: ${lType} millis: ${c} index: ${i}`);
    console.log(repetitions);

    if (i == -1) {
      if (lType.includes('start')) newReps.push([c, null]);
    } else {
      if (lType.includes('end') && newReps[i][1] === null) {
        if (newReps[i][0] + 300 > c) {
          setSnack('Reppetition too short');
          return;
        }
        newReps[i][1] = c;
      }
      if (lType.includes('start')) {
        if (newReps[i][1] === null && newReps[i][0] + 300 > c) {
          setSnack('Reppetition too short');
          return;
        }
        newReps.push([c, null]);
      }
    }

    setRepetitions(
      newReps.sort((a, b) => {
        return a[0] - b[0];
      }),
    );
    forceUpdate(); // Hack because RN didn't want to update for some reason
  };

  const onDismissSnack = () => {
    setSnackVisible(false);
    setSnackContent('');
  };

  return (
    <View style={{flex: 1}}>
      <LableGestureBox
        onMoveEvtStart={onGestureStart}
        onMove={onGestureMove}
        onMoveEvtEnd={onGestureEnd}>
        <Video
          ref={video}
          shouldPlay={false}
          resizeMode={Video.RESIZE_MODE_CONTAIN}
          source={{uri: route.params.uri}}
          style={{
            height: Dimensions.get('window').height - 200,
          }}
        />
      </LableGestureBox>
      <View>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={durationMillis}
          minimumTrackTintColor="black"
          maximumTrackTintColor="black"
          disabled={!refLoaded}
          onValueChange={newValue => {
            if (isPlaying) video.current.pauseAsync();
            video.current.setPositionAsync(Math.floor(newValue));
          }}
          value={currentMillis}
        />
      </View>
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View
          style={{
            backgroundColor: getCurrentLabel(),
            width: '100%',
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Title>
            Rep. count: {findRepIndex(currentMillis) + 1}./{repetitions.length}
          </Title>
          <Title>{millis2time(currentMillis)}</Title>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignContent: 'center',
            justifyContent: 'space-between',
          }}>
          {finished ? (
            <Button
              style={{...styles.button}}
              mode="contained"
              icon="replay"
              onPress={() => {
                console.log('Replay');
                if (video && video.current) video.current.replayAsync();
              }}>
              Replay
            </Button>
          ) : !isPlaying ? (
            <Button
              style={{...styles.button}}
              mode="contained"
              icon="play"
              onPress={() => {
                console.log('Play');
                if (video && video.current) video.current.playAsync();
              }}>
              Play
            </Button>
          ) : (
            <Button
              style={{...styles.button}}
              mode="contained"
              icon="pause"
              onPress={() => {
                console.log('Pause');
                if (video && video.current) video.current.pauseAsync();
              }}>
              Pause
            </Button>
          )}
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="arrow-expand-right"
            disabled={getCurrentLabel() != 'gray'}
            onPress={() => {
              console.log('Start repetition');
              setLable('start');
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="arrow-collapse-right"
            disabled={getCurrentLabel() != 'yellow'}
            onPress={() => {
              console.log('End repetiton');
              setLable('end');
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon={require('../../assets/arrow-stopstart.png')}
            size={30}
            disabled={getCurrentLabel() != 'yellow'}
            onPress={() => {
              console.log('StartEnd repetiton');
              setLable('start end');
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignContent: 'center',
            justifyContent: 'space-around',
          }}>
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="skip-backward"
            onPress={() => {
              console.log('- 5 s');
              skipPlayback(-5);
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="skip-previous"
            disabled={isPlaying}
            onPress={() => {
              console.log('previous');
              skipPrev();
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="skip-next"
            disabled={isPlaying}
            onPress={() => {
              console.log('next');
              skipNext();
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="skip-forward"
            onPress={() => {
              console.log('+ 5 s');
              skipPlayback(5);
            }}
          />
          <IconButton
            style={{...styles.button, marginLeft: 50}}
            mode="outlined"
            icon="content-save-alert"
            disabled={isPlaying}
            onPress={() => {
              saveLabels();
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="delete"
            disabled={isPlaying}
            onPress={() => {
              console.log('delete');
              deleteTag();
            }}
          />
          <IconButton
            style={{...styles.button}}
            mode="outlined"
            icon="delete-alert"
            color="red"
            disabled={isPlaying}
            onPress={() => {
              console.log('Clear all tags');
              clearAllTags();
            }}
          />
        </View>
      </View>
      {/* WARNNG SNACKBAR */}
      <Snackbar
        visible={snackVisible}
        onDismiss={onDismissSnack}
        action={{
          label: 'Hide',
          onPress: onDismissSnack,
        }}>
        {snackContent}
      </Snackbar>
      <Portal>
        {/* SAVE LABLES DIALOG */}
        <Dialog visible={SLDVisible} onDismiss={() => setSLDVisible(false)}>
          <ScrollView>
            <Dialog.Title>Save Lables</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                {`${
                  SLDData.workoutHasReps
                    ? 'This workout already have lables saved in database!\n'
                    : ''
                }Are you sure that labels are correct?\n${SLDData.lableString}`}
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={onSaveLables}>Save</Button>
              <Button onPress={() => setSLDVisible(false)}>Cancel</Button>
            </Dialog.Actions>
          </ScrollView>
        </Dialog>
      </Portal>
    </View>
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
  button: {
    flex: 1,
    margin: 5,
    justifyContent: 'center',
  },
});

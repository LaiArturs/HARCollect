import * as React from 'react';
import {View, StyleSheet, Text, Dimensions, Alert} from 'react-native';
import {Video} from 'expo-av';
import {
  Title,
  Button,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Paragraph,
  HelperText,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {useKeepAwake} from 'expo-keep-awake';

import FS from '../../components/fstore';
import LableSlider from '../../components/lableSlider';

export default function VideoLabeler({route, navigation}) {
  const video = React.useRef(null);
  const [label, setLabel] = React.useState([{millis: 0, label: 'Other'}]);
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
  const [SLDErr, setSLDErr] = React.useState('');
  const [SLDCount, setSLDCount] = React.useState('');
  useKeepAwake();

  const getStatus = (status) => {
    console.log('getStatus');
    setDurationMillis(status.durationMillis);
    setIsPlaying(status.isPlaying);
    setCurrentMillis(status.positionMillis);
    setFinished(status.didJustFinish);
  };

  const positionMillis = async () => {
    if (video && video.current) await video.current.getStatusAsync(getStatus);
    return currentMillis;
  };

  const onPressLabel = async (l) => {
    const t = await positionMillis();
    const i = {millis: t, label: l};
    console.log('onPressLabel: ', i);
    var arr = label.slice();
    var replace = false;
    for (let j = 0; j < arr.length; j++) {
      if (arr[j].millis === i.millis) {
        arr[j].label = i.label;
        replace = true;
        break;
      }
    }
    if (!replace) {
      arr.push(i);
      arr.sort(function (a, b) {
        return a.millis - b.millis;
      });
    }
    var newArr = [];
    var prewLabel = undefined;
    arr.forEach((e) => {
      if (e.label != prewLabel) {
        prewLabel = e.label;
        newArr.push(e);
      }
    });
    setLabel(newArr);
    console.log('onPressLabel', newArr);
  };

  const getCurrentLabel = () => {
    var L = 'Unknown';
    for (let i = 0; i < label.length; i++) {
      if (currentMillis < label[i].millis) break;
      L = label[i].label;
    }
    return L;
  };

  const skipPlayback = (sec) => {
    var newTime = currentMillis + sec * 1000;
    console.log('skipPlayback to ', newTime, sec);
    if (newTime < 0) newTime = 0;
    if (video && video.current) video.current.setPositionAsync(newTime);
  };

  const skipNext = () => {
    for (let i = 0; i < label.length; i++) {
      const {millis} = label[i];
      if (currentMillis < millis) {
        if (video && video.current) video.current.setPositionAsync(millis);
        break;
      }
    }
  };

  const skipPrev = () => {
    var prev = 0;
    for (let i = 0; i < label.length; i++) {
      const {millis} = label[i];
      if (currentMillis <= millis) break;
      prev = millis;
    }
    if (video && video.current) video.current.setPositionAsync(prev);
  };

  const deleteTag = () => {
    var arr = label.slice();
    var i = label.length - 1;
    if (i <= 0) return;
    for (; i > 0; i--) {
      const {millis} = label[i];
      if (currentMillis >= millis) break;
    }
    if (i == 0) return;
    arr.splice(i, 1);

    var newArr = [];
    var prewLabel = undefined;
    arr.forEach((e) => {
      if (e.label != prewLabel) {
        prewLabel = e.label;
        newArr.push(e);
      }
    });
    setLabel(newArr);
  };

  const clearAllTags = () => {
    Alert.alert('Clear all labels', 'Are you sure to clear all lables?', [
      {
        text: 'Yes',
        onPress: () => {
          setLabel([{millis: 0, label: 'Other'}]);
        },
      },
      {
        text: 'Cancel',
      },
    ]);
  };

  const millis2time = (millis) => {
    const min = Math.floor(millis / 60000);
    const sec = Math.floor(millis / 1000) % 60;
    const mil = millis % 1000;
    return `${min}:${String(sec).padStart(2, 0)}.${String(mil).padStart(3, 0)}`;
  };

  const saveLabels = async () => {
    console.log('saveLabels');
    console.log(label);
    console.log(route.params.key);
    const workoutId = route.params.key;
    if (!workoutId) {
      console.log(`Error in saveLables - no workoutId`);
      return;
    }
    const workoutSnap = await FS.workout(workoutId).get();
    if (!workoutSnap.exists) {
      console.log(`Error in saveLables - can't find workout in DB`);
      return;
    }
    const workoutData = workoutSnap.data();
    var workoutHasLables = true;
    if (!workoutData.videoLables) workoutHasLables = false;

    var lableString = '';
    var exercisePeriods = 0;
    label.forEach((l) => {
      lableString += `\n${millis2time(l.millis)} - ${l.label}`;
      if (l.label == 'Exercise') exercisePeriods += 1;
    });
    var countPlaceholder = '';
    for (let i = 0; i < exercisePeriods; i++) {
      if (!countPlaceholder) countPlaceholder = 'count';
      else countPlaceholder += ', count';
    }
    setSLDErr('');
    setSLDCount('');
    setSLDData({
      lableString: lableString,
      workoutHasLables: workoutHasLables,
      exercisePeriods: exercisePeriods,
      countPlaceholder: countPlaceholder,
      workoutId: workoutId,
    });
    console.log({
      lableString: lableString,
      workoutHasLables: workoutHasLables,
      exercisePeriods: exercisePeriods,
      countPlaceholder: countPlaceholder,
      workoutId: workoutId,
    });
    setSLDVisible(true);
  };

  const onSaveLables = () => {
    if (SLDData.exercisePeriods) {
      if (!SLDCount) {
        setSLDErr('Provide repetition count');
        return;
      }
      var s = SLDCount.replace(' ', '').split(',');
      var stringIsOk = true;
      s.forEach((n) => {
        if (isNaN(n)) {
          stringIsOk = false;
        }
      });
      if (!stringIsOk) {
        setSLDErr('Unexpected input');
        return;
      }
      if (s.length != SLDData.exercisePeriods) {
        setSLDErr(
          `Provide repetition count for ${
            SLDData.exercisePeriods
          } exercise period${
            SLDData.exercisePeriods > 1 ? 's seperately' : ''
          }`,
        );
        return;
      }
    }
    setSLDErr('');
    setSLDVisible(false);
    FS.workout(SLDData.workoutId).set(
      {
        videoLables: label,
        exercisePeriods: SLDData.exercisePeriods,
        exerciseCount: SLDCount,
      },
      {
        merge: true,
      },
    );
    setTimeout(() => {
      navigation.reset({
        index: 1,
        routes: [{name: 'VideoGallery'}],
      });
    }, 1000);
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

  return (
    <View style={{flex: 1}}>
      <Video
        ref={video}
        shouldPlay={false}
        resizeMode={Video.RESIZE_MODE_CONTAIN}
        source={{uri: route.params.uri}}
        style={{
          height: Dimensions.get('window').height - 200,
        }}
      />
      <View>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={durationMillis}
          minimumTrackTintColor="black"
          maximumTrackTintColor="black"
          disabled={!refLoaded}
          onValueChange={(newValue) => {
            console.log(`Slide value ${newValue}`);
            if (isPlaying) video.current.pauseAsync();
            video.current.setPositionAsync(Math.floor(newValue));
          }}
          value={currentMillis}
        />
      </View>
      {/* <LableSlider /> */}
      <View style={{flex: 1, flexDirection: 'column'}}>
        <View
          style={{
            backgroundColor: getCurrentLabel() == 'Other' ? 'yellow' : 'green',
            width: '100%',
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Title>Current action: {getCurrentLabel()}</Title>
          <Title>{millis2time(currentMillis)}</Title>
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            alignContent: 'center',
            justifyContent: 'space-between',
          }}>
          <Button
            style={{...styles.button}}
            mode="contained"
            // disabled={!pause}
            onPress={() => {
              console.log('Exercise pressed');
              onPressLabel('Exercise');
            }}>
            Exercise
          </Button>
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

          <Button
            style={{...styles.button}}
            mode="contained"
            // disabled={!pause}
            onPress={() => {
              console.log('Other pressed');
              onPressLabel('Other');
            }}>
            Other
          </Button>
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
      <Portal>
        {/* SAVE LABLES DIALOG */}
        <Dialog visible={SLDVisible} onDismiss={() => setSLDVisible(false)}>
          <Dialog.Title>Save Lables</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {`${
                SLDData.workoutHasLables
                  ? 'This workout already have lables saved in database!\n'
                  : ''
              }Are you sure that labels are correct?\n${SLDData.lableString}`}
            </Paragraph>
            {SLDData.exercisePeriods ? (
              <>
                <Paragraph>
                  Provide coma seperated list of exercise repetitions in each
                  exercise period, like: 10 or: 10, 10, 8
                </Paragraph>
                <TextInput
                  label={SLDData.countPlaceholder}
                  value={SLDCount}
                  onChangeText={(text) => setSLDCount(text)}
                />
                <HelperText type="error" visible={SLDErr}>
                  {SLDErr}
                </HelperText>
              </>
            ) : (
              <></>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onSaveLables}>Save</Button>
            <Button onPress={() => setSLDVisible(false)}>Cancel</Button>
          </Dialog.Actions>
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

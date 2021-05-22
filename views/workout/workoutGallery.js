import React from 'react';
import {View, Text, FlatList} from 'react-native';
import {Appbar, ActivityIndicator} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

import FS from '../../components/fstore';
import FSystem from '../../components/fsystem';
import WorkoutCard from '../../components/workoutCard';

const WorkoutGallery = ({navigation}) => {
  const [workouts, setWorkouts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState();
  console.log('WorkoutGallery');

  React.useEffect(() => {
    (async () => {
      const dirInfo = await FileSystem.getInfoAsync(FSystem.WORKOUT_DIR);
      if (!dirInfo.exists) return;
      var files = await FileSystem.readDirectoryAsync(FSystem.WORKOUT_DIR);
      if (!files || !Array.isArray(files)) return;
      var workouts = [];
      for (const w of files) {
        const workoutSnap = await FS.workout(w.split('.')[0]).get();
        if (!workoutSnap.exists) continue;
        const workoutData = workoutSnap.data();

        const fileInfo = await FileSystem.getInfoAsync(FSystem.WORKOUT_DIR + w);
        workouts.push({
          key: w.split('.')[0],
          time: fileInfo.modificationTime,
          size: fileInfo.size,
          uri: fileInfo.uri,
          exercise: workoutData.exerciseName,
          uid: workoutData.uid,
          canceled: workoutData.canceled,
          menuOpened: false,
          labled: workoutData.videoReps ? true : false,
          videoUploaded: workoutData.videoUpload ? true : false,
          uploaded: workoutData.sensorRecording ? true : false,
          name: workoutData.sensorRecordingName,
        });
      }
      workouts.sort((a, b) => {
        return b.time - a.time;
      });
      setWorkouts(workouts);
    })()
      .catch(e => {
        setError(e);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = key => {
    setWorkouts(
      workouts.filter(w => {
        if (w.key == key) return false;
        return true;
      }),
    );
  };

  const handleSee = key => {
    navigation.navigate('WorkoutData', {workoutId: key});
  };

  return (
    <View style={{flex: 1}}>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title="Workout Recordings"
          subtitle="View and manage workout recordings"
        />
      </Appbar.Header>
      {
        // IF LOADING
        loading ? (
          <View style={{flex: 1, justifyContent: 'center'}}>
            <ActivityIndicator animating={loading} size={'large'} />
          </View>
        ) : // IF ERROR
        error ? (
          <Text>{`Error: ${
            error.code == 'firestore/unavailable'
              ? 'Could not reach server'
              : error.message
          }`}</Text>
        ) : // IF NO VIDEOS FOUND
        workouts.length == 0 ? (
          <Text
            style={{
              textAlign: 'center',
              marginVertical: '10%',
              fontWeight: 'bold',
              color: 'grey',
              fontSize: 17,
            }}>
            No workout recordings yet
          </Text>
        ) : (
          // IF OK
          <FlatList
            data={workouts}
            renderItem={({item}) => (
              <WorkoutCard
                data={item}
                onDelete={handleDelete}
                onSee={handleSee}
              />
            )}
          />
        )
      }
    </View>
  );
};

export default WorkoutGallery;

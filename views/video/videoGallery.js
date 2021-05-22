import React from 'react';
import {View, Text, FlatList} from 'react-native';
import {Appbar, ActivityIndicator} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';

import FS from '../../components/fstore';
import FSystem from '../../components/fsystem';
import VideoCard from '../../components/videoCard';

const VideoGallery = ({navigation}) => {
  const [videos, setVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState();
  console.log('VideoGallery');

  // GET VIDEOS
  React.useEffect(() => {
    (async () => {
      console.log('GET VIDEOS');
      const videoDirInfo = await FileSystem.getInfoAsync(FSystem.VIDEOS_DIR);
      if (!videoDirInfo.exists) return;
      var files = await FileSystem.readDirectoryAsync(FSystem.VIDEOS_DIR);
      if (!files || !Array.isArray(files)) return;
      var videos = [];
      for (const f of files) {
        const workoutSnap = await FS.workout(f.split('.')[0]).get();
        if (!workoutSnap.exists) continue;
        const workoutData = workoutSnap.data();
        console.log(workoutData);

        const fileInfo = await FileSystem.getInfoAsync(FSystem.VIDEOS_DIR + f);
        videos.push({
          key: f.split('.')[0],
          time: fileInfo.modificationTime,
          size: fileInfo.size,
          uri: fileInfo.uri,
          exercise: workoutData.exerciseName,
          uid: workoutData.uid,
          canceled: workoutData.canceled,
          menuOpened: false,
          labled: workoutData.videoReps ? true : false,
          uploaded: workoutData.videoUpload ? true : false,
          videoName: workoutData.videoName,
        });
      }
      videos.sort((a, b) => {
        return b.time - a.time;
      });
      setVideos(videos);
      setLoading(false);
    })()
      .catch(e => {
        setError(e);
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  const handlePlay = uri => {
    navigation.navigate('VideoPlayer', {uri: uri});
  };

  const handleLabel = data => {
    navigation.navigate('VideoLabeler', data);
  };

  const handleDelete = key => {
    setVideos(
      videos.filter(v => {
        if (v.key == key) return false;
        return true;
      }),
    );
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
          title="Video Gallery"
          subtitle="View and manage videos"
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
        videos.length == 0 ? (
          <Text
            style={{
              textAlign: 'center',
              marginVertical: '10%',
              fontWeight: 'bold',
              color: 'grey',
              fontSize: 17,
            }}>
            No videos yet
          </Text>
        ) : (
          // IF OK
          <FlatList
            data={videos}
            renderItem={({item}) => (
              <VideoCard
                data={item}
                onPlay={handlePlay}
                onLabel={handleLabel}
                onDelete={handleDelete}
              />
            )}
          />
        )
      }
    </View>
  );
};

export default VideoGallery;

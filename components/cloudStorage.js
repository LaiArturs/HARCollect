import storage from '@react-native-firebase/storage';

const VIDEO_DIR = '/workoutVideos/';
const WORKOUT_DIR = '/workoutSensorData/';

module.exports.uploadVideo = (file) => {
  const fileName = file.split('/').slice(-1)[0];
  const reference = storage().ref(VIDEO_DIR + fileName);
  return reference.putFile(file);
};

module.exports.uploadWR = (file) => {
  const fileName = file.split('/').slice(-1)[0];
  const reference = storage().ref(WORKOUT_DIR + fileName);
  return reference.putFile(file);
};

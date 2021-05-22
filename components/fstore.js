import firestore from '@react-native-firebase/firestore';

module.exports.user = user => {
  return firestore().collection('Users').doc(user.uid);
};

module.exports.exercises = () => {
  return firestore().collection('Exercises');
};

module.exports.constants = () => {
  return firestore().collection('Constants');
};

module.exports.videoPeer = id => {
  return firestore().collection('VideoPeers').doc(id);
};

module.exports.workout = id => {
  return firestore().collection('Workouts').doc(id);
};

module.exports.timestamp = () => {
  return firestore.FieldValue.serverTimestamp();
};

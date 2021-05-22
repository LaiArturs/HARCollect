import functions from '@react-native-firebase/functions';
// Use a local emulator in development
if (0) {
  // For DEV
  // If you are running on a physical device, replace http://localhost with the local ip of your PC. (http://192.168.x.x)
  functions().useFunctionsEmulator('http://192.168.20.3:5001');
}

module.exports.getVideoPeerId = functions().httpsCallable('getVideoPeerId');
module.exports.submitVideoPeerId = functions().httpsCallable(
  'submitVideoPeerId',
);
module.exports.setWorkoutTime = functions().httpsCallable('setWorkoutTime');

module.exports.err = functions.HttpsErrorCode;

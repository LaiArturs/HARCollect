import * as FileSystem from 'expo-file-system';
import {readAsStringAsync} from 'expo-file-system';

const VIDEOS_DIR = FileSystem.documentDirectory + 'HARVideos/';
const WORKOUT_DIR = FileSystem.documentDirectory + 'HARWorkout/';
module.exports.VIDEOS_DIR = VIDEOS_DIR;
module.exports.WORKOUT_DIR = WORKOUT_DIR;

// newName - just name withouth path or extension
module.exports.moveVideoToMemory = async (file, newName) => {
  if (!file || typeof file != 'string') return;
  console.log('moveVideoToMemory:', file, 'newName:', newName);
  const fileInfo = await FileSystem.getInfoAsync(file);
  if (!fileInfo.exists) {
    console.log('moveVideoToMemory: file does not exist:', file);
    return;
  }

  const videoDirInfo = await FileSystem.getInfoAsync(VIDEOS_DIR);
  if (!videoDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VIDEOS_DIR, {intermediates: true});
  }

  var destName = VIDEOS_DIR;
  if (newName) {
    var extension = file.split('/').slice(-1)[0].split('.').slice(-1)[0];
    if (extension) extension = '.' + extension;
    destName = destName + newName + extension;
  } else {
    destName = destName + file.split('/').slice(-1)[0];
  }

  await FileSystem.moveAsync({
    from: file,
    to: destName,
  });
};

module.exports.moveWorkoutDataToMemory = async (workoutId) => {
  console.log('moveWorkoutDataToMemory', workoutId);
  if (!workoutId || typeof workoutId != 'string') return;
  const fileInfo = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + workoutId,
  );
  if (!fileInfo.exists) {
    console.log('moveVideoToMemory: file does not exist:', file);
    return;
  }
  console.log(fileInfo);

  const destDirInfo = await FileSystem.getInfoAsync(WORKOUT_DIR);
  if (!destDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(WORKOUT_DIR, {intermediates: true});
  }

  var destName = WORKOUT_DIR + workoutId + '.csv';

  await FileSystem.moveAsync({
    from: fileInfo.uri,
    to: destName,
  });
};

module.exports.delete = (file) => {
  FileSystem.deleteAsync(file, {idempotent: true});
};

module.exports.getWorkoutData = async (wid) => {
  if (!wid || typeof wid != 'string') return [];
  try {
    const contents = await FileSystem.readAsStringAsync(
      WORKOUT_DIR + wid + '.csv',
    );
    if (!contents) return [];
    var r = {x: [], y: [], z: []};
    const a = contents.split('\n');
    a.forEach((d) => {
      if (!d || typeof d != 'string') return [];
      const v = d.split(',');
      if (v.length != 5 || v[0] != 'A') return; // Get only Accellometer datas
      r.x.push(v[2]);
      r.y.push(v[3]);
      r.z.push(v[4]);
    });
    return r;
  } catch (e) {
    console.log(e);
    return [];
  }
};

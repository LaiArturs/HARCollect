import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {
  Modal,
  Portal,
  Appbar,
  Paragraph,
  Title,
  HelperText,
  TextInput,
  Button,
  Card,
  Avatar,
  Menu,
  Divider,
  IconButton,
  Dialog,
  ProgressBar,
} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';

import CS from '../components/cloudStorage';
import Color from '../config/colors';
import FS from '../components/fstore';
import FSystem from '../components/fsystem';
import {NetContext} from '../routes/netProvider';

const VideoCard = ({data, onPlay, onLabel, onDelete}) => {
  const networkStatus = React.useContext(NetContext);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [infoVisible, setInfoVisible] = React.useState(false);
  const [uploading, setUploading] = React.useState(0);
  const [uploadedPath, setUploadedPath] = React.useState(null);
  const [uploaded, setUploaded] = React.useState(false);
  const [rename, setRename] = React.useState(false);
  const [videoName, setvideoName] = React.useState(null);
  const [newVideoName, setNewVideoName] = React.useState(null);
  const [forceUpladCounter, setForceUpladCounter] = React.useState(0);

  const status = React.useRef();
  React.useEffect(() => {
    status.current = {
      uploadedPath: uploadedPath,
    };
  });

  var iconColor = Color.videoState0;
  if (uploaded && data.labled) iconColor = Color.videoState2;
  else if (uploaded || data.labled) iconColor = Color.videoState1;

  const getSizeStr = bytes => {
    return Number.parseFloat(bytes / 1000000).toPrecision(4) + 'MB';
  };

  const getTimeStr = seconds => {
    var t = new Date();
    t.setTime(seconds * 1000);

    return t.toLocaleTimeString() + ' ' + t.toDateString();
  };

  const getSubtitle = item => {
    var t = new Date();
    t.setTime(item.time * 1000);
    return (
      item.exercise +
      ' | ' +
      getTimeStr(item.time) +
      ' | ' +
      getSizeStr(item.size)
    );
  };

  const doUpload = () => {
    const task = CS.uploadVideo(data.uri);
    task.on(
      'state_changed',
      s => {
        // s - TaskSnapshotObserver
        if (!s) return;
        setUploading(s.bytesTransferred / s.totalBytes);
        setUploadedPath(s.metadata.fullPath);
      },
      e => {
        console.log(e);
      },
      () => {
        console.log('Upload done! - ', status.current.uploadedPath);
        setUploading(0);
        FS.workout(data.key).set(
          {
            videoUpload: status.current.uploadedPath,
          },
          {
            merge: true,
          },
        );
        setUploaded(true);
      },
    );
  };

  React.useEffect(() => {
    setUploaded(data.uploaded);
    setvideoName(data.videoName ? data.videoName : data.exercise);
  }, []);

  const menu = () => {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => {
          setMenuVisible(false);
        }}
        anchor={
          <IconButton
            icon="dots-vertical"
            onPress={() => {
              setMenuVisible(true);
            }}
          />
        }>
        {/* PLAY */}
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            onPlay(data.uri);
          }}
          title="Play"
          icon="play-circle-outline"
        />
        {/* LABLE */}
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            onLabel(data);
          }}
          title="Label"
          icon="marker"
        />
        {/* UPLOAD */}
        <Menu.Item
          disabled={true}
          onPress={async () => {
            setMenuVisible(false);
            if (!networkStatus.isConnected) return;
            const alreadyUpladed = await FS.workout(data.key)
              .get()
              .then(snap => {
                if (!snap.exists) return true;
                const data = snap.data();
                if (data.videoUpload || uploaded) {
                  // Dont allow to upload twice
                  console.log('Video already uplaoded');
                  return true;
                }
                return false;
              });
            if (alreadyUpladed) {
              // Notify that video is already uplaoded
              // But give "backdoor" to force upload it again
              if (forceUpladCounter != 4) {
                setForceUpladCounter(forceUpladCounter + 1);
                Snackbar.show({
                  text: 'Video already upladed.',
                });
              } else {
                Snackbar.show({
                  text: 'Video already upladed.',
                  action: {
                    text: 'Force',
                    textColor: 'red',
                    onPress: () => {
                      doUpload();
                      setForceUpladCounter(forceUpladCounter + 1);
                    },
                  },
                });
              }
              return;
            }
            if (networkStatus.details.isConnectionExpensive)
              Alert.alert(
                'Metered connection',
                `You are on metered connection, not Wi-Fi. Data charges may apply. File size: ${getSizeStr(
                  data.size,
                )}\nUpload anyway?`,
                [
                  {
                    text: 'Upload',
                    onPress: () => {
                      doUpload();
                    },
                  },
                  {
                    text: 'Cancel',
                  },
                ],
              );
            else doUpload();
          }}
          title="Upload"
          icon="upload"
        />
        {/* INFO */}
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            setInfoVisible(true);
          }}
          title="Info"
          icon="information"
        />
        {/* RENAME */}
        <Menu.Item
          title="Rename"
          icon="pencil"
          onPress={() => {
            setMenuVisible(false);
            setRename(true);
          }}
        />
        {/* DELETE */}
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            Alert.alert(
              'Delete video',
              `Are you sure to delete this video from device?${
                uploaded ? '' : '\nVideo is not uploaded yet!'
              }${data.labled ? '' : '\nWorkout is not labled yet!'}`,
              [
                {
                  text: 'Yes',
                  onPress: () => {
                    FSystem.delete(data.uri);
                    onDelete(data.key);
                  },
                },
                {
                  text: 'Cancel',
                },
              ],
            );
          }}
          title="Delete"
          icon="delete"
        />
      </Menu>
    );
  };

  return (
    <>
      <Card
        onPress={() => {
          console.log('Card presed');
          if (data.labled) {
            onPlay(data.uri);
          } else {
            onLabel(data);
          }
        }}>
        <Card.Title
          title={videoName}
          subtitle={getSubtitle(data)}
          left={() => (
            <Avatar.Icon
              size={40}
              icon="video"
              style={{backgroundColor: iconColor}}
            />
          )}
          right={() => menu()}
        />
        {uploading ? (
          <Card.Content>
            <ProgressBar progress={uploading} />
          </Card.Content>
        ) : (
          <></>
        )}
      </Card>
      <Portal>
        {/* INFORMATION */}
        <Dialog
          visible={infoVisible}
          onDismiss={() => {
            setInfoVisible(false);
          }}>
          <Dialog.Title>Info</Dialog.Title>
          <Dialog.Content>
            <Text>Name: {videoName}</Text>
            <Text>Exercise type: {data.exercise}</Text>
            <Text>Size: {getSizeStr(data.size)}</Text>
            <Text>Creation time: {getTimeStr(data.time)}</Text>
            <Text>Workout ID: {data.key}</Text>
            <Text>Workout labeled: {data.labled ? 'Yes' : 'Not yet'}</Text>
            <Text>Video uploaded: {uploaded ? 'Yes' : 'Not yet'}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setInfoVisible(false);
              }}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* RENAME */}
        <Dialog
          visible={rename}
          onDismiss={() => {
            setRename(false);
          }}>
          <Dialog.Title>Rename video</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={newVideoName !== null ? newVideoName : videoName}
              onChangeText={text => setNewVideoName(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setRename(false);
                setNewVideoName(null);
              }}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                setRename(false);
                setvideoName(newVideoName);
                FS.workout(data.key).set(
                  {
                    videoName: newVideoName,
                  },
                  {
                    merge: true,
                  },
                );
              }}>
              Done
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default VideoCard;

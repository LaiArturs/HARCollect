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

import CS from '../components/cloudStorage';
import Color from '../config/colors';
import FS from '../components/fstore';
import FSystem from '../components/fsystem';
import {NetContext} from '../routes/netProvider';

const WorkoutCard = ({data, onDelete, onSee}) => {
  const networkStatus = React.useContext(NetContext);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [infoVisible, setInfoVisible] = React.useState(false);
  const [uploading, setUploading] = React.useState(0);
  const [uploadedPath, setUploadedPath] = React.useState(null);
  const [uploaded, setUploaded] = React.useState(false);
  const [rename, setRename] = React.useState(false);
  const [recordingName, setRecordingName] = React.useState(null);
  const [newRecordingName, setNewRecordingName] = React.useState(null);

  const status = React.useRef();
  React.useEffect(() => {
    status.current = {
      uploadedPath: uploadedPath,
    };
  });

  var iconColor = Color.videoState0;
  if (uploaded && data.labled) iconColor = Color.videoState2;
  else if (uploaded || data.labled) iconColor = Color.videoState1;

  const getSizeStr = (bytes) => {
    return Number.parseFloat(bytes / 1000000).toPrecision(4) + 'MB';
  };

  const getTimeStr = (seconds) => {
    var t = new Date();
    t.setTime(seconds * 1000);

    return t.toLocaleTimeString() + ' ' + t.toDateString();
  };

  const getSubtitle = (item) => {
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
    const task = CS.uploadWR(data.uri);
    task.on(
      'state_changed',
      (s) => {
        // s - TaskSnapshotObserver
        if (!s) return;
        setUploading(s.bytesTransferred / s.totalBytes);
        setUploadedPath(s.metadata.fullPath);
      },
      (e) => {
        console.log(e);
      },
      () => {
        console.log('Upload done! - ', status.current.uploadedPath);
        setUploading(0);
        FS.workout(data.key).set(
          {
            sensorRecording: status.current.uploadedPath,
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
    setRecordingName(data.name ? data.name : data.exercise);
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
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            onSee(data.key);
          }}
          title="See"
          icon="eye"
        />
        {/* UPLOAD */}
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            if (!networkStatus.isConnected) return;
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
              'Delete sensor recording',
              `Are you sure to delete this sensor recording from device?${
                uploaded ? '' : '\nSensor recording is not uploaded yet!'
              }`,
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
      <Card onPress={() => {}}>
        <Card.Title
          title={recordingName}
          subtitle={getSubtitle(data)}
          left={() => (
            <Avatar.Icon
              size={40}
              icon="chart-timeline-variant"
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
            <Text>Name: {recordingName}</Text>
            <Text>Exercise type: {data.exercise}</Text>
            <Text>Size: {getSizeStr(data.size)}</Text>
            <Text>Creation time: {getTimeStr(data.time)}</Text>
            <Text>Workout ID: {data.key}</Text>
            <Text>Workout labeled: {data.labled ? 'Yes' : 'Not yet'}</Text>
            <Text>
              Video uploaded: {data.videoUploaded ? 'Yes' : 'Not yet'}
            </Text>
            <Text>
              Sensor recording uploaded: {uploaded ? 'Yes' : 'Not yet'}
            </Text>
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
              value={
                newRecordingName !== null ? newRecordingName : recordingName
              }
              onChangeText={(text) => setNewRecordingName(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setRename(false);
                setNewRecordingName(null);
              }}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                setRename(false);
                setRecordingName(newRecordingName);
                FS.workout(data.key).set(
                  {
                    sensorRecordingName: newRecordingName,
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

export default WorkoutCard;

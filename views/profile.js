import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import {
  Portal,
  Appbar,
  Paragraph,
  HelperText,
  TextInput,
  Button,
  ActivityIndicator,
  Dialog,
} from 'react-native-paper';

import {AuthContext} from '../routes/authProvider';
import FS from '../components/fstore';

const Profile = ({navigation}) => {
  const {logout, user, login, deleteUser} = React.useContext(AuthContext);
  const [deletDialog, setDeleteDialog] = React.useState(false);
  const [password, setPassword] = React.useState();
  const [delError, setDelError] = React.useState();

  const [userData, setUserData] = React.useState();
  React.useEffect(() => {
    const subscriber = FS.user(user).onSnapshot((documentSnapshot) => {
      setUserData(documentSnapshot.data());
      console.log(documentSnapshot.data());
    });
    return () => subscriber();
  }, []);

  const sec2date = (sec) => {
    if (typeof sec != 'number') return;
    var date = new Date();
    date.setTime(sec * 1000);
    console.log(date);
    return date.toLocaleDateString();
  };

  return (
    <View>
      <Appbar.Header>
        <Appbar.Action
          icon="home"
          onPress={() => {
            navigation.navigate('Home');
          }}
        />
        <Appbar.Content title="Profile" />
      </Appbar.Header>
      <View style={{margin: '10%'}}>
        {userData ? (
          <>
            <Text>Name: {userData.name}</Text>
            <Text>Surname: {userData.surname}</Text>
            <Text>Email: {userData.email}</Text>
            <Text>Gender: {userData.male ? 'Male' : 'Female'}</Text>
            <Text>Date of birth: {sec2date(userData.birthday.seconds)}</Text>
          </>
        ) : (
          <ActivityIndicator animating={true} />
        )}
      </View>
      <Button onPress={() => logout()}>Logout</Button>
      <Button
        onPress={() => setDeleteDialog(true)}
        // onPress={() => {Alert.alert('Delete profile', 'Are you sure to delete this account? Action is immediate and irreversible. Profile data will be deleted, but any uploaded workout data (videos, sensor data) will be kept for research purposes.', [
        //   {text: "Cancel", style: 'cancel', onPress: () => {}},
        //   {
        //     text: 'Delete',
        //     style: 'destructive',
        //     onPress: () => {
        //       FS.user(user).set(
        //         {
        //           deleted: true,
        //           name: '',
        //           surname: '',
        //           email: '',
        //         },
        //         {
        //           merge: true,
        //         },
        //       );

        //     },
        //   },
        // ])}}
        style={{
          position: 'absolute',
          top: Dimensions.get('window').height - 100,
          alignSelf: 'center',
        }}
        color={'red'}>
        Delete profile
      </Button>
      <Portal>
        <Dialog visible={deletDialog} onDismiss={() => setDeleteDialog(false)}>
          <Dialog.Title>Delete profile</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure to delete this account? Action is immediate and
              irreversible. Profile data will be deleted, but any uploaded
              workout data (videos, sensor data) will be kept for research
              purposes.
            </Paragraph>
            <Paragraph style={{marginVertical: 20}}>
              Verify action with the password:
            </Paragraph>
            <TextInput
              label="Password"
              value={password}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
            <HelperText type="error" visible={delError}>
              {delError}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDeleteDialog(false);
                setDelError(undefined);
              }}>
              Cancel
            </Button>
            <Button
              color={'red'}
              onPress={() => {
                login(userData.email, password)
                  .then((c) => {
                    FS.user(user).set(
                      {
                        deleted: true,
                        name: '',
                        surname: '',
                        email: '',
                      },
                      {
                        merge: true,
                      },
                    );
                    deleteUser()
                      .then(() => {
                        console.log('Deleted succesfully');
                      })
                      .catch((e) => {
                        console.log('Could not delete', e);
                        setDelError('Could not delete');
                      });
                  })
                  .catch((e) => {
                    console.log('Could not login', e);
                    setDelError('Could not verify password');
                  });
              }}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Profile;

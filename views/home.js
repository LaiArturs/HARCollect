import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AuthContext} from '../routes/authProvider';
import FS from '../components/fstore';
import {
  Appbar,
  Button,
  IconButton,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';

import Constants from '../config/constansts';
import Color from '../config/colors';

const Home = ({navigation}) => {
  const {user, logout} = React.useContext(AuthContext);
  const [userData, setUserData] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [menuVisible, setMenuVisible] = React.useState(false);
  React.useEffect(() => {
    FS.user(user)
      .get()
      .then(snap => {
        setUserData(snap.data());
        FS.user(user).set(
          {
            lastVisit: FS.timestamp(),
          },
          {
            merge: true,
          },
        );
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    const unsubscribe = FS.constants()
      .get()
      .then(snap => {
        var version = '';
        snap.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          if (data.ver) version = data.ver;
        });
        if (Constants.version != version)
          Snackbar.show({
            text: `Installed version of app is not latest. Use latest version - ${version}`,
            duration: Snackbar.LENGTH_INDEFINITE,
            action: {
              text: 'Dismiss',
              textColor: 'gray',
            },
          });
        else Snackbar.dismiss();
      });
    return unsubscribe;
  }, []);

  const menu = (
    <Menu
      visible={menuVisible}
      onDismiss={() => {
        setMenuVisible(false);
      }}
      anchor={
        <IconButton
          icon="dots-vertical"
          color="white"
          onPress={() => {
            setMenuVisible(true);
          }}
        />
      }>
      {/* PROFILE */}
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          navigation.navigate('Profile');
        }}
        title="Profile"
        icon="account"
      />
      {/* About */}
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          navigation.navigate('About');
        }}
        title="About"
        icon="information"
      />
      {/* Terms */}
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          navigation.navigate('Terms');
        }}
        title="Terms"
        icon="file-document"
      />
      {/* Logout */}
      <Menu.Item
        onPress={() => {
          setMenuVisible(false);
          logout();
        }}
        title="Logout"
        icon="logout"
      />
    </Menu>
  );

  if (loading)
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={{flex: 1}}>
      <Appbar.Header>
        <Appbar.Content
          title="HAR Collect"
          subtitle={`Hi ${userData && userData.name ? userData.name : 'user'}!`}
        />
        {menu}
      </Appbar.Header>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Button
          style={styles.button}
          mode={'contained'}
          onPress={() => {
            navigation.navigate('Collect');
          }}>
          <Text style={styles.buttonText}>Collect</Text>
        </Button>
        <Button
          style={styles.button}
          mode={'contained'}
          onPress={() => {
            navigation.navigate('Video');
          }}>
          <Text style={styles.buttonText}>Video</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: '8%',
    marginHorizontal: '15%',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: Color.action,
  },
  buttonText: {
    fontSize: 20,
    lineHeight: 50,
  },
});

export default Home;

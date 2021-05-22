import React from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import * as yup from 'yup';
import {
  Button,
  Dialog,
  Portal,
  TextInput,
  HelperText,
} from 'react-native-paper';

import auth from '@react-native-firebase/auth';
import Color from '../../config/colors';
import {AuthContext} from '../../routes/authProvider';
import Snackbar from 'react-native-snackbar';

const schema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password too short, min 8 characters')
    .max(32, 'Password too long, max 32 characters'),
});

const resetEmailSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email'),
});

const Login = () => {
  const [emailV, emailC] = React.useState();
  const [passwordV, passwordC] = React.useState();
  const [resetDialogVisible, setResetDialogVisible] = React.useState(false);
  const [resetEmailV, resetEmailC] = React.useState('');
  const [resetEmailErr, setResetEmailErr] = React.useState('');
  const {login, logout} = React.useContext(AuthContext);
  const {user} = React.useContext(AuthContext);

  if (user) logout();

  const handleLogin = () => {
    console.log('DEBUG: handleLogin()');

    const data = {
      email: emailV,
      password: passwordV,
    };

    schema
      .validate(data)
      .then((data) => {
        login(data.email, data.password)
          .then((userCredential) => {
            var user = userCredential.user;
            if (!user.emailVerified) {
              Alert.alert(
                'Email not verified',
                'Check your email for verification code, then login!',
                [
                  {text: 'OK'},
                  {
                    text: 'Resend link',
                    onPress: () => user.sendEmailVerification(),
                  },
                ],
              );
              logout();
            }
          })
          .catch((e) => {
            Alert.alert('Could not login', e.message, [{text: 'OK'}]);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const resetPressSendEmail = () => {
    resetEmailSchema
      .validate({email: resetEmailV})
      .then((data) => {
        setResetEmailErr('');
        console.log('Validated', data);
        auth()
          .sendPasswordResetEmail(data.email)
          .then(() => {
            setResetDialogVisible(false);
            Snackbar.show({
              text: `Email sent to ${resetEmailV}`,
              duration: Snackbar.LENGTH_LONG,
            });
          })
          .catch((e) => {
            setResetEmailErr(e.code);
          });
      })
      .catch((e) => {
        setResetEmailErr(e.errors[0]);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputView}>
        <TextInput
          label="Email"
          value={emailV}
          onChangeText={(text) => emailC(text)}
        />
      </View>
      <View style={styles.inputView}>
        <TextInput
          label="Password"
          secureTextEntry={true}
          value={passwordV}
          onChangeText={(text) => passwordC(text)}
        />
      </View>
      <Button
        style={{
          marginTop: 50,
          backgroundColor: Color.action,
          borderRadius: 30,
          width: '50%',
        }}
        mode={'contained'}
        onPress={handleLogin}>
        Login
      </Button>
      <Text
        style={{marginTop: 30, color: 'purple'}}
        onPress={() => setResetDialogVisible(true)}>
        Reset password
      </Text>
      <Portal>
        <Dialog
          visible={resetDialogVisible}
          onDismiss={() => setResetDialogVisible(false)}>
          <Dialog.Title>Reset password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Email"
              value={resetEmailV}
              onChangeText={(text) => resetEmailC(text)}
            />
            <HelperText type="error" visible={resetEmailErr}>
              {resetEmailErr}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={resetPressSendEmail}>Reset</Button>
            <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bg,
  },
  inputView: {
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: Color.primary,
    // borderRadius: 20,
    width: '90%',
    marginVertical: 10,
  },
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.primary,
    borderRadius: 20,
    width: '90%',
    height: 40,
    marginVertical: 7,
  },
  inputName: {
    fontSize: 14,
    marginHorizontal: 10,
    paddingLeft: 5,
    color: Color.text,
    width: 90,
  },
  inputText: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: Color.white,
    borderColor: Color.primary,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    flexGrow: 1,
  },
});

export default Login;

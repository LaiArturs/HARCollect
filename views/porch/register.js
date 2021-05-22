import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {Button} from 'react-native-paper';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as yup from 'yup';
import firestore from '@react-native-firebase/firestore';
import Orientation from 'react-native-orientation';

import Color from '../../config/colors';
import {AuthContext} from '../../routes/authProvider';

const maxBD = new Date();
maxBD.setFullYear(maxBD.getFullYear() - 12);
const minBD = new Date();
minBD.setFullYear(minBD.getFullYear() - 65);
const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name should be longer'),
  // .matches("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$", 'Invalid Name'),
  surname: yup
    .string()
    .required('Surname is required')
    .min(2, 'Surname should be longer'),
  // .matches("^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$", 'Invalid Surname'),
  // TODO: check if email is NOT already in DB
  email: yup.string().required('Email is required').email('Invalid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password too short, min 8 characters')
    .max(32, 'Password too long, max 32 characters'),
  birthday: yup
    .date()
    .label('Invalid date of birth')
    .min(minBD, 'User too young')
    .max(maxBD, 'User too old')
    .test('date-test', 'Invalid date of birth', function (value) {
      return (
        this.parent.day === value.getDate() &&
        this.parent.month === value.getMonth() &&
        this.parent.year === value.getFullYear()
      );
    }),
  day: yup.number().required(),
  month: yup.number().required(),
  year: yup.number().required(),
  male: yup.bool(),
  terms: yup
    .bool()
    .oneOf([true], 'Read and accept terms and conditions to register'),
});

const Register = ({navigation}) => {
  Orientation.lockToPortrait();

  const [nameV, nameC] = React.useState();
  const [surnameV, surnameC] = React.useState();
  const [emailV, emailC] = React.useState();
  const [passwordV, passwordC] = React.useState();
  const [dayV, dayC] = React.useState('DD');
  const [monthV, monthC] = React.useState('MM');
  const [yearV, yearC] = React.useState('YYYY');
  const [sexV, sexC] = React.useState(false);
  const sexT = () => sexC((previousState) => !previousState);
  const [termsV, termsC] = React.useState(false);

  const {register, logout} = React.useContext(AuthContext);

  const storeData = (data, user) => {
    firestore()
      .collection('Users')
      .doc(user.uid)
      .set({
        name: data.name,
        surname: data.surname,
        email: data.email,
        birthday: data.birthday,
        male: data.male,
        terms: data.terms,
      })
      .then(() => {
        console.log('User added!');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleRegister = () => {
    console.log('DEBUG: handleRegister()');

    const data = {
      name: nameV,
      surname: surnameV,
      email: emailV,
      password: passwordV,
      birthday: new Date(yearV, monthV - 1, dayV),
      day: dayV,
      month: monthV - 1,
      year: yearV,
      male: sexV,
      terms: termsV,
    };

    schema
      .validate(data)
      .then((data) => {
        console.log(data);
        register(data.email, data.password)
          .then((userCredential) => {
            var user = userCredential.user;
            user.sendEmailVerification();
            if (!user.emailVerified) {
              Alert.alert(
                'Registration successful',
                'Link has been sent to your email. Verify your email, then login!',
                [{text: 'OK'}],
              );
              storeData(data, user);
              navigation.navigate('Porch');
            }
          })
          .catch((e) => {
            Alert.alert('Could not register', e.message, [{text: 'OK'}]);
          });
      })
      .catch((err) => {
        Alert.alert('Invalid Input', err.errors[0], [{text: 'OK'}]);
      });
  };

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
      }}>
      <View style={styles.container}>
        <View style={styles.inputBox}>
          <Text style={styles.inputName}>Name:</Text>
          <TextInput
            style={styles.inputText}
            onChangeText={(text) => nameC(text)}
            value={nameV}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputName}>Surname:</Text>
          <TextInput
            style={styles.inputText}
            onChangeText={(text) => surnameC(text)}
            value={surnameV}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputName}>Email:</Text>
          <TextInput
            style={styles.inputText}
            onChangeText={(text) => emailC(text)}
            value={emailV}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputName}>Password:</Text>
          <TextInput
            style={styles.inputText}
            secureTextEntry={true}
            onChangeText={(text) => passwordC(text)}
            value={passwordV}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.inputName}>Date of birth:</Text>
          <TextInput
            style={{
              ...styles.inputText,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            onChangeText={(text) => dayC(text)}
            value={dayV}
          />
          <TextInput
            style={{
              ...styles.inputText,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            onChangeText={(text) => monthC(text)}
            value={monthV}
          />
          <TextInput
            style={styles.inputText}
            onChangeText={(text) => yearC(text)}
            value={yearV}
          />
        </View>
        {/* SEX */}
        <View style={styles.inputBox}>
          <Text style={styles.inputName}>Gender:</Text>
          <View style={styles.inputSwitch}>
            <Text>Female</Text>
            <Switch
              trackColor={{
                false: Color.primaryLight,
                true: Color.primaryLight,
              }}
              thumbColor={Color.primary}
              ios_backgroundColor="#3e3e3e"
              onValueChange={sexT}
              value={sexV}
            />
            <Text>Male</Text>
          </View>
        </View>
        {/* TERMS AND CONDITIONS */}
        <View
          style={{...styles.inputBox, backgroundColor: Color.secondaryLight}}>
          <Text style={{...styles.inputName, flex: 1}}>
            Terms and Conditions:
          </Text>
          <View style={styles.inputCheckBox}>
            <Icon
              name="file-document"
              size={25}
              color={Color.primary}
              onPress={() => navigation.navigate('Terms')}
            />
            <CheckBox
              value={termsV}
              onValueChange={(newValue) => termsC(newValue)}
            />
          </View>
        </View>
        {/* REGISTER BUTTON */}
        <Button
          onPress={handleRegister}
          style={{
            marginTop: 50,
            backgroundColor: Color.action,
            width: '50%',
            borderRadius: 30,
          }}
          mode={'contained'}>
          Register
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bg,
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
  inputSwitch: {
    backgroundColor: Color.white,
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: Color.primary,
  },
  inputCheckBox: {
    backgroundColor: Color.white,
    width: '50%',
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderColor: Color.secondaryLight,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default Register;

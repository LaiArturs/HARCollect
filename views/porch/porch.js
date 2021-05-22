import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Title, Button} from 'react-native-paper';

const Porch = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Title style={styles.title}>HAR Collect</Title>
      </View>
      <View style={{flex: 1, width: '70%'}}>
        <Button
          style={styles.button}
          mode={'contained'}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.text}>Login</Text>
        </Button>
        <Button
          style={styles.button}
          mode={'contained'}
          onPress={() => navigation.navigate('Register')}>
          <Text style={styles.text}>Register</Text>
        </Button>
        <Button
          style={styles.button}
          mode={'contained'}
          onPress={() => navigation.navigate('About')}>
          <Text style={styles.text}>About</Text>
        </Button>
      </View>
      <View style={{flex: 1}}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 70,
    width: '100%',
    justifyContent: 'center',
    marginVertical: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    fontSize: 22,
  },
  title: {
    fontSize: 40,
    lineHeight: 50,
    fontWeight: 'bold',
  },
});

export default Porch;

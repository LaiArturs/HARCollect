import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Appbar} from 'react-native-paper';
import Orientation from 'react-native-orientation';

import FS from '../../components/fstore';
import Color from '../../config/colors';

const ChooseExercise = ({navigation}) => {
  console.log('ChooseExercise');
  const [exercises, setExercises] = React.useState([]);
  React.useEffect(() => {
    Orientation.lockToPortrait();
    const subscriber = FS.exercises().onSnapshot((querySnapshot) => {
      const e = [];
      querySnapshot.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        if (data.enabled)
          e.push({
            ...data,
            key: documentSnapshot.id,
          });
      });
      console.log(e);
      setExercises(e);
    });
    return () => subscriber();
  }, []);

  return (
    <View style={{flex: 1}}>
      <Appbar.Header>
        <Appbar.Action
          icon="home"
          onPress={() => {
            navigation.navigate('Home');
          }}
        />
        <Appbar.Content title="Choose Exercise" />
        <Appbar.Action
          icon="chart-multiple"
          onPress={() => {
            navigation.navigate('WorkoutGallery');
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <FlatList
          data={exercises}
          renderItem={({item}) => (
            <Text
              style={styles.item}
              onPress={() => navigation.navigate('ExerciseSetup', item)}>
              {item.name}
            </Text>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.bg,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  item: {
    marginTop: 24,
    padding: 30,
    backgroundColor: Color.primary,
    fontSize: 24,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    margin: 40,
  },
});

export default ChooseExercise;

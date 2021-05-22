import * as React from 'react';
import {View, StyleSheet, Text, Dimensions} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation';

import FSystem from '../../components/fsystem';

export default function WorkoutData({route, navigation}) {
  const [data1, setData1] = React.useState([1]);
  const [data2, setData2] = React.useState([1]);
  const [data3, setData3] = React.useState([1]);
  const [position, setPosition] = React.useState(0);
  const [reload, setReload] = React.useState(false);
  const [h, setH] = React.useState(400);
  const [w, setW] = React.useState(200);

  React.useEffect(() => {
    if (data1.length == 1)
      (async () => {
        if (!route.params || !route.params.workoutId) return;
        const wid = route.params.workoutId;
        if (typeof wid != 'string') return;
        const data = await FSystem.getWorkoutData(wid);
        if (
          !data ||
          !data.x ||
          !data.y ||
          !data.z ||
          !Array.isArray(data.x) ||
          !Array.isArray(data.y) ||
          !Array.isArray(data.z)
        )
          return;
        setData1(data.x);
        setData2(data.y);
        setData3(data.z);
      })();
  }, []);

  React.useEffect(() => {
    Orientation.lockToLandscapeLeft();
    if (!reload) {
      setReload(true);
      setTimeout(() => {
        Orientation.lockToLandscapeRight();
        setH(Dimensions.get('window').height);
        setW(Dimensions.get('window').width);
      }, 1000);
    }

    return () => {
      Orientation.lockToPortrait();
    };
  }, [reload]);

  const slice = (arr) => {
    if (!Array.isArray(arr)) return [];
    var window = 30;
    const l = arr.length;
    if (!l) return [];
    if (window >= l) return arr;
    const p = Math.floor((l - window) * position);
    const q = p + window;
    return arr.slice(p, q);
  };

  if (!route.params || !route.params.workoutId || data1.length <= 1) {
    return <Text>No workout recording file</Text>;
  }

  return !reload ? (
    <></>
  ) : (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
      }}>
      <LineChart
        data={{
          datasets: [
            {
              data: slice(data1),
              color: (opacity = 1) => `rgba(254, 0, 0, ${opacity})`, // optional
            },
            {
              data: slice(data2),
              color: (opacity = 1) => `rgba(0, 254, 0, ${opacity})`, // optional
            },
            {
              data: slice(data3),
              color: (opacity = 1) => `rgba(0, 0, 254, ${opacity})`, // optional
            },
          ],
        }}
        width={w} // from react-native
        height={h - 60}
        yAxisSuffix="g"
        withDots={false}
        withVerticalLines={false}
        withHorizontalLines={false}
        yAxisInterval={1} // optional, defaults to 1
        formatXLabel={() => {
          return '';
        }}
        chartConfig={{
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 4, // optional, defaults to 2dp
          color: (opacity = 0) => `rgba(255, 255, 255, 0)`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 0,
          },
        }}
        bezier
        style={{
          marginVertical: 0,
          borderRadius: 0,
        }}
      />
      <Slider
        style={{
          height: 20,
          width: w - 50,
          marginHorizontal: 25,
          backgroundColor: 'gray',
        }}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="black"
        maximumTrackTintColor="black"
        onValueChange={(value) => {
          setPosition(value);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  video: {
    alignSelf: 'center',
    width: 320,
    height: 200,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

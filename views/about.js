import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Paragraph, Title, Headline} from 'react-native-paper';

import constants from '../config/constansts';

const About = () => {
  return (
    <ScrollView>
      <View style={{padding: 20, marginBottom: 50}}>
        <View style={styles.titleBox}>
          <Title style={styles.title}>HAR Collect</Title>
        </View>
        <Paragraph>
          Human Activity Recognition Collect is App developed to collect and
          label user activity data.
        </Paragraph>
        <Headline style={styles.headline}>Project</Headline>
        <Paragraph>
          The app is developed as part of a Master thesis and FLPP project of
          "Kompleksa novērtēšanas un atbalsta programma, lai samazinātu ar
          ekrānos pavadīto laiku saistītos veselības riskus pusaudžiem". The
          project is lead by two Latvian universities LSPA and LU. The data
          collected with this app will be used to train human activity
          recognition models.
        </Paragraph>
        <Headline style={styles.headline}>Usage</Headline>
        <Paragraph>
          This app collects Accelerometer and Gyroscope data from phone internal
          sensors during the execution of specific workouts. The second phone
          with this app is used to video record the person executing the
          exercise and then label the activity.
        </Paragraph>
        <Headline style={styles.headline}>Data</Headline>
        <Paragraph>
          The app is collecting accelerometer and gyroscope data only when
          workout data collection is specifically started by the user.
        </Paragraph>
        <Headline style={styles.headline}>Created by</Headline>
        <Paragraph>
          The app is developed by LU student Artūrs Laizans and may contain some
          bugs, so be warned.
        </Paragraph>
        <Paragraph style={{textAlign: 'center', marginVertical: 20}}>
          {constants.version}
        </Paragraph>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  titleBox: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 30,
  },
  headline: {
    marginTop: 20,
  },
});

export default About;

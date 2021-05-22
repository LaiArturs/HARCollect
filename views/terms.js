import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Paragraph, Title, Headline} from 'react-native-paper';

const Terms = () => {
  return (
    <ScrollView>
      <View style={{padding: 20, marginBottom: 50}}>
        <View style={styles.titleBox}>
          <Title style={styles.title}>Terms and Conditions</Title>
        </View>
        <Paragraph>
          By accessing and using HARCollect app, you accept and agree to be
          bound by the terms and provision of this agreement. Also, when using
          HARCollect app, you shall be subject to any posted guidelines or rules
          applicable to this service. Any participation in this service will
          constitute acceptance of this agreement. If you do not agree to abide
          by the above, please do not use this service.
        </Paragraph>
        <Headline style={styles.headline}>Privacy</Headline>
        <Paragraph>
          HARCollect will ask you to provide personal information about yourself
          such as name, surname, email, date of birth, and gender. By providing
          this information you guarantee for it to be correct. Name and surname
          can be used in personalized app experience and communication with you.
          Name, surname, and email won't be distributed to a third party. Date
          of birth and gender will be used for research purposes. Also, data of
          birth and gender without other private information can be shared with
          third parties to use for research purposes. On submitting this
          information it will be stored both on your device and also on
          HARCollect servers.
        </Paragraph>
        <Paragraph>
          On your action within the HARCollect app, it will collect sensor data
          and video data. This data can be managed through the app. Also, you
          can choose to upload it to HARCollect servers. Once it is uploaded it
          can be used for research purposes. Video recordings won't be
          distributed to third parties.
        </Paragraph>
        <Paragraph>
          You can request at any time to delete all information gathered from
          you, or an information report the app collected.
        </Paragraph>
        <Headline style={styles.headline}>Usage</Headline>
        <Paragraph>
          HARCollect app shall be used only for its intended purpose - to
          generate and collect motion data for our project.
        </Paragraph>
        <Paragraph>
          We may terminate your access to the Site, without cause or notice,
          which may result in the forfeiture and destruction of all information
          associated with your account.
        </Paragraph>
        <Headline style={styles.headline}>Notification of Changes</Headline>
        <Paragraph>
          The developer of this app reserves the right to change these terms and
          conditions at any moment. Changes in terms and conditions will be
          announced to the email address of user accounts.
        </Paragraph>
        <Paragraph style={{marginVertical: 20}}>
          Last updated: 25.02.2021.
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

export default Terms;

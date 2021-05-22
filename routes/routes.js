import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import {AuthContext} from './authProvider';
import AuthStack from './authStack';
import AppStack from './appStack';

const Routes = () => {
  const {user, setUser} = React.useContext(AuthContext);
  const [initializing, setInitializing] = React.useState(true);

  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;
  return (
    <NavigationContainer>
      {user && user.emailVerified ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;

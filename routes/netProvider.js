import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Snackbar from 'react-native-snackbar';

export const NetContext = React.createContext();

export const NetProvider = ({children}) => {
  const [state, setState] = React.useState(NetInfo.useNetInfo());

  React.useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener(state => {
      setState(state);
      if (!state.isConnected)
        Snackbar.show({
          text: 'Not connected to internet, please connect for app to work properly.',
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

  return <NetContext.Provider value={state}>{children}</NetContext.Provider>;
};

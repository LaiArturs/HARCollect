import * as React from 'react';
import {AuthProvider} from './routes/authProvider';
import {NetProvider} from './routes/netProvider';
import Routes from './routes/routes';
import {Provider as PaperProvider} from 'react-native-paper';

const App = () => {
  return (
    <NetProvider>
      <PaperProvider>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </PaperProvider>
    </NetProvider>
  );
};

export default App;

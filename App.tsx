import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

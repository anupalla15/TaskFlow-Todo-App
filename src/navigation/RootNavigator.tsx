import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import TasksScreen from '../screens/TasksScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import { useAppDispatch, useAppSelector } from '../store';
import { restoreSession } from '../store/authSlice';
import { colors } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Shows the auth screens when logged out and the task screens when logged in. */
export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { token, restoring } = useAppSelector((s) => s.auth);

  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);

  if (restoring) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.ink }}>
        {token ? (
          <>
            <Stack.Screen name="Tasks" component={TasksScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'New task' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={AuthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={AuthScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AUTH_STACK_STRINGS} from '../constants';
import Login from '../../screens/auth/login';
import Signup from '../../screens/auth/signup';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={AUTH_STACK_STRINGS.LOGIN} component={Login} />
      <Stack.Screen name={AUTH_STACK_STRINGS.SIGNUP} component={Signup} />
    </Stack.Navigator>
  );
};

export default AuthStack;

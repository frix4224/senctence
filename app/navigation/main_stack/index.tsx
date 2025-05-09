import * as React from 'react';
import {MAIN_STACK_STRINGS} from '../constants';
import ServiceOverview from '../../screens/services/overview';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../../screens/services/HomeScreen';
import {AccountScreen, EditProfle, OrdersScreen} from '../../screens';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={MAIN_STACK_STRINGS.HOME} component={HomeScreen} />
      <Stack.Screen
        name={MAIN_STACK_STRINGS.SERVICE_OVERVIEW}
        component={ServiceOverview}
      />
      <Stack.Screen
        name={MAIN_STACK_STRINGS.ORDER_SCREEN}
        component={OrdersScreen}
      />
      <Stack.Screen
        name={MAIN_STACK_STRINGS.ACCOUNT}
        component={AccountScreen}
      />
    </Stack.Navigator>
  );
}

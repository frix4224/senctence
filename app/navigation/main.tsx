import React, {useEffect} from 'react';
import {PermissionsAndroid, Platform, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MAIN_NAV_STRINGS} from './constants';
import {
  AddAddress,
  AddAddressMap,
  AddressList,
  CartScreen,
  Checkout,
  FAQ,
  IntroScreen,
  OrderDetails,
  OrderFailure,
  OrderSuccess,
  Payment,
  PickAndCollectScreen,
  SplashScreen,
} from '../screens';
import {ToastProvider} from 'react-native-toast-notifications';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IonIcons from 'react-native-vector-icons/Ionicons';
import AuthStack from './auth';
import {COLORS, SIZING} from '../utils';
import {getSecureInfo, setSecureInfo} from '../utils/secureStore';
import {SECURE_STRINGS} from '../utils/secureStore/strings';
import {useSetAtom} from 'jotai';
import {userAtom} from '../store/auth';
import {UserInfo} from '../customTypes/userInfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {fcmTokeAtom} from '../store';
import {navigationRef} from '../../App';
import {CommonActions} from '@react-navigation/native';
import MainStack from './main_stack';
import {FONTS} from '../assets/fonts';
// import {useNetInfo} from '@react-native-community/netinfo';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const Main = () => {
  const setUserInfo = useSetAtom(userAtom);
  const setFcmToken = useSetAtom(fcmTokeAtom);
  // const internetState = useNetInfo();

  useEffect(() => {
    PushNotification.configure({
      onRegister: function (token) {
        // Platform.OS === 'android' && console.log('TOKEN:', token);
        Platform.OS === 'android' && setFcmToken(token.token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        if (notification.foreground) {
          PushNotification.localNotification(notification);
        }
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }, [setFcmToken]);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Eazyy Notification Permissions',
            message: 'Eazyy wants to send you notifications',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // const token = await messaging().getToken();
          // console.log({ token });
          // setFcmToken(token);
        } else {
          // console.log('Notifications permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        // console.log({token, msg: 'ios'});
        setFcmToken(token);
      }
    }
  };

  const fetchUserData = async () => {
    requestNotificationPermission();
    const userStorageData = await getSecureInfo(SECURE_STRINGS.USER_INFO);
    if (userStorageData && userStorageData.length > 0) {
      const parsedUserInfo: UserInfo = JSON.parse(userStorageData);
      setUserInfo(parsedUserInfo);
      setTimeout(() => {
        if (Platform.OS === 'ios') {
          navigationRef.navigate(MAIN_NAV_STRINGS.MAINSTACK as never);
        } else {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: MAIN_NAV_STRINGS.MAINSTACK}],
            }),
          );
        }
      }, 1000);
    } else {
      const isFirstTime = await getSecureInfo(SECURE_STRINGS.IS_FIRST_TIME);
      if (isFirstTime && isFirstTime === 'false') {
        setTimeout(() => {
          if (Platform.OS === 'ios') {
            navigationRef.navigate(MAIN_NAV_STRINGS.AUTHSTACK as never);
          } else {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: MAIN_NAV_STRINGS.AUTHSTACK}],
              }),
            );
          }
        }, 1000);
      } else {
        await setSecureInfo(SECURE_STRINGS.IS_FIRST_TIME, 'false');
        setTimeout(() => {
          if (Platform.OS === 'ios') {
            navigationRef.navigate(MAIN_NAV_STRINGS.INTRO as never);
          } else {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: MAIN_NAV_STRINGS.INTRO}],
              }),
            );
          }
        }, 1000);
      }
    }
  };

  // useEffect(() => {
  //   if (internetState.isConnected === false) {
  //     showCustomToast('No Internet! ❌', 'danger');
  //   } else {
  //     // showCustomToast('Connected! ✅', 'success');
  //   }
  // }, [internetState.isConnected]);
  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <ToastProvider
          placement="top"
          duration={3000}
          animationType="slide-in"
          animationDuration={250}
          successColor={COLORS.PRICE}
          dangerColor={COLORS.RED}
          warningColor={COLORS.WARNING}
          normalColor={'#424242'}
          dangerIcon={
            <MaterialIcons
              size={SIZING.scaleWidth(20)}
              name="dangerous"
              color={COLORS.WHITE}
            />
          }
          successIcon={
            <IonIcons
              size={SIZING.scaleWidth(20)}
              name="checkmark-done"
              color={COLORS.WHITE}
            />
          }
          warningIcon={
            <IonIcons
              size={SIZING.scaleWidth(20)}
              name="warning-outline"
              color={COLORS.WHITE}
            />
          }
          textStyle={{
            fontSize: SIZING.scaleFont(16),
            fontFamily: FONTS.GilroyRegular,
            paddingHorizontal: SIZING.scaleWidth(5),
          }}
          offsetTop={SIZING.scaleHeight(20)}
          swipeEnabled={true}
          style={{marginTop: SIZING.scaleHeight(50)}}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              orientation: 'portrait',
              gestureEnabled: false,
            }}>
            <Stack.Screen
              name={MAIN_NAV_STRINGS.SPLASH}
              component={SplashScreen}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.INTRO}
              component={IntroScreen}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.AUTHSTACK}
              component={AuthStack}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.MAINSTACK}
              component={MainStack}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.CART_SCREEN}
              component={CartScreen}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.PICK_COLLECT_SCREEN}
              component={PickAndCollectScreen}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.CHECKOUT}
              component={Checkout}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.ORDER_SUCCESS}
              component={OrderSuccess}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.ORDER_FAILURE}
              component={OrderFailure}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.ORDER_DETAILS}
              component={OrderDetails}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.ADDRESS_LIST}
              component={AddressList}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.ADD_ADDRESS_MAP}
              component={AddAddressMap}
            />
            <Stack.Screen
              name={MAIN_NAV_STRINGS.ADD_ADDRESS}
              component={AddAddress}
            />
            <Stack.Screen name={MAIN_NAV_STRINGS.FAQ} component={FAQ} />
            <Stack.Screen name={MAIN_NAV_STRINGS.PAYMENT} component={Payment} />
          </Stack.Navigator>
        </ToastProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default Main;

const styles = StyleSheet.create({
  gestureContainer: {flex: 1},
});

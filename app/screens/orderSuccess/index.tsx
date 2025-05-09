import React from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {CommonActions} from '@react-navigation/native';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {navigationRef} from '../../../App';

const OrderSuccess = ({route}: any) => {
  const {reason} = route.params;

  const onPressHome = () => {
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
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar animated barStyle="default" />
      <View style={styles.successIconContainer}>
        <MaterialIcons
          name="check-circle-outline"
          size={SIZING.scaleWidth(150)}
          color={COLORS.PRICE}
        />
      </View>
      <Text allowFontScaling={false} style={styles.orderSuccessText}>
        {reason.title}
      </Text>
      <Text allowFontScaling={false} style={styles.orderHeadingText}>
        {reason.message}
      </Text>
      <TouchableOpacity
        style={styles.buttonContainer}
        activeOpacity={0.5}
        onPress={onPressHome}>
        <Text allowFontScaling={false} style={styles.buttonText}>
          go home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OrderSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: SIZING.scaleHeight(50),
  },
  orderSuccessText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(24),
    marginVertical: SIZING.scaleHeight(20),
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  orderHeadingText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginHorizontal: SIZING.scaleWidth(20),
    letterSpacing: 1,
  },
  buttonContainer: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: SIZING.scaleWidth(20),
    marginHorizontal: SIZING.scaleWidth(100),
    paddingVertical: SIZING.scaleHeight(10),
    paddingHorizontal: SIZING.scaleWidth(10),
    marginTop: SIZING.scaleHeight(50),
    marginBottom: SIZING.scaleHeight(10),
  },
  buttonText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    textTransform: 'capitalize',
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(16),
  },
});

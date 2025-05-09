import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TextInput,
  TextInputProps,
  StyleProp,
  TextStyle,
  StatusBar,
} from 'react-native';
import {IMAGES} from '../../assets/images';
import {COLORS, isPlatformIos, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FastImage from 'react-native-fast-image';
import {ActivityIndicator} from 'react-native-paper';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {navigationRef} from '../../../App';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';

export const AuthWrapper = ({
  children,
  title,
  footerSubTitle,
  footerTitle,
  footerPress,
  isFromCheckout,
}: {
  children: React.ReactNode;
  title: string;
  footerTitle: string;
  footerSubTitle: string;
  footerPress: () => void;
  isFromCheckout: boolean;
}) => {
  const navigation = useNavigation();
  const isSignup = title === 'Sign up';
  const route: any = useRoute();
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        animated
        barStyle={'light-content'}
        backgroundColor={'transparent'}
      />
      {isSignup || isFromCheckout ? (
        <TouchableOpacity
          style={styles.header}
          onPress={() => navigation.goBack()}>
          <EntypoIcon
            name="chevron-thin-left"
            color={COLORS.WHITE}
            size={SIZING.scaleWidth(30)}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.header} />
      )}
      <View style={styles.curvedViewContainer}>
        <View style={styles.headingContainer}>
          <View />
          <Text style={styles.heading}>{title}</Text>
          {isSignup ? (
            <View />
          ) : route?.params?.comingFrom !== 'Checkout' ? (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                navigationRef.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{name: MAIN_NAV_STRINGS.MAINSTACK}],
                  }),
                );
              }}>
              <Text style={styles.skipHeading}>
                {route?.params?.comingFrom === 'HomePage' ? 'GoBack' : 'Skip'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
        {children}
        <View style={styles.footerContainer}>
          <Text style={styles.footerTitle}>{footerTitle} </Text>
          <TouchableOpacity activeOpacity={0.5} onPress={footerPress}>
            <Text style={styles.footerSubTitle}> {footerSubTitle} </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const AuthButtons = ({
  buttonLoading,
  handleSubmit,
  btnTitle,
  optionTitle,
  onPressGoogle,
  googleLoading,
  onAppleButtonPress,
  appleLoading,
}: {
  handleSubmit: () => void;
  buttonLoading: boolean;
  btnTitle: string;
  optionTitle: string;
  onPressGoogle: () => void;
  onAppleButtonPress: () => void;
  googleLoading: boolean;
  appleLoading: boolean;
}) => {
  return (
    <View style={styles.socialBtnContainer}>
      <TouchableOpacity
        style={styles.loginBtnContainer}
        disabled={buttonLoading}
        onPress={() => handleSubmit()}>
        {buttonLoading ? (
          <ActivityIndicator color={COLORS.WHITE} size={'small'} />
        ) : (
          <Text style={styles.loginBtnText}>{btnTitle}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.sectionContainer}>
        <View style={styles.divider} />
        <Text style={styles.logInWithTitle}>Or {optionTitle} with</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialButtonContainer}>
        {/* <TouchableOpacity style={styles.socialBtnWrapper} activeOpacity={0.5}>
          <Fontisto
            name="facebook"
            color={COLORS.PRIMARY}
            size={SIZING.scaleWidth(20)}
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.socialBtnWrapper}
          activeOpacity={0.5}
          disabled={googleLoading}
          onPress={onPressGoogle}>
          {googleLoading ? (
            <ActivityIndicator size={'small'} color={COLORS.PRIMARY} />
          ) : (
            <FastImage
              source={IMAGES.GOOGLE_ICON}
              resizeMode={FastImage.resizeMode.contain}
              style={{
                height: SIZING.scaleHeight(25),
                width: SIZING.scaleWidth(25),
              }}
            />
          )}
        </TouchableOpacity>
        {isPlatformIos && (
          <TouchableOpacity
            style={styles.socialBtnWrapper}
            activeOpacity={0.5}
            onPress={onAppleButtonPress}>
            {appleLoading ? (
              <ActivityIndicator size={'small'} color={COLORS.PRIMARY} />
            ) : (
              <Fontisto
                name="apple"
                color={COLORS.PRIMARY}
                size={SIZING.scaleWidth(20)}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const AuthField = ({
  placeholder,
  fieldProps,
  inputStyles,
  title,
  titleStyles,
}: {
  ref?: React.RefObject<TextInput>;
  placeholder: string;
  fieldProps?: TextInputProps;
  inputStyles?: StyleProp<TextStyle>;
  titleStyles?: StyleProp<TextStyle>;
  title: string;
}) => {
  return (
    <View>
      <Text style={[styles.titleStyles, titleStyles]}>{title}</Text>
      <View style={[styles.fieldContainer, inputStyles]}>
        <TextInput
          style={styles.fieldStyles}
          placeholder={placeholder}
          {...fieldProps}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
    paddingTop: SIZING.scaleHeight(120),
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25), position: 'absolute'},
  curvedViewContainer: {
    backgroundColor: COLORS.WHITE,
    width: SIZING.scaleWidth(380),
    height: SIZING.scaleHeight(730),
    borderTopLeftRadius: SIZING.scaleWidth(70),
    borderTopRightRadius: SIZING.scaleWidth(70),
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZING.scaleWidth(50),
  },
  heading: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(28),
    textAlign: 'center',
    marginTop: SIZING.scaleHeight(35),
  },
  skipHeading: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(20),
    textAlign: 'center',
    marginTop: SIZING.scaleHeight(35),
  },
  titleStyles: {
    marginLeft: SIZING.scaleWidth(20),
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(15),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(2),
  },
  socialBtnContainer: {
    marginTop: SIZING.scaleHeight(40),
  },
  loginBtnContainer: {
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: SIZING.scaleWidth(20),
    borderRadius: SIZING.scaleWidth(28),
    paddingVertical: isPlatformIos
      ? SIZING.scaleHeight(18)
      : SIZING.scaleHeight(16),
  },
  loginBtnText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(20),
    textAlign: 'center',
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZING.scaleHeight(20),
    justifyContent: 'space-between',
    paddingHorizontal: SIZING.scaleWidth(20),
  },
  divider: {
    width: SIZING.scaleWidth(110),
    backgroundColor: COLORS.DIVIDER_GRAY,
    height: SIZING.scaleHeight(1),
  },
  logInWithTitle: {
    fontFamily: FONTS.GilroyRegular,
    color: COLORS.BLACK + '90',
    fontSize: SIZING.scaleFont(16),
  },
  socialButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZING.scaleHeight(30),
    paddingHorizontal: SIZING.scaleWidth(20),
  },
  socialBtnWrapper: {
    borderColor: COLORS.DIVIDER_GRAY,
    flex: 1,
    borderWidth: SIZING.scaleWidth(1),
    paddingVertical: SIZING.scaleHeight(12),
    marginRight: SIZING.scaleWidth(10),
    borderRadius: SIZING.scaleWidth(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldContainer: {
    borderRadius: SIZING.scaleWidth(8),
    borderColor: COLORS.PRIMARY,
    borderWidth: isPlatformIos ? SIZING.scaleWidth(0.8) : SIZING.scaleWidth(1),
    marginTop: isPlatformIos ? SIZING.scaleHeight(8) : SIZING.scaleHeight(5),
    width: SIZING.scaleWidth(340),
    paddingHorizontal: isPlatformIos
      ? SIZING.scaleWidth(8)
      : SIZING.scaleWidth(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  fieldStyles: {
    paddingVertical: isPlatformIos
      ? SIZING.scaleHeight(12)
      : SIZING.scaleHeight(10),
    fontSize: SIZING.scaleFont(14),
    fontFamily: FONTS.GilroyRegular,
    width: SIZING.scaleWidth(300),
  },
  footerTitle: {
    textAlign: 'center',
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
  },
  footerSubTitle: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.LINK_BLUE,
  },
  footerContainer: {
    marginTop: SIZING.scaleHeight(90),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

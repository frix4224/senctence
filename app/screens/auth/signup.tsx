import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import {AuthButtons, AuthField, AuthWrapper} from './common';
import {useFormik} from 'formik';
import {getUniqueId} from 'react-native-device-info';
import {fcmTokeAtom} from '../../store';
import {UserInfo} from '../../customTypes/userInfo';
import {useAtomValue, useSetAtom} from 'jotai';
import {userAtom} from '../../store/auth';
import {setSecureInfo} from '../../utils/secureStore';
import {SECURE_STRINGS} from '../../utils/secureStore/strings';
import {navigationRef} from '../../../App';
import {
  CommonActions,
  StackActions,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {SignupSchema} from '../../schema/auth';
import {ErrorText} from '../../components';
import {SignupRequest} from '../../services/types/auth';
import {userSignup, userSocialSignup} from '../../services/methods';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {SocialSignupRequest} from '../../services/types/auth';
import {GOOGLE_CLIENT_ID, IOS_GOOGLE_CLIENT_ID} from '@env';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {FONTS} from '../../assets/fonts';
import appleAuth from '@invertase/react-native-apple-authentication';

const Signup = () => {
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [showGoogleLoading, setShowGoogleLoading] = useState<boolean>(false);
  const [showAppleLoading, setShowAppleLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const fcmToken = useAtomValue(fcmTokeAtom);
  const setUserInfo = useSetAtom(userAtom);
  const route: any = useRoute();
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
      iosClientId: IOS_GOOGLE_CLIENT_ID,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setErrors({
        email: '',
        password: '',
        fullName: '',
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldTouched,
    setErrors,
  } = useFormik({
    initialValues: {email: '', password: '', fullName: ''},
    onSubmit: async () => {
      setShowLoading(true);
      const UniqueId = await getUniqueId();
      try {
        const payload: SignupRequest = {
          email: values.email,
          password: values.password,
          name: values.fullName,
          device_id: UniqueId,
          device_os: Platform.OS,
          fcm_token: fcmToken,
          type: 'custom',
        };
        const signupResponse = await userSignup(payload);

        if (signupResponse.status === 200 && signupResponse.data.status) {
          const data: UserInfo = {
            email: signupResponse.data.data.user.email,
            userId: signupResponse.data.data.user.id,
            name: signupResponse.data.data.user.name,
            token: signupResponse.data.data.access_token,
            userIdentifier: signupResponse.data.data.user.user_identifier,
            mobile: signupResponse.data.data.user.mobile,
          };
          setUserInfo(data);
          await setSecureInfo(
            SECURE_STRINGS.ACCESS_TOKEN,
            signupResponse.data.data.access_token,
          );
          await setSecureInfo(SECURE_STRINGS.USER_INFO, JSON.stringify(data));
          if (route?.params?.comingFrom === 'Checkout') {
            navigationRef.dispatch(StackActions.pop(1));
            navigationRef.dispatch(StackActions.pop(1));
            navigationRef?.navigate(MAIN_NAV_STRINGS.CHECKOUT as never);
          } else {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: MAIN_NAV_STRINGS.MAINSTACK}],
              }),
            );
          }
        }
        setShowLoading(false);
      } catch (error: any) {
        showCustomToast(error.message, 'danger');
      } finally {
        setShowLoading(false);
      }
    },
    validationSchema: SignupSchema,
  });
  const onPressSignin = async () => {
    setShowGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const UniqueId = await getUniqueId();
      if (isSuccessResponse(response)) {
        const payload: SocialSignupRequest = {
          email: response.data?.user.email,
          name: response.data?.user.name as string,
          profile: response.data?.user.photo ?? '',
          provider_token: response.data.idToken as string,
          fcm_token: fcmToken,
          device_id: UniqueId,
          device_os: Platform.OS,
        };
        const socialSignUpResponse = await userSocialSignup(payload, 'google');
        if (
          socialSignUpResponse.status === 200 &&
          socialSignUpResponse.data.status
        ) {
          const data: UserInfo = {
            email: socialSignUpResponse.data.data.user.email,
            userId: socialSignUpResponse.data.data.user.id,
            name: socialSignUpResponse.data.data.user.name,
            token: socialSignUpResponse.data.data.access_token,
            userIdentifier: socialSignUpResponse.data.data.user.user_identifier,
            mobile: socialSignUpResponse.data.data.user.mobile,
          };
          setUserInfo(data);
          await setSecureInfo(
            SECURE_STRINGS.ACCESS_TOKEN,
            socialSignUpResponse.data.data.access_token,
          );
          await setSecureInfo(SECURE_STRINGS.USER_INFO, JSON.stringify(data));
          if (route?.params?.comingFrom === 'Checkout') {
            navigationRef.dispatch(StackActions.pop(1));
            navigationRef.dispatch(StackActions.pop(1));
            navigationRef?.navigate(MAIN_NAV_STRINGS.CHECKOUT as never);
          } else {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: MAIN_NAV_STRINGS.MAINSTACK}],
              }),
            );
          }
        }
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log({msg: 'in progress'});
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log({msg: 'play services not available'});
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    } finally {
      setShowGoogleLoading(false);
    }
  };

  const onAppleButtonPress = async () => {
    setShowAppleLoading(true);
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identify token returned');
      }
      const {email, fullName} = appleAuthRequestResponse;
      const UniqueId = await getUniqueId();
      if (appleAuthRequestResponse.identityToken) {
        const firstName = fullName?.givenName ?? null;
        const lastName = fullName?.familyName ?? null;
        const name =
          firstName === null && lastName === null
            ? ''
            : `${firstName ?? ''} ${lastName ?? ''}`.trim();
        const payload: SocialSignupRequest = {
          email: email ?? '',
          name: name,
          profile: '',
          provider_token: appleAuthRequestResponse.identityToken,
          fcm_token: fcmToken,
          device_id: UniqueId,
          device_os: Platform.OS,
        };
        const socialSignUpResponse = await userSocialSignup(payload, 'apple');
        if (
          socialSignUpResponse.status === 200 &&
          socialSignUpResponse.data.status
        ) {
          const data: UserInfo = {
            email: socialSignUpResponse.data.data.user.email,
            userId: socialSignUpResponse.data.data.user.id,
            name: socialSignUpResponse.data.data.user.name,
            token: socialSignUpResponse.data.data.access_token,
            userIdentifier: socialSignUpResponse.data.data.user.user_identifier,
            mobile: socialSignUpResponse.data.data.user.mobile,
          };
          setUserInfo(data);
          await setSecureInfo(
            SECURE_STRINGS.ACCESS_TOKEN,
            socialSignUpResponse.data.data.access_token,
          );
          await setSecureInfo(SECURE_STRINGS.USER_INFO, JSON.stringify(data));
          if (route?.params?.comingFrom === 'Checkout') {
            navigationRef.dispatch(StackActions.pop(1));
            navigationRef.dispatch(StackActions.pop(1));
            navigationRef?.navigate(MAIN_NAV_STRINGS.CHECKOUT as never);
          } else {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: MAIN_NAV_STRINGS.MAINSTACK}],
              }),
            );
          }
        }
      } else {
        // sign in was cancelled by user
      }
    } catch (error: any) {
      showCustomToast(error.message, 'danger');
    } finally {
      setShowAppleLoading(false);
    }
  };

  return (
    console.log('route?.params?.comingFrom', route?.params?.comingFrom),
    (
      <AuthWrapper
        isFromCheckout={false}
        title="Sign up"
        footerPress={() => navigationRef.goBack()}
        footerSubTitle="Log in"
        footerTitle="Already have an account?">
        <View style={styles.fieldWrapper}>
          <AuthField
            placeholder="Enter your Name"
            title="Name"
            fieldProps={{
              returnKeyType: 'next',
              value: values.fullName,
              onChangeText: handleChange('fullName'),
              caretHidden: false,
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              onBlur: () => {
                setFieldTouched('fullName');
              },
            }}
            inputStyles={{
              borderColor:
                touched.fullName && errors.fullName ? COLORS.RED : COLORS.GRAY,
            }}
          />
          <View style={styles.errorContainer}>
            <ErrorText error={errors.fullName} touched={touched.fullName} />
          </View>
          <AuthField
            placeholder="Enter your E-Mail Address..."
            title="Email"
            fieldProps={{
              returnKeyType: 'next',
              keyboardType: 'email-address',
              value: values.email,
              onChangeText: handleChange('email'),
              caretHidden: false,
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              onBlur: () => {
                setFieldTouched('email');
              },
            }}
            inputStyles={{
              borderColor:
                touched.email && errors.email ? COLORS.RED : COLORS.GRAY,
            }}
            titleStyles={{
              marginTop: SIZING.scaleHeight(10),
            }}
          />
          <View style={styles.errorContainer}>
            <ErrorText error={errors.email} touched={touched.email} />
          </View>

          <Text style={styles.titleStyles}>Password</Text>
          <View
            style={[
              styles.fieldContainer,
              {
                borderColor:
                  touched.password && errors.password
                    ? COLORS.RED
                    : COLORS.GRAY,
              },
            ]}>
            <TextInput
              style={styles.fieldStyles}
              placeholder="Enter your Password"
              secureTextEntry={showPassword}
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={() => setFieldTouched('password')}
              caretHidden={false}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.5}>
              <IonIcons
                name={showPassword ? 'eye-outline' : 'eye-off-sharp'}
                size={SIZING.scaleWidth(22)}
                color={COLORS.GRAY}
                style={{marginRight: SIZING.scaleWidth(3)}}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <ErrorText error={errors.password} touched={touched.password} />
          </View>
        </View>
        <AuthButtons
          buttonLoading={showLoading}
          handleSubmit={handleSubmit}
          btnTitle="Sign up"
          optionTitle="Register"
          googleLoading={showGoogleLoading}
          onPressGoogle={onPressSignin}
          appleLoading={showAppleLoading}
          onAppleButtonPress={onAppleButtonPress}
        />
      </AuthWrapper>
    )
  );
};

export default Signup;

const styles = StyleSheet.create({
  fieldWrapper: {},
  errorContainer: {marginLeft: SIZING.scaleWidth(22)},
  titleStyles: {
    marginLeft: SIZING.scaleWidth(20),
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(15),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(15),
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
});

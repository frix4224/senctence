import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAtom, useSetAtom} from 'jotai';
import {userAtom} from '../../store/auth';
import {setSecureInfo} from '../../utils/secureStore';
import {SECURE_STRINGS} from '../../utils/secureStore/strings';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import {navigationRef} from '../../../App';
import {CommonActions} from '@react-navigation/native';
import {MAIN_NAV_STRINGS, MAIN_STACK_STRINGS} from '../../navigation/constants';
import {FONTS} from '../../assets/fonts';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {
  FetchUserAddressApi,
  FetchUserProfileApi,
  UpdateUserMobileNumberApi,
  UpdateUserProfileApi,
  logoutApi,
} from '../../services/methods/home';
import {useQuery} from '@tanstack/react-query';
import {UserAddressesType} from '../../customTypes/home';
import {UserInfo} from '../../customTypes/userInfo';
import {
  cartItemsAtoms,
  collectionAndDeliveryAtom,
  selectedFacilityAtom,
} from '../../store';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {ActivityIndicator} from 'react-native-paper';
import {
  AddressFacilityType,
  UserProfileUpdateRequest,
} from '../../services/types/home';
import {EditProfileSchema} from '../../schema/auth';
import {useFormik} from 'formik';
import {ErrorText, PhoneNumberVerification} from '../../components';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {IMAGE_BASE_URL} from '@env';

const AccountScreen = ({navigation}: {navigation: any}) => {
  const [userInfo, setUserInfo] = useAtom(userAtom);
  const setFacilityId = useSetAtom(selectedFacilityAtom);
  const setCartItems = useSetAtom(cartItemsAtoms);
  const setCollectionData = useSetAtom(collectionAndDeliveryAtom);
  const setInfoItems = useSetAtom(userAtom);
  const [userAddressList, setUserAddressList] = useState<UserAddressesType[]>(
    [],
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [mobileOtp, setMobileOtp] = useState<string>('');
  const [mobileMessage, setMobileMessage] = useState<string>('');
  const [mobileNumberLoading, setMobileNumberLoading] =
    useState<boolean>(false);

  const onPressLogout = async () => {
    try {
      const logoutResponse = await logoutApi();

      if (logoutResponse.status === 200 && logoutResponse.data.status) {
      }
    } catch (error: any) {
      console.log({error: error.message});
    } finally {
      setUserInfo({
        email: '',
        mobile: '',
        name: '',
        token: '',
        userId: 0,
        userIdentifier: 0,
      });
      await setSecureInfo(SECURE_STRINGS.ACCESS_TOKEN, '');
      await setSecureInfo(SECURE_STRINGS.USER_INFO, '');
      setInfoItems({
        token: '',
        name: '',
        email: '',
        userId: 0,
        userIdentifier: 0,
        mobile: '',
      });
      setCartItems([]);
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: MAIN_NAV_STRINGS.AUTHSTACK}],
        }),
      );
    }
  };
  const {data: userAddressData, isLoading} = useQuery({
    queryKey: ['user_addresses'],
    queryFn: FetchUserAddressApi,
    refetchOnMount: true,
    refetchInterval: 30000,
  });
  const {data: userProfileData} = useQuery({
    queryKey: ['user_profile'],
    queryFn: FetchUserProfileApi,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (userProfileData?.status === 200 && userProfileData.data.status) {
      const data: UserInfo = {
        email: userProfileData.data.data.email,
        userId: userProfileData.data.data.id,
        name: userProfileData.data.data.name,
        token: userInfo?.token + '',
        userIdentifier: userProfileData.data.data.user_identifier,
        mobile: userProfileData.data.data.mobile,
      };
      setUserInfo(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token, userProfileData]);

  useEffect(() => {
    if (
      userAddressData?.status === 200 &&
      userAddressData.data.status &&
      userAddressData.data.data.address.length > 0
    ) {
      const addresses = userAddressData.data.data.address;
      const deafultAddress = addresses.filter(address => address.default === 1);
      if (deafultAddress.length > 0) {
        setFacilityId(
          (userAddressData.data.data.facility as AddressFacilityType)
            .facility_id,
        );
        setCollectionData(prev => ({
          ...prev,
          selectedAddress: deafultAddress[0],
        }));
      }

      setUserAddressList(addresses);
    } else {
      setUserAddressList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddressData]);

  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldTouched,
    isSubmitting,
    setSubmitting,
  } = useFormik({
    initialValues: {name: userInfo?.name, mobileNumber: userInfo?.mobile},
    onSubmit: async () => {
      const payload: UserProfileUpdateRequest = {
        email: userInfo?.email + '',
        mobile: values.mobileNumber + '',
        name: values.name + '',
      };
      try {
        const updateProfileResponse = await UpdateUserProfileApi(payload);
        if (
          updateProfileResponse.status === 200 &&
          updateProfileResponse.data.status
        ) {
          showCustomToast('User profile updated', 'success');
          const data: UserInfo = {
            email: updateProfileResponse.data.data.email,
            userId: updateProfileResponse.data.data.id,
            name: updateProfileResponse.data.data.name,
            token: userInfo?.token + '',
            userIdentifier: updateProfileResponse.data.data.user_identifier,
            mobile: updateProfileResponse.data.data.mobile,
          };
          setUserInfo(data);
          await setSecureInfo(SECURE_STRINGS.USER_INFO, JSON.stringify(data));
        }
      } catch (error: any) {
        showCustomToast(error.message, 'danger');
        console.log({error: error.message});
      } finally {
        setSubmitting(false);
      }
    },
    validationSchema: EditProfileSchema,
  });

  const requestMobileNumberOtp = async () => {
    if (values.mobileNumber === '') {
      showCustomToast('Please enter phone number', 'warning');
      return null;
    }
    setMobileNumberLoading(true);
    try {
      const requestOtpResponse = await UpdateUserMobileNumberApi(
        Number(values.mobileNumber),
      );

      if (requestOtpResponse.status === 200) {
        if (requestOtpResponse.data && requestOtpResponse.data.otp) {
          setMobileOtp(requestOtpResponse.data.otp + '');
          setMobileMessage(requestOtpResponse.data.message + '');
        }
        setIsModalVisible(true);
      }
    } catch (error: any) {
      showCustomToast(error.message, 'danger');
      console.log({error: error.message});
    } finally {
      setMobileNumberLoading(false);
    }
  };

  const selectedAddress = useMemo(() => {
    if (userAddressList.length > 0) {
      const filteredAddress = userAddressList.find(
        address => address.default === 1,
      );
      if (filteredAddress) {
        return filteredAddress.address;
      }
    }
    return '';
  }, [userAddressList]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <ScrollView bounces={false}>
          <View style={styles.headingContainer}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => navigation.goBack()}>
              <EntypoIcon
                name="chevron-thin-left"
                color={COLORS.PRIMARY}
                size={SIZING.scaleWidth(30)}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headingText}>Profile</Text>
            <View />
          </View>
          <View style={styles.profileContainer}>
            <FastImage
              source={IMAGES.PROFILE_ICON}
              resizeMode={FastImage.resizeMode.contain}
              style={styles.profileIcon}
            />
          </View>

          <View style={styles.addressWrapper}>
            <View style={styles.addressContainer}>
              <Text style={styles.addressTitle}>Addresses</Text>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() =>
                  navigation.navigate(MAIN_NAV_STRINGS.ADDRESS_LIST as never)
                }>
                <FastImage
                  source={IMAGES.EDIT_ICON}
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.addressIcon}
                />
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <ActivityIndicator size={'small'} color={COLORS.PRIMARY} />
            ) : (
              <Text style={styles.addressText}>{selectedAddress}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.pastOrderWrapper}
            activeOpacity={0.5}
            onPress={() =>
              navigation.navigate(MAIN_STACK_STRINGS.ORDER_SCREEN as never)
            }>
            <Text style={styles.pastOrderHeading}>Past Orders</Text>
            <IonIcons
              name="chevron-forward-outline"
              color={COLORS.PRIMARY}
              size={SIZING.scaleWidth(30)}
            />
          </TouchableOpacity>

          <Text style={styles.contactTitle}>Contact details</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldTitle}>Full Name</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={() => setFieldTouched('name')}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              importantForAutofill="no"
            />
            <View style={styles.errorContainer}>
              <ErrorText error={errors.name} touched={touched.name} />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldTitle}>Mobile Number</Text>
            <TextInput
              style={styles.inputField}
              onBlur={() => setFieldTouched('mobileNumber')}
              value={values.mobileNumber}
              onChangeText={handleChange('mobileNumber')}
              placeholder="Enter your mobile number"
            />
            <View style={styles.errorContainer}>
              <ErrorText
                error={errors.mobileNumber}
                touched={touched.mobileNumber}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldTitle}>Email</Text>
            <TextInput
              style={styles.inputField}
              editable={false}
              value={userInfo?.email}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.butonContainer}
            onPress={() => {
              userInfo?.mobile === values.mobileNumber
                ? handleSubmit()
                : requestMobileNumberOtp();
            }}>
            {isSubmitting || mobileNumberLoading ? (
              <ActivityIndicator color={COLORS.WHITE} size={'small'} />
            ) : (
              <Text style={styles.title}>save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={onPressLogout}
            style={styles.logoutContainer}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          {isPlatformIos && (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => {
                Alert.alert(
                  'Are you sure to delete your account?',
                  'By deleting your account, all your personal information and order details will be deleted.',
                  [
                    {
                      text: 'Ok',
                      onPress: () => {
                        Linking.openURL(`${IMAGE_BASE_URL}delete-request`);
                      },
                    },
                    {
                      text: 'cancel',
                      onPress: () => console.log('cancel Pressed'),
                    },
                  ],
                  {cancelable: false},
                );
              }}
              style={[
                styles.logoutContainer,
                {
                  marginTop: SIZING.scaleHeight(20),
                  marginBottom: SIZING.scaleHeight(30),
                },
              ]}>
              <Text style={styles.logoutText}>Delete Account</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <PhoneNumberVerification
          isModalVisible={isModalVisible}
          setModalVisible={setIsModalVisible}
          mobile={values.mobileNumber + ''}
          pickAndCollectonConfirm={handleSubmit}
          isPickAndCollect={true}
          mobileOtp={mobileOtp}
          messageText={mobileMessage}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isPlatformIos ? SIZING.scaleHeight(60) : SIZING.scaleHeight(50),
    backgroundColor: COLORS.WHITE,
  },
  profileContainer: {
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    width: SIZING.scaleWidth(110),
    alignSelf: 'center',
    marginTop: SIZING.scaleHeight(25),
    borderRadius: SIZING.scaleWidth(60),
    paddingVertical: SIZING.scaleHeight(8),
  },
  profileIcon: {
    width: SIZING.scaleWidth(90),
    height: SIZING.scaleHeight(90),
  },
  headingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(2),
  },
  backIcon: {marginLeft: SIZING.scaleWidth(12)},
  headingText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(22),
    color: COLORS.PRIMARY,
    alignSelf: 'center',
    flex: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
    flex: 0.2,
  },
  addressWrapper: {
    borderWidth: SIZING.scaleHeight(1),
    borderColor: COLORS.PRIMARY,
    borderRadius: SIZING.scaleWidth(20),
    marginHorizontal: SIZING.scaleWidth(20),
    marginTop: SIZING.scaleHeight(30),
    paddingVertical: SIZING.scaleHeight(15),
    paddingHorizontal: SIZING.scaleHeight(15),
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
  },
  addressIcon: {
    width: SIZING.scaleWidth(18),
    height: SIZING.scaleHeight(18),
  },
  addressText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(10),
  },
  pastOrderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: SIZING.scaleHeight(1),
    borderColor: COLORS.PRIMARY,
    borderRadius: SIZING.scaleWidth(20),
    marginHorizontal: SIZING.scaleWidth(20),
    marginTop: SIZING.scaleHeight(30),
    paddingVertical: SIZING.scaleHeight(20),
    paddingHorizontal: SIZING.scaleHeight(15),
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  pastOrderHeading: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(20),
    color: COLORS.PRIMARY,
  },
  contactTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(25),
    marginLeft: SIZING.scaleWidth(25),
  },
  fieldContainer: {
    marginTop: SIZING.scaleHeight(25),
    marginLeft: SIZING.scaleWidth(25),
  },
  fieldTitle: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(17),
    color: COLORS.PRIMARY,
  },
  inputField: {
    borderRadius: SIZING.scaleWidth(8),
    borderWidth: SIZING.scaleWidth(1),
    borderColor: COLORS.PRIMARY,
    width: SIZING.scaleWidth(320),
    marginTop: SIZING.scaleHeight(10),
    paddingHorizontal: SIZING.scaleWidth(10),
    paddingVertical: SIZING.scaleHeight(15),
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.GRAY,
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  butonContainer: {
    backgroundColor: COLORS.LINK_BLUE,
    paddingVertical: SIZING.scaleHeight(8),
    marginTop: SIZING.scaleHeight(20),
    alignSelf: 'flex-end',
    marginHorizontal: SIZING.scaleWidth(20),
    paddingHorizontal: SIZING.scaleWidth(20),
    marginBottom: SIZING.scaleHeight(20),
    alignItems: 'center',
    borderRadius: SIZING.scaleWidth(8),
    marginRight: SIZING.scaleWidth(28),
  },
  title: {
    color: COLORS.WHITE,
    fontSize: SIZING.scaleFont(18),
    textTransform: 'capitalize',
    fontFamily: FONTS.GilroySemiBold,
  },
  logoutContainer: {
    marginBottom: SIZING.scaleHeight(10),
  },
  logoutText: {
    textAlign: 'center',
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyBold,
    fontSize: SIZING.scaleFont(16),
  },
  errorContainer: {marginLeft: SIZING.scaleWidth(1)},
});

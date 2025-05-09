import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import IonIcons from 'react-native-vector-icons/Ionicons';
import OctIcons from 'react-native-vector-icons/Octicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {FONTS} from '../../assets/fonts';
import {PhoneNumberVerification} from '../../components';
import {AUTH_STACK_STRINGS, MAIN_NAV_STRINGS} from '../../navigation/constants';
import {useQuery} from '@tanstack/react-query';
import {
  FetchCollectFromApi,
  FetchSlotsApi,
  UpdateUserMobileNumberApi,
} from '../../services/methods/home';
import {ActivityIndicator} from 'react-native-paper';
import {CollectFromType, SlotsType} from '../../customTypes/home';
import {Dropdown} from 'react-native-element-dropdown';
import moment from 'moment';
import {useAtom, useAtomValue} from 'jotai';
import {collectionAndDeliveryAtom} from '../../store';
import {userAtom} from '../../store/auth';
import RNDatePicker from '@react-native-community/datetimepicker';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import EntypoIcon from 'react-native-vector-icons/Entypo';

const Header = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.goBack()}>
        <EntypoIcon
          name="chevron-thin-left"
          color={COLORS.PRIMARY}
          size={SIZING.scaleWidth(28)}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Collection & Delivery</Text>
      <View />
      <View />
    </View>
  );
};

const PickAndCollectScreen = ({navigation}: {navigation: any}) => {
  const [collectionData, setCollectionData] = useAtom(
    collectionAndDeliveryAtom,
  );

  const [selectedPickupSlot, setSelectedPickupSlot] = useState<SlotsType>();
  const [selectedDropSlot, setSelectedDropSlot] = useState<SlotsType>();

  const phoneNumberRef = useRef<TextInput>(null);

  const [mobileNumberLoading, setMobileNumberLoading] =
    useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const userInfo = useAtomValue(userAtom);
  const [mobileOtp, setMobileOtp] = useState<string>('');
  const [mobileMessage, setMobileMessage] = useState<string>('');
  const [slotsList, setSlotsList] = useState<SlotsType[]>([]);
  const [collectFromList, setCollectFromList] = useState<CollectFromType[]>([]);
  const today = moment().startOf('day');
  const endOfMonth = moment().add(30, 'day');

  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDropPicker, setShowDropPicker] = useState(false);

  const {data: userSlots} = useQuery({
    queryKey: ['user_slots'],
    queryFn: FetchSlotsApi,
    refetchOnMount: false,
  });
  const {data: collectFromData} = useQuery({
    queryKey: ['user_collects_from'],
    queryFn: FetchCollectFromApi,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (
      userSlots?.status === 200 &&
      userSlots.data.status &&
      userSlots.data.data.length > 0
    ) {
      const newData = userSlots.data.data.map(us => {
        const startTime = moment(us.start_time, 'HH:mm').format('HH:mm');
        const endTime = moment(us.end_time, 'HH:mm').format('HH:mm');
        return {
          id: us.id,
          name: `${startTime} - ${endTime}`,
          slotTime: us.start_time,
        };
      });
      setSlotsList(newData);
      setSelectedPickupSlot(newData[0]);

      setSelectedDropSlot(newData[0]);
      setCollectionData(prev => ({
        ...prev,
        selectedSlot: userSlots.data.data[0].name,
        selectedSlotTime: moment(
          userSlots.data.data[0].start_time,
          'HH:mm',
        ).format('HH:mm'),
        dropSlotTime: moment(userSlots.data.data[0].start_time, 'HH:mm').format(
          'HH:mm',
        ),
        dropSlot: userSlots.data.data[0].name,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSlots]);

  useEffect(() => {
    if (userInfo?.mobile) {
      setCollectionData(prev => ({...prev, phoneNumber: userInfo.mobile}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.mobile]);

  useEffect(() => {
    if (
      collectFromData?.status === 200 &&
      collectFromData.data.status &&
      collectFromData.data.data.length > 0
    ) {
      setCollectFromList(collectFromData.data.data);
      setCollectionData(prev => ({
        ...prev,
        schedule_collect_from: collectFromData.data.data[0],
        drop_collect_from: collectFromData.data.data[0],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectFromData]);

  useFocusEffect(
    useCallback(() => {
      setCollectionData(prev => ({
        ...prev,
        dropDate: moment().add(1, 'day').toDate(),
      }));
    }, [setCollectionData]),
  );

  const handlePickupChange = (_: any, selectedDate: any) => {
    if (selectedDate) {
      let newSelctedPickup: Date = moment().toDate();
      let newSelctedDrop: Date = moment(collectionData.dropDate).toDate();
      const newPickupDate = moment(selectedDate).startOf('day');
      newSelctedPickup = newPickupDate.toDate();

      if (moment(collectionData.dropDate).isBefore(newPickupDate)) {
        newSelctedDrop = newPickupDate.add(1, 'day').toDate();
      }
      setCollectionData(prev => ({
        ...prev,
        scheduleDate: newSelctedPickup,
        dropDate: newSelctedDrop,
      }));
    }
    setShowPickupPicker(false);
  };

  const handleDropChange = (_: any, selectedDate: any) => {
    if (selectedDate) {
      const newDropDate = moment(selectedDate).startOf('day');
      setCollectionData(prev => ({
        ...prev,
        dropDate: newDropDate.toDate(),
      }));
    }
    setShowDropPicker(false);
  };
  const onPressNext = () => {
    if (!userInfo?.userId) {
      navigation.navigate(MAIN_NAV_STRINGS.AUTHSTACK, {
        screen: AUTH_STACK_STRINGS.LOGIN,
        params: {
          comingFrom: 'Checkout',
        },
      });
      return;
    }
    if (collectionData.phoneNumber.length < 1) {
      showCustomToast('Please update your phone number', 'warning');
      return;
    }
    if (!collectionData.selectedSlot) {
      showCustomToast('Please select a pickup slot', 'warning');
      return;
    }
    if (!collectionData.schedule_collect_from.id) {
      showCustomToast('Please select collect from', 'warning');
      return;
    }
    if (!collectionData.dropSlot) {
      showCustomToast('Please select a drop slot', 'warning');
      return;
    }
    if (!collectionData.drop_collect_from.id) {
      showCustomToast('Please select collect by', 'warning');
      return;
    }
    if (
      moment(collectionData.dropDate).isSameOrBefore(
        collectionData.scheduleDate,
      )
    ) {
      showCustomToast('Please select future date for schedule drop', 'warning');
      return;
    }
    navigation.navigate(MAIN_NAV_STRINGS.CHECKOUT as never);
  };

  const requestMobileNumberOtp = async () => {
    if (!userInfo?.userId) {
      navigation.navigate(MAIN_NAV_STRINGS.AUTHSTACK, {
        screen: AUTH_STACK_STRINGS.LOGIN,
        params: {comingFrom: 'Checkout'},
      });

      return;
    }
    if (collectionData.phoneNumber === '') {
      showCustomToast('Please enter phone number', 'warning');
      return null;
    }
    setMobileNumberLoading(true);
    try {
      const requestOtpResponse = await UpdateUserMobileNumberApi(
        Number(collectionData.phoneNumber),
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
    } finally {
      setMobileNumberLoading(false);
    }
  };

  const pickUpDateValue = useMemo(() => {
    if (collectionData.scheduleDate) {
      return moment(collectionData.scheduleDate).format('DD-MMM-YYYY');
    }
    return '';
  }, [collectionData.scheduleDate]);

  const dropDateValue = useMemo(() => {
    if (collectionData.dropDate) {
      return moment(collectionData.dropDate).format('DD-MMM-YYYY');
    }

    return moment(collectionData.scheduleDate)
      .add(1, 'day')
      .format('DD-MMM-YYYY');
  }, [collectionData.dropDate, collectionData.scheduleDate]);
  const dropDateMinimumValue = useMemo(() => {
    if (collectionData.scheduleDate) {
      return moment(collectionData.scheduleDate).add(1, 'day').toDate();
    }
    return today.add(1, 'day').toDate();
  }, [collectionData.scheduleDate, today]);

  return (
    <View style={styles.container}>
      <Header />
      <KeyboardAwareScrollView onScroll={() => phoneNumberRef.current?.blur()}>
        <View
          style={[
            styles.sectionContainer,
            {marginTop: SIZING.scaleHeight(20)},
          ]}>
          <Text style={styles.sectionHeading}>Phone number</Text>
          <View style={styles.phoneNumberContainer}>
            <FastImage source={IMAGES.PHONE_ICON} style={styles.bucketIcon} />
            <View style={styles.phoneNumberWrapper}>
              <TextInput
                ref={phoneNumberRef}
                style={styles.phoneNumberText}
                allowFontScaling={false}
                keyboardType="number-pad"
                placeholder="Enter your phone number"
                returnKeyType="done"
                value={collectionData.phoneNumber}
                maxLength={10}
                onChangeText={text =>
                  setCollectionData(prev => ({...prev, phoneNumber: text}))
                }
              />
            </View>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Schedule pickup</Text>
          <TouchableOpacity
            style={styles.pickupWrapper}
            activeOpacity={0.5}
            onPress={() => setShowPickupPicker(true)}>
            <View style={styles.pickupContainer}>
              <OctIcons
                name="calendar"
                size={SIZING.scaleWidth(24)}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.pickupText}>{pickUpDateValue}</Text>
              {showPickupPicker && (
                <RNDatePicker
                  mode="date"
                  display="calendar"
                  minimumDate={today.toDate()}
                  maximumDate={endOfMonth.toDate()}
                  value={collectionData.scheduleDate}
                  onChange={handlePickupChange}
                />
              )}
            </View>
          </TouchableOpacity>
          <View
            style={[styles.pickupWrapper, {marginTop: SIZING.scaleHeight(15)}]}>
            <View style={styles.pickupContainer}>
              <MaterialCommunityIcons
                name="clock-time-three-outline"
                size={SIZING.scaleWidth(26)}
                color={COLORS.PRIMARY}
              />
              <Dropdown
                style={[styles.dropdown, {marginLeft: SIZING.scaleWidth(10)}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                renderRightIcon={() => (
                  <IonIcons
                    name="chevron-down"
                    size={SIZING.scaleWidth(22)}
                    color={COLORS.PRIMARY}
                  />
                )}
                iconColor={COLORS.WHITE}
                data={slotsList}
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder={'Select pickup slot'}
                value={selectedPickupSlot}
                onChange={item => {
                  setCollectionData(prev => ({
                    ...prev,
                    selectedSlot: item.name,
                    selectedSlotTime: moment(item.slotTime, 'HH:mm').format(
                      'HH:mm',
                    ),
                  }));
                  setSelectedPickupSlot(item);
                }}
              />
            </View>
          </View>
          <View
            style={[
              styles.pickupWrapper,
              {marginBottom: SIZING.scaleHeight(5)},
            ]}>
            <View style={styles.pickupContainer}>
              <OctIcons
                name="person"
                size={SIZING.scaleWidth(26)}
                color={COLORS.PRIMARY}
                style={{
                  marginLeft: SIZING.scaleWidth(3),
                }}
              />
              <Dropdown
                style={[styles.dropdown, {marginLeft: SIZING.scaleWidth(13)}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={{
                  fontFamily: FONTS.GilroyRegular,
                  fontSize: SIZING.scaleFont(14),
                  color: COLORS.PRIMARY,
                }}
                renderRightIcon={() => (
                  <IonIcons
                    name="chevron-down"
                    size={SIZING.scaleWidth(22)}
                    color={COLORS.PRIMARY}
                  />
                )}
                iconColor={COLORS.WHITE}
                data={collectFromList}
                maxHeight={300}
                labelField="from"
                valueField="id"
                placeholder={'Collect from'}
                value={collectionData.schedule_collect_from}
                onChange={item => {
                  setCollectionData(prev => ({
                    ...prev,
                    schedule_collect_from: item,
                  }));
                }}
              />
            </View>
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>Schedule drop</Text>
          <TouchableOpacity
            style={styles.pickupWrapper}
            activeOpacity={0.5}
            onPress={() => setShowDropPicker(true)}>
            <View style={styles.pickupContainer}>
              <OctIcons
                name="calendar"
                size={SIZING.scaleWidth(24)}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.pickupText}>{dropDateValue}</Text>
              {showDropPicker && (
                <RNDatePicker
                  mode="date"
                  display="calendar"
                  minimumDate={dropDateMinimumValue}
                  maximumDate={endOfMonth.toDate()}
                  value={collectionData.dropDate}
                  onChange={handleDropChange}
                />
              )}
            </View>
          </TouchableOpacity>
          <View
            style={[styles.pickupWrapper, {marginTop: SIZING.scaleHeight(15)}]}>
            <View style={styles.pickupContainer}>
              <MaterialCommunityIcons
                name="clock-time-three-outline"
                size={SIZING.scaleWidth(26)}
                color={COLORS.PRIMARY}
              />
              <Dropdown
                style={[styles.dropdown, {marginLeft: SIZING.scaleWidth(10)}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                renderRightIcon={() => (
                  <IonIcons
                    name="chevron-down"
                    size={SIZING.scaleWidth(22)}
                    color={COLORS.PRIMARY}
                  />
                )}
                iconColor={COLORS.WHITE}
                data={slotsList}
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder={'Select pickup slot'}
                value={selectedDropSlot}
                onChange={item => {
                  setCollectionData(prev => ({
                    ...prev,
                    dropSlot: item.name,
                    dropSlotTime: moment(item.slotTime, 'HH:mm').format(
                      'HH:mm',
                    ),
                  }));
                  setSelectedDropSlot(item);
                }}
              />
            </View>
          </View>
          <View
            style={[
              styles.pickupWrapper,
              {marginBottom: SIZING.scaleHeight(5)},
            ]}>
            <View style={styles.pickupContainer}>
              <OctIcons
                name="person"
                size={SIZING.scaleWidth(26)}
                color={COLORS.PRIMARY}
                style={{
                  marginLeft: SIZING.scaleWidth(3),
                }}
              />
              <Dropdown
                style={[styles.dropdown, {marginLeft: SIZING.scaleWidth(13)}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={{
                  fontFamily: FONTS.GilroyRegular,
                  fontSize: SIZING.scaleFont(14),
                  color: COLORS.PRIMARY,
                }}
                renderRightIcon={() => (
                  <IonIcons
                    name="chevron-down"
                    size={SIZING.scaleWidth(22)}
                    color={COLORS.PRIMARY}
                  />
                )}
                iconColor={COLORS.WHITE}
                data={collectFromList}
                maxHeight={300}
                labelField="from"
                valueField="id"
                placeholder={'Drop To'}
                value={collectionData.drop_collect_from}
                onChange={item => {
                  setCollectionData(prev => ({
                    ...prev,
                    drop_collect_from: item,
                  }));
                }}
              />
            </View>
          </View>
        </View>
        <View style={styles.devlieryNotesContainer}>
          <TextInput
            style={styles.textInputContainer}
            placeholder="Add a driver notes"
            autoComplete="off"
            autoCorrect={false}
            placeholderTextColor={COLORS.PRIMARY}
            multiline
            value={collectionData.driver_notes}
            onChangeText={text =>
              setCollectionData(prev => ({...prev, driver_notes: text}))
            }
          />
          <TextInput
            style={[
              styles.textInputContainer,
              {marginTop: SIZING.scaleHeight(10)},
            ]}
            placeholder="Add a facility notes"
            textAlignVertical="top"
            autoComplete="off"
            autoCorrect={false}
            placeholderTextColor={COLORS.PRIMARY}
            multiline
            value={collectionData.facility_notes}
            onChangeText={text =>
              setCollectionData(prev => ({...prev, facility_notes: text}))
            }
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={[
            styles.butonContainer,
            {opacity: mobileNumberLoading ? 0.6 : 1},
          ]}
          onPress={() => {
            userInfo?.mobile === collectionData.phoneNumber
              ? onPressNext()
              : requestMobileNumberOtp();
          }}>
          {mobileNumberLoading ? (
            <ActivityIndicator color={COLORS.WHITE} size={'small'} />
          ) : (
            <Text style={styles.title}>save</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <PhoneNumberVerification
        isModalVisible={isModalVisible}
        setModalVisible={setIsModalVisible}
        mobile={collectionData.phoneNumber}
        pickAndCollectonConfirm={onPressNext}
        isPickAndCollect={true}
        mobileOtp={mobileOtp}
        messageText={mobileMessage}
      />
    </View>
  );
};

export default PickAndCollectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: SIZING.scaleHeight(60),
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25), position: 'absolute'},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZING.scaleWidth(2),
    paddingHorizontal: SIZING.scaleWidth(10),
  },
  headerTitle: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(20),
  },
  sectionContainer: {
    borderRadius: SIZING.scaleWidth(10),
    borderWidth: SIZING.scaleWidth(1),
    borderColor: COLORS.PRIMARY,
    marginHorizontal: SIZING.scaleWidth(10),
    paddingVertical: SIZING.scaleHeight(10),
    marginTop: SIZING.scaleHeight(15),
  },
  sectionHeading: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    paddingHorizontal: SIZING.scaleWidth(10),
  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZING.scaleWidth(10),
    marginTop: SIZING.scaleHeight(10),
  },
  pickupText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(15),
    color: COLORS.PRIMARY,
    marginLeft: SIZING.scaleWidth(15),
    marginTop: SIZING.scaleHeight(5),
  },
  devlieryNotesContainer: {
    marginTop: SIZING.scaleHeight(15),
  },
  textInputContainer: {
    height: SIZING.scaleHeight(80),
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZING.scaleWidth(20),
    paddingVertical: SIZING.scaleHeight(8),
    paddingHorizontal: SIZING.scaleWidth(15),
    marginBottom: SIZING.scaleHeight(2),
    borderWidth: SIZING.scaleWidth(1),
    borderColor: COLORS.PRIMARY,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(14),
    marginHorizontal: SIZING.scaleWidth(10),
  },
  dropdown: {
    height: SIZING.scaleHeight(35),
    width: SIZING.scaleWidth(270),
    borderColor: COLORS.PRIMARY,
    borderWidth: SIZING.scaleWidth(1),
    borderRadius: SIZING.scaleWidth(8),
    paddingHorizontal: SIZING.scaleWidth(10),
  },
  placeholderStyle: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(15),
  },
  selectedTextStyle: {
    fontSize: SIZING.scaleFont(15),
    fontFamily: FONTS.GilroyMedium,
    color: COLORS.PRIMARY,
  },
  slotDropdownText: {
    paddingLeft: SIZING.scaleWidth(10),
    paddingVertical: SIZING.scaleHeight(10),
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SIZING.scaleWidth(5),
    marginHorizontal: SIZING.scaleWidth(5),
    width: SIZING.scaleWidth(200),
    marginTop: SIZING.scaleHeight(10),
  },
  phoneNumberWrapper: {
    borderRadius: SIZING.scaleWidth(8),
    borderWidth: SIZING.scaleWidth(1),
    borderColor: COLORS.PRIMARY,
    marginLeft: SIZING.scaleWidth(5),
    paddingVertical: isPlatformIos
      ? SIZING.scaleHeight(8)
      : SIZING.scaleHeight(0),
    paddingHorizontal: SIZING.scaleWidth(5),
    width: SIZING.scaleWidth(270),
  },
  phoneNumberText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(15),
    color: COLORS.PRIMARY,
    width: SIZING.scaleWidth(250),
  },
  butonContainer: {
    backgroundColor: COLORS.LINK_BLUE,
    paddingVertical: SIZING.scaleHeight(8),
    marginTop: SIZING.scaleHeight(10),
    alignSelf: 'flex-end',
    marginHorizontal: SIZING.scaleWidth(20),
    paddingHorizontal: SIZING.scaleWidth(20),
    marginBottom: SIZING.scaleHeight(20),
    alignItems: 'center',
    borderRadius: SIZING.scaleWidth(8),
  },
  title: {
    color: COLORS.WHITE,
    fontSize: SIZING.scaleFont(18),
    textTransform: 'capitalize',
    fontFamily: FONTS.GilroySemiBold,
  },
  bucketIcon: {
    width: SIZING.scaleWidth(25),
    height: SIZING.scaleHeight(25),
  },
});

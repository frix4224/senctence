import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MapView, {MapPressEvent, Marker, Region} from 'react-native-maps';
import {CreateAddressRequest} from '../../services/types/home';
import {useAtomValue} from 'jotai';
import {userAtom} from '../../store/auth';
import {CreateUserAddressApi} from '../../services/methods/home';
import {useQueryClient} from '@tanstack/react-query';
import {ActivityIndicator} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// import {hasNotch, getModel} from 'react-native-device-info';

const AddAddressMap = ({route, navigation}) => {
  const userInfo = useAtomValue(userAtom);
  const {place, lat, long} = route.params;

  const queryClient = useQueryClient();

  // console.log({Platform: getModel(), isNotch: hasNotch(), msg: ''});

  const [addressLoading, setAddAddressLoading] = useState<boolean>(false);

  const [currentLocation, setCurrentLocation] = useState<Region>({
    latitude: lat ?? 22.719569,
    longitude: long ?? 75.857726,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const onChangeRegion = useCallback(
    (event: MapPressEvent) => {
      setCurrentLocation({
        latitude: event.nativeEvent.coordinate.latitude,
        longitude: event.nativeEvent.coordinate.longitude,
        latitudeDelta: currentLocation.latitudeDelta,
        longitudeDelta: currentLocation.longitudeDelta,
      });
    },
    [currentLocation.latitudeDelta, currentLocation.longitudeDelta],
  );

  const onPressSave = async () => {
    if (!currentLocation.latitude || !currentLocation.longitude) {
      return showCustomToast('please select a address', 'warning');
    }
    setAddAddressLoading(true);
    const data: CreateAddressRequest = {
      user_id: Number(userInfo?.userId),
      address: place + '',
      lat: currentLocation?.latitude + '',
      long: currentLocation?.longitude + '',
      type: 'home',
      fullName: userInfo?.name + '',
    };
    try {
      const addAddressResponse = await CreateUserAddressApi(data);
      if (addAddressResponse.status === 200 && addAddressResponse.data.status) {
        showCustomToast('Address added successfully', 'success');
        queryClient.invalidateQueries({queryKey: ['user_addresses']});
        navigation.pop(2);
      }
    } catch (error: any) {
      showCustomToast(JSON.stringify(error.message), 'danger');
      console.log({error: error.message});
    } finally {
      setAddAddressLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView bounces={false}>
        <StatusBar
          animated
          barStyle={'dark-content'}
          translucent
          backgroundColor={'transparent'}
        />
        <View style={styles.wrapperContainer}>
          <View style={styles.headingContainer}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => navigation.goBack()}>
              <EntypoIcon
                name="chevron-thin-left"
                color={COLORS.PRIMARY}
                size={SIZING.scaleWidth(25)}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={styles.headingText}>Addresses</Text>
            <View />
          </View>
          <View>
            <MapView
              showsUserLocation
              onPress={onChangeRegion}
              style={styles.mapStyles}
              provider="google"
              initialRegion={currentLocation}>
              <Marker coordinate={currentLocation} />
            </MapView>
          </View>
          <Text style={styles.yourAddressTitle}>Your address</Text>
          <Text style={styles.yourAddressText}>{place}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter specifications"
              style={styles.inputStyles}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={onPressSave}
          disabled={addressLoading}
          style={styles.getStartedBtnContainer}
          activeOpacity={0.5}>
          {addressLoading ? (
            <ActivityIndicator size={'small'} color={COLORS.WHITE} />
          ) : (
            <Text style={styles.getStartedBtnText}>save</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  wrapperContainer: {
    width: SIZING.scaleWidth(380),
    height: SIZING.scaleHeight(730),
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: SIZING.scaleWidth(70),
    borderBottomRightRadius: SIZING.scaleWidth(70),
  },
  getStartedBtnContainer: {
    marginTop: SIZING.scaleHeight(20),
  },
  getStartedBtnText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    textTransform: 'capitalize',
    fontSize: SIZING.scaleFont(22),
    fontFamily: FONTS.GilroySemiBold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: SIZING.scaleWidth(5),
    marginTop: isPlatformIos ? SIZING.scaleHeight(60) : SIZING.scaleHeight(45),
  },
  headingText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(22),
    color: COLORS.PRIMARY,
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25), position: 'absolute'},
  mapStyles: {
    marginTop: SIZING.scaleHeight(25),
    height: SIZING.scaleHeight(250),
    width: SIZING.scaleWidth(370),
  },
  yourAddressTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(24),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(30),
    marginLeft: SIZING.scaleWidth(25),
  },
  yourAddressText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(15),
    marginLeft: SIZING.scaleWidth(27),
    width: SIZING.scaleWidth(330),
  },
  inputContainer: {
    marginTop: SIZING.scaleHeight(30),
    marginLeft: SIZING.scaleWidth(20),
    backgroundColor: COLORS.WHITE,
    width: SIZING.scaleWidth(330),
    borderRadius: SIZING.scaleWidth(8),
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  inputStyles: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    borderRadius: SIZING.scaleWidth(8),
    paddingVertical: SIZING.scaleHeight(12),
    paddingHorizontal: SIZING.scaleWidth(10),
    width: SIZING.scaleWidth(330),
  },
});

export default AddAddressMap;

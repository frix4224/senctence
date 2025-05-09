import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useAtom, useAtomValue} from 'jotai';
import {userAtom} from '../../store/auth';
import {useQuery} from '@tanstack/react-query';
import {FetchHomeServices} from '../../services/methods/home';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {useNavigation} from '@react-navigation/native';
import {serviceItemsAtoms} from '../../store';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {ServiceCategory} from '../../customTypes/home';
import {
  AUTH_STACK_STRINGS,
  MAIN_NAV_STRINGS,
  MAIN_STACK_STRINGS,
} from '../../navigation/constants';
import {MainLayout} from '../../components';
import {IMAGE_BASE_URL} from '@env';

const ServiceItem = ({
  item,
}: {
  item: {
    id: number;
    name: string;
    icon: string;
    image: string;
    description: string;
    service_categories: ServiceCategory[];
  };
}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.serviceItemContainer}
      activeOpacity={0.5}
      onPress={() => {
        navigation.navigate(MAIN_STACK_STRINGS.SERVICE_OVERVIEW, {
          activeServiceId: JSON.stringify(item.id),
        });
      }}>
      <View style={styles.serviceIconContainer}>
        <FastImage
          source={IMAGES.SERVICE_ICON_WRAPPER}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.serviceIconWrapper}
        />
        <FastImage
          source={{uri: IMAGE_BASE_URL + item.image}}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.serviceIcon}
        />
      </View>
      <Text style={styles.serviceItemTitle}>{item.name}</Text>
      <Text style={styles.serviceItemSubTitle}>{item.description}</Text>
    </TouchableOpacity>
  );
};
const HomeScreen = ({navigation}: {navigation: any}) => {
  const [services, setServices] = useAtom(serviceItemsAtoms);
  const {data: servicesData, isLoading} = useQuery({
    queryKey: ['services'],
    queryFn: () => FetchHomeServices(),
  });

  useEffect(() => {
    if (servicesData?.status === 200 && servicesData.data.status) {
      const servicesInfo = servicesData.data.data.services;
      setServices(servicesInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicesData]);

  const userInfoAtom = useAtomValue(userAtom);

  const todayDate = moment().format('ddd DD MMM');

  const greetingMsg = useMemo(() => {
    let msg = 'Hello';
    if (userInfoAtom?.userId) {
      msg = msg += `, ${userInfoAtom?.name}`;
      return msg;
    }
    return msg;
  }, [userInfoAtom?.userId, userInfoAtom?.name]);

  return (
    <MainLayout>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{greetingMsg}</Text>
          <Text style={styles.subText}>{todayDate}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            if (userInfoAtom?.userId) {
              navigation.navigate(MAIN_STACK_STRINGS.ACCOUNT as never);
            } else {
              navigation.navigate(MAIN_NAV_STRINGS.AUTHSTACK, {
                screen: AUTH_STACK_STRINGS.LOGIN,
                params: {
                  comingFrom: 'HomePage',
                },
              });
            }
          }}>
          <FastImage
            source={IMAGES.PROFILE_ICON}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.serviceHeading}>Services</Text>
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.PRIMARY}
          size={'large'}
          style={{marginTop: SIZING.scaleHeight(20)}}
        />
      ) : (
        <FlatList
          data={services}
          numColumns={2}
          style={{marginBottom: SIZING.scaleHeight(10)}}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <ServiceItem item={item} />}
        />
      )}
    </MainLayout>
  );
};
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: isPlatformIos ? SIZING.scaleHeight(20) : SIZING.scaleHeight(5),
  },
  welcomeText: {
    fontSize: SIZING.scaleFont(28),
    fontFamily: FONTS.GilroyRegular,
    color: COLORS.PRIMARY,
    width: SIZING.scaleWidth(270),
  },
  subText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(20),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(5),
  },
  profileIcon: {
    width: SIZING.scaleWidth(40),
    height: SIZING.scaleHeight(40),
  },
  serviceHeading: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(30),
    color: COLORS.PRIMARY,
    marginTop: isPlatformIos ? SIZING.scaleHeight(30) : SIZING.scaleHeight(50),
  },
  serviceItemContainer: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.LINK_BLUE,
    borderWidth: 1,
    width: SIZING.scaleWidth(150),
    borderRadius: SIZING.scaleWidth(20),
    paddingVertical: SIZING.scaleWidth(15),
    marginTop: SIZING.scaleHeight(15),
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    marginRight: SIZING.scaleWidth(25),
    marginBottom: SIZING.scaleHeight(5),
  },
  serviceIconContainer: {
    alignItems: 'center',
    width: SIZING.scaleWidth(100),
    height: SIZING.scaleHeight(100),
    alignSelf: 'center',
    marginTop: SIZING.scaleHeight(5),
  },
  serviceIconWrapper: {
    width: SIZING.scaleWidth(100),
    height: SIZING.scaleHeight(100),
  },
  serviceIcon: {
    width: SIZING.isSmallerDevice
      ? SIZING.scaleWidth(55)
      : SIZING.scaleWidth(65),
    height: SIZING.scaleHeight(100),
    position: 'absolute',
  },
  serviceItemTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleWidth(18),
    color: COLORS.LINK_BLUE,
    textAlign: 'center',
    marginTop: SIZING.scaleHeight(10),
  },
  serviceItemSubTitle: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleWidth(14),
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginTop: isPlatformIos ? SIZING.scaleHeight(8) : SIZING.scaleHeight(5),
    width: SIZING.scaleWidth(130),
    alignSelf: 'center',
  },
});

export default HomeScreen;

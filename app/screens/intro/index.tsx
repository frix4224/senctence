import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  ViewToken,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import {IMAGES} from '../../assets/images';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {navigationRef} from '../../../App';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {CommonActions} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

interface SliderType {
  key: string;
  title: string;
  subtitle: string;
}

const slides: SliderType[] = [
  {
    key: '1',
    title: 'Laundry Made Eazyy',
    subtitle: 'Pick a service, schedule a pickup, and relax.',
  },
  {
    key: '2',
    title: 'We Do the Work',
    subtitle: 'We pick up, clean, and deliver – fresh and on time.',
  },
  {
    key: '3',
    title: 'Homes, Hotels & More',
    subtitle: 'Perfect for families, hotels, and even sports clubs.',
  },
];

const IntroScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken<SliderType>[]}) => {
      if (viewableItems.length > 0) {
        setActiveIndex(Number(viewableItems[0].index));
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = ({item}: {item: SliderType}) => {
    return (
      <View key={item.key} style={{width: SIZING.scaleWidth(380)}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        animated
        barStyle={'dark-content'}
        translucent
        backgroundColor={'transparent'}
      />
      <View style={styles.wrapperContainer}>
        <FastImage
          source={IMAGES.FULL_LOGO}
          style={styles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
        <FlatList
          style={styles.listStyles}
          data={slides}
          renderItem={renderItem}
          keyExtractor={item => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {x: scrollX}}}],
            {useNativeDriver: false},
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        <View style={styles.dotWrapper}>
          <View />
          <View style={styles.dotContainer}>
            {slides.map((_, index) => {
              const isActive = index === activeIndex;
              return (
                <View
                  key={index.toString()}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.getStartedBtnContainer}
        activeOpacity={0.5}
        onPress={() => {
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
        }}>
        <Text style={styles.getStartedBtnText}>get started</Text>
      </TouchableOpacity>
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
  logo: {
    width: SIZING.scaleWidth(110),
    height: SIZING.scaleHeight(90),
    alignSelf: 'center',
    marginTop: SIZING.scaleHeight(50),
  },
  listStyles: {
    paddingLeft: SIZING.scaleWidth(40),
    marginTop: SIZING.scaleHeight(400),
  },
  title: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(28),
    color: COLORS.PRIMARY,
  },
  subtitle: {
    fontFamily: FONTS.GilroyLight,
    fontSize: SIZING.scaleFont(19.5),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(10),
    width: SIZING.scaleWidth(280),
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: SIZING.scaleWidth(8),
    height: SIZING.scaleHeight(7),
    borderRadius: SIZING.scaleWidth(10),
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: COLORS.PRIMARY,
    width: SIZING.scaleWidth(35),
  },
  inactiveDot: {
    backgroundColor: '#D9D9D9',
  },
  dotWrapper: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: SIZING.scaleHeight(20),
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
});

export default IntroScreen;

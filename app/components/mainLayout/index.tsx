import React, {useMemo} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, isPlatformIos, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {useAtomValue} from 'jotai';
import {cartItemsAtoms} from '../../store';
import {useNavigation} from '@react-navigation/native';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';

const MainLayout = ({children}: {children: React.ReactNode}) => {
  const cartItems = useAtomValue(cartItemsAtoms);

  const navigation = useNavigation();

  const badgeCount = useMemo(() => {
    if (cartItems.length > 0) {
      let count = 0;
      cartItems.forEach(ci => {
        ci.items.forEach(item => (count += item.quantity));
      });
      return count;
    }
    return 0;
  }, [cartItems]);
  return (
    <View style={styles.container}>
      <StatusBar
        animated
        barStyle={'dark-content'}
        translucent
        backgroundColor={'transparent'}
      />
      <View style={styles.wrapperContainer}>{children}</View>
      <View style={styles.cartContainer}>
        <Text style={styles.cartTitle}>Cart</Text>
        <TouchableOpacity
          style={styles.cartIconWrapper}
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate(MAIN_NAV_STRINGS.CART_SCREEN as never);
          }}>
          <FastImage
            source={IMAGES.CART_ICON}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.cartIcon}
          />
          {cartItems.length > 0 && (
            <View style={styles.cartCountContainer}>
              <Text style={styles.cartCount}>{badgeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MainLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  wrapperContainer: {
    width: SIZING.scaleWidth(380),
    height: SIZING.scaleHeight(700),
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: SIZING.scaleWidth(50),
    borderBottomRightRadius: SIZING.scaleWidth(50),
    paddingTop: SIZING.scaleHeight(50),
    paddingHorizontal: SIZING.scaleWidth(25),
  },
  cartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZING.scaleWidth(40),
    marginTop: SIZING.scaleHeight(25),
  },
  cartTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(28),
    color: COLORS.WHITE,
  },
  cartIconWrapper: {
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZING.scaleWidth(30),
    alignItems: 'center',
    padding: SIZING.scaleWidth(10),
  },
  cartIcon: {
    width: SIZING.scaleWidth(30),
    height: SIZING.scaleHeight(30),
    marginRight: SIZING.scaleWidth(2),
  },
  cartCountContainer: {
    backgroundColor: COLORS.LINK_BLUE,
    position: 'absolute',
    top: SIZING.scaleHeight(35),
    right: SIZING.scaleWidth(-5),
    minWidth: SIZING.scaleHeight(20),
    maxWidth: SIZING.scaleHeight(50),
    borderRadius: SIZING.scaleWidth(15),
    paddingHorizontal: isPlatformIos
      ? SIZING.scaleWidth(6.4)
      : SIZING.scaleWidth(6),
    paddingVertical: SIZING.scaleHeight(2),
    paddingTop: isPlatformIos ? SIZING.scaleHeight(5) : SIZING.scaleHeight(2),
  },
  cartCount: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(14),
    color: COLORS.WHITE,
  },
});

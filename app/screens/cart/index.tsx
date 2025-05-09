import React, {useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  UIManager,
  FlatList,
  ScrollView,
} from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {COLORS, isPlatformIos, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {useAtomValue, useSetAtom} from 'jotai';
import {cartItemsAtoms, collectionAndDeliveryAtom} from '../../store';
import {ServiceItemsType} from '../../customTypes/home';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../assets/images';
import {EmptyList} from '../../components';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RenderSubItems = ({
  items,
  itemTotal,
  serviceName,
}: {
  serviceName: string;
  items: {
    itemId: number;
    quantity: number;
    item: ServiceItemsType;
  }[];
  itemTotal: string;
}) => {
  const setCartItems = useSetAtom(cartItemsAtoms);

  const onPressDecrement = (itemId: number) => {
    setCartItems(prev => {
      return prev
        .map(service => {
          if (service.serviceName === serviceName) {
            const updatedItems = service.items
              .map(item => {
                if (item.itemId === itemId) {
                  return {
                    ...item,
                    quantity: item.quantity - 1,
                  };
                }
                return item;
              })
              .filter(item => item.quantity > 0);

            if (updatedItems.length === 0) {
              return null;
            }

            return {
              ...service,
              items: updatedItems,
            };
          }
          return service;
        })
        .filter(service => service !== null);
    });
  };

  const onPressIncrement = (itemId: number) => {
    setCartItems(prev => {
      return prev.map(service => {
        if (service.serviceName === serviceName) {
          return {
            ...service,
            items: service.items.map(item => {
              if (item.itemId === itemId) {
                return {
                  ...item,
                  quantity: item.quantity + 1,
                };
              }
              return item;
            }),
          };
        }
        return service;
      });
    });
  };

  return (
    <FlatList
      data={items}
      style={styles.subItemLisContainer}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({item, index}) => (
        <>
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>{item.item.item.name}</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.5}
                onPress={() => onPressDecrement(item.itemId)}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.countText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.5}
                onPress={() => onPressIncrement(item.itemId)}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.priceText}>€ {item.item.item.price}</Text>
          </View>
          {items.length - 1 !== index ? (
            <View style={styles.subItemSeparator} />
          ) : (
            <>
              <View style={styles.subItemTotalContainer} />
              <Text style={styles.subItemTotalText}>Total: € {itemTotal}</Text>
            </>
          )}
        </>
      )}
    />
  );
};

const RenderItem = ({
  item,
  mainIndex,
}: {
  item: {
    serviceImage: string;
    serviceName: string;
    items: {
      itemId: number;
      quantity: number;
      item: ServiceItemsType;
    }[];
  };
  mainIndex: number;
}) => {
  const cartItems = useAtomValue(cartItemsAtoms);

  const totalItemPrice = useMemo(() => {
    if (cartItems.length > 0) {
      let total = 0;
      const findIndex = cartItems.findIndex(
        ci => ci.serviceName === item.serviceName,
      );
      if (findIndex > -1) {
        cartItems[findIndex].items.forEach(cartItem => {
          total += cartItem.quantity * cartItem.item.item.price;
        });
      }

      return total;
    }
    return '0';
  }, [cartItems, item.serviceName]);

  return (
    <>
      <View
        style={[
          styles.itemContainer,
          {
            paddingTop:
              mainIndex === 0 ? SIZING.scaleHeight(10) : SIZING.scaleHeight(20),
          },
        ]}>
        <View>
          <View style={styles.itemRowContainer}>
            <View style={styles.itemRowWrapper}>
              <View style={styles.serviceIconContainer}>
                <FastImage
                  source={IMAGES.SERVICE_ICON_WRAPPER}
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.serviceIconWrapper}
                />
                <FastImage
                  source={{uri: item.serviceImage}}
                  resizeMode={FastImage.resizeMode.contain}
                  style={styles.serviceIcon}
                />
              </View>
            </View>
            <View style={styles.itemRowSupport} />
          </View>
          <View style={styles.itemRowTitle}>
            <Text style={styles.title}>{item.serviceName}</Text>
          </View>
        </View>
      </View>
      <RenderSubItems
        items={item.items}
        itemTotal={totalItemPrice + ''}
        serviceName={item.serviceName}
      />
    </>
  );
};

const CartList = ({navigation}: {navigation: any}) => {
  const cartItems = useAtomValue(cartItemsAtoms);
  const setCollectionData = useSetAtom(collectionAndDeliveryAtom);

  const totalPrice = useMemo(() => {
    if (cartItems.length > 0) {
      let total = 0;
      cartItems.forEach(ci => {
        ci.items.forEach(item => {
          total += item.quantity * item.item.item.price;
        });
      });
      return total;
    }
    return '0';
  }, [cartItems]);

  useFocusEffect(
    useCallback(() => {
      setCollectionData({
        selectedAddress: {
          id: 0,
          user_id: 0,
          lat: 0,
          long: 0,
          default: 0,
          address: '',
          type: '',
          created_at: '',
        },
        scheduleDate: moment().toDate(),
        selectedSlot: '',
        selectedSlotTime: '',
        schedule_collect_from: {id: 0, from: ''},
        dropDate: moment().toDate(),
        dropSlot: '',
        dropSlotTime: '',
        drop_collect_from: {id: 0, from: ''},
        driver_notes: '',
        facility_notes: '',
        phoneNumber: '',
      });
    }, [setCollectionData]),
  );

  return (
    <View style={styles.container}>
      <StatusBar
        animated
        barStyle={'dark-content'}
        translucent
        backgroundColor={'transparent'}
      />
      <ScrollView bounces={false}>
        <View>
          <View style={styles.topContainer}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => navigation.goBack()}>
              <EntypoIcon
                name="chevron-thin-left"
                color={COLORS.PRIMARY}
                size={SIZING.scaleWidth(30)}
                style={styles.backIconStyles}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.heading}>Cart</Text>
          <View>
            <FlatList
              data={cartItems}
              ListEmptyComponent={
                <EmptyList
                  title="No items found"
                  textStyle={{
                    color: COLORS.WHITE,
                    marginTop: SIZING.scaleHeight(50),
                  }}
                />
              }
              keyExtractor={item => item.serviceName}
              renderItem={({item, index}) => (
                <RenderItem item={item} mainIndex={index} />
              )}
            />
          </View>
          {cartItems.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total: </Text>
                <Text style={styles.totalCountText}>€ {totalPrice}</Text>
              </View>
            </>
          )}
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(MAIN_NAV_STRINGS.PICK_COLLECT_SCREEN as never)
            }
            activeOpacity={0.5}
            style={[
              styles.nextBtnContainer,
              {
                backgroundColor:
                  cartItems.length < 1 ? 'rgba(255,255,255,0.8)' : COLORS.WHITE,
              },
            ]}
            disabled={cartItems.length < 1}>
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'space-between',
    paddingBottom: SIZING.scaleHeight(30),
  },
  topContainer: {
    backgroundColor: COLORS.WHITE,
    height: SIZING.scaleHeight(100),
    borderBottomLeftRadius: SIZING.scaleWidth(30),
    borderBottomRightRadius: SIZING.scaleWidth(30),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: isPlatformIos ? SIZING.scaleHeight(20) : SIZING.scaleHeight(5),
    marginLeft: SIZING.scaleWidth(-10),
  },
  backIconStyles: {
    marginLeft: SIZING.scaleWidth(25),
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZING.scaleHeight(15),
    marginHorizontal: SIZING.scaleWidth(40),
    alignSelf: 'flex-end',
  },
  totalText: {
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.WHITE,
    fontSize: SIZING.scaleFont(32),
  },
  totalCountText: {
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.WHITE,
    fontSize: SIZING.scaleFont(28),
  },
  divider: {
    height: SIZING.scaleHeight(0.7),
    width: SIZING.scaleWidth(150),
    backgroundColor: COLORS.WHITE,
    marginTop: SIZING.scaleHeight(30),
    marginLeft: SIZING.scaleWidth(50),
    alignSelf: 'flex-end',
    marginHorizontal: SIZING.scaleWidth(40),
  },
  nextBtnContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SIZING.scaleWidth(20),
    borderRadius: SIZING.scaleWidth(35),
    paddingVertical: SIZING.scaleHeight(18),
    marginTop: SIZING.scaleHeight(30),
    marginBottom: SIZING.scaleHeight(20),
  },
  nextBtnText: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(20),
  },
  heading: {
    marginLeft: SIZING.scaleWidth(10),
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(30),
    color: COLORS.WHITE,
    marginTop: SIZING.scaleHeight(40),
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZING.scaleWidth(10),
    paddingTop: SIZING.scaleHeight(40),
  },
  title: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(24),
    color: COLORS.LINK_BLUE,
  },
  serviceIconContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SIZING.scaleHeight(5),
    borderColor: COLORS.LINK_BLUE,
    borderWidth: SIZING.scaleWidth(1.5),
    borderRadius: SIZING.scaleWidth(28),
    height: SIZING.isSmallerDevice
      ? SIZING.scaleHeight(49)
      : SIZING.scaleHeight(48),
    width: SIZING.isSmallerDevice
      ? SIZING.scaleWidth(40)
      : SIZING.scaleWidth(48),
  },
  serviceIconWrapper: {
    width: SIZING.isSmallerDevice
      ? SIZING.scaleWidth(40)
      : SIZING.scaleWidth(45),
    height: SIZING.scaleHeight(45),
  },
  serviceIcon: {
    width: SIZING.scaleWidth(30),
    height: SIZING.scaleHeight(45),
    position: 'absolute',
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZING.scaleHeight(5),
  },
  itemText: {
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    width: SIZING.scaleWidth(180),
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SIZING.scaleWidth(80),
  },
  button: {
    borderColor: COLORS.PRIMARY,
    borderWidth: SIZING.scaleWidth(2),
    paddingHorizontal: SIZING.scaleWidth(5),
    paddingVertical: SIZING.scaleWidth(1),
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    borderRadius: SIZING.scaleWidth(5),
  },
  buttonText: {
    fontSize: SIZING.scaleFont(21),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
  },
  countText: {
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
  },
  priceText: {
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    width: SIZING.scaleWidth(50),
  },
  itemRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: SIZING.scaleWidth(8),
  },
  itemRowWrapper: {
    backgroundColor: COLORS.WHITE,
    padding: SIZING.scaleWidth(10),
    borderTopLeftRadius: SIZING.scaleWidth(20),
    borderTopRightRadius: SIZING.scaleWidth(20),
  },
  itemRowSupport: {
    backgroundColor: COLORS.PRIMARY,
    width: SIZING.scaleWidth(250),
    height: SIZING.scaleHeight(20),
    borderBottomLeftRadius: SIZING.scaleWidth(10),
    marginTop: SIZING.scaleHeight(50),
  },
  itemRowTitle: {
    paddingTop: SIZING.scaleHeight(20),
    backgroundColor: COLORS.WHITE,
    marginTop: SIZING.scaleHeight(-2),
    paddingLeft: SIZING.scaleWidth(12),
    borderTopRightRadius: SIZING.scaleWidth(20),
    width: SIZING.scaleWidth(355),
  },
  subItemLisContainer: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SIZING.scaleWidth(10),
    marginTop: SIZING.scaleHeight(-1),
    borderBottomLeftRadius: SIZING.scaleWidth(20),
    borderBottomRightRadius: SIZING.scaleWidth(20),
    paddingLeft: SIZING.scaleWidth(10),
    paddingRight: SIZING.scaleWidth(10),
    paddingBottom: SIZING.scaleHeight(20),
    paddingTop: SIZING.scaleHeight(10),
  },
  subItemSeparator: {
    backgroundColor: COLORS.DIVIDER_GRAY,
    height: SIZING.scaleHeight(0.5),
    width: SIZING.scaleHeight(310),
    marginVertical: SIZING.scaleHeight(10),
    marginHorizontal: SIZING.scaleWidth(10),
  },
  subItemTotalContainer: {
    backgroundColor: COLORS.DIVIDER_GRAY,
    height: SIZING.scaleHeight(0.6),
    width: SIZING.scaleHeight(140),
    marginVertical: SIZING.scaleHeight(10),
    marginHorizontal: SIZING.scaleWidth(10),
    alignSelf: 'flex-end',
  },
  subItemTotalText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(20),
    color: COLORS.PRIMARY,
    alignSelf: 'flex-end',
    marginHorizontal: SIZING.scaleWidth(40),
  },
});

export default CartList;

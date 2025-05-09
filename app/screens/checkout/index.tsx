import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {ActivityIndicator, Divider} from 'react-native-paper';
import {COLORS, showCustomToast, SIZING} from '../../utils';
import {EmptyList, OrderButton} from '../../components';
import {FONTS} from '../../assets/fonts';
import {IMAGES} from '../../assets/images';
import {
  CreateCODOrderApi,
  CreateOnlineOrderApi,
  fetchCostBreakUp,
  FetchUserAddressApi,
} from '../../services/methods/home';
import {
  AddressFacilityType,
  CostBreakupRequest,
  PlaceCODOrderRequest,
  PlaceOnlineOrderRequest,
} from '../../services/types/home';
import {useNavigation} from '@react-navigation/native';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {userAtom} from '../../store/auth';
import {
  cartItemsAtoms,
  collectionAndDeliveryAtom,
  orderDataAtom,
  paymentDataAtom,
  selectedFacilityAtom,
} from '../../store';
import moment from 'moment';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FullScreenLoader from '../../components/fullScreenLoader';

const BreakdownItem = ({label, amount}: {label: string; amount: string}) => (
  <View style={styles.breakdownItem}>
    <Text style={styles.breakdownLabel}>{label}</Text>
    <Text style={styles.breakdownLabel}>{amount}</Text>
  </View>
);
const EmptyAddress = 'No address selected';

const Header = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity activeOpacity={0.5} onPress={() => navigation.goBack()}>
        <EntypoIcon
          name="chevron-thin-left"
          color={COLORS.PRIMARY}
          size={SIZING.scaleWidth(25)}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Checkout</Text>
      <View />
    </View>
  );
};

export default function Checkout({navigation}: {navigation: any}) {
  const [showCODLoading, setShowCODLoading] = useState<boolean>(false);
  const [showOnlineLoading, setShowOnlineLoading] = useState<boolean>(false);
  const [costBreakUpLoading, setCostBreakUpLoading] = useState<boolean>(false);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [costBreakUp, setCostBreakUp] = useState<
    {
      key: string;
      value: string;
      label: string;
    }[]
  >([]);
  const userInfo = useAtomValue(userAtom);
  const [cartItems, setCartItems] = useAtom(cartItemsAtoms);
  const setPaymentData = useSetAtom(paymentDataAtom);
  const setOrderData = useSetAtom(orderDataAtom);
  const [facilityId, setFacilityId] = useAtom(selectedFacilityAtom);

  const queryClient = useQueryClient();

  const [collectionData, setCollectionData] = useAtom(
    collectionAndDeliveryAtom,
  );

  const {data: userAddressData, isLoading} = useQuery({
    queryKey: ['user_addresses'],
    queryFn: FetchUserAddressApi,
    enabled: Boolean(userInfo?.userId),
  });

  const finalCartItems = useMemo(() => {
    if (cartItems.length > 0) {
      const newData: {
        item_id: number;
        item_name: string;
        amount: number;
        quantity: number;
        service_id: number;
        category_id: number;
        service_name: string;
        category_name: string;
      }[] = [];
      cartItems.forEach(ci => {
        ci.items.forEach(item => {
          newData.push({
            item_id: item.item.item_id,
            item_name: item.item.item.name,
            amount: item.item.item.price,
            quantity: item.quantity,
            service_id: item.itemId,
            service_name: ci.serviceName,
            category_id: item.item.service_category_id,
            category_name: item.category,
          });
        });
      });
      return newData;
    }
    return [];
  }, [cartItems]);

  useEffect(() => {
    const costBreakupCalculation = async () => {
      if (cartItems.length > 0) {
        setCostBreakUpLoading(true);
        const payload: CostBreakupRequest[] = [];
        try {
          cartItems.map(ci => {
            ci.items.map(i => {
              payload.push({
                item_id: i.item.item_id,
                qty: i.quantity,
              });
            });
          });

          const breakUpResponse = await fetchCostBreakUp(payload);
          if (breakUpResponse.status === 201 && breakUpResponse.data.status) {
            setGrandTotal(breakUpResponse.data.data.grand_total);
            setSubTotal(breakUpResponse.data.data.sub_total);
            setCostBreakUp(breakUpResponse.data.data.cost_breakup);
          }
        } catch (error: any) {
          console.log({error: error});
        } finally {
          setCostBreakUpLoading(false);
        }
      }
    };
    costBreakupCalculation();
  }, [cartItems]);

  const onPressCheckoutCODOrder = async () => {
    if (!userInfo?.userId) {
      showCustomToast('please login or sign up first!', 'warning');
      return;
    }
    if (selectedAddress === EmptyAddress) {
      showCustomToast('please select an address first', 'warning');
      return;
    }
    if (facilityId === 0 || !facilityId) {
      showCustomToast(
        "Sorry, we're not providing services in selected address",
        'warning',
      );
      return;
    }
    setShowCODLoading(true);
    try {
      const payload: PlaceCODOrderRequest = {
        facility_id: facilityId,
        user_id: Number(userInfo?.userId),
        mobile: collectionData.phoneNumber,
        user_address_id: collectionData.selectedAddress.id,
        sub_total: subTotal,
        total_amount: grandTotal,
        payment_method: 'COD',
        driver_notes: collectionData.driver_notes,
        payment_id: '',
        transaction_id: 0,
        facility_notes: collectionData.facility_notes,
        schedule: {
          pickup: {
            date: pickupDate,
            slot: collectionData.selectedSlot,
            time: collectionData.selectedSlotTime,
            collect_from: collectionData.schedule_collect_from.from,
            collect_from_id: collectionData.schedule_collect_from.id,
          },
          drop: {
            date: dropDate,
            slot: collectionData.dropSlot,
            time: collectionData.dropSlotTime,
            collect_from: collectionData.drop_collect_from.from,
            collect_from_id: collectionData.drop_collect_from.id,
          },
        },

        items: finalCartItems,
      };

      const placeOrderResponse = await CreateCODOrderApi(payload);
      if (placeOrderResponse.status === 201 && placeOrderResponse.data.status) {
        navigation.navigate(MAIN_NAV_STRINGS.ORDER_SUCCESS as never, {
          reason: placeOrderResponse.data.message,
        });
        queryClient.invalidateQueries({queryKey: ['user_orders']});
        setCartItems([]);
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
      }
    } catch (error: any) {
      console.log({error: error.message});
      showCustomToast(JSON.stringify(error), 'danger');
    } finally {
      setShowCODLoading(false);
    }
  };
  const onPressCheckoutOnlineOrder = async () => {
    if (!userInfo?.userId) {
      showCustomToast('please login or sign up first!', 'warning');
      return;
    }
    if (selectedAddress === EmptyAddress) {
      showCustomToast('please select an address first', 'warning');
      return;
    }
    if (facilityId === 0 || !facilityId) {
      showCustomToast(
        "Sorry, we're not providing services in selected address",
        'warning',
      );
      return;
    }
    setShowOnlineLoading(true);
    try {
      const payload: PlaceOnlineOrderRequest = {
        amount: grandTotal + '',
      };
      const placeOrderResponse = await CreateOnlineOrderApi(payload);
      if (placeOrderResponse.status === 200 && placeOrderResponse.data.status) {
        setPaymentData({
          paymentId: placeOrderResponse.data.data.payment_id,
          payment_transaction_id: 0,
        });
        setOrderData({
          facilityId: facilityId,
          orderTotal: Number(subTotal),
          grandTotal: Number(grandTotal),
          pickupDate: pickupDate,
          dropDate: dropDate,
        });
        navigation.navigate(MAIN_NAV_STRINGS.PAYMENT as never, {
          checkout_url: placeOrderResponse.data.data.checkout_url,
        });
      }
    } catch (error: any) {
      console.log({error: error.message});
    } finally {
      setShowOnlineLoading(false);
    }
  };

  const pickupDate = useMemo(() => {
    if (collectionData.scheduleDate) {
      const date = moment(collectionData.scheduleDate).format('DD/MM/YYYY');
      return date;
    }
    return '';
  }, [collectionData.scheduleDate]);

  const dropDate = useMemo(() => {
    if (collectionData.dropDate) {
      const date = moment(collectionData.dropDate).format('DD/MM/YYYY');
      return date;
    }
    return '';
  }, [collectionData.dropDate]);

  const selectedAddress = useMemo(() => {
    if (
      userAddressData &&
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
      return deafultAddress.length > 0
        ? deafultAddress[0].address
        : EmptyAddress;
    }
    return EmptyAddress;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddressData]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <Header />
        <TouchableOpacity
          style={styles.addressContainer}
          disabled={isLoading}
          activeOpacity={0.5}
          onPress={() => {
            if (userInfo?.userId) {
              navigation.navigate(MAIN_NAV_STRINGS.ADDRESS_LIST as never);
            } else {
              showCustomToast('please login or sign up first!', 'warning');
            }
          }}>
          {isLoading ? (
            <ActivityIndicator
              color={COLORS.PRIMARY}
              size={'small'}
              style={{
                marginLeft: SIZING.scaleWidth(150),
                marginVertical: SIZING.scaleHeight(10),
              }}
            />
          ) : (
            <Text style={styles.addressText}>{selectedAddress}</Text>
          )}
          <IonIcons
            name="location-outline"
            size={SIZING.scaleWidth(24)}
            color={COLORS.GRAY}
          />
        </TouchableOpacity>

        <View
          style={[styles.deliveryWrapper, {marginTop: SIZING.scaleHeight(15)}]}>
          <View style={styles.deliveryContainer}>
            <FastImage source={IMAGES.PHONE_ICON} style={styles.bucketIcon} />
            <Text style={styles.deliveryText}>
              Phone Number: {collectionData.phoneNumber}
            </Text>
          </View>
        </View>
        <View style={styles.deliveryWrapper}>
          <View style={styles.deliveryContainer}>
            <FastImage source={IMAGES.BAG_ICON} style={styles.bucketIcon} />
            <Text style={styles.deliveryText}>
              Pick up on {pickupDate}, {collectionData.selectedSlotTime}
            </Text>
          </View>
        </View>
        <View style={styles.deliveryWrapper}>
          <View style={styles.deliveryContainer}>
            <FastImage source={IMAGES.BAG_ICON} style={styles.bucketIcon} />
            <Text style={styles.deliveryText}>
              Delivered on {dropDate}, {collectionData.dropSlotTime}
            </Text>
          </View>
        </View>

        <Divider style={{marginTop: SIZING.scaleHeight(10)}} />

        <Text style={styles.sectionTitle}>Items in order</Text>
        <FlatList
          data={cartItems}
          style={{
            marginTop: SIZING.scaleHeight(10),
          }}
          renderItem={({item}) => {
            const totalItemPrice = () => {
              let total = 0;
              item.items.forEach(i => {
                total += i.item.item.price * i.quantity;
              });
              return total;
            };
            return (
              <View style={styles.itemContainer} key={item.serviceName}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                  <Text style={styles.itemTitle}>{item.serviceName}</Text>
                </View>
                <Text style={styles.itemPrice}>€ {totalItemPrice()}</Text>
              </View>
            );
          }}
        />

        <Divider style={{marginTop: SIZING.scaleHeight(10)}} />

        <View style={styles.orderTotalContainer}>
          <Text style={styles.orderTotalText}>Order total</Text>
          <Text style={styles.orderTotalAmount}>€ {subTotal}</Text>
        </View>

        {/* Charges Breakdown */}
        <View style={styles.breakdownContainer}>
          <FlatList
            data={costBreakUp}
            ListEmptyComponent={<EmptyList title="No Cost Break Up found" />}
            renderItem={({item}) => {
              return (
                <BreakdownItem
                  key={item.key}
                  label={item.label}
                  amount={item.value}
                />
              );
            }}
          />
          <BreakdownItem label="Final Total" amount={`€ ${grandTotal}`} />
        </View>
      </ScrollView>
      <View style={{marginTop: SIZING.scaleHeight(20)}}>
        <OrderButton
          onPress={onPressCheckoutCODOrder}
          title="Pay (Cash)"
          loading={showCODLoading}
        />
        <OrderButton
          onPress={onPressCheckoutOnlineOrder}
          title="Pay (Online)"
          loading={showOnlineLoading}
        />
      </View>
      <FullScreenLoader
        isLoading={costBreakUpLoading}
        text={"please wait\n while we're are fetching the cost break up"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: SIZING.scaleHeight(60),
  },
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
    marginLeft: SIZING.scaleWidth(-30),
  },
  subHeaderText: {
    fontSize: SIZING.scaleFont(3.2),
    fontFamily: FONTS.GilroyRegular,
    color: '#0C2638',
    marginTop: SIZING.scaleHeight(1),
    width: SIZING.scaleWidth(80),
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZING.scaleHeight(10),
    marginBottom: SIZING.scaleHeight(10),
    marginHorizontal: SIZING.scaleWidth(17),
  },
  addressText: {
    fontSize: SIZING.scaleFont(19),
    width: SIZING.scaleWidth(280),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.PRIMARY,
    lineHeight: 30,
  },
  pinText: {
    fontSize: SIZING.scaleFont(3.2),
    fontFamily: FONTS.GilroyRegular,
    color: '#666',
    marginTop: SIZING.scaleHeight(1),
  },
  deliveryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZING.scaleHeight(1),
    marginHorizontal: SIZING.scaleWidth(5),
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZING.scaleHeight(5),
    marginHorizontal: SIZING.scaleWidth(12),
  },
  deliveryText: {
    fontSize: SIZING.scaleFont(17.5),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    marginHorizontal: SIZING.scaleWidth(10),
  },
  bucketIcon: {
    width: SIZING.scaleWidth(27),
    height: SIZING.scaleHeight(27),
  },
  sectionTitle: {
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroySemiBold,
    marginVertical: SIZING.scaleHeight(1),
    marginTop: SIZING.scaleHeight(20),
    marginHorizontal: SIZING.scaleWidth(17),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZING.scaleWidth(10),
    paddingVertical: SIZING.scaleHeight(5),
  },
  itemCard: {
    borderRadius: SIZING.scaleWidth(2),
    overflow: 'hidden',
  },
  itemImage: {
    width: SIZING.scaleWidth(10),
    height: SIZING.scaleHeight(5),
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  itemTitle: {
    fontSize: SIZING.scaleFont(22),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.LINK_BLUE,
    width: SIZING.scaleWidth(235),
  },
  itemDetails: {
    fontSize: SIZING.scaleFont(3.2),
    fontFamily: FONTS.GilroyRegular,
    color: '#666',
  },
  itemPrice: {
    fontSize: SIZING.scaleFont(22),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.PRIMARY,
  },
  learnMoreButton: {
    marginTop: SIZING.scaleHeight(1),
    paddingHorizontal: SIZING.scaleWidth(17),
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#1E88E5',
    fontSize: SIZING.scaleFont(3.5),
    marginLeft: SIZING.scaleWidth(2),
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SIZING.scaleHeight(10),
    marginTop: SIZING.scaleHeight(15),
    marginLeft: SIZING.scaleWidth(15),
    marginRight: SIZING.scaleWidth(8),
  },
  orderTotalText: {
    fontSize: SIZING.scaleFont(23),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.PRIMARY,
  },
  orderTotalAmount: {
    fontSize: SIZING.scaleFont(23),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.PRIMARY,
  },
  howItWorksButton: {
    backgroundColor: '#09467222',
    marginVertical: SIZING.scaleHeight(2),
    width: SIZING.scaleWidth(40),
    borderRadius: SIZING.scaleWidth(2),
    marginLeft: SIZING.scaleWidth(5),
  },
  breakdownContainer: {
    marginVertical: SIZING.scaleHeight(10),
    marginHorizontal: SIZING.scaleWidth(15),
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZING.scaleHeight(6),
  },
  breakdownLabel: {
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
  },
  boldText: {
    fontFamily: FONTS.GilroyBold,
  },
  backButttonContainer: {
    backgroundColor: COLORS.GRAY,
    borderRadius: SIZING.scaleWidth(2),
    width: SIZING.scaleWidth(10),
    marginLeft: SIZING.scaleWidth(5),
    paddingVertical: SIZING.scaleHeight(0.7),
    alignItems: 'center',
    marginTop: SIZING.scaleHeight(5),
  },
  mapIcon: {
    height: SIZING.scaleHeight(10),
    width: SIZING.scaleWidth(10),
  },
  serviceIconContainer: {
    alignItems: 'center',
    width: SIZING.scaleWidth(50),
    height: SIZING.scaleHeight(50),
    marginRight: SIZING.scaleWidth(8),
  },
  serviceIconWrapper: {
    width: SIZING.scaleWidth(45),
    height: SIZING.scaleHeight(45),
    backgroundColor: COLORS.WHITE,
  },
  serviceIcon: {
    width: SIZING.scaleWidth(30),
    height: SIZING.scaleHeight(45),
    position: 'absolute',
  },
});

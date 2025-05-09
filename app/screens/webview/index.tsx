import React, {useMemo, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import WebView, {WebViewNavigation} from 'react-native-webview';
import {SIZING} from '../../utils';
import {useAtom, useAtomValue} from 'jotai';
import {
  cartItemsAtoms,
  collectionAndDeliveryAtom,
  orderDataAtom,
  paymentDataAtom,
} from '../../store';
import {navigationRef} from '../../../App';
import {PlaceCODOrderRequest} from '../../services/types/home';
import {userAtom} from '../../store/auth';
import {VerifyOnlinePaymentApi} from '../../services/methods/home';
import {CommonActions} from '@react-navigation/native';
import moment from 'moment';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {useQueryClient} from '@tanstack/react-query';
import FullScreenLoader from '../../components/fullScreenLoader';

const Payment = ({route, navigation}: any) => {
  const checkout_url: string = route?.params?.checkout_url;
  const [showVerifyPaymentLoading, setShowVerifyPaymentLoading] =
    useState<boolean>(false);
  const [paymentData, setPaymentData] = useAtom(paymentDataAtom);
  const [orderData, setOrderData] = useAtom(orderDataAtom);
  const [collectionData, setCollectionData] = useAtom(
    collectionAndDeliveryAtom,
  );
  const userInfo = useAtomValue(userAtom);
  const [cartItems, setCartItems] = useAtom(cartItemsAtoms);
  const queryClient = useQueryClient();
  const isPaymentDone = useRef<boolean>(false);

  const finalCartItems = useMemo(() => {
    if (cartItems.length > 0) {
      const newData: {
        item_id: number;
        item_name: string;
        amount: number;
        quantity: number;
        service_id: number;
        category_id: number;
      }[] = [];
      cartItems.forEach(ci => {
        ci.items.forEach(item => {
          newData.push({
            item_id: item.item.item_id,
            item_name: item.item.item.name,
            amount: item.item.item.price,
            quantity: item.quantity,
            service_id: item.itemId,
            category_id: item.item.service_category_id,
          });
          // newData.push(item);
        });
      });
      return newData;
    }
    return [];
  }, [cartItems]);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const {url} = navState;
    if (url.includes('payment/success') && isPaymentDone.current === false) {
      isPaymentDone.current = true;
      setShowVerifyPaymentLoading(true);
      setTimeout(async () => {
        const payload: PlaceCODOrderRequest = {
          facility_id: Number(orderData.facilityId),
          user_id: Number(userInfo?.userId),
          mobile: collectionData.phoneNumber,
          user_address_id: collectionData.selectedAddress.id,
          sub_total: orderData.orderTotal,
          total_amount: orderData.grandTotal,
          payment_method: 'ONLINE',
          driver_notes: collectionData.driver_notes,
          payment_id: paymentData.paymentId,
          transaction_id: parseInt(url.split('transaction_id=')[1], 10),
          facility_notes: collectionData.facility_notes,
          schedule: {
            pickup: {
              date: orderData?.pickupDate + '',
              slot: collectionData.selectedSlot,
              time: collectionData.selectedSlotTime,
              collect_from: collectionData.schedule_collect_from.from,
              collect_from_id: collectionData.schedule_collect_from.id,
            },
            drop: {
              date: orderData.dropDate,
              slot: collectionData.dropSlot,
              time: collectionData.dropSlotTime,
              collect_from: collectionData.drop_collect_from.from,
              collect_from_id: collectionData.drop_collect_from.id,
            },
          },

          items: finalCartItems,
        };

        try {
          const verifyPaymentResponse = await VerifyOnlinePaymentApi(payload);
          if (
            verifyPaymentResponse.status === 201 &&
            verifyPaymentResponse.data.status
          ) {
            setCartItems([]);
            setPaymentData({payment_transaction_id: 0, paymentId: ''});
            navigation.navigate(MAIN_NAV_STRINGS.ORDER_SUCCESS as never, {
              reason: verifyPaymentResponse.data.message,
            });
            queryClient.invalidateQueries({queryKey: ['user_orders']});
            setOrderData({
              facilityId: 0,
              orderTotal: 0,
              grandTotal: 0,
              pickupDate: '',
              dropDate: '',
            });
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
          console.log({error: error});
          if (Platform.OS === 'ios') {
            navigationRef.navigate(MAIN_NAV_STRINGS.ORDER_FAILURE as never, {
              reason: error.message,
              transactionId: error.data.transaction_id,
            });
          } else {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: MAIN_NAV_STRINGS.ORDER_FAILURE,
                    params: {reason: error.message},
                  },
                ],
              }),
            );
          }
        } finally {
          setShowVerifyPaymentLoading(false);
        }
      }, 1000);
    }
  };
  return (
    <View style={{flex: 1}}>
      <WebView
        source={{uri: checkout_url}}
        minimumFontSize={12}
        onNavigationStateChange={handleNavigationStateChange}
        containerStyle={{paddingTop: SIZING.scaleHeight(5)}}
      />
      <FullScreenLoader
        isLoading={showVerifyPaymentLoading}
        text={"please wait\n while we're are verifying the payment"}
      />
    </View>
  );
};

export default Payment;

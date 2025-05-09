import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {IMAGES} from '../../assets/images';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {UserOrdersType} from '../../customTypes/home';
import {CancelOrderModal, OrderButton} from '../../components';
import IonIcons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import EntypoIcon from 'react-native-vector-icons/Entypo';

const BreakdownItem = ({
  label,
  amount,
  bold = false,
}: {
  label: string;
  amount: string;
  bold?: boolean;
}) => (
  <View style={styles.breakdownItem}>
    <Text style={[styles.breakdownLabel, bold && styles.boldText]}>
      {label}
    </Text>
    <Text style={[styles.breakdownLabel, bold && styles.boldText]}>
      {amount}
    </Text>
  </View>
);

const Header = () => {
  const navigation = useNavigation();
  return (
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
      <Text style={styles.headingText}>Order Details</Text>
      <View />
    </View>
  );
};

export default function OrderDetails({route, navigation}: any) {
  const {orderDetails} = route.params;
  const orderItem: UserOrdersType = orderDetails
    ? JSON.parse(orderDetails as string)
    : {};

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const pickupDate = useMemo(() => {
    if (orderItem?.schedule?.pickup_date) {
      const date = moment(orderItem.schedule.pickup_date, 'YYYY-DD-MM').format(
        'DD/MM/YYYY',
      );
      return date;
    }
    return '';
  }, [orderItem?.schedule?.pickup_date]);

  const pickupTime = useMemo(() => {
    if (orderItem?.schedule?.pickup_time) {
      const date = moment(orderItem.schedule.pickup_time, 'HH:mm:ss').format(
        'HH:mm A',
      );
      return date;
    }
    return '';
  }, [orderItem?.schedule?.pickup_time]);

  const dropDate = useMemo(() => {
    if (orderItem?.schedule?.drop_date) {
      const date = moment(orderItem.schedule.drop_date, 'YYYY-DD-MM').format(
        'DD/MM/YYYY',
      );
      return date;
    }
    return '';
  }, [orderItem?.schedule?.drop_date]);

  const dropTime = useMemo(() => {
    if (orderItem?.schedule?.drop_time) {
      const date = moment(orderItem.schedule.drop_time, 'HH:mm:ss').format(
        'HH:mm A',
      );
      return date;
    }
    return '';
  }, [orderItem?.schedule?.drop_time]);

  const showOrderCancelButton = useMemo(() => {
    if (orderItem?.current_status?.title === 'Order Placed') {
      return true;
    }
    return false;
  }, [orderItem.current_status]);

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.addressContainer}>
        <Text style={styles.addressText}>
          {orderItem?.order_user_address?.address}
        </Text>
        <IonIcons
          name="location-outline"
          size={SIZING.scaleWidth(24)}
          color={COLORS.GRAY}
        />
      </View>

      <View
        style={[styles.deliveryWrapper, {marginTop: SIZING.scaleHeight(15)}]}>
        <View style={styles.deliveryContainer}>
          <FastImage source={IMAGES.BAG_ICON} style={styles.bucketIcon} />
          <Text style={styles.deliveryText}>
            Pick up on {pickupDate}, {pickupTime}
          </Text>
        </View>
      </View>
      <View style={styles.deliveryWrapper}>
        <View style={styles.deliveryContainer}>
          <FastImage source={IMAGES.BAG_ICON} style={styles.bucketIcon} />
          <Text style={styles.deliveryText}>
            Delivered on {dropDate}, {dropTime}
          </Text>
        </View>
      </View>

      <Divider style={{marginTop: SIZING.scaleHeight(10)}} />

      <Text style={styles.sectionTitle}>Items in order</Text>
      <FlatList
        data={orderItem.items}
        style={{
          marginTop: SIZING.scaleHeight(10),
        }}
        renderItem={({item}) => {
          return (
            <View style={styles.itemContainer} key={item.item_id}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.serviceIconContainer}>
                  <FastImage
                    source={IMAGES.SERVICE_ICON_WRAPPER}
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.serviceIconWrapper}
                  />
                  <FastImage
                    source={IMAGES.SERVICE_ICON}
                    resizeMode={FastImage.resizeMode.contain}
                    style={styles.serviceIcon}
                  />
                </View>
                <Text style={styles.itemTitle}>{item.item.name}</Text>
              </View>
              <Text style={styles.itemPrice}>€ {item.amount}</Text>
            </View>
          );
        }}
      />

      <Divider style={{marginTop: SIZING.scaleHeight(10)}} />

      <View style={styles.orderTotalContainer}>
        <Text style={styles.orderTotalText}>Order total</Text>
        <Text style={styles.orderTotalAmount}>€ {orderItem.sub_total}</Text>
      </View>

      {/* Charges Breakdown */}
      <View style={styles.breakdownContainer}>
        <BreakdownItem label="Minimum Order Charge" amount={'€ 0,00'} />
        <BreakdownItem label="Service Fee" amount={'€ 0,00'} />
        <BreakdownItem label="Discounts" amount={'€ 0,00'} />
        <BreakdownItem
          label="Final Total"
          amount={`€ ${orderItem.grand_total}`}
        />
      </View>

      {showOrderCancelButton && (
        <View
          style={{
            marginTop: SIZING.scaleHeight(30),
            marginBottom: SIZING.scaleHeight(50),
          }}>
          <OrderButton
            onPress={() => setIsModalVisible(true)}
            title="Cancel order"
            loading={false}
          />
        </View>
      )}
      <CancelOrderModal
        isModalVisible={isModalVisible}
        setModalVisible={setIsModalVisible}
        orderId={orderItem.order_number}
        navigation={navigation}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: SIZING.scaleHeight(60),
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(2),
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25), position: 'absolute'},
  headingText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(22),
    color: COLORS.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZING.scaleHeight(20),
    marginBottom: SIZING.scaleHeight(10),
    marginHorizontal: SIZING.scaleWidth(17),
  },
  addressText: {
    fontSize: SIZING.scaleFont(19),
    width: SIZING.scaleWidth(280),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.PRIMARY,
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
    fontSize: SIZING.scaleFont(20),
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
    fontSize: SIZING.scaleFont(14),
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

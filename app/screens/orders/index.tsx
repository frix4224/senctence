import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {FetchUserOrdersApi} from '../../services/methods/home';
import {COLORS, SIZING} from '../../utils';
import {UserOrdersType} from '../../customTypes/home';
import {FONTS} from '../../assets/fonts';
import {useNavigation} from '@react-navigation/native';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import moment from 'moment';
import EntypoIcon from 'react-native-vector-icons/Entypo';

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
      <Text style={styles.headingText}>Orders</Text>
      <View />
    </View>
  );
};

const OrderListItem = ({item}: {item: UserOrdersType}) => {
  const navigation = useNavigation();
  const orderDate = useMemo(() => {
    if (item.created_at) {
      return moment(item.created_at).format('DD-MMM-YYYY HH:mm A');
      // return moment.utc(item.created_at).format('DD-MMM-YYYY HH:mm A');
    }
    return '';
  }, [item.created_at]);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.rowFront}
      onPress={() =>
        navigation.navigate(MAIN_NAV_STRINGS.ORDER_DETAILS as never, {
          orderDetails: JSON.stringify(item),
        })
      }>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>
          #{item?.order_number} ({orderDate})
        </Text>
        <Text style={styles.unitPrice}>Total items: {item.items.length}</Text>
        <Text style={styles.price}>Total Price: {item.sub_total}</Text>
      </View>
      <Text style={styles.statusText}>{item?.current_status?.title}</Text>
    </TouchableOpacity>
  );
};
const OrdersScreen = () => {
  const [orderListData, setOrderListData] = useState<UserOrdersType[]>([]);

  const {data: orders, isLoading} = useQuery({
    queryKey: ['user_orders'],
    queryFn: FetchUserOrdersApi,
  });

  useEffect(() => {
    if (orders?.status === 200 && orders.data.status) {
      setOrderListData(orders.data.data);
    }
  }, [orders]);

  const renderItem = ({item}: {item: UserOrdersType}) => (
    <OrderListItem item={item} />
  );

  return (
    <ScrollView style={styles.container} bounces={false}>
      <StatusBar
        animated
        barStyle={'dark-content'}
        translucent
        backgroundColor={'transparent'}
      />
      <Header />

      {isLoading ? (
        <ActivityIndicator color={COLORS.PRIMARY} size={'large'} />
      ) : (
        <FlatList
          data={orderListData}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>No orders found!</Text>
          }
          keyExtractor={item => item.id + ''}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SIZING.scaleHeight(50),
    backgroundColor: COLORS.WHITE,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex:1,
    justifyContent: 'space-between',
    marginLeft: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(5),
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25), flex:0.3},
  headingText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(22),
    color: COLORS.PRIMARY,
    flex:0.8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
  },
  listContainer: {
    flex: 1,
    marginTop: SIZING.scaleHeight(30),
    marginBottom: SIZING.scaleHeight(50),
    backgroundColor: COLORS.WHITE,
    paddingBottom: SIZING.scaleHeight(12),
  },
  rowFront: {
    flexDirection: 'row',
    marginHorizontal: SIZING.scaleWidth(15),
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    paddingVertical: SIZING.scaleHeight(20),
    borderRadius: SIZING.scaleWidth(8),
    marginBottom: SIZING.scaleHeight(20),
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 5,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SIZING.scaleWidth(20),
  },
  itemName: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(17),
    color: COLORS.PRIMARY,
    width: SIZING.scaleWidth(210),
  },
  unitPrice: {
    fontSize: SIZING.scaleFont(16),
    fontFamily: FONTS.GilroyBold,
    marginTop: SIZING.scaleHeight(10),
    color: '#888',
  },
  price: {
    fontSize: SIZING.scaleFont(16),
    fontFamily: FONTS.GilroyBold,
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(10),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyListText: {
    textAlign: 'center',
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(5),
    color: COLORS.BLACK,
  },
  statusText: {
    fontFamily: FONTS.GilroyBold,
    fontSize: SIZING.scaleFont(15),
    color: COLORS.LINK_BLUE,
    width: SIZING.scaleWidth(100),
    marginRight: SIZING.scaleWidth(10),
    textAlign: 'center',
  },
});

export default OrdersScreen;

import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import {ConfirmationModal, EmptyList} from '../../components';
import {
  DeleteUserAddressApi,
  FetchUserAddressApi,
  UserAddressUpdateApi,
} from '../../services/methods/home';
import {userAtom} from '../../store/auth';
import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {UserAddressesType} from '../../customTypes/home';
import {ActivityIndicator} from 'react-native-paper';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {collectionAndDeliveryAtom, selectedFacilityAtom} from '../../store';
import FullScreenLoader from '../../components/fullScreenLoader';
import {
  AddressFacilityType,
  AddressType,
  AddressUpdateRequest,
  AddressUpdateResponse,
  FacilityType,
} from '../../services/types/home';

const AddressList = ({navigation}: {navigation: any}) => {
  const queryClient = useQueryClient();
  const userInfo = useAtomValue(userAtom);
  const setFacilityId = useSetAtom(selectedFacilityAtom);
  const [collectionData, setCollectionData] = useAtom(
    collectionAndDeliveryAtom,
  );
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);

  const [userAddressList, setUserAddressList] = useState<UserAddressesType[]>(
    [],
  );

  const {data: userAddressData, isLoading} = useQuery({
    queryKey: ['user_addresses'],
    queryFn: FetchUserAddressApi,
  });
  const {isPending: addressUpdateLoading, mutate} = useMutation<
    AddressUpdateResponse,
    Error,
    {addressId: string; payload: AddressUpdateRequest}
  >({
    mutationKey: ['address_update'],
    mutationFn: async ({addressId, payload}) => {
      const response = await UserAddressUpdateApi({addressId, payload});
      return response.data;
    },
    onSuccess: response => {
      if (
        response.data.length > 0 &&
        (response.data[1] as FacilityType).facility_id
      ) {
        showCustomToast('Nearby facility found', 'success');
        setFacilityId((response.data[1] as FacilityType).facility_id);
      } else if (
        response.data.length > 0 &&
        (response.data[0] as AddressType).id
      ) {
        showCustomToast('No nearby facility found', 'warning');
        setCollectionData(prev => ({
          ...prev,
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
        }));
      }
      queryClient.invalidateQueries({queryKey: ['user_addresses']});
    },
    onError: error => {
      console.log({error: error.message});
      showCustomToast(error.message, 'danger');
    },
  });

  const {mutateAsync, isPending} = useMutation({
    mutationKey: ['delete_address'],
    mutationFn: (addressId: string) =>
      DeleteUserAddressApi(addressId, userInfo?.userId + ''),
    onSuccess: deleteAddressResponse => {
       try {
        if (
          deleteAddressResponse.status === 200 &&
          deleteAddressResponse.data.status
        ) {
          queryClient.invalidateQueries({queryKey: ['user_addresses']});
          showCustomToast('Address deleted successfully', 'success');
          setShowConfirmationModal(false);
        }
      } catch (error: any) {
        console.log({error: error});

        showCustomToast('Something went wrong', 'danger');
      }
    },
  });

  useEffect(() => {
    if (
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

      setUserAddressList(addresses);
      if (addresses.length === 1) {
        setCollectionData(prev => ({
          ...prev,
          selectedAddress: addresses[0],
        }));
      }
    } else {
      setUserAddressList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddressData]);

  const onPressDeleteAddress = async () => {
    await mutateAsync(selectedAddressId + '');
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity
        style={styles.addAddressContainer}
        activeOpacity={0.5}
        onPress={() =>
          navigation.navigate(MAIN_NAV_STRINGS.ADD_ADDRESS as never)
        }>
        <AntDesign
          name="pluscircleo"
          size={SIZING.scaleWidth(20)}
          color={COLORS.PRIMARY}
        />
        <Text style={styles.addNewAddressText}>Add a new address</Text>
      </TouchableOpacity>
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.PRIMARY}
          size={'large'}
          style={{marginTop: SIZING.scaleHeight(20)}}
        />
      ) : (
        <FlatList
          data={userAddressList}
          ListEmptyComponent={
            <EmptyList
              title="You haven't added any addresses"
              textStyle={{
                marginTop: SIZING.scaleHeight(120),
              }}
            />
          }
          renderItem={({item}) => {
            let isSelected = false;
            if (item?.default === 1) {
              isSelected = true;
            } 
         return (
              <View style={styles.addressWrapper} key={item.id}>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressTitle}>Address</Text>
                  <Text style={styles.addressText}>{item.address}</Text>
                </View>
                <View style={styles.addressActionDivider} />
                <View style={styles.addressActionContainer}>
                  <TouchableOpacity
                    disabled={isSelected}
                    activeOpacity={0.5}
                    onPress={() => {
                      mutate({
                        addressId: item.id + '',
                        payload: {
                          default: true,
                          address: item.address,
                          lat: item.lat + '',
                          long: item.long + '',
                          type: 'home',
                          user_id: Number(userInfo?.userId),
                        },
                      });
                      setCollectionData(prev => ({
                        ...prev,
                        selectedAddress: item,
                      }));
                    }}>
                    <Octicons
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={SIZING.scaleWidth(20)}
                      color={COLORS.PRIMARY}
                    />
                  </TouchableOpacity>
                  <View style={styles.actionDivider} />
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      setSelectedAddressId(item.id);
                      setShowConfirmationModal(true);
                    }}>
                    <Feather
                      name="trash-2"
                      size={SIZING.scaleWidth(20)}
                      color={COLORS.PRIMARY}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
      <ConfirmationModal
        isModalVisible={showConfirmationModal}
        setModalVisible={setShowConfirmationModal}
        title="Are you sure you want to delete this address ?"
        onConfirm={onPressDeleteAddress}
        confirmationloading={isPending}
      />
      <FullScreenLoader
        isLoading={addressUpdateLoading}
        text={"please wait\n while we're fetching nearby facility"}
      />
    </View>
  );
};

export default AddressList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isPlatformIos ? SIZING.scaleHeight(60) : SIZING.scaleHeight(50),
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
  },
  profileContainer: {
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    width: SIZING.scaleWidth(110),
    alignSelf: 'center',
    marginTop: SIZING.scaleHeight(25),
    borderRadius: SIZING.scaleWidth(60),
    paddingVertical: SIZING.scaleHeight(8),
  },
  profileIcon: {
    width: SIZING.scaleWidth(90),
    height: SIZING.scaleHeight(90),
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(2),
  },
  headingText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(22),
    color: COLORS.PRIMARY,
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25)},
  addAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZING.scaleHeight(20),
    marginBottom: SIZING.scaleHeight(10),
  },
  addNewAddressText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    marginLeft: SIZING.scaleWidth(8),
  },
  addressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: SIZING.scaleHeight(1),
    borderColor: COLORS.PRIMARY,
    borderRadius: SIZING.scaleWidth(20),
    marginHorizontal: SIZING.scaleWidth(20),
    marginTop: SIZING.scaleHeight(20),
    paddingHorizontal: SIZING.scaleHeight(15),
    backgroundColor: COLORS.WHITE,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  addressContainer: {
    paddingVertical: SIZING.scaleHeight(15),
  },
  addressTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
  },
  addressIcon: {
    width: SIZING.scaleWidth(18),
    height: SIZING.scaleHeight(18),
  },
  addressText: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.PRIMARY,
    marginTop: SIZING.scaleHeight(10),
    width: SIZING.scaleWidth(270),
  },
  addressActionDivider: {
    backgroundColor: COLORS.PRIMARY,
    height: SIZING.scaleHeight(90),
    width: SIZING.scaleWidth(1),
    marginLeft: SIZING.scaleWidth(5),
  },
  addressActionContainer: {
    alignItems: 'center',
    height: SIZING.scaleHeight(80),
    justifyContent: 'space-between',
    paddingVertical: SIZING.scaleHeight(10),
  },
  actionDivider: {
    backgroundColor: COLORS.PRIMARY,
    width: isPlatformIos ? SIZING.scaleWidth(38) : SIZING.scaleWidth(43),
    height: SIZING.scaleHeight(1),
  },
});

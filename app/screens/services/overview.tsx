import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import {IMAGES} from '../../assets/images';
import {COLORS, isPlatformIos, showCustomToast, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {ServicesType} from '../../services/types/home';
import {ServiceCategory, ServiceItemsType} from '../../customTypes/home';
import {EmptyList, MainLayout} from '../../components';
import {useAtomValue, useSetAtom} from 'jotai';
import {cartItemsAtoms, serviceItemsAtoms} from '../../store';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import {Dropdown} from 'react-native-element-dropdown';
import {IMAGE_BASE_URL} from '@env';

LogBox.ignoreAllLogs();
const ServiceItem = ({
  item,
  selectedService,
  serviceImage,
  activeCategory,
}: {
  item: ServiceItemsType;
  selectedService: ServicesType | undefined;
  serviceImage: string;
  activeCategory: string;
}) => {
  let imageURL = item?.item?.image ? item?.item?.image : serviceImage;
  const setCartItems = useSetAtom(cartItemsAtoms);
  return (
    <View style={styles.serviceItemContainer}>
      <View style={styles.serviceIconContainer}>
        <FastImage
          source={IMAGES.SERVICE_ICON_WRAPPER}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.serviceIconWrapper}
        />
        <FastImage
          source={{uri: IMAGE_BASE_URL + imageURL}}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.serviceIcon}
        />
      </View>
      <Text style={styles.serviceItemTitle}>{item.item?.name}</Text>
      <View style={styles.addBtnAndPriceContainer}>
        <View style={{marginLeft: SIZING.scaleWidth(10)}}>
          <Text style={styles.serviceItemSubTitle}>
            {item.item?.description}
          </Text>
          <Text style={styles.serviceItemPrice}>€{item.item?.price}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.addToCartBtnContainer}
          onPress={() => {
            setCartItems(prev => {
              const oldData = [...prev];

              const serviceGroupIndex = oldData.findIndex(
                group => group.serviceName === selectedService?.name,
              );

              if (serviceGroupIndex > -1) {
                const items = oldData[serviceGroupIndex].items;
                const itemIndex = items.findIndex(i => i.itemId === item.id);

                if (itemIndex > -1) {
                  items[itemIndex].quantity += 1;
                } else {
                  items.push({
                    quantity: 1,
                    itemId: item.id,
                    item: item,
                    category: activeCategory,
                  });
                }
              } else {
                oldData.push({
                  serviceName: selectedService?.name + '',
                  serviceImage: IMAGE_BASE_URL + selectedService?.image,
                  items: [
                    {
                      quantity: 1,
                      itemId: item.id,
                      item: item,
                      category: activeCategory,
                    },
                  ],
                });
              }

              return oldData;
            });
            showCustomToast('Item added to cart', 'success');
          }}>
          <FastImage
            source={IMAGES.CART_PLUS_ICON}
            resizeMode={FastImage.resizeMode.contain}
            style={styles.addToCartBtnImg}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const ServiceCategoryItem = ({
  selectedService,
  item,
  setSelectedService,
  setServiceCategories,
}: {
  item: {
    id: number;
    name: string;
    icon: string;
    image: string;
    description: string;
    service_categories: ServiceCategory[];
  };
  selectedService: ServicesType | undefined;
  setSelectedService: React.Dispatch<
    React.SetStateAction<ServicesType | undefined>
  >;
  setServiceCategories: React.Dispatch<
    React.SetStateAction<
      {
        categoryName: string;
        categoryImage: string;
      }[]
    >
  >;
}) => {
  return (
    <TouchableOpacity
      disabled={selectedService?.id === item.id}
      style={[
        styles.serviceCategoryItemContainer,
        selectedService?.id === item.id &&
          styles.serviceCategoryActiveItemContainer,
      ]}
      onPress={() => {
        setServiceCategories([]);
        setSelectedService(item);
      }}
      activeOpacity={0.5}>
      <View style={styles.serviceCategoryIconContainer}>
        <FastImage
          source={IMAGES.SERVICE_ICON_WRAPPER}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.serviceCategoryIconWrapper}
        />
        <FastImage
          source={{uri: IMAGE_BASE_URL + item.image}}
          resizeMode={FastImage.resizeMode.contain}
          style={styles.serviceCategoryIcon}
        />
      </View>
    </TouchableOpacity>
  );
};
const ServiceOverview = ({route, navigation}: any) => {
  const services = useAtomValue(serviceItemsAtoms);
  const [serviceItems, setServiceItems] = useState<ServiceItemsType[]>([]);
  const [showDropDown, setShowDropDown] = useState<Boolean>(false);
  const [serviceCategories, setServiceCategories] = useState<
    {
      categoryName: string;
      categoryImage: string;
    }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedService, setSelectedService] = useState<ServicesType>();

  const activeServiceId: number = useMemo(() => {
    if (route.params && route.params?.activeServiceId.length > 0) {
      return JSON.parse(route.params?.activeServiceId);
    }
    return 0;
  }, [route.params]);

  useEffect(() => {
    if (selectedService && selectedService.service_categories.length > 0) {
      const categories = selectedService.service_categories.map(sc => ({
        categoryName: sc?.category?.name ?? '',
        categoryImage: sc?.category?.image ?? '',
      }));

      setServiceCategories(categories);
      setActiveCategory(
        selectedService.service_categories[0].category?.name ?? '',
      );
    } else if (activeServiceId) {
      const filteredService = services.filter(
        service => service.id === activeServiceId,
      );

      if (
        filteredService.length > 0 &&
        filteredService[0].service_categories.length > 0
      ) {
        const serviceItemList: any = [];
        filteredService[0].service_categories.map(sc => {
          if (sc.items.length >= 1) {
            sc.items.map(item => {
              serviceItemList.push(item);
            });
          }
        });
        const categories = filteredService[0].service_categories.map(sc => ({
          categoryName: sc?.category?.name ?? '',
          categoryImage: sc?.category?.image ?? '',
        }));
        setServiceCategories(categories);
        if (
          selectedService &&
          selectedService?.service_categories?.length < 1
        ) {
          setShowDropDown(true);
        } else {
          setShowDropDown(false);
        }
        setActiveCategory(
          filteredService[0].service_categories[0].category?.name ?? '',
        );
      }
    }
  }, [activeServiceId, selectedService, services]);

  useEffect(() => {
    if (activeCategory) {
      const activeService = services.find(
        service => service.id === selectedService?.id,
      );
      if (selectedService && selectedService?.service_categories?.length < 1) {
        setShowDropDown(true);
      } else {
        setShowDropDown(false);
      }
      if (activeService) {
        const itemsService: ServiceItemsType[] = [];

        activeService.service_categories.forEach(sc => {
          if (sc.category.name === activeCategory) {
            itemsService.push(...sc.items);
          }
        });

        setServiceItems(itemsService);
      }
    }
  }, [activeCategory, activeServiceId, selectedService, services]);

  useEffect(() => {
    if (activeServiceId) {
      const filteredService = services.filter(
        service => service.id === activeServiceId,
      );
      if (selectedService && selectedService?.service_categories?.length < 1) {
        setShowDropDown(true);
      } else {
        setShowDropDown(false);
      }
      if (filteredService.length > 0) {
        setSelectedService(filteredService[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeServiceId, services]);

  return (
    <MainLayout>
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.goBack()}>
        <EntypoIcon
          name="chevron-thin-left"
          color={COLORS.PRIMARY}
          size={SIZING.scaleWidth(30)}
        />
      </TouchableOpacity>
      <View>
        <FlatList
          data={services}
          horizontal
          ListEmptyComponent={<EmptyList title="No services found" />}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <ServiceCategoryItem
              item={item}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              setServiceCategories={setServiceCategories}
            />
          )}
        />
      </View>
      {!showDropDown && (
        <View style={styles.headingContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={{
              height: SIZING.scaleHeight(30),
              width: SIZING.scaleWidth(30),
            }}
            inputSearchStyle={styles.inputSearchStyle}
            iconColor={COLORS.PRIMARY}
            data={serviceCategories}
            maxHeight={300}
            labelField="categoryName"
            valueField="categoryName"
            placeholder={'Select a item'}
            value={activeCategory}
            onChange={item => {
              setActiveCategory(item.categoryName);
            }}
          />
        </View>
      )}

      <FlatList
        data={serviceItems}
        numColumns={2}
        style={{
          marginBottom: SIZING.scaleHeight(10),
          marginTop: SIZING.scaleHeight(10),
        }}
        ListEmptyComponent={
          <View style={{marginTop: SIZING.scaleHeight(20)}}>
            <EmptyList />
          </View>
        }
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <ServiceItem
            item={item}
            selectedService={selectedService}
            serviceImage={selectedService?.image + ''}
            activeCategory={activeCategory}
          />
        )}
      />
    </MainLayout>
  );
};

export default ServiceOverview;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: isPlatformIos ? SIZING.scaleHeight(20) : SIZING.scaleHeight(5),
    marginLeft: SIZING.scaleWidth(-10),
  },
  serviceCategoryItemContainer: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.LINK_BLUE,
    borderWidth: 1,
    width: SIZING.scaleWidth(60),
    borderRadius: SIZING.scaleWidth(30),
    borderBottomLeftRadius: SIZING.scaleWidth(30),
    height: SIZING.isSmallerDevice
      ? SIZING.scaleHeight(105)
      : SIZING.scaleHeight(95),
    marginTop: SIZING.scaleHeight(10),
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: SIZING.scaleWidth(25),
  },
  serviceCategoryActiveItemContainer: {
    backgroundColor: COLORS.LINK_BLUE,
  },
  serviceCategoryIconContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    padding: SIZING.scaleWidth(10),
  },
  serviceCategoryIconWrapper: {
    width: SIZING.scaleWidth(45),
    height: SIZING.scaleHeight(45),
  },
  serviceCategoryIcon: {
    width: SIZING.isSmallerDevice
      ? SIZING.scaleWidth(24)
      : SIZING.scaleWidth(30),
    height: SIZING.scaleHeight(48),
    position: 'absolute',
    marginTop: SIZING.isSmallerDevice
      ? SIZING.scaleHeight(10)
      : SIZING.scaleHeight(7),
  },
  serviceItemContainer: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.LINK_BLUE,
    borderWidth: 1,
    width: SIZING.scaleWidth(150),
    justifyContent: 'space-between',
    borderRadius: SIZING.scaleWidth(20),
    paddingTop: SIZING.scaleWidth(15),
    marginTop: SIZING.scaleHeight(15),
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginRight: SIZING.scaleWidth(25),
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
    height: '99%',
    borderRadius: SIZING.scaleWidth(50),
    position: 'absolute',
  },
  serviceItemTitle: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleWidth(16),
    color: COLORS.LINK_BLUE,
    marginLeft: SIZING.scaleWidth(10),
    marginTop: SIZING.scaleHeight(10),
  },
  serviceItemSubTitle: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(14),
    color: COLORS.PRIMARY,
    width: SIZING.scaleWidth(95),
    marginTop: SIZING.scaleHeight(5),
  },
  addBtnAndPriceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  serviceItemPrice: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(20),
    color: COLORS.PRIMARY,
    width: SIZING.scaleWidth(92),
    marginVertical: SIZING.scaleHeight(10),
  },
  addToCartBtnContainer: {
    backgroundColor: COLORS.LINK_BLUE,
    height: SIZING.isSmallerDevice
      ? SIZING.scaleHeight(50)
      : SIZING.scaleHeight(42),
    padding: SIZING.scaleWidth(7),
    borderTopLeftRadius: SIZING.scaleWidth(8),
    borderBottomRightRadius: SIZING.scaleWidth(12),
    justifyContent: 'center',
    marginTop: SIZING.scaleHeight(10),
  },
  addToCartBtnImg: {
    width: SIZING.scaleWidth(25),
    height: SIZING.scaleHeight(25),
  },
  headingContainer: {
    marginTop: SIZING.scaleHeight(2),
    marginHorizontal: SIZING.scaleWidth(5),
  },
  dropdown: {
    marginTop: SIZING.scaleHeight(12),
    height: SIZING.scaleHeight(50),
    width: SIZING.scaleWidth(320),
    borderColor: COLORS.LINK_BLUE,
    borderWidth: SIZING.scaleWidth(1.2),
    borderRadius: SIZING.isSmallerDevice
      ? SIZING.scaleWidth(12)
      : SIZING.scaleWidth(18),
    paddingHorizontal: SIZING.scaleWidth(20),
  },
  label: {
    position: 'absolute',
    backgroundColor: COLORS.PRIMARY,
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(20),
  },
  placeholderStyle: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(14),
  },
  selectedTextStyle: {
    fontSize: SIZING.scaleFont(18),
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.PRIMARY,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

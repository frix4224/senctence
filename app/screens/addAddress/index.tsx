import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {COLORS, isPlatformIos, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAP_API_KEY} from '@env';
import {MAIN_NAV_STRINGS} from '../../navigation/constants';
import {EmptyList} from '../../components';
import {ActivityIndicator} from 'react-native-paper';

const CustomRow = ({description}: {description: string}) => {
  return (
    <View style={styles.customRowContainer}>
      <Text style={styles.customRowText}>{description}</Text>
      <MaterialIcons
        name="chevron-right"
        size={SIZING.scaleWidth(35)}
        color={COLORS.PRIMARY}
      />
    </View>
  );
};

const AddAddress = ({navigation}: {navigation: any}) => {
  const handleAddressSelection = (
    _: GooglePlaceData,
    details: GooglePlaceDetail | null,
  ) => {
    if (details) {
      const formattedAddress = details.formatted_address;

      const latitude = details.geometry.location.lat;
      const longitude = details.geometry.location.lng;

      navigation.navigate(MAIN_NAV_STRINGS.ADD_ADDRESS_MAP as never, {
        place: formattedAddress,
        lat: latitude,
        long: longitude,
      });
    }
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
      <GooglePlacesAutocomplete
        placeholder="Enter Address"
        onPress={handleAddressSelection}
        numberOfLines={3}
        fetchDetails={true}
        listLoaderComponent={
          <ActivityIndicator
            color={COLORS.PRIMARY}
            size={'large'}
            style={{marginTop: SIZING.scaleHeight(20)}}
          />
        }
        listEmptyComponent={
          <EmptyList
            title="No address found"
            textStyle={{marginTop: SIZING.scaleHeight(20)}}
          />
        }
        query={{
          key: GOOGLE_MAP_API_KEY,
          language: 'en',
        }}
        renderRow={({description}) => <CustomRow description={description} />}
        styles={{
          textInputContainer: styles.searchContainer,
          textInput: styles.searchInput,
          separator: styles.addressSeparator,
          row: styles.addressRow,
          description: styles.addressDescription,
        }}
        debounce={300}
        enablePoweredByContainer={false}
      />
    </View>
  );
};

export default AddAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: isPlatformIos ? SIZING.scaleHeight(60) : SIZING.scaleHeight(50),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(-10),
  },
  backIcon: {marginLeft: SIZING.scaleWidth(25), position: 'absolute'},
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
  searchContainer: {
    borderColor: COLORS.PRIMARY,
    borderWidth: SIZING.scaleWidth(0.5),
    marginHorizontal: SIZING.scaleWidth(20),
    marginTop: SIZING.scaleHeight(25),
    borderRadius: SIZING.scaleWidth(20),
    backgroundColor: COLORS.WHITE,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  searchInput: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    borderRadius: SIZING.scaleWidth(25),
    marginLeft: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(5),
  },
  customRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customRowText: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    borderRadius: SIZING.scaleWidth(25),
    marginLeft: SIZING.scaleWidth(10),
    width: SIZING.scaleWidth(300),
  },
  addressSeparator: {backgroundColor: 'transparent'},
  addressRow: {
    marginHorizontal: SIZING.scaleWidth(10),
    width: SIZING.scaleWidth(350),
  },
  addressDescription: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(17),
    color: COLORS.PRIMARY,
  },
});

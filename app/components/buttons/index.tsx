import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {ActivityIndicator} from 'react-native-paper';

const OrderButton = ({
  title,
  onPress,
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      disabled={disabled}
      style={[styles.container, {opacity: disabled ? 0.6 : 1}]}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={COLORS.PRIMARY} size={'small'} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
export default OrderButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderWidth: SIZING.scaleWidth(1),
    borderColor: COLORS.PRIMARY,
    paddingVertical: SIZING.scaleHeight(15),
    marginHorizontal: SIZING.scaleWidth(20),
    marginBottom: SIZING.scaleHeight(20),
    alignItems: 'center',
    borderRadius: SIZING.scaleWidth(25),
  },
  title: {
    color: COLORS.PRIMARY,
    fontSize: SIZING.scaleFont(18),
    fontFamily: FONTS.GilroySemiBold,
  },
});

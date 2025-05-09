import React from 'react';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {FONTS} from '../../assets/fonts';
import {COLORS, SIZING} from '../../utils';

const EmptyList = ({
  title,
  textStyle,
}: {
  title?: string;
  textStyle?: StyleProp<TextStyle>;
}) => {
  const textTitle = title || 'No items found';

  return (
    <View style={style.container}>
      <Text style={[style.text, textStyle]}>{textTitle}</Text>
    </View>
  );
};
export default EmptyList;

const style = StyleSheet.create({
  container: {alignItems: 'center', marginTop: SIZING.scaleHeight(2)},
  text: {
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(20),
    color: COLORS.BLACK,
  },
});

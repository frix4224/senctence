import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {COLORS, SIZING} from '../utils';
import {IMAGES} from '../assets/images';
import FastImage from 'react-native-fast-image';

const Splash = () => {
  return (
    <View style={styles.container}>
      <StatusBar
        animated
        barStyle={'light-content'}
        translucent
        backgroundColor={'transparent'}
      />
      <FastImage
        style={styles.img}
        source={IMAGES.LOGO}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );
};
export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: SIZING.scaleHeight(100),
    width: SIZING.scaleWidth(100),
  },
});

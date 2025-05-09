import {Dimensions} from 'react-native';

const {height, width} = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

export const SIZING = {
  scaleHeight: (size: number) => verticalScale(size),
  scaleWidth: (size: number) => horizontalScale(size),
  moderateScale,
  scaleFont: (size: number) => moderateScale(size),
  isSmallerDevice: height < 668 && width < 376,
};

export {COLORS} from './colors';
export {SIZING} from './sizing';

import {Platform} from 'react-native';
import {Toast as CustomToast} from 'react-native-toast-notifications';

let currentToast = '';

export const showCustomToast = (
  text: string,
  type: 'normal' | 'success' | 'warning' | 'danger' = 'normal',
  duration: number = 5000,
) => {
  if (currentToast) {
    CustomToast.hide(currentToast);
  }
  currentToast = CustomToast.show(text, {type, duration});
};

export const isPlatformIos = Platform.OS === 'ios';

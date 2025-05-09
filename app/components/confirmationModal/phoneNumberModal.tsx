import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {COLORS, showCustomToast, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {ErrorText} from '..';
import {useAtom, useSetAtom} from 'jotai';
import {userAtom} from '../../store/auth';
import {ActivityIndicator} from 'react-native-paper';
import {VerifyUserMobileNumberApi} from '../../services/methods/home';
import {SECURE_STRINGS} from '../../utils/secureStore/strings';
import {setSecureInfo} from '../../utils/secureStore';
import {UserInfo} from '../../customTypes/userInfo';
import {collectionAndDeliveryAtom} from '../../store';

function PhoneNumberVerification({
  isModalVisible,
  setModalVisible,
  mobile,
  isPickAndCollect,
  pickAndCollectonConfirm,
  mobileOtp,
  messageText,
}: {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  mobile: string;
  pickAndCollectonConfirm: () => void;
  isPickAndCollect: boolean;
  mobileOtp: string;
  messageText: string;
}) {
  const setCollectionData = useSetAtom(collectionAndDeliveryAtom);
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false);

  useEffect(() => {
    if (mobileOtp) {
      setOtp(mobileOtp);
    }
  }, [mobileOtp]);

  const [userInfo, setUserInfo] = useAtom(userAtom);
  const onPressConfirm = async () => {
    if (otp === '') {
      setError('please enter otp');
      return null;
    }
    try {
      setShowLoading(true);
      const verifyOtpResponse = await VerifyUserMobileNumberApi(
        Number(mobile),
        Number(otp),
      );

      if (verifyOtpResponse.status === 200 && verifyOtpResponse.data.status) {
        const data: UserInfo = {
          email: userInfo?.email + '',
          userId: Number(userInfo?.userId),
          name: userInfo?.name + '',
          userIdentifier: Number(userInfo?.userIdentifier),
          token: userInfo?.token + '',
          mobile: mobile,
        };

        setUserInfo(prev => {
          const newData = prev as UserInfo;
          return {
            ...newData,
            mobile: mobile + '',
          };
        });
        setOtp('');
        setCollectionData(prev => ({...prev, phoneNumber: mobile}));
        setSecureInfo(SECURE_STRINGS.USER_INFO, JSON.stringify(data));
        showCustomToast('Mobile Number Updated Successfully!', 'success');
        isPickAndCollect && pickAndCollectonConfirm();
        setModalVisible(false);
      }
    } catch (otpError: any) {
      console.log({otpError: otpError.message});
    } finally {
      setShowLoading(false);
    }
  };

  const onPressCancel = () => {
    setError('');
    setOtp('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={onPressCancel}
        style={styles.modal}
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}>
        <View style={styles.modalContent}>
          <Text allowFontScaling={false} style={styles.heading}>
            Verify OTP
          </Text>
          <Text allowFontScaling={false} style={styles.subHeading}>
            {messageText}
          </Text>
          <OTPInputView
            style={styles.otpStyles}
            pinCount={6}
            keyboardType="number-pad"
            code={otp}
            onCodeChanged={code => {
              setError('');
              setOtp(code);
            }}
            autoFocusOnLoad={false}
            codeInputFieldStyle={styles.otpFieldStyles}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            // onCodeFilled={(code) => {
            //   console.log(`Code is ${code}, you are good to go!`);
            // }}
          />
          <ErrorText error={error} touched />
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={onPressConfirm}
              disabled={showLoading}
              style={styles.confirmBtnContainer}
              activeOpacity={0.7}>
              {showLoading ? (
                <ActivityIndicator color={COLORS.WHITE} size={'small'} />
              ) : (
                <Text allowFontScaling={false} style={styles.confirmBtnText}>
                  verify
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtnContainer}
              activeOpacity={0.7}
              onPress={onPressCancel}>
              <Text allowFontScaling={false} style={styles.cancelBtnText}>
                cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: SIZING.scaleHeight(30),
    borderRadius: SIZING.scaleWidth(8),
    alignItems: 'center',
  },
  heading: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(14),
    color: COLORS.PRIMARY,
    marginBottom: SIZING.scaleHeight(10),
    textAlign: 'center',
  },
  subHeading: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(14),
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: SIZING.scaleHeight(1),
  },
  btnContainer: {
    marginTop: SIZING.scaleHeight(20),
    alignItems: 'center',
  },
  confirmBtnContainer: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SIZING.scaleHeight(8),
    paddingHorizontal: SIZING.scaleWidth(30),
    borderRadius: SIZING.scaleWidth(5),
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(14),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  cancelBtnContainer: {
    marginTop: SIZING.scaleHeight(25),
  },
  cancelBtnText: {
    textAlign: 'center',
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(14),
    textTransform: 'uppercase',
  },
  otpStyles: {
    height: SIZING.scaleHeight(70),
    marginTop: SIZING.scaleHeight(10),
    paddingHorizontal: SIZING.scaleWidth(20),
  },
  otpFieldStyles: {
    borderRadius: SIZING.scaleWidth(8),
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    color: COLORS.PRIMARY,
    fontSize: SIZING.scaleFont(14),
    fontFamily: FONTS.GilroyLight,
  },
  underlineStyleHighLighted: {
    borderColor: COLORS.BLACK,
  },
});

export default PhoneNumberVerification;

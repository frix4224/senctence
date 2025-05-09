import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {COLORS, showCustomToast, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {ErrorText} from '..';
import {ActivityIndicator} from 'react-native-paper';
import {CancelOrderApi} from '../../services/methods/home';
import {useQueryClient} from '@tanstack/react-query';

function CancelOrderModal({
  isModalVisible,
  setModalVisible,
  orderId,
  navigation,
}: {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  orderId: number;
  navigation: any;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showLoading, setShowLoading] = useState<boolean>(false);

  const onPressConfirm = async () => {
    if (cancelReason === '') {
      setError('please enter reason');
      return null;
    }
    setShowLoading(true);
    setError('');
    try {
      const cancelOrderResponse = await CancelOrderApi({
        order_number: orderId,
        remark: cancelReason,
      });

      if (cancelOrderResponse.status === 201) {
        showCustomToast('Order cancelled successfully!', 'success');
        queryClient.invalidateQueries({queryKey: ['user_orders']});
        return;
      }
    } catch (cancelError: any) {
      showCustomToast('Unable to cancel the order', 'danger');
      console.log({error: cancelError.message});
    } finally {
      setShowLoading(false);
      setModalVisible(false);
      navigation.goBack();
    }
  };

  const onPressCancel = () => {
    setError('');
    setCancelReason('');
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
            Cancel this order
          </Text>
          <Text allowFontScaling={false} style={styles.subHeading}>
            Are you sure to cancel this order?
          </Text>
          <View style={styles.reasonTextInputContainer}>
            <TextInput
              placeholder="Enter reason to cancel the order"
              multiline
              style={styles.reasonTextInput}
              textAlignVertical="top"
              value={cancelReason}
              onChangeText={text => {
                setError('');
                setCancelReason(text);
              }}
            />
          </View>
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
                  cancel order
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtnContainer}
              activeOpacity={0.7}
              onPress={onPressCancel}>
              <Text allowFontScaling={false} style={styles.cancelBtnText}>
                close
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
    width: SIZING.scaleWidth(350),
    backgroundColor: COLORS.WHITE,
    paddingVertical: SIZING.scaleHeight(20),
    borderRadius: SIZING.scaleWidth(20),
    alignItems: 'center',
  },
  heading: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(18),
    color: COLORS.PRIMARY,
    marginBottom: SIZING.scaleHeight(10),
    textAlign: 'center',
  },
  subHeading: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: SIZING.scaleHeight(10),
  },
  btnContainer: {
    marginTop: SIZING.scaleHeight(30),
    alignItems: 'center',
  },
  confirmBtnContainer: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SIZING.scaleHeight(10),
    paddingHorizontal: SIZING.scaleWidth(20),
    borderRadius: SIZING.scaleWidth(10),
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(15),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  cancelBtnContainer: {
    marginTop: SIZING.scaleHeight(20),
  },
  cancelBtnText: {
    textAlign: 'center',
    color: COLORS.BLACK,
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(14),
    textTransform: 'uppercase',
  },
  reasonTextInput: {
    height: SIZING.scaleHeight(100),
    width: SIZING.scaleWidth(300),
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(16),
    color: COLORS.BLACK,
  },
  reasonTextInputContainer: {
    borderColor: COLORS.GRAY,
    borderWidth: 1,
    paddingHorizontal: SIZING.scaleWidth(10),
    borderRadius: SIZING.scaleWidth(8),
    marginTop: SIZING.scaleHeight(20),
    paddingTop: SIZING.scaleHeight(5),
  },
});

export default CancelOrderModal;

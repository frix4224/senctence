import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import {ActivityIndicator} from 'react-native-paper';

function AddressConfirm({
  isModalVisible,
  setModalVisible,
  title,
  onConfirm,
  confirmationloading,
}: {
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  onConfirm: () => void;
  confirmationloading: boolean;
}) {
  const onPressCancel = () => {
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
          <Text style={styles.heading} allowFontScaling={false}>
            {title}
          </Text>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.cancelBtnContainer}
              activeOpacity={0.7}
              onPress={onPressCancel}>
              <Text allowFontScaling={false} style={styles.cancelBtnText}>
                cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={styles.confirmBtnContainer}
              activeOpacity={0.7}>
              {confirmationloading ? (
                <ActivityIndicator color={COLORS.WHITE} size={'small'} />
              ) : (
                <Text allowFontScaling={false} style={styles.confirmBtnText}>
                  confirm
                </Text>
              )}
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
    height: SIZING.scaleWidth(150),
    backgroundColor: COLORS.WHITE,
    paddingVertical: SIZING.scaleHeight(20),
    paddingHorizontal: SIZING.scaleHeight(3),
    borderRadius: SIZING.scaleWidth(20),
    alignItems: 'center',
  },
  heading: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(17),
    color: COLORS.BLACK,
    marginBottom: SIZING.scaleHeight(1),
    marginHorizontal: SIZING.scaleWidth(10),
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SIZING.scaleWidth(250),
    marginTop: SIZING.scaleHeight(40),
  },
  confirmBtnContainer: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SIZING.scaleHeight(8),
    paddingHorizontal: SIZING.scaleHeight(10),
    borderRadius: SIZING.scaleWidth(5),
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(16),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  cancelBtnContainer: {
    borderColor: COLORS.BLACK,
    borderWidth: SIZING.scaleWidth(0.5),
    paddingVertical: SIZING.scaleHeight(8),
    paddingHorizontal: SIZING.scaleHeight(10),
    borderRadius: SIZING.scaleWidth(5),
  },
  cancelBtnText: {
    color: COLORS.BLACK,
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(16),
    textTransform: 'uppercase',
  },
});

export default AddressConfirm;

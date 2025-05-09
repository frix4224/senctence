import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Animated} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';

const FaqItem = ({
  item,
}: {
  item: {
    id: number;
    question: string;
    answer: string;
    created_at: string;
  };
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedValue = useState(new Animated.Value(0))[0];

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(animatedValue, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const heightInterpolation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, item.answer.length * 0.65],
  });

  return (
    <View style={styles.container} key={item.id}>
      <View style={styles.offerItemContainer}>
        <View style={styles.offerItemNameContainer}>
          <Text allowFontScaling={false} style={styles.offerText}>
            {item.question}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.5} onPress={toggleDescription}>
          <MaterialCommunityIcons
            name="plus"
            size={SIZING.scaleWidth(6)}
            color={COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{
          height: heightInterpolation,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: SIZING.scaleHeight(1),
        }}>
        <Text
          style={[
            styles.offerDescription,
            {
              width: isExpanded ? undefined : SIZING.scaleWidth(70),
            },
          ]}>
          {item.answer}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    marginVertical: SIZING.scaleHeight(1),
    marginHorizontal: SIZING.scaleWidth(1),
    borderRadius: SIZING.scaleWidth(2),
    borderColor: COLORS.GRAY,
    borderWidth: 1,
  },
  offerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZING.scaleWidth(3),
    marginVertical: SIZING.scaleHeight(0.5),
  },
  offerItemNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SIZING.scaleWidth(65),
  },
  offerText: {
    marginLeft: SIZING.scaleWidth(2),
    color: COLORS.BLACK,
    fontFamily: FONTS.PoppinsBold,
    fontSize: SIZING.scaleFont(3.8),
    opacity: 0.8,
  },
  offerDescription: {
    color: COLORS.GRAY,
    fontFamily: FONTS.PoppinsRegular,
    fontSize: SIZING.scaleFont(3.6),
    marginHorizontal: SIZING.scaleWidth(5),
  },
});

export default FaqItem;

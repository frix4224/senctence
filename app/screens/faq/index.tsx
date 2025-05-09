import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLORS, SIZING} from '../../utils';
import {FONTS} from '../../assets/fonts';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FaqItem from './item';
import {FetchHomeFaqs} from '../../services/methods/home';
import {useQuery} from '@tanstack/react-query';
import {ActivityIndicator} from 'react-native-paper';

const FAQ = ({navigation}: {navigation: any}) => {
  const [faqList, setFaqList] = useState<
    {
      id: number;
      question: string;
      answer: string;
      created_at: string;
    }[]
  >([]);

  const {data: faqsData, isLoading} = useQuery({
    queryKey: ['faqs'],
    queryFn: () => FetchHomeFaqs(),
  });

  useEffect(() => {
    if (faqsData?.status === 200 && faqsData.data.status) {
      setFaqList(faqsData.data.data);
    }
  }, [faqsData]);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backIconContainer}
        activeOpacity={0.5}
        onPress={() => navigation.goBack()}>
        <IonIcons
          name="arrow-back-outline"
          size={SIZING.scaleWidth(7)}
          color={COLORS.BLACK}
          style={{
            marginTop: SIZING.scaleHeight(5),
            marginBottom: SIZING.scaleHeight(2),
          }}
        />
      </TouchableOpacity>
      <View style={styles.headingContainer}>
        <View style={styles.headingBar} />
        <Text style={styles.headingText}>Getting Started</Text>
      </View>
      <View style={styles.contactDetailsWrapper}>
        <Text style={styles.itemHeadingText}>How can we help you?</Text>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={SIZING.scaleFont(5)}
            color={COLORS.BLACK}
          />
          <TextInput
            placeholder="Enter your keyword"
            style={styles.searchInput}
          />
        </View>
        <View style={styles.topQuestionsContainer}>
          <Text style={styles.topQuestionsText}>Top Questions</Text>
          {/* <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity> */}
        </View>
        {isLoading ? (
          <ActivityIndicator size={'large'} color={COLORS.PRIMARY} />
        ) : (
          <FlatList
            data={faqList}
            renderItem={({item}) => <FaqItem item={item} />}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default FAQ;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backIconContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: SIZING.scaleWidth(5),
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(2),
  },
  headingText: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(5),
    color: COLORS.BLACK,
  },
  itemHeadingText: {
    fontFamily: FONTS.GilroySemiBold,
    color: COLORS.BLACK,
    fontSize: SIZING.scaleFont(4.8),
    textAlign: 'center',
    marginTop: SIZING.scaleHeight(1),
  },
  headingBar: {
    height: SIZING.scaleHeight(2.2),
    backgroundColor: COLORS.PRIMARY,
    width: SIZING.scaleWidth(1),
    marginRight: SIZING.scaleWidth(2),
    borderRadius: SIZING.scaleWidth(2),
    marginTop: SIZING.scaleHeight(-0.5),
  },
  contactDetailsWrapper: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: SIZING.scaleWidth(5),
    marginTop: SIZING.scaleHeight(2),
    borderRadius: SIZING.scaleWidth(1.5),
    paddingHorizontal: SIZING.scaleWidth(3),
    paddingBottom: SIZING.scaleHeight(2),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: SIZING.scaleWidth(2),
    paddingLeft: SIZING.scaleWidth(3),
    marginVertical: SIZING.scaleHeight(1),
  },
  searchInput: {
    fontFamily: FONTS.GilroyRegular,
    fontSize: SIZING.scaleFont(4),
    color: COLORS.BLACK,
    width: SIZING.scaleWidth(70),
    marginLeft: SIZING.scaleWidth(2),
    marginTop: SIZING.scaleHeight(0.5),
  },
  topQuestionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZING.scaleWidth(2),
    marginTop: SIZING.scaleHeight(2),
    marginBottom: SIZING.scaleHeight(1),
  },
  topQuestionsText: {
    fontFamily: FONTS.GilroySemiBold,
    fontSize: SIZING.scaleFont(4),
    color: COLORS.BLACK,
  },
  viewAllText: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.GilroyMedium,
    fontSize: SIZING.scaleFont(3.5),
  },
});

import {atom} from 'jotai';
import {
  CollectionAndDeliveryType,
  ServiceItemsType,
  ServiceCategory,
} from '../customTypes/home';
import moment from 'moment';

const initialCollectionState = {
  selectedAddress: {
    id: 0,
    user_id: 0,
    lat: 0,
    long: 0,
    default: 0,
    address: '',
    type: '',
    created_at: '',
  },
  scheduleDate: moment().toDate(),
  selectedSlot: '',
  selectedSlotTime: '',
  schedule_collect_from: {id: 0, from: ''},
  dropDate: moment().toDate(),
  dropSlot: '',
  dropSlotTime: '',
  drop_collect_from: {id: 0, from: ''},
  driver_notes: '',
  facility_notes: '',
  phoneNumber: '',
};

export const cartItemsAtoms = atom<
  {
    serviceImage: string;
    serviceName: string;
    items: {
      itemId: number;
      quantity: number;
      category: string;
      item: ServiceItemsType;
    }[];
  }[]
>([]);

export const collectionAndDeliveryAtom = atom<CollectionAndDeliveryType>(
  initialCollectionState,
);
export const serviceItemsAtoms = atom<
  {
    id: number;
    name: string;
    icon: string;
    image: string;
    description: string;
    service_categories: ServiceCategory[];
  }[]
>([]);

export const paymentLoadingAtom = atom<{loading: boolean; status: number}>({
  loading: false,
  status: 0,
});
export const paymentDataAtom = atom<{
  paymentId: string;
  payment_transaction_id: number;
}>({
  paymentId: '',
  payment_transaction_id: 0,
});

export const fcmTokeAtom = atom<string>('');

export const orderDataAtom = atom<{
  facilityId: number;
  orderTotal: number;
  grandTotal: number;
  pickupDate: string;
  dropDate: string;
}>({
  facilityId: 0,
  orderTotal: 0,
  grandTotal: 0,
  pickupDate: '',
  dropDate: '',
});

export const selectedFacilityAtom = atom<number>(0);

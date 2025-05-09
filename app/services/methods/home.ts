import {AxiosRequestConfig} from 'axios';
import {Endpoints} from '../apiConstants';
import axiosPrivate from '../apiInstance';
import {
  AddressUpdateRequest,
  AddressUpdateResponse,
  BannersResponse,
  CollectFromListResponse,
  CostBreakupRequest,
  CostBreakupResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  DeleteAddressResponse,
  FaqsResponse,
  FetchUserOrdersResponse,
  PlaceCODOrderRequest,
  PlaceCODOrderResponse,
  PlaceOnlineOrderRequest,
  PlaceOnlineOrderResponse,
  ServiceResponse,
  SlotsListResponse,
  UserAddressResponse,
  UserMobileNumberUpdateResponse,
  UserMobileNumberVerifyResponse,
  UserProfileResponse,
  UserProfileUpdateRequest,
  UserProfileUpdateResponse,
} from '../types/home';

export const FetchHomeServices = async () => {
  return await axiosPrivate.get<ServiceResponse>(Endpoints.SERVICES);
};
export const FetchHomeFaqs = async () => {
  return await axiosPrivate.get<FaqsResponse>(Endpoints.FAQS);
};
export const FetchHomeBanners = async () => {
  return await axiosPrivate.get<BannersResponse>(Endpoints.BANNERS);
};

export const CreateCODOrderApi = async (data: PlaceCODOrderRequest) => {
  return await axiosPrivate.post<PlaceCODOrderResponse>(
    Endpoints.PLACE_COD_ORDER,
    data,
  );
};
export const CreateOnlineOrderApi = async (data: PlaceOnlineOrderRequest) => {
  return await axiosPrivate.post<PlaceOnlineOrderResponse>(
    Endpoints.PLACE_ONLINE_ORDER,
    data,
  );
};
export const VerifyOnlinePaymentApi = async (data: PlaceCODOrderRequest) => {
  return await axiosPrivate.post<PlaceCODOrderResponse>(
    Endpoints.VERIFY_ONLINE_PAMENT,
    data,
  );
};

export const FetchUserAddressApi = async () => {
  return await axiosPrivate.get<UserAddressResponse>(Endpoints.USER_ADDRESS);
};

export const FetchSlotsApi = async () => {
  return await axiosPrivate.get<SlotsListResponse>(Endpoints.SLOTS);
};
export const FetchCollectFromApi = async () => {
  return await axiosPrivate.get<CollectFromListResponse>(
    Endpoints.COLLECT_FROM,
  );
};

export const CreateUserAddressApi = async (data: CreateAddressRequest) => {
  return await axiosPrivate.post<CreateAddressResponse>(
    Endpoints.CREATE_USER_ADDRESS,
    data,
  );
};

export const DeleteUserAddressApi = async (id: string, userId: string) => {
  const config: AxiosRequestConfig = {
    params: {user_id: userId},
    headers: {'Content-Type': 'application/json'},
  };
  return await axiosPrivate.delete<DeleteAddressResponse>(
    Endpoints.DELETE_USER_ADDRESS + id,
    config,
  );
};

export const FetchUserOrdersApi = async () =>
  await axiosPrivate.get<FetchUserOrdersResponse>(Endpoints.ORDERS);

export const FetchUserProfileApi = async () => {
  return await axiosPrivate.get<UserProfileResponse>(Endpoints.USER_PROFILE);
};
export const UpdateUserProfileApi = async (
  payload: UserProfileUpdateRequest,
) => {
  return await axiosPrivate.put<UserProfileUpdateResponse>(
    Endpoints.USER_PROFILE,
    payload,
  );
};

export const UpdateUserMobileNumberApi = async (mobile: number) => {
  return await axiosPrivate.post<UserMobileNumberUpdateResponse>(
    Endpoints.USER_MOBILE_NUMBER,
    {mobile},
  );
};
export const VerifyUserMobileNumberApi = async (
  mobile: number,
  otp: number,
) => {
  return await axiosPrivate.post<UserMobileNumberVerifyResponse>(
    Endpoints.VERIFY_MOBILE_NUMBER,
    {mobile, otp},
  );
};
export const UserAddressUpdateApi = async ({
  payload,
  addressId,
}: {
  payload: AddressUpdateRequest;
  addressId: string;
}) => {
  return await axiosPrivate.put<AddressUpdateResponse>(
    Endpoints.USER_ADDRESS_UPDATE(addressId),
    payload,
  );
};
export const CancelOrderApi = async ({
  order_number,
  remark,
}: {
  order_number: number;
  remark: string;
}) => {
  return await axiosPrivate.post(Endpoints.CANCEL_ORDER, {
    order_number,
    remark,
  });
};

export const fetchCostBreakUp = async (data: CostBreakupRequest[]) => {
  return await axiosPrivate.post<CostBreakupResponse>(
    Endpoints.COST_BREAKUP,
    data,
  );
};
export const logoutApi = async () => {
  return await axiosPrivate.post<CostBreakupResponse>(Endpoints.LOGOUT);
};

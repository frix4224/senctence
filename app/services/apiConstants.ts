export const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const Endpoints = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  SOCIAL_SIGNUP: 'social/',

  SERVICES: 'service-price-item',
  PLACE_COD_ORDER: 'placeOrder',
  PLACE_ONLINE_ORDER: 'prepare-payment',
  VERIFY_ONLINE_PAMENT: 'placeOrder',
  USER_ADDRESS: 'user/address',
  USER_PROFILE: 'user',
  USER_ADDRESS_UPDATE: (addressId: string) =>
    `user/update-address/${addressId}`,
  USER_MOBILE_NUMBER: 'user/send-otp',
  VERIFY_MOBILE_NUMBER: 'user/verify-otp',
  CANCEL_ORDER: 'report-failure',
  CREATE_USER_ADDRESS: 'user/create-address',
  DELETE_USER_ADDRESS: 'user/address/',
  SLOTS: 'slots',
  COLLECT_FROM: 'collect_from',
  ORDERS: 'user/orders',
  BANNERS: 'banners',
  FAQS: 'faqs',
  COST_BREAKUP: 'checkout/cost-breakup',
  LOGOUT: 'logout',
} as const;

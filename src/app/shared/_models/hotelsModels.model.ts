export class HotelSearchRequest {
  // page?: number = 0;
  // size?: number = 20;
  latitude: number;
  longitude: number;
  checkin: string;
  checkout: string;
  residency?: string = "gb";
  language? = "en";
  currency?: string = "EUR";
  guests: GuestModel[];
  // mealOptions?: { title: string; selected: boolean }[] = [];
  // starsOptions?: { title: string; selected: boolean }[] = [];
  // hotelFacilities?: { title: string; selected: boolean }[] = [];
  // propertyTypes?: { title: string; selected: boolean }[] = [];
  // propertyThemes?: { title: string; selected: boolean }[] = [];
  // bedTypes?: { title: string; selected: boolean }[] = [];
  // sortBy?: string = "asc";
}

export class GuestModel {
  adults: number;
  children: number[];
}

export class HotelListByGeo {
  content: ShortHotelModel[];
  empty: boolean;
  first: boolean;
  last: boolean;
  // number of page
  number: number;
  numberOfElements: number;
  currentSearchTotal: number;
  size: number;
  totalElements: number;
  totalPages: number;
  // TODO: do we need this props? (ask Andrian)
  pageable: any;
  sort: any;
}

export class HotelPageResponse {
  page: HotelListByGeo;
  currentSearchTotal: number;
  allHotels: ShortHotelModel[];
}

export class ShortHotelModel {
  address: string;
  name: string;
  distanceFromGeoPoint: string;
  rating: number;
  hotelStars: number;
  images: string[];
  hotelsImages: string[];
  lowestPrice: number;
  latitude: number;
  longitude: number;
  location: HotelLocation;
  roomType: string;
  id: string;
  hotelSearchRequest: HotelSearchRequest;
  rates: HotelRatesModel[] = [];
}

export class HotelLocation {
  x: number;
  y: number;
  coordinates: [];
  type: string;
}

export class ShortHodelCardModel extends ShortHotelModel {
  featuredImage: string;
  label: string;
  lat: number;
  lng: number;
  options: any;
}

export class HotelPageModel {
  bar_price_data: any;
  distanceFromGeoPoint: any;
  hotel: HotelModel;
  hotelReview: any;
  hotelStars: number;
  hotelsImages: string[];
  id: string;
  rates: HotelRatesModel[];
  rateHawkDictionary: any;
  rating: any;
}

export class HotelRatesModel {
  allotment: number;
  amenities_data: string[];
  any_residency: boolean;
  bar_rate_price_data: any;
  book_hash: string;
  daily_prices: number[] = [];
  deposit: any;
  match_hash: string;
  meal: string;
  no_show: any;
  payment_options: PaymentOptionsModel;
  rg_ext: RgExtModel;
  room_data_trans: RoomDataTransModel;
  room_name: string;
  sell_price_limits: any;
  serp_filters: string[];
}

export class PaymentOptionsModel {
  payment_types: PaymentTypesModel[];
}

export class PaymentTypesModel {
  amount: number;
  by: any;
  cancellation_penalties: CancelationPenaltiesModel;
  commission_info: CommissionInfoModel;
  currency_code: string;
  is_need_credit_card_data: boolean;
  is_need_cvc: boolean;
  perks: PerksModel;
  recommended_price: any;
  show_amount: number;
  show_currency_code: string;
  tax_data: TaxDataModelCityTax;
  type: string;
  vat_data: VatModel;
}

export class TaxDataModel {
  taxes: VatModel[];
}

export class TaxDataModelCityTax extends TaxDataModel {
  cityTax: string;
}

export class VatModel {
  amount: number;
  applied: boolean;
  currency_code: string;
  included: boolean;
  value: string;
  name: string;
  included_by_supplier: boolean;
}

export class PerksModel {
  early_checkin: any;
  late_checkout: any;
}

export class CancelationPenaltiesModel {
  free_cancellation_before: any;
  free_cancellation_before_parsed: any;
  policies: PoliciesModel[];
}

export class PoliciesModel {
  amount_charge: number;
  amount_show: number;
  commission_info: CommissionInfoModel;
  end_at: any;
  start_at: any;
  start_at_parsed: any;
  end_at_parsed: any;
}

export class CommissionInfoModel {
  charge: ChargeShowModel;
  show: ChargeShowModel;
}

export class ChargeShowModel {
  amount_commission: number;
  amount_gross: number;
  amount_net: number;
}

export class RoomDataTransModel {
  bathroom: any;
  bedding_type: string;
  main_name: string;
  main_room_type: string;
  misc_room_type: string;
}

export class HotelShowMap {
  id: string;
  name: string;
  distanceFromGeoPoint: string;
  rating: number;
  hotelStars: number;
  images: string[];
  lowestPrice: number;
  latitude: number;
  longitude: number;
  address: string;
  roomType: string;
  hotelSearchRequest: HotelSearchRequest;
}

export class HotelModel {
  language: string;
  email: string;
  facts: FactsModel;
  id: string;
  images: string[];
  kind: string;
  latitude: number;
  longitude: number;
  name: string;
  phone: string;
  region: RegionModel;
  address: string;
  amenity_groups: AmenityGroupsModel[];
  check_in_time: string;
  check_out_time: string;
  description_struct: DescriptionStruct[];
  front_desk_time_end: string;
  front_desk_time_start: string;
  hotel_chain: string;
  is_closed: boolean;
  is_gender_specification_required: boolean;
  metapolicy_extra_info: string;
  metapolicy_struct: MetapolictStructModel;
  payment_methods: string[];
  policy_struct: PolicyStructModel[];
  postal_code: string;
  room_groups: RoomGroupsModel[];
  semantic_version: number;
  star_certificate: StarCertificateModel;
  star_rating: number;
  serp_filters: string[];
  bestinform_markup: number;
}

export class FactsModel {
  electricity: ElectrycityModel;
  floors_number: number;
  rooms_number: number;
  year_built: number;
  year_renovated: number;
}

export class ElectrycityModel {
  frequency: number[];
  sockets: string[];
  voltage: number[];
}

export class RegionModel {
  iata: string;
  id: number;
  name: string;
  type: string;
  country_code: string;
}

export class AmenityGroupsModel {
  amenities: string[];
  group_name: string;
}

export class DescriptionStruct {
  title: string;
  paragraphs: string[];
}

export class MetapolictStructModel {
  add_fee: AddFeeModel[];
  check_in_check_out: CheckInCheckOutModel[];
  children: ChildrenModel[];
  children_meal: ChildrenMealModel[];
  cot: CotModel[];
  deposit: DepositModel[];
  extra_bed: ExtraBedModel[];
  internet: InternetModel[];
  meal: MealModel[];
  no_show: NoShowModel[];
  parking: ParkingModel[];
  pets: PetsModel[];
  shuttle: ShuttleModel[];
  visa: VisaModel;
}

export class AddFeeModel {
  currency: string;
  price: number;
  fee_type: string;
  price_unit: string;
}

export class CheckInCheckOutModel {
  currency: string;
  inclusion: string;
  price: number;
  check_in_check_out_type: string;
}

export class ChildrenModel {
  currency: string;
  extra_bed: string;
  price: number;
  age_end: number;
  age_start: number;
}

export class ChildrenMealModel {
  currency: string;
  inclusion: string;
  price: number;
  age_end: number;
  age_start: number;
  meal_type: string;
}

export class CotModel {
  amount: number;
  currency: string;
  inclusion: string;
  price: number;
  price_unit: string;
}

export class DepositModel {
  availability: string;
  currency: string;
  price: number;
  deposit_type: string;
  payment_type: string;
  price_unit: string;
  pricing_method: string;
}

export class ExtraBedModel {
  amount: number;
  currency: string;
  inclusion: string;
  price: number;
  price_unit: string;
}

export class InternetModel {
  currency: string;
  inclusion: string;
  price: number;
  internet_type: string;
  price_unit: string;
  work_area: string;
}

export class MealModel {
  currency: string;
  inclusion: string;
  price: number;
  meal_type: string;
}

export class NoShowModel {
  availability: string;
  time: string;
  day_period: string;
}

export class ParkingModel {
  currency: string;
  inclusion: string;
  price: number;
  price_unit: string;
  territory_type: string;
}

export class PetsModel {
  currency: string;
  inclusion: string;
  price: number;
  pets_type: string;
  price_unit: string;
}

export class ShuttleModel {
  currency: string;
  inclusion: string;
  price: number;
  destination_type: string;
  shuttle_type: string;
}

export class VisaModel {
  visa_support: string;
}

export class PolicyStructModel {
  title: string;
  paragraphs: string[];
}

export class RoomGroupsModel {
  name: string;
  images: string[];
  name_struct: NameStructExendedModel;
  room_amenities: string[];
  rg_ext: RgExtModel;
  rates: HotelRatesModel[];
}
export class RoomGroupsModelExtended extends RoomGroupsModel {
  roomAmenitiesDetails: any[] = [];
}

export enum IconSource {
  OWN,
  PRIME_NG,
  MATERIAL
}

export class RoomAmenityDetails {
  description: string;
  icon: string;
  iconSource: IconSource;
}

export class NameStructModel {
  bathroom: string;
  bedding_type: string;
  main_name: string;
}

export class NameStructExendedModel {
  bathroom: string;
  bedding_type: string;
  main_name: string;
  beddingTypeDescription: string;
}

export class RgExtModel {
  quality: number;
  sex: number;
  bathroom: number;
  bedding: number;
  family: number;
  capacity: number;
  club: number;
  bedrooms: number;
  balcony: number;
  view: number;
  floor: number;
  class: number;
}

export class StarCertificateModel {
  valid_to: Date;
  certificate_id: string;
}

export class ChangesModel {
  changes: boolean;
}

export class PrebookModel {
  hotels: HotelModel[];
  changes: ChangesModel;
}

export class RoomDetails {
  room: RoomGroupsModel;
  rooms: number;
  rate: HotelRatesModel;
  guests: number;
  children: number;
  daysRequested: number;
  selectedSearchParams: any;
  hotelName: string;
  hotelAddress: string;
  latitude: number;
  longitude: number;
}

import { MerchantV2 } from './merchant-v2';

export class MerchantDepartment {
  id: number;
  merchant: MerchantV2;
  merchantId?: number;
  countryCode?: string;
  region?: string;
  city?: string;
  zipcode?: string;
  building?: string;
  apartments?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  openHours = 10 * 60;
  closeHours = 22 * 60;
  isMain?: boolean;
}

export class MerchantDepartment {
  id?: number;
  address: string;
  zipcode: string;
  latitude: number;
  longitude: number;
}

export class Merchant {
  id: number;
  name: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  departments: MerchantDepartment[];
  user: {
    id?: number;
    username: string;
    password?: string;
  };

  public constructor(init?: Partial<Merchant>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}

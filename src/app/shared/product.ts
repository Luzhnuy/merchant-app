export class Product {
  category: string;
  clientkey: string;
  created: string;
  disabled: string;
  enabled: string;
  id: string;
  image: string;
  longdescriptioneng: string;
  longdescriptionfra: string;
  nameeng: string;
  namefra: string;
  price: string;
  shortdescriptioneng: string;
  shortdescriptionfra: string;
  userid: string;

  public constructor(init: Partial<Product>) {
    Object.assign(this, init);
  }
}

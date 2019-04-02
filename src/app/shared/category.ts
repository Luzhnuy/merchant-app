export class Category {
  clientkey: string;
  created: string;
  id: string;
  nameeng: string;
  namefra: string;
  shortdescriptioneng: string;
  shortdescriptionfra: string;
  userid: string;

  public constructor(init: Partial<Category>) {
    Object.assign(this, init);
  }
}

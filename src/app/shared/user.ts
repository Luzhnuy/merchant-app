export class User {
  id: string;
  account: string;
  address: string;
  closehour: string;
  enabled: '0' | '1';
  firstname: string;
  lastname: string;
  logo: string;
  name: string;
  openhour: string;
  phone: string;
  success: boolean;
  token: string;
  username: string;       // the same as email
  website: string;

  // get email() {
  //   return this.username;
  // }
  // set email(value) {
  //   this.username = value;
  // }

  public constructor(init: Partial<User>) {
    Object.assign(this, init);
  }
}

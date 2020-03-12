import { Role } from './role';

export class UserV2 {
  id: number;
  username: string;
  isDefault: boolean;
  isActive = true;
  createdAt: string;  // "2019-06-12T20:54:31.000Z"
  updateAt: string;   // "2019-06-12T20:54:31.000Z"
  roles: Role[] = [];
  authToken: string;
  password: string;

  constructor(init?: Partial<UserV2>) {
    if (init) {
      if (init.roles) {
        init.roles = init.roles.map(role => new Role((role)));
      }
      Object.assign(this, init);
    }
  }

  isLogged() {
    return !!this.id;
  }
}

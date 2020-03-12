export class Role {
  id: number;
  name: string;
  description: string;
  group: string;
  isDefault: boolean;

  constructor(init?: Partial<Role>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}

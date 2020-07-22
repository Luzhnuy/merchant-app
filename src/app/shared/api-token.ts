export class ApiToken {
  userId: number;
  token: string;

  public constructor(init?: Partial<ApiToken>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}

// import { User } from '../../shared/users/user';

export class Entity {
  id: number;
  authorId: number | null;
  moderatorId: number | null;
  isPublished: boolean;
  createdAt: Date;
  get CreatedAtStr() {
    return this.createdAt ? this.createdAt.toString() : null;
  }
  updatedAt: Date;
  // user?: User;     // TODO remove this
  isDefault?: boolean;
}

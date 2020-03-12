// import {Md5} from 'ts-md5';

export class StorageCollectionItem {
  id: string;

  public constructor(init: Partial<StorageCollectionItem>) {
    if (!init.id) {
      init.id = this.generateId();
    }
    Object.assign(this, init);
  }

  private generateId() {
    return (Math.random() * 1000000000000).toFixed(0);
    // return Md5.hashStr((new Date).getTime() + '-' + Math.random()) as string;
  }

}

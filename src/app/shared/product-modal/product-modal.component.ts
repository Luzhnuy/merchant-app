import { Component, Input, NgZone, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HelperService } from '../helper.service';
import { MenuItem } from '../menu-item';
import { ItemsV2Service } from '../items-v2.service';
import { CategoriesV2Service } from '../categories-v2.service';
import { MerchantsService } from '../merchants.service';
import { MenuCategory } from '../menu-category';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() accountId: number;
  @Input() categoryId: number;
  @Input() data: MenuItem;

  name = '';
  description = '';
  price = '';
  disabled = false;
  image: any;
  categories: MenuCategory[];
  fileData: File = null;
  uploader: FileUploader;
  imageChanged = false;

  constructor(
    private modalController: ModalController,
    private itemsV2Service: ItemsV2Service,
    private categoriesV2Service: CategoriesV2Service,
    private merchantsService: MerchantsService,
    private helper: HelperService,
    private zone: NgZone,
  ) {
    this.uploader = new FileUploader({
      disableMultipart: true,
      formatDataFunctionIsAsync: true,
      formatDataFunction: async (item) => {
        return new Promise( (resolve, reject) => {
          resolve({
            name: item._file.name,
            length: item._file.size,
            contentType: item._file.type,
            date: new Date()
          });
        });
      }
    });
  }

  ngOnInit() {
    if (this.data) {
      this.name = this.data.name || '';
      this.description = this.data.description || '';
      this.price = this.data.price.toString() || '';
      this.categoryId = this.data.categoryId || null;
      this.disabled = this.data.isPublished;
      // this.image = this.data.image ? environment.imageHost + this.data.image : null;
      this.image = this.data.image;
    }
    this.categoriesV2Service
      .$categories
      .pipe(take(1))
      .subscribe(categories => this.categories = categories);
  }

  loadCategories() {
    this.categoriesV2Service
      .loadCategories();
  }

  submit() {
    const item =  new MenuItem({
      id: this.data ? this.data.id : undefined,
      name: this.name,
      description: this.description,
      price: parseFloat(this.price),
      categoryId: this.categoryId,
      isPublished: this.disabled,
      merchantId: this.accountId,
    }, true);
    if (this.imageChanged) {
      item.image = this.image;
    }
    if (item.id) {
      this.itemsV2Service
        .update(item)
        .subscribe(
          () => {
            this.modalController.dismiss();
            this.helper.showToast('Product was saved successfully');
            this.loadCategories();
          }
        );
    } else {
      this.itemsV2Service
        .create(item)
        .subscribe(
          () => {
            this.modalController.dismiss();
            this.helper.showToast('Product was saved successfully');
            this.loadCategories();
          }
        );
    }
  }

  cancel() {
    this.modalController.dismiss();
  }

  fileProgress(files: any) {
    this.fileData = files[0] as File;
    if (this.fileData) {
      this.preview();
    }
  }

  private preview() {
    const mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => this.zone.run(() => {
      this.image = <any>reader.result;
      this.imageChanged = true;
    });
  }

}

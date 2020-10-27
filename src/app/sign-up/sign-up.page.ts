import { Component, OnInit } from '@angular/core';
import { HelperService } from '../shared/helper.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Merchant } from '../shared/merchant';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { UserServiceV2 } from '../shared/user-v2.service';
import { ApiV2Service } from '../shared/api-v2.service';

declare var fbq: (...args) => void;
declare var lintrk: (...args) => void;

export enum ZipcodesLists {
  Customers = 'customers',
  Merchants = 'merchants',
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  name: string;
  phone: string;
  email: string;
  password: string;
  website: string;
  description: string;
  latitude: number;
  longitude: number;

  readonly placesOptions = {
    types: ['address'],
    componentRestrictions: {
      country: 'ca'
    }
  };

  address: string;

  addressInvalid = true;

  showErrors = false;

  public formatted_address: string;
  private zipcode: string;
  private googlePlaceAddress: Address;

  private availableZipcodes: string[];
  private readonly endpointZipcodes = 'zipcodes';

  constructor(
    private userServiceV2: UserServiceV2,
    private helper: HelperService,
    private router: Router,
    private errorHandler: ErrorHandlerService,
    private apiClientService: ApiV2Service,
  ) { }

  ngOnInit() {
    if (typeof fbq === 'function') {
      fbq('track', 'PageView');
    }
    if (typeof lintrk === 'function') {
      lintrk('track');
    }
    this.apiClientService
      .get(`${this.endpointZipcodes}/lists`)
      .subscribe((lists: { [key: string ]: { zipcode: string }[]; }) => {
        this.availableZipcodes = lists[ZipcodesLists.Merchants].map(zipcode => zipcode.zipcode);
      });
  }

  handleAddressChange($event) {
    this.addressInvalid = false;
    const longZipcode = $event.address_components.find(cmp => {
      return cmp.types.indexOf('postal_code') > -1;
    });
    const shortZipcode = longZipcode ? longZipcode.long_name.substring(0, 3) : '';
    this.zipcode = shortZipcode;
    this.formatted_address = $event.formatted_address;
    this.googlePlaceAddress = $event;
    this.latitude = this.googlePlaceAddress.geometry.location.lat();
    this.longitude = this.googlePlaceAddress.geometry.location.lng();
    if (this.availableZipcodes.indexOf(shortZipcode) === -1) {
      this.addressInvalid = true;
    }
  }

  register(invalid) {
    this.showErrors = invalid;
    if (invalid) {
      return;
    }
    const merchant = new Merchant({
      name: this.name,
      email: this.email,
      user: {
        username: this.email,
        password: this.password,
      },
      description: this.description,
      website: this.website,
      phone: this.phone,
      departments: [{
        address: this.formatted_address,
        zipcode: this.zipcode,
        latitude: this.latitude,
        longitude: this.longitude,
      }],
    });
    this.userServiceV2
      .create(merchant)
      .subscribe(res => {
        this.userServiceV2
          .login(this.email, this.password)
          .subscribe(() => {
            this.router.navigate(['/']);
          }, err => {
            this.helper.showError(this.errorHandler.handleError(err));
          })
        // this.router.navigate(['/confirm-sms-phone'], { queryParams: { email: this.email }});
      }, err => {
        this.helper.showError(this.errorHandler.handleError(err));
      });
  }
}

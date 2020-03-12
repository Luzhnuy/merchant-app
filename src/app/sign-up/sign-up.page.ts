import { Component, OnInit } from '@angular/core';
import { HelperService } from '../shared/helper.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Merchant } from '../shared/merchant';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { UserServiceV2 } from '../shared/user-v2.service';

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

  private zipcodeszone = ['H2G', 'H3J', 'H3Z', 'H3Y', 'H3H', 'H3V', 'H3T', 'H2V', 'H3G', 'H3A',
    'H3B', 'H2Z', 'H2Y', 'H2X', 'H2W', 'H2T', 'H2J', 'H2L', 'H2H', 'H5B', 'H4Z', 'H5A', 'H3C',
    'H4C', 'H1Y', 'H1V', 'H1W', 'H1X', 'H3C', 'H4B', 'H2K', 'H3P', 'H4V', 'H3R', 'H2S', 'H3K',
    'H3S', 'H3X', 'H3Y', 'H4G', 'H4A', 'H4E', 'H3W',
  ];

  private zipcodeszone1 = ['J4H', 'J4G', 'J4R', 'J4S', 'J4W', 'J4X', 'J4P', 'H2N', 'H2P', 'H2R',
    'H1A', 'H1B', 'H1C', 'H1E', 'H1G', 'H1H', 'H1J', 'H1K', 'H1M', 'H1L', 'H1N', 'H1P', 'H1R',
    'H1S', 'H1T', 'H1Z', 'H2A', 'H2B', 'H2C', 'H2E', 'H2M', 'H3E', 'H3L', 'H3M', 'H3N', 'H4H',
    'H4J', 'H4K', 'H4L', 'H4M', 'H4N', 'H4P', 'H4R', 'H4S', 'H4T', 'H4W', 'H4X', 'H4Y',
    'H8N', 'H8P', 'H8R', 'H8S', 'H8T', 'H8Y', 'H8Z', 'H9A', 'H9B', 'H9C', 'H9E', 'H9G', 'H9H',
    'H9J', 'H9K', 'H9P', 'H9R', 'H9S', 'H9W', 'H9X'
  ];

  constructor(
    private userServiceV2: UserServiceV2,
    private helper: HelperService,
    private router: Router,
    private errorHandler: ErrorHandlerService,
  ) { }

  ngOnInit() {
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
    if (this.zipcodeszone.indexOf(shortZipcode) === -1 && this.zipcodeszone1.indexOf(shortZipcode) === -1) {
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
        this.router.navigate(['/confirm-sms-phone'], { queryParams: { email: this.email }});
      }, err => {
        this.helper.showError(this.errorHandler.handleError(err));
      });
  }
}

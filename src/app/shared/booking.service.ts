import { EventEmitter, Injectable } from '@angular/core';
import { Booking } from './booking';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { BookingExtra } from './booking-extra';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
  ) { }

  book(booking: Booking, extra: BookingExtra) {
    const event = new EventEmitter<any>();

    const data = {
      'ApiKey': 'NONE',
      booking,
      extra
    };

    this.http
      .post(
        this.apiService.getUrl('marchands/bookdelivery/'),
        data,
      )
      .subscribe((resp) => {
        event.emit(true);
      }, (err) => {
        event.error(false);
      });

    return event.asObservable();
  }
}

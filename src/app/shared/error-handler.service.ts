import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  private readonly DefaultErrors = {
    200: 'Syntax error during parsing response.',
    400: 'Bad request.',
    401: 'Access denied.',
    403: 'Operation is forbidden.',
    404: 'Not found',
    422: 'Some data is invalid',
  };

  constructor() { }

  /**
   * Returns error message string
   */
  handleError(e: Error | HttpErrorResponse): string {
    let message = '';
    if (e instanceof HttpErrorResponse) {
      // TODO log error and send to the server
      message = e.error.message || this.DefaultErrors[e.status] || e.statusText;
    } else {
      message = e.message;
    }
    return message;
  }
}

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginQrCodeService {
  API_URL: string = 'https://iothubcrud.azurewebsites.net';
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient) {}

  // Handle Errors (if it's an ErrorEvent just pass stuff else give a message)
  error(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);

    return throwError(() => {
      return errorMessage;
    });
  }

  // Create
  addLoginQrCode(data: any): Observable<any> {
    let URL = this.API_URL + '/addLoginQrCode';

    return this.http
      .post(URL, data, { headers: this.headers })
      .pipe(catchError(this.error));
  }
  // Read
  getAllQrCodes(): Observable<any> {
    let URL = this.API_URL + '/getAllQRCodes/';

    return this.http
      .get(URL, { headers: this.headers })
      .pipe(catchError(this.error));
  }
}

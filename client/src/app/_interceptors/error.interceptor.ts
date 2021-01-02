import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if(error){
          switch(error.status){
            case 400:
              if(error.error.errors){
                const modalStateErors = [];
                for(const key in error.error.errors){
                  modalStateErors.push(error.error.errors[key]);
                }
                throw modalStateErors.flat();
              }
              else{
                this.toastr.error(error.error.title, error.status);
              }
              break;
            case 401:              
            this.toastr.error(error.statusText, error.status);
              break;
            case 500:
              const navigateExtras: NavigationExtras = {state: {error: error.error}}
              this.router.navigateByUrl('/server-error',navigateExtras);
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            default:
              this.toastr.error('something unexpected happened');
              console.log(error);
              break;
          }
        }
        return throwError(error);
      })
    )
  }
}

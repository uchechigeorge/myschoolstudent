import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { homeRoute } from '../models/app-routes';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canLoad(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated.pipe(
      filter(value => value !== null), // filter out initial subject value
      take(1), // Otherwise, the observable doesn't complete!
      map(isAuthenticated => {
        if(isAuthenticated) {
          this.router.navigateByUrl(homeRoute, { replaceUrl: true });
        }
        else {
          return true;
        }

      })
    )
  }
}

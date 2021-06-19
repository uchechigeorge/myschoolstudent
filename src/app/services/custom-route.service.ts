import { Injectable } from '@angular/core';
import { PageRoute, homeRoute, settingsRoute, resultsRoute, paymentsRoute, loginRoute, notificationsRoute } from '../models/app-routes';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CustomRouteService {
  
  public PageRoute: PageRoute;

  public PageUrl: string;

  constructor(
    private router: Router,
  ) {
    this.router.events.subscribe((val: NavigationEnd) => {
      if(!(val instanceof NavigationEnd)) return;

      this.PageRoute = this.convertStringToPageType(val.url);
      this.PageUrl = val.url;
    });
  }
  
  async getRoute() {
    return this.PageUrl;
  }

  convertStringToPageType(route: string): PageRoute {
    route = route.replace('/', '');
    switch(route) {
      case '':
        return PageRoute.Home;
      case homeRoute:
        return PageRoute.Home;
      case settingsRoute:
        return PageRoute.Settings;
      case notificationsRoute:
        return PageRoute.Notifications;
      case resultsRoute:
        return PageRoute.Result;
      case paymentsRoute:
        return PageRoute.Payments;
      case loginRoute:
        return PageRoute.Login;
      default:
        return PageRoute.None;
    }
  }

}
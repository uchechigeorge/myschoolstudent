import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Plugins } from "@capacitor/core";

import { homeRoute, PageRoute, nonAuthRoutes, IAppPages, 
  paymentsRoute, settingsRoute, loginRoute, resultsRoute, notificationsRoute } from 'src/app/models/app-routes';
import { CustomRouteService } from 'src/app/services/custom-route.service';
import { AlertController, Platform } from '@ionic/angular';
import { AuthService, STUDENTCREDENTIALS_KEY, STUDENTID_KEY } from 'src/app/services/auth.service';
import { isDefaultImage, asyncTimeOut } from 'src/app/models/list-models';

const { App, Storage } = Plugins;

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  
  public appPages: IAppPages[] = [
    {
      title: 'Home',
      url: homeRoute,
      pageRoute: PageRoute.Home,
      icon: 'home',
      handler: () => {
        this.navigate(PageRoute.Home);
      }
    },
    {
      title: 'Result',
      url: resultsRoute,
      icon: 'bar-chart',
      pageRoute: PageRoute.Result,
      handler: () => {
        this.navigate(PageRoute.Result);
      }
    },
    {
      title: 'Payments',
      url: paymentsRoute,
      icon: 'cash',
      pageRoute: PageRoute.Payments,
      handler: () => {
        this.navigate(PageRoute.Payments);
      }
    },
    {
      title: 'Notifications',
      url: notificationsRoute,
      icon: 'notifications',
      pageRoute: PageRoute.Notifications,
      handler: () => {
        this.navigate(PageRoute.Notifications);
      }
    },
    {
      title: 'Settings',
      url: settingsRoute,
      icon: 'settings',
      pageRoute: PageRoute.Settings,
      handler: () => {
        this.navigate(PageRoute.Settings);
      }
    },
    {
      title: 'Log Out',
      url: loginRoute,
      icon: 'log-out',
      pageRoute: PageRoute.Login,
      handler: async () => {
        const alert = await this.alertCtrl.create({
          header: "Notice",
          message: "Log Out?",
          buttons: [
            {
              text: "Ok",
              handler: async () => {
                await this.authService.logout();
              },
            },
            {
              text: "Cancel",
              role: "cancel"
            }
          ]
        });
    
        return await alert.present();
      }
    },
  ];

  // public PageUrl: string = '';
  public PageTitle: string = '';
  @ViewChild('snav', { static: true }) sideNav: MatSidenav;
  public menuDisabled: boolean = true;
  public closeMenu: boolean = false;
  public hasImage: boolean = false;
  public imgSrc: string = '';
  public hasDetails = false;
  public hasTerm = false;
  public username = '';
  public schoolName = '';
  public activeTerm = '';

  mobileQuery: MediaQueryList;

  private _pageUrl: string;
  get pageUrl() {
    return this._pageUrl;
  }

  set pageUrl(value) {
    if(this._pageUrl == "login" && value == "home" && !this.mobileQuery.matches) {
      this.sideNav.open();
    }
    this._pageUrl = value;
  }

  private _mobileQueryListener: () => void;

  constructor(
    private router: Router,
    private platform: Platform,
    private alertCtrl: AlertController,
    private authService: AuthService,
    public customRoute: CustomRouteService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.router.events.subscribe((val: NavigationEnd) => {
      if(!(val instanceof NavigationEnd)) return;

      this.pageUrl = val.urlAfterRedirects.replace('/', '');
      const page = this.appPages.find(page => page.url == this.pageUrl);
      this.PageTitle = page.title;
      this.checkSideMenu();
    });

    this.setBackBtnPriority();
  }

  ngOnInit() {
    asyncTimeOut(3000)
    .then(() => {
      if(!this.mobileQuery.matches && !this.menuDisabled){
        this.sideNav.open();
      }
    });

    this.getSettings();
  }

  getSettings() {
    this.authService.getSettings()
    .subscribe(res => {
      this.schoolName = res?.name;

    })
  }

  imgErr() {
    this.hasImage = false;
  }
  
  imgLoaded() {
    if(isDefaultImage(this.imgSrc)) {
      this.hasImage = false;
    }
    else {
      this.hasImage = true;
    }
  }

  async menuOpened() {
    this.getDetails();
    this.getActiveTerm();
  }

  async getDetails() {
    if(this.hasDetails) return;

    const { value } = await Storage.get({ key: STUDENTCREDENTIALS_KEY });
    if(value) {
      const details = JSON.parse(value);
      this.imgSrc = details.dpUrl;
      this.username = details.username;
      this.hasDetails = true;
      
    }
    else {
      const { value } = await Storage.get({ key: STUDENTID_KEY });
      if(value) return;

      this.authService.viewStudent({
        updateType: "2",
        studentId: value,
        pageNum: "1",
        pageSize: "1",
      })
      .subscribe(async res => {
        if(res.statuscode == 200) {
          const response = res.dataResponse[0];
          this.authService.saveCredentials({
            credentials: JSON.stringify(response),
          });

          this.imgSrc = response.dpUrl;
          this.username = response.username;
          this.hasDetails = true;
        }
      })
    }
  }

  async getActiveTerm() {
    if(this.hasTerm) return;
    this.authService.viewTerm({
      updateType: "3",
      pageSize: "10",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.activeTerm = `${response.term}${this.getPosition(response.term)} term ${response.schoolYear}`;
        this.hasTerm = true;
      }
    }, err => { });
  }

  navigate(pageRoute: PageRoute) {
    const page = this.appPages.find(page => page.pageRoute == pageRoute);
    const route = page.url;
    this.PageTitle = page.title;
    this.closeOnClick();

    this.router.navigateByUrl(route);
  }
  
  checkSideMenu() {
    this.menuDisabled = !nonAuthRoutes.some(route => route == this.pageUrl);
    this.closeMenu = this.menuDisabled;
    if(!nonAuthRoutes.some(route => route == this.pageUrl)) {
      this.sideNav.close();
      this.imgSrc = '';
      this.hasDetails = false;
      this.hasImage = false;
      this.hasTerm = false;
      this.activeTerm = '';
      this.username = '';
    }
  }

  setBackBtnPriority() {
    if(this.sideNav?.opened) {
      this.platform.backButton.subscribeWithPriority(50, () => {
        this.sideNav.close();
      });
    }
  }

  getPosition(value: number): string {
    if(value % 100 > 10 && value % 100 < 20) {
      return 'th';
    }
    else if(value % 10 == 1) {
      return 'st';
    }
    else if(value % 10 == 2) {
      return 'nd';
    }
    else if(value % 10 == 3) {
      return 'rd';
    }
    else if(!value){
      return '';
    }
    else {
      return 'th';
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  closeOnClick() {
    if(this.mobileQuery.matches) {
      this.sideNav.close();
    }
  }

}

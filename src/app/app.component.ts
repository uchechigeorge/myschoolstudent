import { Component, OnInit } from '@angular/core';

import { Platform, isPlatform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar as StatusBarNative } from '@ionic-native/status-bar/ngx';
import { Plugins, StatusBarStyle } from "@capacitor/core";
import { themeKeyValue } from './models/storage-models';
import { FcmService } from './services/fcm.service';
import { CustomRouteService } from './services/custom-route.service';
import { PageRoute, homeRoute } from './models/app-routes';
import { Router } from '@angular/router';

const { App, StatusBar, Storage } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  
  public Theme: IThemeType = 'light';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBarNative,
    private fcmService: FcmService,
    private customRoute: CustomRouteService,
    private router: Router,
  ) {
    this.initializeApp();
  }
  
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });

    this.setBackBtnPriority();
    
    this.fcmService.initPush();
    this.checkThemeAsync();
  }
  
  ngOnInit() {
  }

  async checkThemeAsync() {
    const { value } = await Storage.get({ key: themeKeyValue });
    if(value == 'null' || value == null) {
      this.Theme = "system-preference"
      await Storage.set({
        key: themeKeyValue,
        value: this.Theme,
      });
    }
    else{
      this.Theme = value as IThemeType;
    }
    this.toggleTheme();
  }

  toggleTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if(this.Theme == 'light') {
      this.setLight();
    }
    else if(this.Theme == 'dark') {
      this.setDark();
    }
    else if(this.Theme == 'system-preference') {
      if(prefersDark.matches) {
        this.setDark();
      }
      else {
        this.setLight();
      }
    }
  }

  setLight() {
    document.body.classList.remove('dark');
    if(!isPlatform('capacitor')) return;
    StatusBar.setBackgroundColor({
      color: '#673AB7',
    });
    StatusBar.setStyle({
      style: StatusBarStyle.Light,
    });
  }

  setDark() {
    document.querySelector('body').classList.add('dark');
    if(!isPlatform('capacitor')) return;
    StatusBar.setBackgroundColor({
      color: '#323233',
    });
    StatusBar.setStyle({
      style: StatusBarStyle.Dark,
    });
  }

  setBackBtnPriority() {
    this.platform.backButton.subscribeWithPriority(-10, (process) => {
      if(this.customRoute.PageRoute == PageRoute.Home || this.customRoute.PageRoute == PageRoute.Login) {
        App.exitApp();
      }
      else{
        this.router.navigateByUrl(homeRoute);
      }

      // process();
    });   

    this.platform.backButton.subscribeWithPriority(50, (process) => {
      alert("Hii");
    });    
  }
}

type IThemeType = "light" | "dark" | "system-preference";

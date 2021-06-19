import { Injectable } from '@angular/core';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  Capacitor
} from '@capacitor/core';
import { isPlatform } from "@ionic/angular";
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
 
const { PushNotifications, Device } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private authService: AuthService,
  ) { }

  initPush() {
    if(isPlatform("capacitor")) {
      this.registerPush();
    }
  }
 
  private async registerPush() {
    await PushNotifications.requestPermission().then((permission) => {
      if (permission.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // No permission for push granted
      }
    });
 
    PushNotifications.addListener(
      'registration',
      async (token: PushNotificationToken) => {
        const device = await Device.getInfo();

        this.authService.addFirebaseId({
          notificationToken: token.value,
          device: device.model,
        })
        .subscribe(async (res) => { 
        },
        err => {
        })
      }
    );
 
    PushNotifications.addListener('registrationError', (error: any) => { });
 
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );
 
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: PushNotificationActionPerformed) => {
        const data = notification.notification.data;
        console.log('Action performed: ' + JSON.stringify(notification.notification));
        if (data.detailsId) {
          // this.router.navigateByUrl(`/home/${data.detailsId}`);
        }
      }
    );
  }
  
}

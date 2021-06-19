import { Component, OnInit, ViewChild } from '@angular/core';
import { IListDetailsOptions } from 'src/app/models/list-models';
import { isPlatform, ModalController, AlertController, IonToggle, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Plugins, StatusBarStyle } from "@capacitor/core";

import { themeKeyValue } from 'src/app/models/storage-models';
import { loginRoute } from 'src/app/models/app-routes';
import { ResetPasswordComponent } from 'src/app/components/modals/reset-password/reset-password.component';
import { resetPasswordModalID, recoveryEmailModalID, updateScratchCardModalID } from 'src/app/models/components-id';
import { AuthService, STUDENTID_KEY } from 'src/app/services/auth.service';
import { RecoveryEmailComponent } from 'src/app/components/modals/recovery-email/recovery-email.component';
import { UpdateScratchCardComponent } from 'src/app/components/modals/update-scratch-card/update-scratch-card.component';

const  { Storage, StatusBar } = Plugins;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

 
  public Theme: IThemeType = 'light';
  public PushNotificationEnabled: boolean = false;
  public LogOutBtnText: string = "Log Out";

  @ViewChild('toggle') toggle: IonToggle;

  public SettingsOptions: ISettingsOptions[] = [
    // Theme
    {
      title: 'Theme',
      id: ListItemID.Theme,
      subtitle: 'Light',
      hasHeader: true,
      header: 'Preferences',
      icon: isPlatform('ios') ? 'sunny-outline' : 'sunny-sharp',
      button: true,
      handler: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Select Theme',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Ok',
              handler: (e) => {
                if(e == undefined) return false;
                this.changeTheme(e);
              }
            },
          ],
          inputs: [
            {
              type: 'radio',
              label: 'System Preferrence',
              value: 'system-preference' as IThemeType,
              checked: this.Theme == 'system-preference',
            },
            {
              type: 'radio',
              label: 'Light',
              value: 'light' as IThemeType,
              checked: this.Theme == 'light',
            },
            {
              type: 'radio',
              label: 'Dark',
              value: 'dark' as IThemeType,
              checked: this.Theme == 'dark',
            },
          ]
        });

        return await alert.present();
      }
    },
    // Notifications
    {
      title: 'Push Notifications',
      checkDisabled: true,
      id: ListItemID.Notifications,
      subtitle: "Off",
      icon: "notifications",
      button: false,
      toggle: true,
      handler: async (e?: any) => {
        if(!e) return;
        
        const listItem = this.getListItem(ListItemID.Notifications);

        const state = !this.toggle.checked;

        this.authService.updateNotificationState({ state })
        .subscribe(async (res) => { 
          listItem.checkDisabled = true;
          if(res.statuscode == 200) {
            await this.presentToast("Success");
            this.getNotification();
          }
          else {
            this.presentToast(res.status);
            this.toggle.checked = !this.toggle.checked;
            listItem.checkDisabled = false;
          }
        },
        err => { 
          this.toggle.checked = !this.toggle.checked;
          listItem.checkDisabled = false;
          this.presentToast("Could not update");
        });
      },
    },
    // Reset Password
    {
      title: 'Reset Password',
      subtitle: 'Secure your account',
      hasHeader: true,
      header: 'Account Settings',
      button: true,
      icon: isPlatform('ios') ? 'key-outline' : 'key-sharp',
      handler: async () => {
        const modal = await this.modalCtrl.create({
          component: ResetPasswordComponent,
          id: resetPasswordModalID,
        });

        return await modal.present();
      }
    },
    // Update Scratch Card
    {
      id: ListItemID.ScratchCard,
      title: 'Update Scratch Card',
      subtitle: 'Not activated',
      button: true,
      icon: isPlatform('ios') ? 'card-outline' : 'card-sharp',
      handler: async () => {
        const modal = await this.modalCtrl.create({
          component: UpdateScratchCardComponent,
          id: updateScratchCardModalID,
        });

        await modal.present();
        await modal.onWillDismiss();
        this.getScratchCard();
      }
    },
    // Recovery Email
    {
      title: 'Recovery Email',
      subtitle: 'Add an email for recovery',
      icon: isPlatform('ios') ? 'mail-outline' : 'mail-sharp',
      button: true,
      handler: async () => {
        const modal = await this.modalCtrl.create({
          component: RecoveryEmailComponent,
          id: recoveryEmailModalID
        });

        return await modal.present();
      }
    },
    // Help
    {
      title: 'Help and Support',
      subtitle: 'Having an issue? Contact us. FAQs',
      button: true,
      icon: isPlatform('ios') ? 'help-outline' : 'help-sharp',
      handler: () => {
        
      }
    },
  ]

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getUserDetails();
    this.getNotification();
    this.getScratchCard();
  }

  async getUserDetails() {
    const { value } = await Storage.get({ key: themeKeyValue });
    
    if(value == 'null' || value == null) {
      this.Theme = "system-preference"
      await Storage.set({
        key: themeKeyValue,
        value: this.Theme,
      });
    }
    else {
      this.Theme = value as IThemeType;
    }
    this.changeTheme(this.Theme);
  }
  
  getListItem(id: ListItemID) {
    const listItem = this.SettingsOptions.find(item => item.id == id);
    return listItem;
  }

  changeTheme(value?: IThemeType) {
    let listItem = this.getListItem(ListItemID.Theme);
    
    switch (value) {
      case 'system-preference':
        listItem.subtitle = 'System Preference';
        listItem.icon = isPlatform('ios') ? 'desktop-outline' : 'desktop-sharp';
        this.Theme = 'system-preference';
        break;
      case 'light':
        listItem.subtitle = 'Light';
        listItem.icon = isPlatform('ios') ? 'sunny-outline' : 'sunny-sharp';
        this.Theme = 'light';
        break;
      case 'dark':
        listItem.subtitle = 'Dark';
        listItem.icon = isPlatform('ios') ? 'moon-outline' : 'moon-sharp';
        this.Theme = 'dark';
        break;
      default:
        break;
    }

    Storage.set({
      key: themeKeyValue,
      value: this.Theme
    });
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

  async logOut() {
    const alert = await this.alertCtrl.create({
      header: "Notice",
      message: "Log Out?",
      buttons: [
        {
          text: "Ok",
          handler: () => {
            this.authService.logout();
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

  async getNotification() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });
    if(!value) return;

    return this.authService.viewFBId({
      updateType: "3",
      postId: "2",
      pageNum: "1",
      pageSize: "1",
      qString: value,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];

        this.toggle.checked = response.notificationState;
        
        const listItem = this.getListItem(ListItemID.Notifications);
        if(this.toggle.checked == true) {
          listItem.icon = isPlatform('ios') ? 'notifications-outline' : 'notifications-sharp';
          listItem.subtitle = 'On';
        }
        else {
          listItem.icon = isPlatform('ios') ? 'notifications-off-outline' : 'notifications-off-sharp';
          listItem.subtitle = 'Off';
        }
        listItem.checkDisabled = false;
      }
    })
  }

  getResultProcedure() {
    this.authService.viewResultProcedure()
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        console.log(response);
      }
    })
  }

  async getScratchCard() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;

    this.authService.viewScratchCard({
      updateType: "1",
      studentId: value,
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;

        if(response[0].activated == true) {
          this.getListItem(ListItemID.ScratchCard).subtitle = "Activated";
        }
      }
      
    }, err => { })
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }
}

type IThemeType = 'light' | 'dark' | 'system-preference';

enum ListItemID{
  Theme,
  Notifications,
  ScratchCard,
}

interface ISettingsOptions{
  title: string,
  id?: any,
  subtitle?: string,
  button?: boolean,
  icon?: string,
  iconSrc?: string,
  hasHeader?: boolean,
  toggle?: boolean,
  disabled?: boolean,
  checkDisabled?: boolean,
  header?: string,
  showSecondaryIcon?: boolean,
  secondaryIcon?: string,
  handler?: () => void,
}

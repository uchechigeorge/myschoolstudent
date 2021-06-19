import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Plugins } from "@capacitor/core";

import { requiredField } from 'src/app/helpers/input-validators';
import { homeRoute } from 'src/app/models/app-routes';
import { AuthService, TOKEN_KEY } from 'src/app/services/auth.service';
import { ToastController, ModalController } from '@ionic/angular';
import { ForgotPasswordComponent } from '../modals/forgot-password/forgot-password.component';
import { forgotPasswordModalID } from 'src/app/models/components-id';
import { MatSidenav } from '@angular/material/sidenav';

const { Storage } = Plugins;
export const CHECK_INTERNET_CON = "Check internet connection";


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
 
  public isVerifying: boolean = false;
  @Input() public showTitle: boolean = true;
  @Input('title') public titleText: string = 'Welcome';
  @Input() public isMobile = false;
  
  public loginForm = new FormGroup({
    'username': new FormControl('', [
      requiredField
    ]),
    'password': new FormControl('', [
      requiredField
    ])
  });

  public hidePassword: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {}

  onChange() {
    
  }

  login() {
    if(this.isVerifying || this.loginForm.invalid) return;

    this.isVerifying = true;
    
    const username = this.loginForm.get('username').value?.trim();
    const password = this.loginForm.get('password').value?.trim();

    this.authService.login({ username, password })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.isVerifying = false;
        this.authService.isAuthenticated.next(true);
        
        this.authService.saveCredentials({
          studentId: res.dataResponse.studentId,
          token: res.dataResponse.token,
          credentials: JSON.stringify(res.dataResponse)
        })
        this.proceed();
      }
      else if(res.statuscode == 401) {
        this.isVerifying = false;
        this.authService.isAuthenticated.next(false);
        await Storage.remove({ key: TOKEN_KEY });
        this.loginForm.get("password").setErrors({ invalidCredentials: true });

        this.loginForm.get("username").setErrors({ invalidCredentials: true });
      }
      else {
        this.presentToast(res.status);
      }
      
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isVerifying = false;
      
    })
  }

  async forgotPassword() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordComponent,
      id: forgotPasswordModalID,
    });

    await modal.present();
  }

  proceed() {
    this.isVerifying = false;
    this.loginForm.reset();
    this.router.navigateByUrl(homeRoute, { replaceUrl: true });
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

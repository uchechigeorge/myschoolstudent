import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { forgotPasswordModalID } from 'src/app/models/components-id';
import { requiredField } from 'src/app/helpers/input-validators';
import { Validators, FormControl } from '@angular/forms';

const CHECK_INTERNET_CON = "Check internet connection";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

  public formControl = new FormControl("", [ requiredField, Validators.maxLength(50) ]);
  
  public isVerifying: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private authService: AuthService,

  ) { }

  ngOnInit() {}

  resetPassword() {
    if(this.isVerifying || this.formControl.invalid) return;

    this.isVerifying = true;

    const username = this.formControl.value?.trim();
    this.authService.forgotPassword({ username })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.presentToast("Your password has been reset and sent to your recovery email");
      }
      else {
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }


  dismissModal() {
    this.modalCtrl.dismiss('', '', forgotPasswordModalID);
  }
}

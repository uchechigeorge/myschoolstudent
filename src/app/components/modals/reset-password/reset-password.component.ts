import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { resetPasswordModalID } from 'src/app/models/components-id';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { requiredField, passwordConfirming } from 'src/app/helpers/input-validators';
import { AuthService } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from '../../login-form/login-form.component';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {

  public confirmFormControl = new FormControl('', [ requiredField ]);
  public resetFormGroup = new FormGroup({
    'password': new FormControl('', [ requiredField, Validators.maxLength(50), Validators.minLength(5) ]),
    'confirmPassword': new FormControl('', [ requiredField, passwordConfirming ])
  });

  public isConfirmed: boolean = false;
  public hidePassword1: boolean = true;
  public hidePassword2: boolean = true;
  public hidePassword3: boolean = true;

  public isResetting: boolean = false;
  public isConfirming: boolean = false; 

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {}

  verifyPassword() {
    if(this.isConfirming || this.confirmFormControl.invalid) return;

    this.isConfirming = true;

    const password = this.confirmFormControl.value?.trim();
    this.authService.confirmPassword({ password })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        this.isConfirmed = true;
      }
      else {
        this.confirmFormControl.setErrors({ invalid: true });
      }

      this.isConfirming = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  resetPassword() {
    if(this.isResetting || this.resetFormGroup.invalid) return;

    this.isResetting = true;
    const oldPassword = this.confirmFormControl.value?.trim();
    const newPassword = this.resetFormGroup.get("password").value?.trim();

    this.authService.resetPassword({ oldPassword, newPassword })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        await this.authService.saveCredentials({
          studentId: res.dataResponse.studentId,
          token: res.dataResponse.token,
        });
        this.resetFormGroup.reset();
        this.confirmFormControl.reset();
        this.presentToast("Successful");
        this.isConfirmed = false;
        this.dismissModal();
      }
      else {
        this.presentToast(res.status);
      }
      this.isResetting = false;
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
    this.modalCtrl.dismiss('', '', resetPasswordModalID);
  }

}

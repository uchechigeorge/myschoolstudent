import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FormControl } from '@angular/forms';
import { Plugins } from "@capacitor/core";

import { updateScratchCardModalID } from 'src/app/models/components-id';
import { requiredField } from 'src/app/helpers/input-validators';
import { AuthService, STUDENTID_KEY } from 'src/app/services/auth.service';
import { CHECK_INTERNET_CON } from '../../login-form/login-form.component';

const { Storage } = Plugins;

@Component({
  selector: 'app-update-scratch-card',
  templateUrl: './update-scratch-card.component.html',
  styleUrls: ['./update-scratch-card.component.scss'],
})
export class UpdateScratchCardComponent implements OnInit {

  public activated = false;
  public isVerifying = false;

  public showError = false;
  public isLoading = true;
  public errMessage = "";

  public formControl = new FormControl('', [ requiredField ]);

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.getScratchCard();
  }

  update() {
    if(this.isVerifying || this.formControl.invalid) return;

    this.isVerifying = true;
    const scratchCardNumber = this.formControl.value.replace(/-/g, '');

    this.authService.updateScratchCard({ scratchCardNumber })
    .subscribe(res => {
      if(res.statuscode == 200) {
        this.presentToast("Successful");

        this.getScratchCard();
      }
      else {
        this.presentToast(res.status);
      }

      this.isVerifying = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isVerifying = false;
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
          this.activated = true;
        }
        else {
          this.activated = false;
        }
      }
      else {
        this.activated = false;
      }
      
      this.isLoading = false;
    }, err => { 
      this.activated = false;
      this.isLoading = false;
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
    this.modalCtrl.dismiss('', '', updateScratchCardModalID);
  }
}

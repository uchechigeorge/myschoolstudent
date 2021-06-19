import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IEditInput } from 'src/app/models/list-models';
import { Platform, ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AuthService, STUDENTID_KEY } from 'src/app/services/auth.service';
import { recoveryEmailModalID } from 'src/app/models/components-id';
import { Plugins } from "@capacitor/core";
import { CHECK_INTERNET_CON } from '../../login-form/login-form.component';

const LOADER_ID = "update-email-loader";

const { Storage } = Plugins;

@Component({
  selector: 'app-recovery-email',
  templateUrl: './recovery-email.component.html',
  styleUrls: ['./recovery-email.component.scss'],
})
export class RecoveryEmailComponent implements OnInit {

  public studentId: string;
  public isLoading: boolean = true;
  public showError: boolean = false;
  public errMessage: string = "";
  public isDeleting: boolean = false;

  public details: IEditInput[] = [
    {
      id: EditInputs.Email,
      model: "",
      label: 'Email',
      icon: 'email',
      type: 'email',
      valiators: ['email', 'maxLength'],
      inputChange: (e) => {
        this.getInput(EditInputs.Email).model = e.model?.trim();
      },
      updateInput: async () => {
        await this.showLoading();
        let value = await this.authService.updateEmail({ email: this.getInput(EditInputs.Email).model?.trim() })
        .toPromise()
        .then(res => {
          if(res.statuscode == 200) {
            this.dismissLoading();
            this.authService.saveCredentials({
              studentId: res.dataResponse.studentId,
              token: res.dataResponse.token
            });
            this.presentToast("Successful");
            return true;
          }
          else {
            this.dismissLoading();
            this.presentToast(res.status);
            return false;
          }
        }, (err) => {
          this.dismissLoading();
          this.presentToast(CHECK_INTERNET_CON);
          return false;
        });
        
        return value;
      }
    },
  ]
 
  public isVerifying: boolean = false;
  
  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private changeDetectorRef: ChangeDetectorRef,
    private alertCtrl: AlertController,
  ) { 
   
    this.setBackBtnPriority();
  }

  ngOnInit() {
    this.getStudent();
  }


  async getStudent() {

    const { value } = await Storage.get({ key: STUDENTID_KEY });
    if(!value) {
      this.presentToast("Unknown error. Try again later");
      return;
    }

    this.studentId = value;
    
    this.authService.viewStudent({
      updateType: "2",
      studentId: value,
      pageSize: "1",
      pageNum: "1",
    })
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];
        this.getInput(EditInputs.Email).model = response.email;
      }
      else {
        this.presentToast(res.status);
      }

      this.isLoading = false;

    }, (err) => {
      this.isLoading = false;

      this.presentToast(CHECK_INTERNET_CON);
    })
  }

  getInput(id: EditInputs) {
    return this.details?.find(detail => detail.id == id);
  }

  async showLoading(message?: string) {
    if(!message) message = "Uploading credentials";
    const loader = await this.loadingCtrl.create({
      id: LOADER_ID,
      message,
      spinner: "crescent",
    });

    return await loader.present();
  }

  async dismissLoading() {
    await this.loadingCtrl.dismiss();
  }

  setBackBtnPriority() {
  
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
    this.modalCtrl.dismiss('', '', recoveryEmailModalID);
  }
}

enum EditInputs{
  Email
}
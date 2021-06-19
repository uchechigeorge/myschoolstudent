import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, STUDENTID_KEY } from 'src/app/services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Plugins } from "@capacitor/core";

import { asyncTimeOut, ISelectOptions, ISelectMultipleOptions } from 'src/app/models/list-models';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { CHECK_INTERNET_CON } from 'src/app/components/login-form/login-form.component';
import { PaystackOptions } from 'angular4-paystack';

const { Storage } = Plugins;
const LOADER_ID = "update-email-loader";

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {

  public formGroup = new FormGroup({
    term: new FormControl(""),
    classId: new FormControl(""),
  });

  public showError = false;
  public isLoading = false;
  public errMessage = "";
  public selectTerms: ISelectOptions[] = [];
  public selectClasses: ISelectMultipleOptions[] = [];

  public isVerifying: boolean = false;
  public classFeesDataSource = new MatTableDataSource<IFeeDataSource>([]);
  public studentFeesDataSource = new MatTableDataSource<IFeeDataSource>([]);
  public paidFeesDataSource = new MatTableDataSource<IFeeDataSource>([]);
  public feesData: IFeeDataSource[] = [];
  public hasClassFees = false;
  public hasStudentFees = false;
  public hasPaidFees = false;

  public displayColumns: string[] = ['title', 'amount', 'description'];
  public paidDisplayColumns: string[] = ['title', 'amount', 'description', "paymentType"];
  public reference = "";
  public amount: number;

  @ViewChild('paystackBtn') paystackBtn;

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.getTerms();
    this.getClasses();
  }

  get termId() {
    return this.formGroup.get('term').value?.trim();
  }

  get classId() {
    return this.formGroup.get('classId').value?.trim();
  }

  async getTerms() {
    this.authService.viewTerm({
      updateType: "10",
      pageSize: "30",
      pageNum: "1",
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        response.forEach(term => {
          this.selectTerms.push({
            text: term.term + this.getPosition(term.term) + " term" + " - " + term.schoolYear,
            value: term.termId,
          });
        });
      }
    })
  }

  async getClasses() {
    const classes = await this.authService.viewClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    const subClasses = await this.authService.viewSubClass({
      updateType: "10",
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response;
      }
    });

    if(!classes || !subClasses) return;

    classes.forEach(c => {
      c.subClasses = [];
      subClasses.forEach(s => {
        if(s.parentClassId == c.classId)
          c.subClasses.push(s);
      });
    });

    classes.forEach(c => {
      if(c.subClasses.length > 0){
        this.selectClasses.push({
          label: c.className,
          options: c.subClasses.map(s => {
            return {
              text: s.subClassName,
              value: s.subClassId,
            }
          })
        })
      }
    });
    
  }

  async getRefernce() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;

    this.reference = value + "_" + Date.now().toString();
  }

  onSelectChanged() {
    this.hasClassFees = false;
    if(this.termId != "" && this.classId != "") {
      this.isLoading = true;
      this.amount = null;

      this.getClassFees();
      this.getStudentFees();
      this.getPaidFees();
    }

  }

  async getClassFees() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;
    this.authService.viewGeneralFees({
      updateType: "1",
      termId: this.termId,
      classId: this.classId,
    })
    .subscribe(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        let data: IFeeDataSource[] = [];
        response.forEach(fee => {
          data.push({
            type: "0",
            typeId: fee.generalFeesId,
            title: fee.title,
            amount: fee.amount,
            description: fee.description,
            select: fee
          });
        });

        this.amount ? this.amount += parseFloat(response[0].totalAmount) : this.amount = parseFloat(response[0].totalAmount);
        this.classFeesDataSource = new MatTableDataSource(data);
        this.feesData = data;
        this.hasClassFees = true;
        this.errMessage = "";
        this.showError = false;

      }
      else if(res.statuscode == 204) {
        this.errMessage = "No fees";
        this.hasClassFees = false;
      }
      else {
        this.presentToast(res.status);
      }

      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
    
  }

  async getStudentFees() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;
    this.authService.viewSpecificFees({
      updateType: "1",
      termId: this.termId,
      studentId: value,
    })
    .subscribe(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        let data: IFeeDataSource[] = [];
        response.forEach(fee => {
          data.push({
            type: "1",
            typeId: fee.specificFeesId,
            title: fee.title,
            amount: fee.amount,
            description: fee.description,
            select: fee
          });
        });

        this.amount ? this.amount += parseFloat(response[0].totalAmount) : this.amount = parseFloat(response[0].totalAmount);
        this.studentFeesDataSource = new MatTableDataSource(data);
        this.feesData = data;
        this.hasStudentFees = true;
        this.errMessage = "";
        this.showError = false;

      }
      else if(res.statuscode == 204) {
        this.errMessage = "No fees";
        this.hasStudentFees = false;
      }

      this.isLoading = false;
    }, err => {
      // this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
    
  }

  async getPaidFees() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;
    this.authService.viewPaidFees({
      updateType: "2",
      termId: this.termId,
      qString: value,
    })
    .subscribe(async res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        console.log(response[0].type);
        let data: IFeeDataSource[] = [];
        response.forEach(fee => {
          data.push({
            type: fee.type,
            typeId: fee.tyeId,
            title: fee.type ? (fee.type == "0" ? fee.generalFeesTitle : fee.specifcFeesTitle) : "",
            amount: fee.amountPaid,
            description: fee.type ? (fee.type == "0" ? fee.generalFeesDescription : fee.specifcFeesDescription) : "",
            select: fee,
            paymentType: fee.type ? (fee.type == "0" ? `${fee.subClassName} fees` : "Student fees") : ""
          });
        });

        this.paidFeesDataSource = new MatTableDataSource(data);
        this.feesData = data;
        this.hasPaidFees = true;
      }
    }, err => { })
    
  }

  refresh() {

  }

  async pay() {
    if(this.isVerifying) return;
    await this.getRefernce();

    const { value } = await Storage.get({ key: STUDENTID_KEY });
    
    if(!value) return;
    this.isVerifying = true;
    
      this.authService.viewStudent({
        updateType: "2",
        studentId: value,
        pageNum: "1",
        pageSize: "1",
      })
      .subscribe(async res => {
        if(res.statuscode == 200) {
          const response = res.dataResponse[0];
          await this.authService.saveCredentials({
            studentId: response.studentId,
            token: response.token,
            credentials: JSON.stringify(response),
          });
          
          this.paystackBtn.nativeElement.click();
          // this.getRefernce();
        }
        else {
          this.showAlert();
        }
        this.isVerifying = false;
      }, err => {
        this.presentToast(CHECK_INTERNET_CON);
        this.isVerifying = false;
      });
  }

  async verifyPayment() {
    const reference = this.reference;

    this.authService.verifyPayment({ reference })
    .subscribe(async res => {
      console.log(res);
      if(res.status == true) {
        this.registerPayment();
      }
      else {
        this.presentToast("Unkwown error");
        this.dismissLoading();
        this.reset();
      }
    }, err => { 
      this.dismissLoading();
      this.reset();
    })
  }
 
  paymentCancel() {
  }

  async paymentInit() {
    
  }

  async paymentDone(e) {
    await this.showLoading();
    await this.verifyPayment();
  }

  async registerPayment() {
    const fees = this.feesData.map((fee) => { 
      return { type: fee.type, typeId: fee.typeId, amount: fee.amount };
    })
    this.authService.payFees({ fees })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        await this.authService.saveCredentials({
          token: response.token,
          studentId: response.studentId,
        });
        this.presentToast("Successful");
        this.reset();

      }
      else {
        this.presentToast(res.status);
      }

        this.reset();
        this.dismissLoading();
    }, err => {
      this.dismissLoading();
      this.reset();
    });
  }
  
  
  reset() {
    this.hasClassFees = false;
    this.formGroup.get('term').setValue("");
    this.formGroup.get('classId').setValue("");
  }
  
  async showLoading(message?: string) {
    if(!message) message = "Please wait ...";
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

  showAmount(amount: number) {
    if(!amount) return "0";
    let amountString = amount.toFixed(2).toString();

    let wholeNumber = amountString.replace(/\.[0-9]+/, '');
    let decimalNumber = amountString.replace(wholeNumber, '');
    let wholeNumberArray: string[] = wholeNumber.split('');
    let decimalArray: string[] = decimalNumber.split('');
    let wholeNoModifiedArray: string[] = [];

    wholeNumberArray = wholeNumberArray.reverse();
      wholeNumberArray.forEach((value, i) => {
        if(isNaN(parseInt(value))) return;
        wholeNoModifiedArray.push(value);
          if((( i + 1 ) % 3 ) == 0) {
          wholeNoModifiedArray.push(',');
        }
      });

      wholeNoModifiedArray = wholeNoModifiedArray.reverse().concat(decimalArray);

      amountString = wholeNoModifiedArray.join('');
      amountString = amountString.replace(/^,/, '');

      return amountString;
  }

  async showAlert(message?: string) {
    if(!message) message = "Try logging in again to complete transaction to avoid errors.";
    const alert = await this.alertCtrl.create({
      header: "Warning",
      backdropDismiss: false,
      message,
      buttons: [
        { 
          text: "OK", 
          handler: async () => { 
            await this.authService.logout();
          } 
        }
      ]
    });

    await alert.present();
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

interface IFeeDataSource {
  type?: string,
  typeId?: string,
  title: string, 
  amount?: string, 
  description?: string,
  select?: string,
  paymentType?: string,
  className?: string,
}
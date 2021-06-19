import { Component, OnInit, SecurityContext } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from "@capacitor/core";

import { ICourseResult, ISelectOptions, asyncTimeOut } from 'src/app/models/list-models';
import { AuthService, STUDENTID_KEY } from 'src/app/services/auth.service';
import { ToastController, ModalController, LoadingController } from '@ionic/angular';
import { CHECK_INTERNET_CON } from 'src/app/components/login-form/login-form.component';
import { updateScratchCardModalID } from 'src/app/models/components-id';
import { UpdateScratchCardComponent } from 'src/app/components/modals/update-scratch-card/update-scratch-card.component';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

const { Storage, Filesystem } = Plugins;

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  public formControl = new FormControl("");
  public showError = false;
  public isLoading = false;
  public errMessage = "";
  public selectTerms: ISelectOptions[] = [];

  public displayColumns: string[] = ['course', 'CA', 'exam', 'total', 'grade'];
  
  public resultDataSource = new MatTableDataSource<IResultDataSource>([]);
  public hasResults = false;
  public studentName = '';
  public className = '';
  public termName = '';

  public gettingResult = false;
  public resultError = false;
  public resultErrorMessage = "Provide your scratch card number";

  public details: IDetail[] = [
    { id: IDetailModel.Average, value: '_', label: 'Average', icon: 'ribbon' },
    // { id: IDetailModel.Position, value: '_', label: 'Position', icon: 'trending-up' },
    { id: IDetailModel.ClassAverage, value: '_', label: 'Class Average', icon: 'school' },
    { id: IDetailModel.NumberOfStudents, value: '_', label: 'Number of Students', icon: 'people' },
  ]

  public resultPDFSrc: string = "";

  // get saniResultPDFSrc(){
  //   return this.domSanitizer.bypassSecurityTrustResourceUrl(this.resultPDFSrc);
  // }
  
  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private httpClient: HttpClient,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.reset();
    this.getResultProcedure();
  }

  get termId() {
    return this.formControl.value?.trim();
  }

  onSelectChanged(e) {
    this.hasResults = false;
    
    if(this.termId != "") {
      this.isLoading = true;
      this.getResult();
      this.termName = this.selectTerms.find(opt => opt.value == this.termId).text;
    }
  }

  async getResult() {
    this.resultDataSource = new MatTableDataSource([]);
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;

    this.authService.viewResult({
      updateType: "2",
      termId: this.termId,
      qString: value,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;
        
        const results: IResultDataSource[] = [];

        response.forEach(result => {
          results.push({
            course: result.course,
            ca: result.ca,
            exam: result.exam,
            total: result.total,
            grade: result.grade,
          });
        });

        this.studentName = response[0].studentName;
        this.className = response[0].subClassName;
        this.getItem(IDetailModel.Average).value = parseFloat(response[0].average).toPrecision(4);
        this.getClassResult();
        this.getStudents();
        this.resultDataSource = new MatTableDataSource(results);
        this.hasResults = true;
        this.errMessage = "";
        this.showError = false;
      }
      else if(res.statuscode == 204) {
        this.errMessage = res.status;
        this.showError = true;
        this.hasResults = false;
      }
      else {
        this.presentToast(res.status);
        this.hasResults = false;
      }
      
      this.isLoading = false;
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.hasResults = false;
      this.isLoading = false;
    })
  }

  async getClass() {
    this.resultDataSource = new MatTableDataSource([]);
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    return this.authService.viewSubClass({
      updateType: "5",
      pageNum: "1",
      pageSize: "1",
      termId: this.termId,
      qString: value,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response[0];
      }
      
    }, err => { });
  }

  async getClassResult() {
    const subClass = await this.getClass();
   
    this.authService.viewResult({
      updateType: "3",
      termId: this.termId,
      qStringc: subClass?.subClassId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        this.getItem(IDetailModel.ClassAverage).value = parseFloat(response[0].average).toPrecision(4);
        
      }
      
    }, err => { })
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

        if(response[0].activated == true || response[0].allowCards == false) {
          this.resultError = false;
          this.getTerms();
        }
        else {
          this.resultError = true;
          this.isLoading = false;
        }
      }
      else {
        this.resultError = true;
        this.isLoading = false;
      }
    }, err => {
      this.isLoading = false;
    })
  }
  
  getResultProcedure() {
    this.authService.viewResultProcedure()
    .subscribe(res => {
      if(res.statuscode == 200) {
        const response = res.dataResponse;

        this.getScratchCard();
      }
      else {
        this.presentToast(res.status);
        this.isLoading = false;
      }
    }, err => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
  }

  public hasStudentResults = false;

  async getStudents(pageSize?: string) {
    if(!pageSize) pageSize = "1";

    const subClass = await this.getClass();
   
    this.authService.viewStudent({
      updateType: "4",
      pageSize,
      pageNum: "1",
      termId: this.termId,
      qString: subClass.subClassId,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        if(this.hasStudentResults) {

        }
        else {

        }
        const response = res.dataResponse;

        this.getItem(IDetailModel.NumberOfStudents).value = response[0].totalRows;
        
      }
      
    }, err => { })
  }

  async getTerms() {
    this.selectTerms = [];
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

      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    })
  }

  getItem(id: IDetailModel) {
    return this.details.find(item => item.id == id);
  }

  toggleTermChanged(e) {

  }

  async updateScratchCard() {
    const modal = await this.modalCtrl.create({
      component: UpdateScratchCardComponent,
      id: updateScratchCardModalID,
    });

    await modal.present();
    await modal.onWillDismiss();
    this.getScratchCard();
  }

  async print() {
    if(!this.hasResults || this.gettingResult) return;

    const loader = await this.loadingCtrl.create({
      message: "Please wait",
      spinner: "crescent",
    });

    await loader.present();

    this.gettingResult = true;

    let schoolName = "";
    let schoolMotto = "";

    await this.authService.getSettings().toPromise()
    .then(res => {
      schoolName = res?.name;
      schoolMotto = res?.motto;
    });

    this.authService.printResult({
      termId: this.termId,
      qString: schoolName,
      qStringb: schoolMotto,
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {

        const response = res.dataResponse as string;
        
        this.httpClient.get(response, { responseType: "blob" })
        .subscribe((res) => {
          // const name = response.substr(response.lastIndexOf('/') + 1);
          this.downloadFile(res);
        })
        
      }
      else {
        this.presentToast(res.status);
        this.resultPDFSrc = null;
      }

      this.gettingResult = false;
      loader.dismiss();
    }, err => {
      this.presentToast("Could not print result");
      this.resultPDFSrc = null;
      this.gettingResult = false;
      loader.dismiss();
    });
  }

  printDocument(documentId: string) {
    setTimeout(() => {
      var doc = document.getElementById(documentId) as any;

      doc.focus();
      doc.contentWindow.print();
    }, 1000);
  }

  downloadFile(data) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;

    reader.onload = () => {
      resolve(reader.result);
    }

    reader.readAsDataURL(blob);
  })

  reset() {
    this.errMessage = "";
    this.selectTerms = [];
    this.showError = false;
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      position: "bottom",
      duration: 3000
    });

    return await toast.present();
  }
}

interface IResultDataSource{
  course?: string,
  ca?: string,
  exam?: string,
  total?: string,
  grade?: string,
}

interface IDetail {
  id?: any,
  value?: string,
  label?: string,
  icon?: string,
}

enum IDetailModel {
  Average,
  Position,
  ClassAverage,
  NumberOfStudents
}
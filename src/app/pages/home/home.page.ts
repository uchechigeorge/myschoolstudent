import { Component, OnInit } from '@angular/core';
import { INewsItem } from 'src/app/models/list-models';
import { AuthService, STUDENTID_KEY } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { Plugins } from "@capacitor/core";
import { CHECK_INTERNET_CON } from 'src/app/components/login-form/login-form.component';
import { MatTableDataSource } from '@angular/material/table';

const { Storage } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public details: { value: any, label?: string, icon?: string, multiple?: boolean }[] = [];

  public courseDataSource = new MatTableDataSource<CourseTableData>([]);

  public hasCourse = false;
  public displayColumns: string[] = ['position', 'course'];
  public hideSomeDetails: boolean = true;

  public isLoading = true;
  public errMessage = "";
  public showError = false;

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.courseDataSource = new MatTableDataSource([]);
    this.reset();
    this.getStudent();
  }

  async getStudent() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;
    this.authService.viewStudent({
      updateType: "2",
      studentId: value,
      pageNum: "1",
      pageSize: "1"
    })
    .subscribe(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse[0];

        const phoneNumbers = [];
        if(response.phonenum1) phoneNumbers.push(response.phonenum1);
        if(response.phonenum2) phoneNumbers.push(response.phonenum2);
        
        let gender = "";

        if(response.gender != "male" && response.gender != "female") {
          gender = "Rather not say";
        }
        else {
          let _gender = response.gender as string;
          _gender = _gender.slice(0, 1).toUpperCase() + _gender.slice(1);
          gender = _gender;
        }

        const hasDate = !(response?.dob == null || response?.dob == "");

        const subClass = await this.getClass(value);

        this.details = [
          { value: response.fullName, label: 'Full Name', icon: 'person' },
          { value: gender, label: 'Gender', icon: 'person' },
          { value: subClass?.subClassName, label: 'Class', icon: 'business' },
          { value: phoneNumbers, label: 'Phone', icon: 'call' },
          { value: response.email, label: 'Email', icon: 'mail' },
          { value: response.nextOfKin, label: 'Next Of Kin', icon: 'man' },
          { value: hasDate ? new Date(response.dob).toDateString() : "", label: 'Date of Birth', icon: 'gift' },
        ]        

        this.getCourse();
      }
      else {
        this.presentToast(res.status);
      }

      // this.dismissLoader();
      
      this.isLoading = false;
    }, (err) => {
      this.presentToast(CHECK_INTERNET_CON);
      this.isLoading = false;
    })
  }

  async getClass(studentId) {
    return this.authService.viewSubClass({
      updateType: "5",
      pageNum: "1",
      pageSize: "1",
      qString: studentId,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;
        return response[0];
      }
      
    }, err => { });
  }
  
  async getCourse() {
    const { value } = await Storage.get({ key: STUDENTID_KEY });

    if(!value) return;
    return this.authService.viewCourse({
      updateType: "5",
      pageNum: "20",
      pageSize: "1",
      qString: value,
    }).toPromise()
    .then(async (res) => {
      if(res.statuscode == 200) {
        const response = res.dataResponse as Array<any>;

        const courses: CourseTableData[] = [];
        response.forEach((course, i) => {
          courses.push({
            course: course.course,
            position: i + 1
          });
        });

        this.courseDataSource = new MatTableDataSource(courses);
        this.hasCourse = true;
      }
      
    }, err => { });
  }

  reset() {
    this.showError = false;
    this.errMessage = "";
    this.details = [];
    this.courseDataSource = new MatTableDataSource([]);
    this.hasCourse = false;
  }

  async refresh(e?) {
    this.details = [];
    this.courseDataSource = new MatTableDataSource([]);
    await this.getStudent();
    
    e?.target.complete()
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

interface CourseTableData { 
  position?: number, 
  course: string 
}
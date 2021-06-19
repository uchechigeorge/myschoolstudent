import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Plugins } from "@capacitor/core";
import { map, tap, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { loginRoute } from '../models/app-routes';
import { Router } from '@angular/router';

const { Storage } = Plugins;

export const LOCAL_HOST = "http://localhost:58003";
export const REMOTE_HOST = "https://testucheapi.profeworld.com";
export const API_HOST = REMOTE_HOST;

export const STUDENTCREDENTIALS_KEY = "credentials";
export const STUDENTID_KEY = "studentid";
export const TOKEN_KEY = "token";

const LOGIN_API_ROUTE = `${API_HOST}/api/student/auth/login.ashx`;
const UPDATEPASSWORD_API_ROUTE = `${API_HOST}/api/student/auth/resetpassword.ashx`;
const CONFIRMPASSWORD_API_ROUTE = `${API_HOST}/api/student/auth/confirmpassword.ashx`;

const VIEWSTUDENT_API_ROUTE = `${API_HOST}/api/student/view/viewstudent.ashx`;
const VIEWTERM_API_ROUTE = `${API_HOST}/api/student/view/viewterm.ashx`;
const VIEWCLASS_API_ROUTE = `${API_HOST}/api/student/view/viewclass.ashx`;
const VIEWSUBCLASS_API_ROUTE = `${API_HOST}/api/student/view/viewsubclass.ashx`;
const VIEWCOURSE_API_ROUTE = `${API_HOST}/api/student/view/viewcourse.ashx`;
const VIEWRESULT_API_ROUTE = `${API_HOST}/api/student/view/viewresult.ashx`;
const VIEWGFEES_API_ROUTE = `${API_HOST}/api/student/view/viewgeneralfees.ashx`;
const VIEWSFEES_API_ROUTE = `${API_HOST}/api/student/view/viewspecificfees.ashx`;
const VIEWPAIDFEES_API_ROUTE = `${API_HOST}/api/student/view/viewfees.ashx`
const VIEWNOTIFICATION_API_ROUTE = `${API_HOST}/api/student/view/viewnotification.ashx`
const VIEWSCRATCHCARD_API_ROUTE = `${API_HOST}/api/student/view/viewscratchcard.ashx`;
const VIEWRESULTPROCEDURE_API_ROUTE = `${API_HOST}/api/student/view/viewresultprocedure.ashx`;

const PAYFEES_API_ROUTE = `${API_HOST}/api/student/update/fees/payfees.ashx`;
const GETKEY_API_ROUTE = `${API_HOST}/api/student/update/fees/getkey.ashx`;
const VERIFYPAYMENT_API_ROUTE = `${API_HOST}/api/student/update/fees/verifypayment.ashx`;
const ADDFBID_API_ROUTE = `${API_HOST}/api/student/auth/addfbid.ashx`;
const VIEWFBID_API_ROUTE = `${API_HOST}/api/student/view/viewfbalert.ashx`;
const UPDATENOTIFICATIONSTATE_API_ROUTE = `${API_HOST}/api/student/auth/updatenotificationstate.ashx`;
const UPDATESCRATCHCARD_API_ROUTE = `${API_HOST}/api/student/auth/updatescratchcard.ashx`;
const UPDATERESULTPROCEDURE_API_ROUTE = `${API_HOST}/api/admin/update/student/updateresultprocedure.ashx`;

const UPDATEEMAIL_API_ROUTE = `${API_HOST}/api/student/auth/updateemail.ashx`;
const PRINTRESULT_API_ROUTE = `${API_HOST}/api/student/view/printresult.ashx`;
const FORGOTPASSWORD_API_ROUTE = `${API_HOST}/api/student/auth/forgotpassword.ashx`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  private requestToken: { studentId?: string, token?: string } = {};
  public requestSubject: BehaviorSubject<{ studentId?: string, token?: string }> = new BehaviorSubject<{ studentId: string, token: string }>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { 
    this.loadToken();
  }

  getSettings(): Observable<any> {
    return this.http.get('./assets/settings.json');
  }

  async loadToken() {
    const tokenStore = await Storage.get({ key: TOKEN_KEY });
    const studentIdStore = await Storage.get({ key: STUDENTID_KEY });

    const token = JSON.parse(`"${tokenStore.value}"`);
    const studentId = JSON.parse(`"${studentIdStore.value}"`);

    const tokenValid = token && token != "undefined" && token != "null";
    const studentIdValid = studentId && studentId != "undefined" && studentId != "null";
    
    if(tokenValid && studentIdValid) {
      this.isAuthenticated.next(true);
      this.requestSubject.next({
        studentId: studentId,
        token: token
      });
    }
    else {
      this.isAuthenticated.next(false);
      this.router.navigateByUrl(loginRoute, { replaceUrl: true });
    }
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    const httpBody = JSON.stringify(credentials);
    return this.http.post(LOGIN_API_ROUTE, httpBody);
  }

  confirmPassword(credentials: { password: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(CONFIRMPASSWORD_API_ROUTE, bodyString);
  }

  updateEmail(credentials: { email?: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEEMAIL_API_ROUTE, bodyString);
  }

  addFirebaseId(credentials: { notificationToken: string, device?: string, state?: boolean }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(ADDFBID_API_ROUTE, bodyString);
  }

  updateNotificationState(credentials: { state: boolean }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATENOTIFICATIONSTATE_API_ROUTE, bodyString);
  }

  viewFBId(reqParams: {
    updateType?: string,
    postId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.postId) params.postid = reqParams.postId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWFBID_API_ROUTE, bodyString, { params });
  }

  viewTerm(reqParams: {
    updateType?: string,
    termId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWTERM_API_ROUTE, bodyString, { params });
  }
  
  viewStudent(reqParams: {
    updateType?: string,
    studentId?: string,
    termId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWSTUDENT_API_ROUTE, bodyString, { params });
  }

  viewClass(reqParams: {
    updateType?: string,
    classId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.classId) params.classid = reqParams.classId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWCLASS_API_ROUTE, bodyString, { params });
  }

  viewSubClass(reqParams: {
    updateType?: string,
    subClassId?: string,
    termId?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.subClassId) params.classid = reqParams.subClassId;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWSUBCLASS_API_ROUTE, bodyString, { params });
  }
  
  viewCourse(reqParams: {
    updateType?: string,
    courseId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.courseId) params.courseid = reqParams.courseId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWCOURSE_API_ROUTE, bodyString, { params });
  }
  
  viewResult(reqParams: {
    updateType?: string,
    termId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWRESULT_API_ROUTE, bodyString, { params });
  }

  viewSpecificFees(reqParams: {
    updateType?: string,
    termId?: string,
    studentId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSFEES_API_ROUTE, bodyString, { params });
  }

  viewPaidFees(reqParams: {
    updateType?: string,
    termId?: string,
    studentId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWPAIDFEES_API_ROUTE, bodyString, { params });
  }

  viewGeneralFees(reqParams: {
    updateType?: string,
    termId?: string,
    classId?: string,
    search?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.termId) params.termid = reqParams.termId;
    if(reqParams.classId) params.classid = reqParams.classId;
    if(reqParams.search) params.search = reqParams.search;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWGFEES_API_ROUTE, bodyString, { params });
  }

  viewNotifications(reqParams: {
    updateType?: string,
    notificationId?: string,
    postId?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }): Observable<any>{
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};
    
    if(reqParams.updateType) params.updatetype = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.notificationId) params.notificationid = reqParams.notificationId;
    if(reqParams.postId) params.postid = reqParams.postId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;

    return this.http.post(VIEWNOTIFICATION_API_ROUTE, bodyString, { params });
  }

  viewScratchCard(reqParams: {
    updateType?: string,
    studentId?: string,
    scratchCardId?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }
  ): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};

    if(reqParams.updateType) params.updateType = reqParams.updateType; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.studentId) params.studentid = reqParams.studentId;
    if(reqParams.scratchCardId) params.scratchcardid = reqParams.scratchCardId;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(VIEWSCRATCHCARD_API_ROUTE, bodyString, { params });
  }

  printResult(reqParams: {
    updateType?: string,
    termId?: string,
    pageSize?: string,
    pageNum?: string,
    qString?: string, 
    qStringb?: string, 
    qStringc?: string, 
  }
  ): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    let params: { [param: string]: string | string[]; } = {};

    if(reqParams.updateType) params.updateType = reqParams.updateType; 
    if(reqParams.termId) params.termid = reqParams.termId; 
    if(reqParams.pageSize) params.pagesize = reqParams.pageSize;
    if(reqParams.pageNum) params.pagenum = reqParams.pageNum;
    if(reqParams.qString) params.qstring = reqParams.qString;
    if(reqParams.qStringb) params.qstringb = reqParams.qStringb;
    if(reqParams.qStringc) params.qstringc = reqParams.qStringc;
    
    return this.http.post(PRINTRESULT_API_ROUTE, bodyString, { params });
  }

  viewResultProcedure(): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    return this.http.post(VIEWRESULTPROCEDURE_API_ROUTE, bodyString);
  }

  resetPassword(credentials: { oldPassword: string, newPassword: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATEPASSWORD_API_ROUTE, bodyString);
  }

  forgotPassword(credentials: { username: string }): Observable<any> {
    let body: any = {};
    body = {...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(FORGOTPASSWORD_API_ROUTE, bodyString);
  }

  payFees(credentials: { fees: { type: string, typeId: string, amount: string }[] }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(PAYFEES_API_ROUTE, bodyString);
  }
  
  updateScratchCard(credentials: { scratchCardNumber: string }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATESCRATCHCARD_API_ROUTE, bodyString);
  }
  
  updateResultProcedure(credentials: { allowCards: boolean }): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue(), ...credentials};
    const bodyString = JSON.stringify(body);
    return this.http.post(UPDATERESULTPROCEDURE_API_ROUTE, bodyString);
  }
  
  getKey(): Observable<any> {
    let body: any = {};
    body = {...this.requestSubject.getValue()};
    const bodyString = JSON.stringify(body);
    return this.http.post(GETKEY_API_ROUTE, bodyString);
  }
  
  verifyPayment(credentials: { reference: string }): Observable<any> {
    let params: { [param: string]: string | string[] } = {};
    if(credentials.reference) params.reference = credentials.reference;

    return this.http.get(VERIFYPAYMENT_API_ROUTE, { params });
  }

  verifyPaystackPayment(credentials: { reference: string, apikey: string}) {
    let headers: { [param: string]: string | string[]; } = {};
    
    headers.Authorization = `Bearer ${ credentials.apikey }`;
    return this.http.get(`https://api.paystack.co/transaction/verify/${ credentials.reference }`, { headers });
  }


  async logout(): Promise<any> {
    this.isAuthenticated.next(false);
    await Storage.remove({ key: TOKEN_KEY });
    await Storage.remove({ key: STUDENTID_KEY });
    await Storage.remove({ key: STUDENTCREDENTIALS_KEY });

    this.router.navigateByUrl(loginRoute);
  }

  async saveCredentials(credentials: { studentId?: string, token?: string, credentials?: any }) {
    if(credentials.studentId) {
      await Storage.set({ key: STUDENTID_KEY, value: credentials.studentId });
      this.requestToken.studentId = credentials.studentId;
    }  
    if(credentials.token) {
      await Storage.set({ key: TOKEN_KEY, value: credentials.token });
      this.requestToken.token = credentials.token;
    }
    if(credentials.credentials){
      await Storage.set({ key: STUDENTCREDENTIALS_KEY, value: credentials.credentials });
    }

    if(credentials.studentId && credentials.token) {
      this.requestSubject.next(this.requestToken);
    }
  }
}
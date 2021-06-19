import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  public counter: number = 1;
  public NumberOfPictures = 4;
  public imgSrc: ImageType = 'one';
  public schoolImageSrc: string = "./assets/images/school-image.jpeg";
  public schoolName: string = '';

  public mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  public contactDetails: { icon: string, text: string }[] = []

  constructor(
    private authService: AuthService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) { 
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.changeCounter();
    this.getSettings();
  }

  changeCounter() {
    setInterval(() => {
      this.counter++;
      this.pictureChange();
    }, 3000);
  }

  getSettings() {
    this.authService.getSettings()
    .subscribe(res => {
      this.schoolName = res?.name;

      this.contactDetails = [
        { icon: "place", text: res?.address },
        { icon: "phone", text: res?.tel },
      ]
    })
  }

  pictureChange() {
    if(this.counter % 4 == 1) {
      this.imgSrc = 'one';
    }
    if(this.counter % 4 == 2) {
      this.imgSrc = 'two';
    }
    if(this.counter % 4 == 3) {
      this.imgSrc = 'three';
    }
    if(this.counter % 4 == 0) {
      this.imgSrc = 'four';
    }
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  } 
}

type ImageType = 'one' | 'two' | 'three' | 'four';

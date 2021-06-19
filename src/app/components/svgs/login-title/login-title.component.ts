import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-title',
  templateUrl: './login-title.component.html',
  styleUrls: ['./login-title.component.scss'],
})
export class LoginTitleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const paths = document.querySelectorAll('.login-title>path') as any;
    paths.forEach(path => {
      console.log(path.getTotalLength());
    });

    console.log(paths.length);
  }

}

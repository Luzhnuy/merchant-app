import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  firstname: string;
  lastname: string;
  email: string;
  password: string;

  constructor() { }

  ngOnInit() {
  }

  register() {
    alert('Not implemented yet. Please use Login for now');
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true
})
export class LoginComponent {

   loginWithGoogle(): void {

    window.location.href =
      'http://localhost:8080/oauth2/authorization/google';
  }
}


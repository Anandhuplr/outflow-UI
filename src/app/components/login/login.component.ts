import { Component } from '@angular/core';
import { environmentServer } from '../../../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true
})
export class LoginComponent {

   loginWithGoogle(): void {

    window.location.href = environmentServer.SERVER_URL + '/oauth2/authorization/google';
  }
}


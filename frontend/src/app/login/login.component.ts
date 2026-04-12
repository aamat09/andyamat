import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username.trim() || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.username.trim(), this.password).subscribe((ok) => {
      this.loading = false;
      if (ok) {
        this.router.navigate(['/admin']);
      } else {
        this.error = 'Invalid credentials';
      }
    });
  }
}

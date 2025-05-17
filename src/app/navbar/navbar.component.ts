// src/app/navbar/navbar.component.ts (Completed)
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, SearchComponent, NgIf],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.auth.userData.subscribe({
      next: (userData) => {
        this.isLoggedIn = userData !== null;
        this.isAdmin = userData?.authorities === 'ADMIN';
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
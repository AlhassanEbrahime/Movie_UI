// search/search.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class SearchComponent implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  isLoggedIn = false;
  private userDataSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    this.userDataSubscription = this.authService.userData.subscribe(userData => {
      const newLoginState = !!userData;
      
      if (this.isLoggedIn !== newLoginState) {
        this.isLoggedIn = newLoginState;
        
        if (this.isLoggedIn) {
          this.setupSearchListener();
        } else if (this.searchSubscription) {
          this.searchSubscription.unsubscribe();
          this.searchSubscription = null;
        }
      }
    });
    
    if (this.isLoggedIn) {
      this.setupSearchListener();
    }
  }
  
  private setupSearchListener(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query && query.trim() !== '') {
        this.router.navigate(['/search-results'], { 
          queryParams: { query: query }
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.isLoggedIn) {
      return; 
    }
    
    const query = this.searchControl.value;
    if (query && query.trim() !== '') {
      this.router.navigate(['/search-results'], { 
        queryParams: { query: query }
      });
    }
  }
  
  ngOnDestroy(): void {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
    
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
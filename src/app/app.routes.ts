// src/app/app.routes.ts (Updated)
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { SearchResultsComponent } from './pages/search-results.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { MovieSearchComponent } from './admin/movie-search/movie-search.component';
import { MovieListComponent } from './admin/movie-list/movie-list.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'search/:query', component: SearchResultsComponent },
  { path: 'movie-details/:id', component: MovieDetailsComponent },
  { path: 'search-results', component: SearchResultsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },


  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      { path: 'search', component: MovieSearchComponent },
      { path: 'movies', component: MovieListComponent }
    ]
  },
  { path: '**', redirectTo: '' },
  
];
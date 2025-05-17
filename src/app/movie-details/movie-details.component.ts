import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../services/movie.service';
import { Movie, MovieRequest } from '../models/movie.model';
import { switchMap, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  movie: Movie | MovieRequest | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isOmdbMovie: boolean = false;
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private location: Location,
    private authService: AuthService
  ) { }


  ngOnInit(): void {
    if (!this.authService.isLoggedIn()){
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    this.loadMovieDetails();
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  loadMovieDetails(): void {
    this.isLoading = true;
    this.error = null;
    
    this.routeSubscription = this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (!id) {
          throw new Error('Movie ID is required');
        }
        
        const source = params['source'] || this.route.snapshot.queryParams['source'];
        
        if (source === 'omdb' || (id && id.startsWith('tt'))) {
          this.isOmdbMovie = true;
          return this.movieService.getOmdbMovieDetails(id);
        } else {
          // Use local API for your own movies
          this.isOmdbMovie = false;
          return this.movieService.getMovieById(id).pipe(
            catchError(err => {
              console.warn('Local API failed, trying OMDB:', err);
              this.isOmdbMovie = true;
              return this.movieService.getOmdbMovieDetails(id);
            })
          );
        }
      })
    ).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching movie details:', err);
        this.error = 'Failed to load movie details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  retry(): void {
    this.loadMovieDetails();
  }
}
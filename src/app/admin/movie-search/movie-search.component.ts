import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { FormControl } from '@angular/forms';
import { Movie } from '../../models/movie.model';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.css']
})
export class MovieSearchComponent {
  searchControl = new FormControl('');
  searchResults: Movie[] = [];
  selectedMovies: Movie[] = [];
  isLoading = false;
  errorMessage = '';
  private searchSubscription: Subscription;

  constructor(private movieService: MovieService) {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query && query.trim()) {
        this.searchOmdb(query);
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  searchOmdb(query: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.movieService.searchOmdbMovies(query).subscribe({
      next: (results) => {
        this.searchResults = results;        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to search movies. Please try again.';
        this.isLoading = false;
        console.error('Error searching movies:', error);
      }
    });
  }

  toggleSelection(movie: Movie) {
    const index = this.selectedMovies.findIndex(m => m.imdbID === movie.imdbID);
    if (index === -1) {
      this.selectedMovies.push(movie);
    } else {
      this.selectedMovies.splice(index, 1);
    }
  }

  isSelected(movie: Movie): boolean {
    return this.selectedMovies.some(m => m.imdbID === movie.imdbID);
  }

  addSelectedMovies() {
    if (this.selectedMovies.length === 0) {
      this.errorMessage = 'Please select at least one movie to add';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    
    const detailRequests = this.selectedMovies.map(movie => 
      this.movieService.getOmdbMovieDetails(movie.imdbID)
    );
    
    forkJoin(detailRequests).subscribe({
      next: (detailedMovies) => {
        this.movieService.addMovies(detailedMovies).subscribe({
          next: () => {
            this.selectedMovies = [];
            this.isLoading = false;
            this.errorMessage = '';
            alert("Movies added successfully"); 
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to add movies. Please try again.';
            console.error('Error adding movies:', error);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to get movie details. Please try again.';
        console.error('Error getting movie details:', error);
      }
    });
  }

  getMovieDetails(imdbID: string) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.movieService.getOmdbMovieDetails(imdbID).subscribe({
      next: (movie) => {
        this.movieService.addMovie(movie).subscribe({
          next: () => {
            this.isLoading = false;
            alert('Movie added successfully');
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Movie is already exists.';
            console.error('Error adding movie:', error);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to get movie details. Please try again.';
        console.error('Error getting movie details:', error);
      }
    });
  }
}
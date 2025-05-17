import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  selectedMovies: number[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;
  errorMessage = '';
  private subscriptions: Subscription = new Subscription();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.movieService.movies$.subscribe(movies => {
        this.movies = movies;
        this.isLoading = false;
      })
    );


    this.subscriptions.add(
      this.movieService.currentPage$.subscribe(page => {
        this.currentPage = page;
      })
    );

    this.subscriptions.add(
      this.movieService.totalPages$.subscribe(pages => {
        this.totalPages = pages;
      })
    );

    this.loadMovies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadMovies() {
    this.isLoading = true;
    this.errorMessage = '';
    this.movieService.getMovies(this.currentPage).subscribe({
      error: (error) => {
        this.errorMessage = 'Failed to load movies. Please try again.';
        this.isLoading = false;
        console.error('Error loading movies:', error);
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMovies();
    }
  }

  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }

  toggleSelection(movieId: number) {
    const index = this.selectedMovies.indexOf(movieId);
    if (index === -1) {
      this.selectedMovies.push(movieId);
    } else {
      this.selectedMovies.splice(index, 1);
    }
  }

  isSelected(movieId: number): boolean {
    return this.selectedMovies.includes(movieId);
  }

  deleteSelectedMovies() {
    if (this.selectedMovies.length === 0) {
      this.errorMessage = 'Please select at least one movie to delete';
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedMovies.length} movies?`)) {
      this.isLoading = true;
      this.errorMessage = '';
      this.movieService.deleteMovies(this.selectedMovies).subscribe({
        next: () => {
          this.selectedMovies = [];
          // No need to explicitly call loadMovies as it's handled by the service
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete movies. Please try again.';
          this.isLoading = false;
          console.error('Error deleting movies:', error);
        }
      });
    }
  }

  deleteMovie(id: number) {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.isLoading = true;
      this.errorMessage = '';
      this.movieService.deleteMovie(id).subscribe({
        next: () => {
          const index = this.selectedMovies.indexOf(id);
          if (index !== -1) {
            this.selectedMovies.splice(index, 1);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete movie. Please try again.';
          this.isLoading = false;
          console.error('Error deleting movie:', error);
        }
      });
    }
  }

  selectAll() {
    if (this.selectedMovies.length === this.movies.length) {
      this.selectedMovies = [];
    } else {
      this.selectedMovies = this.movies.map(movie => movie.id);
    }
  }
}
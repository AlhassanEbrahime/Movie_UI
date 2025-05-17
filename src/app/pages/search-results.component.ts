// pages/search-results.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { Movie } from '../models/movie.model';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SearchResultsComponent implements OnInit {
  movies: Movie[] = [];
  searchQuery: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  totalResults: string = '0';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.searchQuery = params['query'] || '';
        this.isLoading = true;
        this.error = null;
        
        if (!this.searchQuery) {
          this.movies = [];
          this.isLoading = false;
          return [];
        }
        
        return this.movieService.searchMovies(this.searchQuery);
      })
    ).subscribe({
      next: (results) => {
        this.movies = results;
        this.totalResults = results.length.toString();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching search results:', err);
        this.error = 'Failed to load search results. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
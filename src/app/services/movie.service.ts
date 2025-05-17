// src/app/services/movie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of, BehaviorSubject, tap } from 'rxjs';
import { Movie, SearchResponse, MoviePageResponse, MovieRequest } from '../models/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private baseUrl = 'http://localhost:8080/api/v1/movies';
  
  // BehaviorSubject to track movie list changes
  private moviesSubject = new BehaviorSubject<Movie[]>([]);
  public movies$ = this.moviesSubject.asObservable();
  
  // Track current page and total pages
  private currentPageSubject = new BehaviorSubject<number>(1);
  public currentPage$ = this.currentPageSubject.asObservable();
  
  private totalPagesSubject = new BehaviorSubject<number>(1);
  public totalPages$ = this.totalPagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  getMovies(page: number): Observable<MoviePageResponse> {
    return this.http.get<MoviePageResponse>(`${this.baseUrl}/${page}/all`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(response => {
        this.moviesSubject.next(response.content);
        this.totalPagesSubject.next(response.page.totalPages);
        this.currentPageSubject.next(response.page.number + 1);
      })
    );
  }

  getMovieById(id: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  searchMovies(query: string): Observable<Movie[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    return this.http.get<SearchResponse>(`${this.baseUrl}/search?query=${query}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.Response === 'True') {
          return response.Search;
        }
        return [];
      })
    );
  }

  searchOmdbMovies(query: string): Observable<Movie[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    return this.http.get<SearchResponse>(`${this.baseUrl}/search?query=${query}`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => {
        if (response.Response === 'True') {
          return response.Search;
        }
        return [];
      })
    );
  }

  getOmdbMovieDetails(imdbId: string): Observable<MovieRequest> {
    return this.http.get<MovieRequest>(`${this.baseUrl}/omdb/${imdbId}`, { 
      headers: this.getHeaders() 
    });
  }

  addMovie(movie: MovieRequest): Observable<MovieRequest> {
    return this.http.post<MovieRequest>(this.baseUrl, movie, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        // Refresh the current page after adding a movie
        this.getMovies(this.currentPageSubject.value).subscribe();
      })
    );
  }

  addMovies(movies: MovieRequest[]): Observable<MovieRequest[]> {
    return this.http.post<MovieRequest[]>(`${this.baseUrl}/batch-add`, movies, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        // Refresh the current page after adding movies
        this.getMovies(this.currentPageSubject.value).subscribe();
      })
    );
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        // Refresh the current page after deleting a movie
        this.getMovies(this.currentPageSubject.value).subscribe();
      })
    );
  }

  deleteMovies(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/batch-delete`, ids, { 
      headers: this.getHeaders() 
    }).pipe(
      tap(() => {
        // Refresh the current page after deleting movies
        this.getMovies(this.currentPageSubject.value).subscribe();
      })
    );
  }

  // Method to manually refresh the movie list
  refreshMovieList(page?: number): void {
    const pageToLoad = page || this.currentPageSubject.value;
    this.getMovies(pageToLoad).subscribe();
  }

  // Reset state (useful when logging out)
  resetState(): void {
    this.moviesSubject.next([]);
    this.currentPageSubject.next(1);
    this.totalPagesSubject.next(1);
  }
}
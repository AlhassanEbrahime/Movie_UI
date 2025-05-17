// src/app/models/movie.model.ts
export interface Movie {
  id: number;
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Country?: string
  Language?: string
  Writer?: string
  Poster?: string;
  Rated?: string
  imdbRating?: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  Genre?: string;
  Runtime?: string;
  Released?: string;
}

export interface MovieRequest {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Plot?: string;
  Released?: string;
  Rated?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Actors?: string;
  Writer?: string;
  Language?: string;
  Country?: string;
  Poster?: string;
  imdbRating?: string;
}

export interface SearchResponse {
  Search: Movie[];
  totalResults: string;
  Response: string;
}

export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface MoviePageResponse {
  content: Movie[];
  page: Page;
}
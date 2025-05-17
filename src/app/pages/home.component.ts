import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../services/movie.service';
import { RouterModule } from '@angular/router';
import { Movie } from '../models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  movies: Movie[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies(this.currentPage);
  }

  loadMovies(page: number) {
    this.movieService.getMovies(page).subscribe(response => {
      this.movies = response.content;
      this.totalPages = response.page.totalPages;
      this.currentPage = response.page.number + 1;
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadMovies(page);
    }
  }

  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }
}

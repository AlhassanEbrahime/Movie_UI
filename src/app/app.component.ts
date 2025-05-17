import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component'; 



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
  
})
export class AppComponent {
  title = 'movieApp';

  constructor(private router: Router) {}

  onSearch(query: string) {
    if (query && query.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
    }
  }
}

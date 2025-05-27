import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class NavigationServiceService {
  private previousUrlSubject = new BehaviorSubject<string | null>(null);
  previousUrl$ = this.previousUrlSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.previousUrlSubject.next(event.urlAfterRedirects);
      }
    });
  }
  getPreviousUrl(): string | null {
    return this.previousUrlSubject.getValue();
  }
}

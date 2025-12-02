import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent, HeaderComponent, SpinnerComponent } from '$components/layouts';
import { AppFacade } from '$domains/app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly appFacade = inject(AppFacade);
}

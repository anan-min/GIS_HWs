import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Q4Component } from '../components/q4/q4.component';

@Component({
  selector: 'app-root',
  imports: [Q4Component],
  template: ` <app-q4></app-q4> `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'GIS_HWs';
}

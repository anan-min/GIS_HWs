import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Q3Component } from '../components/q3/q3.component';

@Component({
  selector: 'app-root',
  imports: [Q3Component],
  template: ` <app-q3></app-q3> `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'GIS_HWs';
}

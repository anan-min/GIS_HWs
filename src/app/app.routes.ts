import { Routes } from '@angular/router';
import { Q2Component } from '../components/q2/q2.component';
import { Q3Component } from '../components/q3/q3.component';
import { Q4Component } from '../components/q4/q4.component';

export const routes: Routes = [
  { path: '', component: Q4Component },
  { path: 'q2', component: Q2Component },
  { path: 'q3', component: Q3Component },
  { path: 'q4', component: Q4Component },
];

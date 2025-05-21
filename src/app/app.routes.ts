import { Routes } from '@angular/router';
import { Q2Component } from '../components/q2/q2.component';
import { Q3Component } from '../components/q3/q3.component';
import { Q4Component } from '../components/q4/q4.component';
import { I1Component } from '../components/Intermediate/i1/i1.component';
import { I5Component } from '../components/Intermediate/i5/i5.component';
import { I6Component } from '../components/Intermediate/i6/i6.component';

export const routes: Routes = [
  { path: '', component: I6Component },
  { path: 'q2', component: Q2Component },
  { path: 'q3', component: Q3Component },
  { path: 'q4', component: Q4Component },
  { path: 'i1', component: I1Component },
  { path: 'i5', component: I5Component },
  { path: 'i6', component: I6Component },
];

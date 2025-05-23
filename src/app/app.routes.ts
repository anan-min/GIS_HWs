import { Routes } from '@angular/router';
import { Q2Component } from '../components/q2/q2.component';
import { Q3Component } from '../components/q3/q3.component';
import { Q4Component } from '../components/q4/q4.component';
import { I1Component } from '../components/Intermediate/i1/i1.component';
import { I2Component } from '../components/Intermediate/i2/i2.component';
import { I3Component } from '../components/Intermediate/i3/i3.component';
import { I4Component } from '../components/Intermediate/i4/i4.component';
import { I5Component } from '../components/Intermediate/i5/i5.component';
import { I6Component } from '../components/Intermediate/i6/i6.component';
import { I8Component } from '../components/Intermediate/i8/i8.component';

export const routes: Routes = [
  { path: '', component: I4Component },
  { path: 'q2', component: Q2Component },
  { path: 'q3', component: Q3Component },
  { path: 'q4', component: Q4Component },

  { path: 'i1', component: I1Component },
  { path: 'i2', component: I2Component },
  { path: 'i3', component: I3Component },
  { path: 'i4', component: I4Component }, // not done
  { path: 'i5', component: I5Component },
  { path: 'i6', component: I6Component },
  { path: 'i8', component: I8Component }, // not done
];

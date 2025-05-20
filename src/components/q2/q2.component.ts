import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomPoint } from './custom-point.model';

@Component({
  selector: 'app-q2',
  imports: [ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>{{ formTitle }}</h2>
      <form [formGroup]="locationForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="latitude">Latitude</label>
          <input
            type="text"
            id="latitude"
            formControlName="latitude"
            class="form-control"
            [value]="lattitude"
          />
        </div>

        <div class="form-group">
          <label for="longitude">Longitude</label>
          <input
            type="text"
            id="longitude"
            formControlName="longitude"
            class="form-control"
            [value]="longitude"
          />
        </div>

        <button type="submit" class="btn btn-blue">Locate</button>
      </form>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 300px; /* Reduced the max width to 300px */
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
        border: 1px solid #d3d3d3; /* Light grey border */
        border-radius: 8px; /* Rounded corners */
        background-color: #f9f9f9;
      }

      h2 {
        text-align: center;
        color: #333;
      }

      .form-group {
        margin-bottom: 15px;
      }

      label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .form-control {
        width: 100%;
        padding: 10px; /* Ensure proper padding inside the input boxes */
        margin: 5px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box; /* Ensures padding doesn't affect the width */
      }

      .btn {
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }

      .btn-blue {
        background-color: #007bff;
        color: white;
      }

      .btn-blue:hover {
        background-color: #0056b3;
      }

      .btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    `,
  ],
  standalone: true,
})
export class Q2Component {
  @Input() formTitle: string = 'Locator';

  @Input() lattitude: number = 0.0;
  @Input() longitude: number = 0.0;

  @Output() locate: EventEmitter<CustomPoint> = new EventEmitter<CustomPoint>();

  locationForm = new FormGroup({
    longitude: new FormControl(this.lattitude, [Validators.required]),
    latitude: new FormControl(this.longitude, [Validators.required]),
  });

  onSubmit(): void {
    if (this.locationForm.valid) {
      const formData = this.locationForm.value;
      console.log('Form Data:', formData);
      // Add your logic to handle the form submission

      const customPoint = new CustomPoint(
        formData.latitude ? Number(formData.latitude) : 0.0,
        formData.longitude ? Number(formData.longitude) : 0.0
      );

      this.locate.emit(customPoint);
      console.log(customPoint);
    } else {
      console.log('Form is invalid');
    }
  }
}

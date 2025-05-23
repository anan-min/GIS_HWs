import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomPoint } from './custom-point.model';

@Component({
  selector: 'app-q2',
  imports: [ReactiveFormsModule],
  templateUrl: './q2.component.html',
  styleUrls: ['./q2.component.css'],
  standalone: true,
})
export class Q2Component {
  @Input() formTitle: string = 'Locator';

  @Input() lattitude: number = 0.0;
  @Input() longitude: number = 0.0;

  @Output() locate: EventEmitter<CustomPoint> = new EventEmitter<CustomPoint>();

  locationForm = new FormGroup({
    longitude: new FormControl(this.longitude, [Validators.required]), // Correct the order here
    latitude: new FormControl(this.lattitude, [Validators.required]), // Correct the order here
  });

  ngOnChanges(): void {
    // Reset the form values when latitude/longitude inputs change
    this.locationForm.patchValue({
      latitude: this.lattitude,
      longitude: this.longitude,
    });
  }

  onSubmit(): void {
    if (this.locationForm.valid) {
      const formData = this.locationForm.value;
      console.log('Form Data:', formData);

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

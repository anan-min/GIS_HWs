import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I2Component } from './i2.component';

describe('I2Component', () => {
  let component: I2Component;
  let fixture: ComponentFixture<I2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(I2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

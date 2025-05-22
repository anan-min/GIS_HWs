import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I8Component } from './i8.component';

describe('I8Component', () => {
  let component: I8Component;
  let fixture: ComponentFixture<I8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I8Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(I8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

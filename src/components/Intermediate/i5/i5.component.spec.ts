import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I5Component } from './i5.component';

describe('I5Component', () => {
  let component: I5Component;
  let fixture: ComponentFixture<I5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(I5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

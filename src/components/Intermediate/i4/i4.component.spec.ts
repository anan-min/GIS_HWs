import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I4Component } from './i4.component';

describe('I4Component', () => {
  let component: I4Component;
  let fixture: ComponentFixture<I4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(I4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

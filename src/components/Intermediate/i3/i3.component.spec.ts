import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I3Component } from './i3.component';

describe('I3Component', () => {
  let component: I3Component;
  let fixture: ComponentFixture<I3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(I3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

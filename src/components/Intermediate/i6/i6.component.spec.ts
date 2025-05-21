import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I6Component } from './i6.component';

describe('I6Component', () => {
  let component: I6Component;
  let fixture: ComponentFixture<I6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I6Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(I6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

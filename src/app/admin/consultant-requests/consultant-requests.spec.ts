import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantRequests } from './consultant-requests';

describe('ConsultantRequests', () => {
  let component: ConsultantRequests;
  let fixture: ComponentFixture<ConsultantRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultantRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultantRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

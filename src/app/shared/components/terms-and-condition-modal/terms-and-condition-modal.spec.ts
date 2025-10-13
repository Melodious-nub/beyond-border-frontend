import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsAndConditionModal } from './terms-and-condition-modal';

describe('TermsAndConditionModal', () => {
  let component: TermsAndConditionModal;
  let fixture: ComponentFixture<TermsAndConditionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsAndConditionModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsAndConditionModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

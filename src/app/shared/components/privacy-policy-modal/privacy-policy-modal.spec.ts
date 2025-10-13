import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyPolicyModal } from './privacy-policy-modal';

describe('PrivacyPolicyModal', () => {
  let component: PrivacyPolicyModal;
  let fixture: ComponentFixture<PrivacyPolicyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

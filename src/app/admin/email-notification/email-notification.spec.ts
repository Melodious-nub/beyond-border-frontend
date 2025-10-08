import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailNotification } from './email-notification';

describe('EmailNotification', () => {
  let component: EmailNotification;
  let fixture: ComponentFixture<EmailNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

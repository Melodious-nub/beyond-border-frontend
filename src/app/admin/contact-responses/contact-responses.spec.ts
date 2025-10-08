import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactResponses } from './contact-responses';

describe('ContactResponses', () => {
  let component: ContactResponses;
  let fixture: ComponentFixture<ContactResponses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactResponses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactResponses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

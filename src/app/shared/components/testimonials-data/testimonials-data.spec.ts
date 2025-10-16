import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsData } from './testimonials-data';

describe('TestimonialsData', () => {
  let component: TestimonialsData;
  let fixture: ComponentFixture<TestimonialsData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialsData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutData } from './about-data';

describe('AboutData', () => {
  let component: AboutData;
  let fixture: ComponentFixture<AboutData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

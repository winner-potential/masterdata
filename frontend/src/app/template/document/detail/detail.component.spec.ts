import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailDocumentTemplateComponent } from './detail.component';

describe('DetailDocumentTemplateComponent', () => {
  let component: DetailDocumentTemplateComponent;
  let fixture: ComponentFixture<DetailDocumentTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailDocumentTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailDocumentTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

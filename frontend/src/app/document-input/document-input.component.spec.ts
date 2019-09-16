import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentInputComponent } from './document-input.component';

describe('DocumentInputComponent', () => {
  let component: DocumentInputComponent;
  let fixture: ComponentFixture<DocumentInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

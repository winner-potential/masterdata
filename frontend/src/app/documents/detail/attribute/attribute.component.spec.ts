import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAttributeComponent } from './attribute.component';

describe('DocumentAttributeComponent', () => {
  let component: DocumentAttributeComponent;
  let fixture: ComponentFixture<DocumentAttributeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAttributeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

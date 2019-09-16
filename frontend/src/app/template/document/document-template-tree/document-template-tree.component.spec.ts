import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTemplateTreeComponent } from './document-template-tree.component';

describe('DocumentTemplateTreeComponent', () => {
  let component: DocumentTemplateTreeComponent;
  let fixture: ComponentFixture<DocumentTemplateTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTemplateTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplateTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

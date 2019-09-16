import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTagTemplateComponent } from './list.component';

describe('ListTagTemplateComponent', () => {
  let component: ListTagTemplateComponent;
  let fixture: ComponentFixture<ListTagTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTagTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTagTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReallyDeleteComponent } from './really-delete.component';

describe('ReallyDeleteComponent', () => {
  let component: ReallyDeleteComponent;
  let fixture: ComponentFixture<ReallyDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReallyDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReallyDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

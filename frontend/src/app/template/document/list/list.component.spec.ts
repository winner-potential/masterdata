import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDocumentTemplateComponent } from './list.component';

describe('ListDocumentTemplateComponent', () => {
    let component: ListDocumentTemplateComponent;
    let fixture: ComponentFixture<ListDocumentTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListDocumentTemplateComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListDocumentTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

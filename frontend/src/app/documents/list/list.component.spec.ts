import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDocumentComponent } from './list.component';

describe('ListDocumentComponent', () => {
    let component: ListDocumentComponent;
    let fixture: ComponentFixture<ListDocumentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListDocumentComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListDocumentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

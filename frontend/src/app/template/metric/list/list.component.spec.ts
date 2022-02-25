import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMetricTemplateComponent } from './list.component';

describe('ListMetricTemplateComponent', () => {
    let component: ListMetricTemplateComponent;
    let fixture: ComponentFixture<ListMetricTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ListMetricTemplateComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ListMetricTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

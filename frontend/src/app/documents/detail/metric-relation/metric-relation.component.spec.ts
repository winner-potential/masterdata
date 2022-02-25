import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricRelationComponent } from './metric-relation.component';

describe('MetricRelationComponent', () => {
    let component: MetricRelationComponent;
    let fixture: ComponentFixture<MetricRelationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MetricRelationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MetricRelationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMetricTemplateComponent } from './detail.component';

describe('DetailMetricTemplateComponent', () => {
    let component: DetailMetricTemplateComponent;
    let fixture: ComponentFixture<DetailMetricTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DetailMetricTemplateComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailMetricTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailTagTemplateComponent } from './detail.component';

describe('DetailTagTemplateComponent', () => {
    let component: DetailTagTemplateComponent;
    let fixture: ComponentFixture<DetailTagTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DetailTagTemplateComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailTagTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

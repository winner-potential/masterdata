import { Component, Input, OnInit } from '@angular/core';
import { Metric } from '../../../model/metric';

@Component({
    selector: 'document-metric',
    templateUrl: './metric.component.html',
    styleUrls: ['./metric.component.css']
})
export class MetricComponent implements OnInit {

    @Input('tag-templates') public tagTemplates: Metric;

    @Input('metric-template') public metricTemplate: any;

    @Input() private metric: Metric;

    constructor() { }

    get alias(): String {
        return this.metric ? this.metric.alias : '';
    }

    set alias(value: String) {
        this.metric.alias = value;
    }

    get key(): String {
        return this.metric ? this.metric.key : '';
    }

    set key(value: String) {
        this.metric.key = value;
    }

    ngOnInit() {
    }

    public getTag(id: string) {
        return this.metric.getOrCreateTag(this.tagTemplates[id]);
    }

}

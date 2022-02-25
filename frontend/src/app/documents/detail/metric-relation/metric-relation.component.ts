import { Component, Input, OnInit } from '@angular/core';
import { MetricRelation } from '../../../model/metric-relation';
import { ApiService } from '../../../api.service';

@Component({
    selector: 'document-metric-relation',
    templateUrl: './metric-relation.component.html',
    styleUrls: ['./metric-relation.component.css']
})
export class MetricRelationComponent implements OnInit {

    @Input('metric-templates') public metricTemplates: any;
    public documents: Array<any> = [];
    public selectedDocument: any;
    @Input() private metric: MetricRelation;

    constructor(private api: ApiService) { }

    public _document: any;

    get document(): any {
        return this._document;
    }

    set document(value: any) {
        if (value && value._id) {
            this.metric.document = value._id;
        } else {
            this.metric.document = undefined;
        }
        this._document = value;
    }

    get alias(): String {
        return this.metric ? this.metric.alias : '';
    }

    set alias(value: String) {
        this.metric.alias = value;
    }

    get link(): String {
        return this.metric ? this.metric.link : '';
    }

    set link(value: String) {
        this.metric.link = value;
    }

    get identifier(): String {
        return this.metric ? this.metric.identifier : '';
    }

    ngOnInit() {
        if (this.metric.document) {
            this.api.getDocument(this.metric.document).subscribe((doc: any) => {
                this.selectedDocument = doc;
                this._document = {
                    _id: doc._id,
                    name: doc.name,
                    alias: doc.alias
                };
            });
        }
    }

    handleDocument(e) {
        if (e && e.target && e.target.value) {
            this.api.findDocumentWithMetricTemplate(this.metric.identifier, e.target.value).subscribe((data: any) => {
                this.documents.length = 0;
                (data || []).forEach(p => {
                    this.documents.push(p);
                });
            });
        }
    }

    extractDisplayValue(document: any) {
        return document ? document.name : undefined;
    }

    handleSelection(e) {
        const doc = e.option.value;
        if (doc._id) {
            this.api.getDocument(doc._id).subscribe(document => {
                this.selectedDocument = document;
                // Check metrics, if there is only one and select this
                if (this.selectedDocument.metrics) {
                    let count = 0;
                    let last;
                    this.selectedDocument.metrics.forEach((e: any) => {
                        if (e.identifier == this.identifier) {
                            count++;
                            last = e._id;
                        }
                    });
                    if (count == 1) {
                        this.link = last;
                    }
                }
            });
        }
    }

}

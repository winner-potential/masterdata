import { Component, OnInit, Input } from '@angular/core';
import { MetricRelation } from '../../../model/metric-relation';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'document-metric-relation',
  templateUrl: './metric-relation.component.html',
  styleUrls: ['./metric-relation.component.css']
})
export class MetricRelationComponent implements OnInit {

  @Input('metric-templates') public metricTemplates : any;

  @Input('metric') private metric : MetricRelation;

  public documents: Array<any> = [];
  public _document: any;
  public selectedDocument: any;

  constructor(private api: ApiService) { }

  ngOnInit() {
    if(this.metric.document) {
      this.api.getDocument(this.metric.document).subscribe((doc: any) => {
        this.selectedDocument = doc;
        this._document = {
          _id: doc._id,
          name: doc.name,
          alias: doc.alias
        }
      })
    }
  }

  get alias() : String {
    return this.metric ? this.metric.alias : "";
  }

  set alias(value: String) {
    this.metric.alias = value;
  }

  get link() : String {
    return this.metric ? this.metric.link : "";
  }

  get identifier() : String {
    return this.metric ? this.metric.identifier : "";
  }

  set link(value: String) {
    this.metric.link = value;
  }

  get document() : any {
    return this._document;
  }

  set document(value: any) {
    if(value && value._id) {
      this.metric.document = value._id;
    } else {
      this.metric.document = undefined;
    }
    this._document = value;
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
    let doc = e.option.value;
    if(doc._id) {
      this.api.getDocument(doc._id).subscribe(document => {
        this.selectedDocument = document;
        // Check metrics, if there is only one and select this
        if(this.selectedDocument.metrics) {
          let count = 0;
          let last;
          this.selectedDocument.metrics.forEach((e:any) => {
            if(e.identifier == this.identifier) {
              count ++;
              last = e._id;
            }
          })
          if(count == 1) {
            this.link = last;
          }
        }
      });
    }
  }

}

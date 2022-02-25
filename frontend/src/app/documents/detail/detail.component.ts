import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { ActionsService } from '../../actions.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Metric } from '../../model/metric';
import { Tag } from '../../model/tag';
import { MetricRelation } from '../../model/metric-relation';
import { ReallyDeleteComponent, ReallyDeleteData } from 'src/app/really-delete/really-delete.component';

export class DialogData {
    public type: string;
    public selection: string;

    constructor(public usableMetrics: Array<string>, public metricTemplates: Map<string, any>) {}
}

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailDocumentComponent implements OnInit {
    public id: String = '';
    public name: String = '';
    public description: String = '';
    public parent: string;
    public template: string;
    public newMetric: string;

    public testdoc: string;

    public attributes: Array<any> = [];
    public data: Map<string, string> = new Map<string, string>(); // Optional attributes
    public metrics: Array<Metric> = [];
    public relations: Array<MetricRelation> = [];
    public values: Object = {}; // value map for attributes, independend from current template selection
    public usableMetrics: Array<string> = [];
    public documentTemplates: Array<any> = [];
    public metricTemplates: Map<string, any> = new Map<string, any>();
    public tagTemplates: Map<string, any> = new Map<string, any>();

    public saving: boolean;
    public loading: boolean;

    private documentTemplateMap: Map<string, any> = new Map<string, any>();

    constructor(
        private active: ActivatedRoute,
        private api: ApiService,
        private router: Router,
        private actions: ActionsService,
        public snackBar: MatSnackBar,
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.active.params.subscribe(value => {
            this.id = value.id;
            this.loading = true;
            window.setTimeout(() => this.actions.events.emit('show#' + value.id), 0);
            this.api.getDocumentTemplates().subscribe(
                (documentTemplates: Array<object>) => {
                    documentTemplates.forEach((element: any) => {
                        this.documentTemplates.push(element);
                        this.documentTemplateMap[element._id] = element;
                    });
                    this.api.getMetricTemplates().subscribe(
                        (metricTemplates: Array<object>) => {
                            metricTemplates.forEach((element: any) => {
                                this.metricTemplates[element._id] = element;
                            });
                            this.api.getTagTemplates().subscribe(
                                (tagTemplates: Array<object>) => {
                                    tagTemplates.forEach((element: any) => {
                                        this.tagTemplates[element._id] = element;
                                    });
                                    if (this.id) {
                                        this.loadDetails(value.id);
                                    } else {
                                        this.loading = false;
                                    }
                                },
                                err => this.loadError(err)
                            );
                        },
                        err => this.loadError(err)
                    );
                },
                err => this.loadError(err)
            );
        });
    }

    loadError(msg) {
        console.error('Error while loading document', msg);
        this.snackBar.open('Can not load document', 'Error', {
            duration: 2000
        });
    }

    handleDataAttribute(field, data) {
        const reader = new FileReader();
        const self = this;
        reader.onload = (event: any) => {
            self.data.set(field.name, event.target.result);
            this.values[field.name] = data.name;
        };
        reader.readAsDataURL(data);
    }

    handleAddSourceMetric(selection) {
        if (selection) {
            if (this.metricTemplates[selection]) {
                this.metrics.push(new Metric('', '', selection, undefined));
            }
        }
    }

    handleAddDestinationMetric(selection) {
        if (selection) {
            if (this.metricTemplates[selection]) {
                this.relations.push(new MetricRelation('', selection, undefined, undefined));
            }
        }
    }

    handleTemplate(e) {
        this.updateForm();
    }

    removeRelationMetric(index: number) {
        this.relations.splice(index, 1);
    }

    removeMetric(index: number) {
        this.metrics.splice(index, 1);
    }

    findPosition(current) {
        let found = false;
        for (let k = 0; k < this.attributes.length; k++) {
            if (!current) {
                // find position of first separator or end
                if (this.attributes[k].type === 'separator') {
                    return k;
                }
            } else {
                if (!found) {
                    if (this.attributes[k].name === current) {
                        found = true;
                    }
                } else {
                    if (this.attributes[k].type === 'separator') {
                        return k;
                    }
                }
            }
        }
        return this.attributes.length;
    }

    updateForm() {
        this.attributes.length = 0;
        this.usableMetrics.length = 0;

        let temp: any = this.documentTemplateMap[this.template];
        const handledAttributes: Map<string, boolean> = new Map<string, boolean>();
        const handledMetrics: Map<string, boolean> = new Map<string, boolean>();
        while (temp) {
            let current;
            // Find attributes this document should define
            (temp.attributes || []).forEach(attr => {
                attr.type = attr.type.toLowerCase();
                if (!handledAttributes.has(attr.name)) {
                    this.attributes.splice(this.findPosition(current), 0, attr);
                    handledAttributes.set(attr.name, true);
                }
                if (attr.type === 'separator') {
                    current = attr.name;
                }
            });
            // Find metrics, this document should use
            (temp.metrics || []).forEach((m: string) => {
                if (handledMetrics.has(m)) {
                    return;
                }
                this.usableMetrics.push(m);
                handledMetrics.set(m, true);
            });
            // Check if there is an other generalization
            if (temp.extends) {
                temp = this.documentTemplateMap[temp.extends];
            } else {
                temp = undefined;
            }
        }
    }

    save() {
        if (!this.name) {
            return;
        }
        this.saving = true;

        const attributes = [];
        const metrics = [];
        const relations = [];

        let temp: any = this.documentTemplateMap[this.template];
        const root: any = temp;

        const names: Map<string, boolean> = new Map<string, boolean>();
        const uploadable: Map<string, boolean> = new Map<string, boolean>();
        try {
            while (temp) {
                (temp.attributes || []).forEach(attr => {
                    if (names.has(attr.name)) {
                        return;
                    }
                    if ((attr.should || root.identifier === attr.name) && !this.values[attr.name]) {
                        throw 'Missing required attribute ' + attr.name;
                    }
                    names.set(attr.name, attr.should || root.identifier === attr.name);
                    attributes.push({name: attr.name, value: this.values[attr.name]});
                    uploadable.set(attr.name, attr.type.toLowerCase() === 'image');
                });
                if (temp.extends) {
                    temp = this.documentTemplateMap[temp.extends];
                } else {
                    temp = undefined;
                }
            }
        } catch (e) {
            console.error(e);
            this.saving = false;
            return;
        }

        // Get all configurated metrics
        this.metrics.forEach(m => {
            const tags = [];
            m.tags.forEach(tag => {
                tags.push({
                    _id: tag.id ? tag.id : undefined,
                    identifier: tag.identifier,
                    value: tag.value
                });
            });
            metrics.push({
                _id: m.id ? m.id : undefined,
                identifier: m.identifier,
                key: m.key,
                alias: m.alias,
                tags: tags
            });
        });

        this.relations.forEach(d => {
            // only save document and link if both matches
            relations.push({
                link: d.document && d.link ? d.link : undefined,
                document: d.document && d.link ? d.document : undefined,
                identifier: d.identifier,
                alias: d.alias,
                _id: d.id ? d.id : undefined
            });
        });

        const finish = (action, errors) => {
            this.saving = false;
            if (!errors) {
                this.actions.events.emit('close_details');
                this.actions.events.emit('saved');
                this.snackBar.open('Document ' + this.name, 'Saved', {
                    duration: 2000
                });
                this.router.navigate([{outlets: {primary: ['document-list'], details: null}}]);
                this.clear();
            } else {
                this.snackBar.open('Error while saving image', 'Error', {
                    duration: 2000
                });
            }
        };

        const uploadImages = (id, action) => {
            let count = 0;
            let errors = false;
            attributes.forEach(attr => {
                if (this.data.has(attr.name)) {
                    if (uploadable.has(attr.name)) {
                        count++;
                        this.api.uploadImage(id, attr.name, this.data.get(attr.name)).subscribe(
                            data => {
                                count--;
                                if (count <= 0) {
                                    finish(action, errors);
                                }
                            },
                            err => {
                                errors = true;
                                count--;
                                if (count <= 0) {
                                    finish(action, errors);
                                }
                            }
                        );
                    }
                }
            });
            if (count <= 0) {
                finish(action, errors);
            }
        };

        if (this.id) {
            this.api.updateDocument(this.id, this.name, this.description, this.template, attributes, metrics, relations, this.parent).subscribe(
                (data: any) => {
                    uploadImages(data._id, 'Saved');
                },
                error => {
                    console.error('Error while saving', error);
                    this.saving = false;
                    this.snackBar.open('Error while saving', 'Error', {
                        duration: 2000
                    });
                }
            );
        } else {
            this.api.addDocument(this.name, this.description, this.template, attributes, metrics, relations, this.parent).subscribe(
                (data: any) => {
                    uploadImages(data._id, 'Saved');
                },
                error => {
                    console.error('Error while saving', error);
                    this.saving = false;
                    this.snackBar.open('Error while saving', 'Error', {
                        duration: 2000
                    });
                }
            );
        }
    }

    delete() {
        if (!this.id) {
            return;
        }

        const dialogRef = this.dialog.open(ReallyDeleteComponent, {
            width: '350px',
            data: new ReallyDeleteData('Delete Document', 'Do you really want to delete the document ' + this.name + '?')
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result.doIt) {
                return;
            }

            this.api.deleteDocument(this.id).subscribe(
                data => {
                    this.saving = false;
                    this.actions.events.emit('close_details');
                    this.actions.events.emit('deleted');
                    this.snackBar.open('Document ' + this.name, 'Deleted', {
                        duration: 2000
                    });
                    this.clear();
                },
                error => {
                    this.saving = false;
                    this.snackBar.open('Error while deleting ' + this.name, 'Error', {
                        duration: 2000
                    });
                }
            );
        });

    }

    loadDetails(id: String) {
        this.api.getDocument(id).subscribe(
            (data: any) => {
                if (data) {
                    this.name = data.name;
                    this.description = data.description;
                    this.template = data.template;
                    this.metrics.length = 0;
                    this.relations.length = 0;
                    this.parent = data.parent;

                    (data.attributes || []).forEach(attr => {
                        this.values[attr.name] = attr.value;
                    });

                    (data.metrics || []).forEach(metric => {
                        const m: Metric = new Metric(metric.alias, metric.key, metric.identifier, metric._id);
                        (metric.tags || []).forEach(tag => {
                            m.tags.set(tag.identifier, new Tag(tag.identifier, tag.value, tag._id));
                        });
                        this.metrics.push(m);
                    });

                    const n = (a: any) => this.metricTemplates[a.identifier].alias ? this.metricTemplates[a.identifier].alias : this.metricTemplates[a.identifier].name;

                    this.metrics.sort((a: any, b: any) => n(a) < n(b) ? 1 : -1);

                    (data.relations || []).forEach(metric => {
                        const m: MetricRelation = new MetricRelation(metric.alias, metric.identifier, metric.link, metric.document, metric._id);
                        this.relations.push(m);
                    });

                    this.updateForm();
                    this.loading = false;
                } else {
                    this.actions.events.emit('close_details');
                    this.snackBar.open('Can\'t load document', 'Error', {
                        duration: 2000
                    });
                }
            },
            err => this.loadError(err)
        );
    }

    clear() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.template = '';
        this.parent = undefined;
        this.metrics.length = 0;
        this.relations.length = 0;
        for (const key in this.values) {
            delete this.values[key];
        }
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(DetailDocumentMetricDialogComponent, {
            width: '350px',
            data: new DialogData(this.usableMetrics, this.metricTemplates)
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if (result.type === 'source') {
                    this.handleAddSourceMetric(result.selection);
                } else if (result.type === 'relation') {
                    this.handleAddDestinationMetric(result.selection);
                }
            }
        });
    }
}

@Component({
    selector: 'dialog-overview-example-dialog',
    templateUrl: 'detail-metric-dialog.html',
    styleUrls: ['./detail-metric-dialog.css']
})
export class DetailDocumentMetricDialogComponent {
    constructor(public dialogRef: MatDialogRef<DetailDocumentMetricDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}

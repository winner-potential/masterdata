import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../api.service';
import { ActionsService } from '../../../actions.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributeDefinition } from '../../../model/attribute-definition';
import { AttributeDefinitions } from '../../../model/attribute-definitions';
import { ReallyDeleteComponent, ReallyDeleteData } from 'src/app/really-delete/really-delete.component';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailDocumentTemplateComponent implements OnInit {
    public id: String = '';
    public name: String = '';
    public description: String = '';
    public alias: String = '';
    public isPublic = false;
    public extends: String = '';
    public identifier: String = '';
    public newMetric: String = '';
    public newAttribute: AttributeDefinition;
    public attributeDefinitions: AttributeDefinitions;
    public identifiers: Array<object> = [];
    public metrics: Array<object> = [];
    public documents: Array<object> = [];
    public metricsAvailable: Array<object> = [];

    public saving: boolean;
    public loading: boolean;

    private metricsData: Map<string, any> = new Map<string, any>();

    constructor(private active: ActivatedRoute, private api: ApiService, private router: Router, private actions: ActionsService, public snackBar: MatSnackBar, private dialog: MatDialog) {}

    ngOnInit() {
        this.active.params.subscribe(value => {
            this.clear();
            this.loading = true;
            window.setTimeout(() => this.actions.events.emit('show#' + value.id), 0);
            this.id = value.id;
            this.api.getDocumentTemplates().subscribe(
                (documents: Array<object>) => {
                    this.documents = documents;
                    this.api.getMetricTemplates().subscribe(
                        (metrics: Array<object>) => {
                            metrics.forEach((element: any) => {
                                this.metricsData.set(element._id, element);
                            });
                            this.updateAvailableMetrics();
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
        });
    }

    loadError(msg) {
        console.error('Error while loading document templates', msg);
        this.snackBar.open('Can not load document templates', 'Error', {
            duration: 2000
        });
    }

    handleNewExtends() {
        this.updateIdentifiers();
    }

    updateIdentifiers() {
        this.identifiers.length = 0;
        const handled = {};

        this.attributeDefinitions.forEach((attr: AttributeDefinition) => {
            if (!handled[attr.name as string]) {
                const str: String = attr.name + ': ' + attr.type;
                this.identifiers.push({full: str, short: attr.name});
                handled[attr.name as string] = true;
            }
        });

        if (this.extends) {
            const map: Map<String, any> = new Map<String, object>();
            this.documents.forEach((doc: any) => {
                map.set(doc._id, doc);
            });
            let current = map.get(this.extends);
            while (current != null) {
                current.attributes.forEach((attr: any) => {
                    if (!handled[attr.name]) {
                        const str: String = attr.name + ': ' + attr.type;
                        this.identifiers.push({full: str, short: attr.name});
                        handled[attr.name] = true;
                    }
                });
                if (!this.identifier) {
                    this.identifier = current.identifier;
                }
                current = map.get(current.extends);
            }
        }

        if (!handled[this.identifier as string]) {
            this.identifier = '';
        }
    }

    addAttribute() {
        if (!this.newAttribute.isValid()) {
            return;
        }
        this.attributeDefinitions.add(new AttributeDefinition(this.newAttribute.name, this.newAttribute.type, this.newAttribute.should));

        this.updateIdentifiers();

        if (!this.identifier) {
            this.identifier = this.newAttribute.name;
        }

        this.newAttribute.name = '';
        this.newAttribute.type = '';
        this.newAttribute.should = false;
    }

    removeAttribute(index: number) {
        const current: AttributeDefinition = this.attributeDefinitions.remove(index);
        if (current.name === this.identifier) {
            this.identifier = this.attributeDefinitions.length > 0 ? this.attributeDefinitions.get(0).name : undefined;
        }
    }

    changeAttribute(attr: AttributeDefinition, index: number) {
        this.updateIdentifiers();
        if (!this.identifier) {
            this.identifier = attr.name;
        }
    }

    handleNewMetric(id: string) {
        this.metrics.push(this.metricsData.get(id));
        this.newMetric = undefined;
        this.updateAvailableMetrics();
    }

    removeMetric(index: number) {
        this.metrics.splice(index, 1);
        this.updateAvailableMetrics();
    }

    updateAvailableMetrics() {
        this.metricsAvailable.length = 0;
        const available: Map<string, any> = new Map<string, any>();

        // Clone all available metrics
        this.metricsData.forEach((element: any, key: string) => {
            available.set(key, element);
        });

        // Drop already selected metrics
        this.metrics.forEach((element: any) => {
            if (available.has(element._id)) {
                available.delete(element._id);
            }
        });

        // Assign remaining metrics to available list
        available.forEach((element: any) => {
            this.metricsAvailable.push(element);
        });
    }

    save() {
        if (!this.name || !this.identifier) {
            return;
        }
        if (this.newAttribute.isValid()) {
            this.addAttribute();
        }
        this.saving = true;

        const metrics: Array<String> = [];
        this.metrics.forEach((element: any) => {
            metrics.push(element._id);
        });

        const attributes = [];
        this.attributeDefinitions.forEach(attr => {
            attributes.push({
                name: attr.name,
                type: attr.type,
                should: attr.should
            });
        });

        if (this.id) {
            this.api
                .updateDocumentTemplate(this.id, this.name, this.description, metrics, attributes, this.identifier, this.extends, this.alias, this.isPublic)
                .subscribe(
                    data => {
                        this.saving = false;
                        this.actions.events.emit('close_details');
                        this.actions.events.emit('saved');
                        this.snackBar.open('Document Template ' + this.name, 'Updated', {
                            duration: 2000
                        });
                        this.router.navigate([{outlets: {primary: ['template-document-list'], details: null}}]);
                        this.clear();
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
            this.api.addDocumentTemplate(this.name, this.description, metrics, attributes, this.identifier, this.extends, this.alias, this.isPublic).subscribe(
                data => {
                    this.saving = false;
                    this.actions.events.emit('close_details');
                    this.actions.events.emit('saved');
                    this.snackBar.open('Document Template ' + this.name, 'Saved', {
                        duration: 2000
                    });
                    this.router.navigate([{outlets: {primary: ['template-document-list'], details: null}}]);
                    this.clear();
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
            data: new ReallyDeleteData('Delete Document', 'Do you really want to delete the document template ' + this.name + '?')
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result.doIt) {
                return;
            }

            this.api.deleteDocumentTemplate(this.id).subscribe(
                data => {
                    this.saving = false;
                    this.actions.events.emit('close_details');
                    this.actions.events.emit('deleted');
                    this.snackBar.open('Document Template ' + this.name, 'Deleted', {
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
        this.api.getDocumentTemplate(id).subscribe(
            (data: any) => {
                this.name = data.name;
                this.description = data.description;
                this.metrics.length = 0;
                this.extends = data.extends;
                this.identifier = data.identifier;
                (data.attributes || []).forEach((attr: any) => {
                    this.attributeDefinitions.add(new AttributeDefinition(attr.name, attr.type, attr.should));
                });
                this.isPublic = data.public;
                this.alias = data.alias;

                // Get map of available metrics
                const used: Map<String, boolean> = new Map<String, boolean>();
                // Add known and unknown metrics (keep them, in case of problems)
                // and drop duplicates
                (data.metrics || []).forEach((element: any) => {
                    if (!used.has(element)) {
                        used.set(element, true);
                        if (this.metricsData.has(element)) {
                            this.metrics.push(this.metricsData.get(element));
                        } else {
                            this.metrics.push({
                                _id: element,
                                name: element
                            });
                        }
                    }
                });
                this.updateAvailableMetrics();
                this.handleNewExtends();
                this.loading = false;
            },
            err => this.loadError(err)
        );
    }

    getIdentifierError() {
        if (this.attributeDefinitions && this.attributeDefinitions.length) {
            return 'Select an attribute as identifier';
        } else {
            return 'Missing at least one attribute which can be used as identifier';
        }
    }

    clear() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.alias = '';
        this.isPublic = false;
        this.extends = '';
        this.identifier = '';
        this.metrics.length = 0;
        this.attributeDefinitions = new AttributeDefinitions();
        this.newAttribute = new AttributeDefinition('', '');
        this.newAttribute.parent = this.attributeDefinitions; // manuall mapping with list
    }
}

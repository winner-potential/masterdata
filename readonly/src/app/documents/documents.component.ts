import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActionsService } from '../actions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
    public search: String;
    public type: String;
    public documents: Array<object> = [];
    public loading: boolean;

    private templates: Map<String, object> = new Map<String, object>();
    private lastId: String;
    private actionSubscription: Subscription;

    constructor(private active: ActivatedRoute,
                private api: ApiService,
                private router: Router,
                private actions: ActionsService,
                public snackBar: MatSnackBar) {}

    ngOnInit() {
        this.actionSubscription = this.actions.events.subscribe(action => {
            if (action === 'close_details') {
                this.lastId = null;
            } else if (action.startsWith('show')) {
                this.lastId = action.split('#')[1];
            }
        });
        this.active.params.subscribe(value => {
            this.loading = true;
            this.search = value.search;
            this.type = value.type;
            this.api.getDocumentTemplates().subscribe((temps: Array<object>) => {
                temps.forEach((t: any) => {
                    this.templates.set(t._id, t);
                });
                this.documents.length = 0;
                if (this.search) {
                    this.api.findDocuments(this.search)
                        .subscribe((documents: Array<object>) => this.import(documents), (err) => this.loadError(err));
                } else {
                    this.api.getDocuments().subscribe((documents: Array<object>) => this.import(documents), (err) => this.loadError(err));
                }
            }, (err) => this.loadError(err));
        });
    }

    loadError(msg) {
        console.error('Error while loading tag templates', msg);
        this.snackBar.open('Can not load tag templates', 'Saved', {
            duration: 2000
        });
    }

    typeName(id: string) {
        if (this.templates) {
            const temp: any = this.templates.get(id) as any;
            if (temp) {
                return temp.alias ? temp.alias : temp.name;
            }
        }
        return '';
    }

    isSelected(id: String) {
        return this.lastId === id;
    }

    import(documents: Array<object>) {
        this.loading = false;
        documents.forEach((doc: any) => {
            const template: any = this.templates.get(doc.template);
            if (template && template.public) {
                if (!this.type || this.type === doc.template) {
                    this.documents.push(doc);
                }
            }
        });
        this.documents.sort(
            (a: any, b: any) => this.typeName(a.template) + '_' + a.name < this.typeName(b.template) + '_' + b.name ? -1 : 1
        );
    }

    details(id: String) {
        if (this.lastId === id) {
            this.lastId = null;
            this.actions.events.emit('close_details');
        } else {
            this.actions.events.emit('open_details');
            this.lastId = id;

            let primary: Array<String> = ['document-list'];
            if (this.type) {
                primary = ['document-list-filtered', this.type];
            }
            if (this.search) {
                primary.push(this.search);
            }

            this.router.navigate([{outlets: {primary: primary, details: ['document-show', id]}}]);
        }
    }

    ngOnDestroy() {
        this.actionSubscription.unsubscribe();
    }
}

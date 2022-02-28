import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionsService } from '../../actions.service';
import { ApiService } from '../../api.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.css']
})
export class ListDocumentComponent implements OnInit {
    public documents: BehaviorSubject<Array<any>> = new BehaviorSubject<Array<any>>([]);
    public templates: Array<any> = [];
    public loading: boolean;
    public selection: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);

    private actionSubscription: Subscription;

    constructor(private router: Router, private actions: ActionsService, public snackBar: MatSnackBar, private api: ApiService) {}

    private _lastId: string;

    private get lastId() {
        return this._lastId;
    }

    private set lastId(val: string) {
        this._lastId = val;
        this.selection.next(val);
    }

    ngOnInit() {
        this.loading = true;
        this.actionSubscription = this.actions.events.subscribe(action => {
            if (action === 'add') {
                this.add();
            } else if (action === 'close_details') {
                this.lastId = undefined;
            } else if (action === 'saved' || action === 'deleted') {
                this.getDocuments();
            } else if (action.startsWith('show')) {
                this.lastId = action.split('#')[1];
            }
        });
        this.getDocuments();
    }

    loadError(msg) {
        console.error('Error while loading documents', msg);
        this.snackBar.open('Can not load documents', 'Saved', {
            duration: 2000
        });
    }

    isSelected(id: String) {
        return this.lastId === id;
    }

    getDocuments() {
        this.api.getDocumentTemplates().subscribe((templates: Array<any>) => {
            this.templates = templates;
            this.api.getDocuments().subscribe((data: Array<object>) => {
                this.documents.next(data);
                this.loading = false;
            }, (err) => this.loadError(err));
        }, (err) => this.loadError(err));
    }

    add() {
        this.actions.events.emit('open_details');
        this.router.navigate([{outlets: {primary: ['document-list'], details: ['document-add']}}]);
    }

    details(id: String) {
        if (this.lastId === id) {
            this.lastId = undefined;
            this.actions.events.emit('close_details');
        } else {
            this.actions.events.emit('open_details');
            this.router.navigate([{outlets: {primary: ['document-list'], details: ['document-edit', id]}}]);
            this.lastId = (id || '').toString();
        }
    }

    ngOnDestroy() {
        this.actionSubscription.unsubscribe();
    }
}

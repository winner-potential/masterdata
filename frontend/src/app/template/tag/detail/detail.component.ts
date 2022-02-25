import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../api.service';
import { ActionsService } from '../../../actions.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReallyDeleteComponent, ReallyDeleteData } from 'src/app/really-delete/really-delete.component';

@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css']
})
export class DetailTagTemplateComponent implements OnInit {
    public id = '';
    public name: String = '';
    public description: String = '';
    public value: String = '';
    public alias: String = '';
    public isPublic: Boolean = false;

    public saving: boolean;
    public loading: boolean;

    constructor(private active: ActivatedRoute,
                private api: ApiService,
                private router: Router,
                private actions: ActionsService,
                public snackBar: MatSnackBar,
                private dialog: MatDialog) {}

    ngOnInit() {
        this.active.params.subscribe(value => {
            this.clear();
            this.id = value.id;
            this.loading = true;
            window.setTimeout(() => this.actions.events.emit('show#' + value.id), 0);
            if (this.id) {
                this.loadDetails(value.id);
            } else {
                this.loading = false;
            }
        });
    }

    loadDetails(id: String) {
        this.api.getTagTemplate(id).subscribe((data: any) => {
            this.name = data.name;
            this.description = data.description;
            this.alias = data.alias;
            this.value = data.value;
            this.isPublic = !!data.public;
            this.loading = false;
        }, (err) => this.loadError(err));
    }

    loadError(msg) {
        console.error('Error while loading tag templates', msg);
        this.snackBar.open('Can not load tag templates', 'Error', {
            duration: 2000
        });
    }

    delete() {
        const dialogRef = this.dialog.open(ReallyDeleteComponent, {
            width: '350px',
            data: new ReallyDeleteData('Delete Document', 'Do you really want to delete the tag template ' + this.name + '?')
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result.doIt) {
                return;
            }
            this.api.deleteTagTemplate(this.id).subscribe(data => {
                this.saving = false;
                this.actions.events.emit('close_details');
                this.actions.events.emit('deleted');
                this.snackBar.open('Tag ' + this.name, 'Deleted', {
                    duration: 2000
                });
                this.clear();
            }, error => {
                this.saving = false;
                this.snackBar.open('Error while deleting ' + this.name, 'Error', {
                    duration: 2000
                });
            });
        });
    }

    save() {
        if (!this.name) {
            return;
        }
        this.saving = true;

        if (this.id) {
            this.api.updateTagTemplate(this.id, this.name, this.description, this.value, this.alias, this.isPublic).subscribe(data => {
                this.saving = false;
                this.actions.events.emit('close_details');
                this.actions.events.emit('saved');
                this.snackBar.open('Tag Template ' + this.name, 'Updated', {
                    duration: 2000
                });
                this.router.navigate([{outlets: {primary: ['template-tag-list'], details: null}}]);
                this.clear();
            }, error => {
                console.error(error);
                this.saving = false;
                this.snackBar.open('Error while saving', 'Error', {
                    duration: 2000
                });
            });
        } else {
            this.api.addTagTemplate(this.name, this.description, this.value, this.alias, this.isPublic).subscribe(data => {
                this.saving = false;
                this.actions.events.emit('close_details');
                this.actions.events.emit('saved');
                this.snackBar.open('Tag Template ' + this.name, 'Saved', {
                    duration: 2000
                });
                this.router.navigate([{outlets: {primary: ['template-tag-list'], details: null}}]);
                this.clear();
            }, error => {
                console.error(error);
                this.saving = false;
                this.snackBar.open('Error while saving', 'Error', {
                    duration: 2000
                });
            });
        }
    }

    clear() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.value = '';
        this.isPublic = false;
        this.alias = '';
    }
}

import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivationStart, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ActionsService } from '../actions.service';
import { ApiService } from '../api.service';
import { AuthentificationService } from '../authentification.service';

@Component({
    selector: 'masterdata-readonly-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
    public searchMode: boolean;
    public title: String;
    public params: object;
    public search: any = undefined;
    public searchConfig: any = undefined;
    public searchResults: Array<object> = [];
    public templates: Array<object> = [];
    public details: boolean;
    public count = 0;
    @ViewChild('searchBox', {static: false})
        searchBox;
    @ViewChild('detailsDrawer', {static: true})
        detailsDrawer;
    isNavigation$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge])
        .pipe(map(result => result.matches));
    isDetails$: Observable<boolean> = this.breakpointObserver
        .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
        .pipe(map(result => result.matches));
    private hasDetails: boolean;
    private path: string;

    constructor(
        private breakpointObserver: BreakpointObserver,
        private api: ApiService,
        private router: Router,
        private actionsService: ActionsService,
        private auth: AuthentificationService
    ) {}

    toggleSearch() {
        this.searchMode = !this.searchMode;
        const self = this;
        window.setTimeout(function () {
            if (self.searchMode) {
                self.searchBox.nativeElement.focus();
            }
        });
    }

    adminLink(): Observable<string> {
        return this.auth.data.pipe(
            map(data => (window as any).admin && data.admin ? (window as any).admin + '?token=' + this.auth.token : undefined)
        );
    }

    ngOnInit() {
        let firstRun = true;
        this.actionsService.events.subscribe(action => {
            if (action === 'open_details') {
                this.detailsDrawer.open();
                this.details = true;
            }
            if (action === 'close_details') {
                this.detailsDrawer.close();
                this.details = false;
            }
        });
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.searchResults.length = 0;
                this.search = undefined;
                this.searchMode = false;
                this.hasDetails = false;
                if (this.details) {
                    this.detailsDrawer.open();
                } else {
                    this.detailsDrawer.close();
                }
            } else if (event instanceof ActivationStart) {
                if (event.snapshot.outlet === 'primary') {
                    this.title = event.snapshot.data.title;
                    this.searchConfig = event.snapshot.data.search;
                    this.params = event.snapshot.params;
                    this.path = event.snapshot.routeConfig.path;
                } else if (event.snapshot.outlet === 'details') {
                    this.hasDetails = true;
                    if (firstRun) {
                        this.actionsService.events.emit('open_details');
                    }
                }
            } else if (event instanceof NavigationEnd) {
                if (!this.hasDetails) {
                    this.actionsService.events.emit('close_details');
                }
                firstRun = false;
            }
        });
        // we should wait on cylce to carefully finish init
        window.setTimeout(() => {
            const counts: Map<string, number> = new Map<string, number>();
            this.api.getDocumentTemplates().subscribe((data: any) => {
                this.templates.length = 0;
                const templates: Map<string, boolean> = new Map<string, boolean>();
                if (data && data.length) {
                    data.forEach((d: any) => templates.set(d._id, d.public));
                }
                this.api.getDocuments().subscribe((docs: Array<object>) => {
                    docs.forEach((doc: any) => {
                        if (templates.has(doc.template) && templates.get(doc.template)) {
                            counts.set(doc.template, (counts.get(doc.template) || 0) + 1);
                            this.count++;
                        }
                    });
                    if (data && data.length) {
                        data.forEach((d: any) => {
                            if (d.public) {
                                d.count = counts.get(d._id) || 0;
                                this.templates.push(d);
                            }
                        });
                    }
                });
            });
        }, 0);
    }

    isSelectedPath(path: string) {
        return this.path && this.path.startsWith(path);
    }

    isSelected(id: String) {
        return this.params && (this.params as any).type === id;
    }

    handleSearch(e) {
        if (e && e.target && e.target.value) {
            const search = e.target.value;
            this.search = {
                name: search
            };
            if (this.searchConfig) {
                if (!this.searchConfig.find) {
                    console.error('Missing find callback to handle search for this view');
                    this.toggleSearch();
                    return;
                }
                this.searchConfig.find(this.api, search, this.params).subscribe((data: any) => {
                    this.searchResults.length = 0;
                    (data || []).forEach(p => {
                        this.searchResults.push(p);
                    });
                });
            }
        }
    }

    handleSelection() {
        this.doSearch();
    }

    parse(list: Array<string>, params: any) {
        const res = [];
        list.forEach(entry => {
            if (entry.startsWith(':')) {
                entry = params[entry.substr(1)];
            }
            res.push(entry);
        });
        return res;
    }

    doSearch() {
        if (!this.searchConfig || !this.search) {
            console.error('Do search with missing config or search phrase');
            return;
        }

        this.toggleSearch();
        this.actionsService.events.emit('open_details');
        const outlets = {
            primary: this.parse(this.searchConfig.list, this.params).concat([this.search.name])
        };
        if (this.search._id) {
            outlets['details'] = this.parse(this.searchConfig.details, this.params).concat([this.search._id]);
        }
        this.router.navigate([
            {
                outlets: outlets
            }
        ]);
        this.searchResults.length = 0;
        this.search = undefined;
    }

    selectSearch(search: any) {
        return search ? search.name : undefined;
    }

    closeDetails() {
        this.actionsService.events.emit('close_details');
    }
}

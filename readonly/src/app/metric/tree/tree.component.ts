import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { ApiService } from '../../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Flat node with expandable and level information */
export class DynamicMetricNode {
    /* eslint no-use-before-define: 0 */
    constructor(public item: DynamicMetricData, public level = 1, public expandable = false, public isLoading = false) {}
}

export class DynamicMetricData {
    constructor(public data: any, public expandable = false) {}

    public asNode(level: number) {
        return new DynamicMetricNode(this, level, this.expandable);
    }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicMetricDatabase {
    private childs: Map<string, DynamicMetricData[]> = new Map<string, DynamicMetricData[]>();
    private nodes: Map<string, DynamicMetricData> = new Map<string, DynamicMetricData>();
    private loaded: Map<string, boolean> = new Map<string, boolean>();
    private root: any;

    constructor(private naming: (identifier: string) => Object, private loader: (id: string) => Observable<Object[]>) {}

    init(root: any): Observable<DynamicMetricData[]> {
        this.root = root;
        this.handleDocument(this.root); // add root related informations
        return this.getChildren(this.nodes.get(root._id));
    }

    handleDocument(document: any) {
        if (this.nodes.has(document._id)) {
            return;
        }
        // Create document entry
        const node = new DynamicMetricData(document, true);

        // Add document to parent list
        const list: DynamicMetricData[] = this.childs.get(document.parent) || [];
        list.unshift(node);
        this.childs.set(document.parent, list);

        // Register document for level calculation
        this.nodes.set(document._id, node);

        // Catch metrics and relations to create childs for document
        const childs: DynamicMetricData[] = this.childs.get(document._id) || [];
        (document.relations || []).forEach(relation => {
            const names: any = this.naming(relation.identifier);
            if (names) {
                childs.push(new DynamicMetricData(relation, false));
                relation.name = names.name;
                relation.description = names.description;
                relation.unit = names.unit;
                relation.type = 'relation';
            }
        });
        (document.metrics || []).forEach(metric => {
            const names: any = this.naming(metric.identifier);
            if (names) {
                childs.push(new DynamicMetricData(metric, false));
                metric.name = names.name;
                metric.description = names.description;
                metric.unit = names.unit;
                metric.type = 'source';
            }
        });
        this.childs.set(document._id, childs);

        // Return new document node
        return node;
    }

    getChildren(node: DynamicMetricData): Observable<DynamicMetricData[]> {
        // Create observable which provides cached childs for subtree or loads new childs with loader
        return new Observable<DynamicMetricData[]>(observer => {
            if (this.loaded.has(node.data._id)) {
                observer.next(this.childs.get(node.data._id));
            } else {
                this.loader(node.data._id).subscribe(data => {
                    data.forEach((element: any) => {
                        this.handleDocument(element);
                    });
                    this.loaded.set(node.data._id, true); // mark as loaded
                    observer.next(this.childs.get(node.data._id));
                }, (err) => {
                    console.error('Can\'t lacy load child documents', err);
                    observer.next(this.childs.get(node.data._id));
                });
            }
        });
    }
}

@Injectable()
export class DynamicMetricDataSource {
    dataChange = new BehaviorSubject<DynamicMetricNode[]>([]);

    constructor(private treeControl: FlatTreeControl<DynamicMetricNode>, private database: DynamicMetricDatabase) {}

    get data(): DynamicMetricNode[] {
        return this.dataChange.value;
    }

    set data(value: DynamicMetricNode[]) {
        this.treeControl.dataNodes = value;
        this.dataChange.next(value);
    }

    connect(collectionViewer: CollectionViewer): Observable<DynamicMetricNode[]> {
        this.treeControl.expansionModel.changed.subscribe(change => {
            if ((change as SelectionChange<DynamicMetricNode>).added || (change as SelectionChange<DynamicMetricNode>).removed) {
                this.handleTreeControl(change as SelectionChange<DynamicMetricNode>);
            }
        });

        return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
    }

    /** Handle expand/collapse behaviors */
    handleTreeControl(change: SelectionChange<DynamicMetricNode>) {
        if (change.added) {
            change.added.forEach(node => this.toggleNode(node, true));
        }
        if (change.removed) {
            change.removed
                .slice()
                .reverse()
                .forEach(node => this.toggleNode(node, false));
        }
    }

    /**
     * Toggle the node, remove from display list
     */
    toggleNode(node: DynamicMetricNode, expand: boolean) {
        const index = this.data.indexOf(node);
        if (index < 0) {
            // If cannot find the node, no op
            return;
        }
        if (expand) {
            const children = this.database.getChildren(node.item);
            node.isLoading = true;
            children.subscribe(childs => {
                const list = [];
                childs.forEach(element => {
                    list.push(element.asNode(node.level + 1));
                });
                this.data.splice(index + 1, 0, ...list);

                // notify the change
                this.dataChange.next(this.data);
                node.isLoading = false;
            });
        } else {
            let count = 0;
            for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {}
            this.data.splice(index + 1, count);
            this.dataChange.next(this.data);
        }
    }

    public empty(): boolean {
        return !this.dataChange.value || this.dataChange.value.length === 0;
    }
}

@Component({
    selector: 'document-metric-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {
    @Output() public clickEvent = new EventEmitter<any>();
    treeControl: FlatTreeControl<DynamicMetricNode>;
    dataSource: DynamicMetricDataSource;
    @Input() private document: BehaviorSubject<any>;

    constructor(private api: ApiService, public snackBar: MatSnackBar) {}

    ngOnInit() {
        const metricMapping = {};
        const documentMapping = {};
        const database = new DynamicMetricDatabase(
            (id: string) => metricMapping[id] && metricMapping[id].public
                ? {
                    name: metricMapping[id].alias ? metricMapping[id].alias : metricMapping[id].name,
                    description: metricMapping[id].description,
                    unit: metricMapping[id].unit
                }
                : undefined,
            (id: string) => (this.api.getChildDocuments(id) as Observable<Object[]>).pipe(
                map(data => data.filter((v: any) => documentMapping[v.template].public)))
        );
        this.treeControl = new FlatTreeControl<DynamicMetricNode>(this.getLevel, this.isExpandable);
        this.dataSource = new DynamicMetricDataSource(this.treeControl, database);
        this.api.getDocumentTemplates().subscribe((dTemplates: Array<any>) => {
            dTemplates?.forEach(t => {
                documentMapping[t._id] = t;
            });
            this.api.getMetricTemplates().subscribe((mTemplates: Array<any>) => {
                mTemplates?.forEach(t => {
                    metricMapping[t._id] = t;
                });
                this.document.subscribe(newDocument => {
                    if (newDocument) {
                        database.init(newDocument).subscribe(childs => {
                            const list = [];
                            childs.forEach(element => {
                                list.push(element.asNode(0));
                            });
                            this.dataSource.data = list;
                        }, (err) => this.loadError(err));
                    } else {
                        this.dataSource.data = [];
                    }
                }, (err) => this.loadError(err));
            }, (err) => this.loadError(err));
        }, (err) => this.loadError(err));
        this.dataSource.empty();
    }

    handleNodeClick(node: DynamicMetricNode) {
        this.clickEvent.emit(node.item.data);
    }

    loadError(msg) {
        console.error('Error while loading tag templates', msg);
        this.snackBar.open('Can not load tag templates', 'Saved', {
            duration: 2000
        });
    }

    getLevel = (node: DynamicMetricNode) => node.level;

    isExpandable = (node: DynamicMetricNode) => node.expandable;

    hasChild = (_: number, _nodeData: DynamicMetricNode) => _nodeData.expandable;
}

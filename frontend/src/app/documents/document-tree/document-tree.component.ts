import { Component, OnInit, Injectable, Input, Output, EventEmitter } from "@angular/core";
import { BehaviorSubject, Observable, merge } from "../../../../node_modules/rxjs";
import { FlatTreeControl } from "../../../../node_modules/@angular/cdk/tree";
import { CollectionViewer, SelectionChange } from "../../../../node_modules/@angular/cdk/collections";
import { map } from "../../../../node_modules/rxjs/operators";
import { ApiService } from "../../api.service";
import { MatSnackBar } from "../../../../node_modules/@angular/material";

/** Flat node with expandable and level information */
export class DocumentNode {
  constructor(public item: any, public level = 1, public expandable = false, public isLoading = false) {}

  get open(): boolean {
    return window.sessionStorage.getItem("document-" + this.item._id) == "open";
  }

  set open(val: boolean) {
    console.log("Save", this.item._id, val ? "open" : "close");
    window.sessionStorage.setItem("document-" + this.item._id, val ? "open" : "close");
  }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DocumentDatabase {
  private childs: Map<string, DocumentNode[]> = new Map<string, DocumentNode[]>();
  private _root: DocumentNode[] = [];

  constructor() {}

  initNode(node: DocumentNode, level: number = 0) {
    node.level = level;
    node.expandable = this.childs.has(node.item._id);
    if (node.expandable) {
      this.childs.get(node.item._id).forEach(el => this.initNode(el, level + 1));
    }
  }

  clear() {
    this.childs.clear();
    this._root.length = 0;
  }

  init(): DocumentNode[] {
    this._root.forEach(el => {
      this.initNode(el);
    });
    return this.root;
  }

  public get root(): DocumentNode[] {
    var list: DocumentNode[] = [];
    this._root.forEach(el => list.push(el));
    return list;
  }

  add(doc: DocumentNode): void {
    if (doc.item.parent) {
      if (!this.childs.has(doc.item.parent)) {
        this.childs.set(doc.item.parent, []);
      }
      this.childs.get(doc.item.parent).push(doc);
    } else {
      this._root.push(doc);
    }
  }

  getChildren(parent: DocumentNode): DocumentNode[] {
    return this.childs.get(parent.item._id) || [];
  }
}

@Injectable()
export class DocumentDataSource {
  dataChange = new BehaviorSubject<DocumentNode[]>([]);

  get data(): DocumentNode[] {
    return this.dataChange.value;
  }
  set data(value: DocumentNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private treeControl: FlatTreeControl<DocumentNode>, private database: DocumentDatabase) {}

  connect(collectionViewer: CollectionViewer): Observable<DocumentNode[]> {
    this.treeControl.expansionModel.onChange!.subscribe(change => {
      if ((change as SelectionChange<DocumentNode>).added || (change as SelectionChange<DocumentNode>).removed) {
        this.handleTreeControl(change as SelectionChange<DocumentNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DocumentNode>) {
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
  toggleNode(node: DocumentNode, expand: boolean) {
    const index = this.data.indexOf(node);
    if (index < 0) {
      return;
    }
    if (expand) {
      const childs = this.database.getChildren(node);
      this.data.splice(index + 1, 0, ...childs);
      this.dataChange.next(this.data);
      node.open = true;
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {
        this.data[i].open = false;
      }
      node.open = false;
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);
    }
  }

  public empty(): boolean {
    return !this.dataChange.value || this.dataChange.value.length == 0;
  }
}

@Component({
  selector: "document-tree",
  templateUrl: "./document-tree.component.html",
  styleUrls: ["./document-tree.component.css"]
})
export class DocumentTreeComponent implements OnInit {
  @Output("selected") private clickEvent = new EventEmitter<any>();

  @Input("selection") private selection = new BehaviorSubject<string>("");

  @Input("documents") private documents = new BehaviorSubject<Array<any>>([]);

  @Input("templates") private templates: Array<any> = [];

  constructor() {}

  ngOnInit() {
    var templateMapping = {};
    var database = new DocumentDatabase();
    this.treeControl = new FlatTreeControl<DocumentNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DocumentDataSource(this.treeControl, database);
    this.documents.subscribe((documents: Array<any>) => {
      (this.templates || []).forEach(temp => templateMapping[temp._id] = temp);
      database.clear();
      documents.forEach(doc => {
        doc.templateData = templateMapping[doc.template];
        database.add(new DocumentNode(doc));
      });
      var root = database.init();
      var handleChilds = childs => {
        childs.forEach(el => {
          if (el.open) {
            this.treeControl.expansionModel.select(el);
            handleChilds(database.getChildren(el));
          }
        });
      };
      this.dataSource.data = root;
      handleChilds(database.root);
    });
    this.dataSource.empty();
  }

  isSelected(id: String) {
    return this.selection.pipe(
      map(value => {
        return id == value;
      })
    );
  }

  handleClick(node) {
    this.clickEvent.emit(node.item._id);
  }

  treeControl: FlatTreeControl<DocumentNode>;

  dataSource: DocumentDataSource;

  getLevel = (node: DocumentNode) => node.level;

  isExpandable = (node: DocumentNode) => node.expandable;

  hasChild = (_: number, _nodeData: DocumentNode) => _nodeData.expandable;
}

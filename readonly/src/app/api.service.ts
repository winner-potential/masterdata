import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  api = (window as any).api || environment.api;

  constructor(private httpClient: HttpClient) {}

  getImagePath(reference: String, attribute: String): String {
    return `${this.api}api/v1.0/image/${reference}/${attribute}`;
  }

  findByCollection(search: String, collection: String) {
    return this.httpClient.get(`${this.api}api/v1.0/index/${collection}/${search}`);
  }

  findDocuments(search: String) {
    return this.httpClient.get(`${this.api}api/v1.0/document/find/${search}`);
  }

  getChildDocuments(id: String) {
    return this.httpClient.get(`${this.api}api/v1.0/document/childs/${id}`);
  }

  find(search: String) {
    return this.httpClient.get(`${this.api}api/v1.0/index/${search}`);
  }

  resolveMetrics(path: Array<string>) {
    var base = `${this.api}api/v1.0/metric/resolve`
    path.forEach((p:string) => {
      base += '/' + encodeURI(p);
    })
    return this.httpClient.get(base);
  }

  getDocuments() {
    return this.httpClient.get(`${this.api}api/v1.0/document`);
  }
  getDocument(id: String) {
    return this.httpClient.get(`${this.api}api/v1.0/document/${id}`);
  }

  getDocumentTemplates() {
    return this.httpClient.get(`${this.api}api/v1.0/template/document`);
  }

  getMetricTemplates() {
    return this.httpClient.get(`${this.api}api/v1.0/template/metric`);
  }

  queryMetric(metric: string, start: number, end: number) {
    return this.httpClient.post(`${this.api}api/v1.0/tsdb/query/metric/${metric}`, {
      start: start,
      end: end
    });
  }

  queryRelation(relation: string, start: number, end: number) {
    return this.httpClient.post(`${this.api}api/v1.0/tsdb/query/relation/${relation}`, {
      start: start,
      end: end
    });
  }
}

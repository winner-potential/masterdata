import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  api = (window as any).api || environment.api;

  constructor(private httpClient: HttpClient) {}

  findDocuments(search: String) {
    return this.httpClient.get(`${this.api}api/v1.0/document/find/${search}`);
  }

  findDocumentWithMetricTemplate(metric: String, search: String) {
    return this.httpClient.get(`${this.api}api/v1.0/document/find-with-metric-template/${metric}/${search}`);
  }

  getDocuments() {
    return this.httpClient.get(`${this.api}api/v1.0/document`);
  }
  getDocument(id: String) {
    return this.httpClient.get(`${this.api}api/v1.0/document/${id}`);
  }

  uploadImage(reference: String, attribute: String, data: String) {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/octet-stream');
    return this.httpClient.put(`${this.api}api/v1.0/image/${reference}/${attribute}`, data, {headers: headers});
  }

  updateDocument(id: String, name: String, description: String, template: String, attributes: Array<object>, metrics: Array<object>, relations: Array<object>, parent: String) {
    return this.httpClient.put(`${this.api}api/v1.0/document/${id}`, {
      _id: id,
      name: name,
      description: description,
      parent: parent || null,
      template: template,
      attributes: attributes,
      metrics: metrics,
      relations: relations
    });
  }

  addDocument(name: String, description: String, template: String, attributes: Array<object>, metrics: Array<object>, relations: Array<object>, parent: String) {
    return this.httpClient.post(`${this.api}api/v1.0/document`, {
      name: name,
      description: description,
      parent: parent || null,
      template: template,
      attributes: attributes,
      metrics: metrics,
      relations: relations
    });
  }

  deleteDocument(id: String) {
    return this.httpClient.delete(`${this.api}api/v1.0/document/${id}`);
  }

  getTagTemplates() {
    return this.httpClient.get(`${this.api}api/v1.0/template/tag`);
  }

  getTagTemplate(id: String) {
    return this.httpClient.get(`${this.api}api/v1.0/template/tag/${id}`);
  }

  updateTagTemplate(id: String, name: String, description: String, value: String, alias: String, pub: Boolean) {
    return this.httpClient.put(`${this.api}api/v1.0/template/tag/${id}`, {
      _id: id,
      name: name,
      description: description,
      value: value,
      alias: alias,
      public: pub
    });
  }

  addTagTemplate(name: String, description: String, value: String, alias: String, pub: Boolean) {
    return this.httpClient.post(`${this.api}api/v1.0/template/tag`, {
      name: name,
      description: description,
      value: value,
      alias: alias,
      public: pub
    });
  }

  deleteTagTemplate(id: String) {
    return this.httpClient.delete(`${this.api}api/v1.0/template/tag/${id}`);
  }

  getMetricTemplates() {
    return this.httpClient.get(`${this.api}api/v1.0/template/metric`);
  }

  getMetricTemplate(id: String) {
    return this.httpClient.get(`${this.api}api/v1.0/template/metric/${id}`);
  }

  updateMetricTemplate(id: String, name: String, description: String, unit: String, tags: Array<String>, alias: String, pub: Boolean) {
    return this.httpClient.put(`${this.api}api/v1.0/template/metric/${id}`, {
      _id: id,
      name: name,
      description: description,
      unit: unit,
      tags: tags,
      alias: alias,
      public: pub
    });
  }

  addMetricTemplate(name: String, description: String, unit: String, tags: Array<String>, alias: String, pub: Boolean) {
    return this.httpClient.post(`${this.api}api/v1.0/template/metric`, {
      name: name,
      description: description,
      unit: unit,
      tags: tags,
      alias: alias,
      public: pub
    });
  }

  deleteMetricTemplate(id: String) {
    return this.httpClient.delete(`${this.api}api/v1.0/template/metric/${id}`);
  }

  getDocumentTemplates() {
    return this.httpClient.get(`${this.api}api/v1.0/template/document`);
  }

  getDocumentTemplate(id: String) {
    return this.httpClient.get(`${this.api}api/v1.0/template/document/${id}`);
  }

  updateDocumentTemplate(
    id: String,
    name: String,
    description: String,
    metrics: Array<String>,
    attributes: Array<object>,
    identifier: String,
    ext: String,
    alias: String,
    pub: boolean
  ) {
    return this.httpClient.put(`${this.api}api/v1.0/template/document/${id}`, {
      _id: id,
      name: name,
      description: description,
      metrics: metrics,
      extends: ext || null,
      attributes: attributes,
      identifier: identifier,
      alias: alias,
      public: pub
    });
  }

  addDocumentTemplate(
    name: String,
    description: String,
    metrics: Array<String>,
    attributes: Array<object>,
    identifier: String,
    ext: String,
    alias: String,
    pub: boolean
  ) {
    return this.httpClient.post(`${this.api}api/v1.0/template/document`, {
      name: name,
      description: description,
      metrics: metrics,
      extends: ext || null,
      attributes: attributes,
      identifier: identifier,
      alias: alias,
      public: pub
    });
  }

  deleteDocumentTemplate(id: String) {
    return this.httpClient.delete(`${this.api}api/v1.0/template/document/${id}`);
  }
}

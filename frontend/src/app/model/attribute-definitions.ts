import { AttributeDefinition } from "./attribute-definition";

class AttributeDefinitionIterator implements Iterator<AttributeDefinition> {
  private pointer = 0;

  constructor(public definitions: AttributeDefinition[]) {}

  public next(): IteratorResult<AttributeDefinition> {
    if (this.pointer < this.definitions.length) {
      return {
        done: false,
        value: this.definitions[this.pointer++]
      };
    } else {
      return {
        done: true,
        value: null
      };
    }
  }
}

export class AttributeDefinitions implements Iterable<AttributeDefinition> {
  public definitions: Array<AttributeDefinition> = [];

  public add(value: AttributeDefinition) {
    this.definitions.push(value);
    value.parent = this;
    return value;
  }

  [Symbol.iterator](): Iterator<AttributeDefinition> {
    return new AttributeDefinitionIterator(this.definitions);
  }

  public forEach(fn: (value: AttributeDefinition) => any) {
    this.definitions.forEach(fn);
  }

  public get(index: number) {
    return this.definitions[index];
  }

  public remove(index: number) {
    var current = this.definitions[index];
    this.definitions.splice(index, 1);
    return current;
  }

  get length(): number {
      return this.definitions.length;
  }

  public clear() {
      this.definitions.length = 0;
  }
}

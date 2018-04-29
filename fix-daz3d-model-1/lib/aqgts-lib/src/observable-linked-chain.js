import LinkedChain from "./linked-chain";

const _onAdd = Symbol("onAdd");
const _onDelete = Symbol("onDelete");
export default class ObservableLinkedChain extends LinkedChain {
  constructor(iterable, onAdd, onDelete) {
    super(iterable);
    this[_onAdd] = onAdd;
    this[_onDelete] = onDelete;
  }
  pop() {
    let isDeleted, deletedValue;
    if (this.length === 0) {
      isDeleted = false;
    } else {
      isDeleted = true;
      deletedValue = this.tail();
    }
    const result = super.pop();
    if (isDeleted) this[_onDelete].call(this, deletedValue);
    return result;
  }
  push(...values) {
    const addedValues = [...new Set(values)].filter(value => !this.has(value));
    const result = super.push(...values);
    for (const addedValue of addedValues) {
      this[_onAdd].call(this, addedValue);
    }
    return result;
  }
  shift() {
    let isDeleted, deletedValue;
    if (this.length === 0) {
      isDeleted = false;
    } else {
      isDeleted = true;
      deletedValue = this.head();
    }
    const result = super.shift();
    if (isDeleted) this[_onDelete].call(this, deletedValue);
    return result;
  }
  splice(targetValue, howMany, ...newValues) {
    if (!this.has(targetValue)) return this;
    const deletedValues = this.slice(targetValue, false, howMany);
    const addedValues = [...new Set(newValues)].filter(value => deletedValues.has(value) || !this.has(value));
    const result = super.splice(targetValue, howMany, ...newValues);
    for (const deletedValue of deletedValues) {
      this[_onDelete].call(this, deletedValue);
    }
    for (const addedValue of addedValues) {
      this[_onAdd].call(this, addedValue);
    }
    return result;
  }
  unshift(...values) {
    const addedValues = [...new Set(values)].filter(value => !this.has(value));
    const result = super.unshift(...values);
    for (const addedValue of addedValues) {
      this[_onAdd].call(this, addedValue);
    }
    return result;
  }
  clear() {
    const deletedValues = [...this];
    super.clear();
    for (const deletedValue of deletedValues) {
      this[_onDelete].call(this, deletedValue);
    }
  }
  delete(value) {
    let isDeleted, deletedValue;
    if (!this.has(value)) {
      isDeleted = false;
    } else {
      isDeleted = true;
      deletedValue = value;
    }
    const result = super.delete(value);
    if (isDeleted) this[_onDelete].call(this, deletedValue);
    return result;
  }
}

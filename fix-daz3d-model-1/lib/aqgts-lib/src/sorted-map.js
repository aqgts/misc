const _map = Symbol("map");
const _keys = Symbol("keys");
export default class SortedMap {
  constructor(...args) {
    this[_map] = new Map(...args);
    this[_keys] = _.sortBy([...this[_map].keys()], _.identity);
  }
  get size() {
    return this[_map].size;
  }
  clear() {
    this[_map].clear();
    this[_keys].splice(0, this[_keys].length);
  }
  delete(key) {
    if (!this.has(key)) return false;
    this[_map].delete(key);
    this[_keys].splice(_.sortedIndexOf(this[_keys], key), 1);
  }
  *entries() {
    for (const key of this.keys()) {
      yield [key, this[_map].get(key)];
    }
  }
  forEach(callback, thisArg = undefined) {
    for (const [key, value] of this.entries()) {
      callback.call(thisArg, value, key, this);
    }
  }
  get(key) {
    return this[_map].get(key);
  }
  has(key) {
    return this[_map].has(key);
  }
  *keys() {
    for (const key of this[_keys]) {
      yield key;
    }
  }
  set(key, value) {
    const hasKey = this.has(key);
    this[_map].set(key, value);
    if (!hasKey) {
      this[_keys].splice(_.sortedIndex(this[_keys], key), 0, key);
    }
    return this;
  }
  *values() {
    for (const key of this.keys()) {
      yield this[_map].get(key);
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  prevKey(key) {
    if (this.has(key)) return key;
    const index = _.sortedIndex(this[_keys], key) - 1;
    if (index === -1) return undefined;
    return this[_keys][index];
  }
  nextKey(key) {
    if (this.has(key)) return key;
    const index = _.sortedIndex(this[_keys], key);
    if (index === this[_keys].length) return undefined;
    return this[_keys][index];
  }
}

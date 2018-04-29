function sameValueZero(lhs, rhs) {
  if (Number.isNaN(lhs) && Number.isNaN(rhs)) return true;
  return lhs === rhs;
}

class Node {
  constructor(value) {
    this.value = value === 0 && 1 / value === Number.NEGATIVE_INFINITY ? 0 : value;
    this.prev = null;
    this.next = null;
  }
}

const _length = Symbol("length");
const _head = Symbol("head");
const _tail = Symbol("tail");
const _index = Symbol("index");
const _push = Symbol("push");
const _reverse = Symbol("reverse");
const _splice = Symbol("splice");
const _unshift = Symbol("unshift");
const _slice = Symbol("slice");
const _entries = Symbol("entries");
const _clear = Symbol("clear");
const _delete = Symbol("delete");
const _has = Symbol("has");
const _iterator = Symbol("iterator");
const _move = Symbol("move");
export default class LinkedChain {
  constructor(iterable = null) {
    this[_length] = 0;
    this[_head] = null;
    this[_tail] = null;
    this[_index] = new Map();
    if (iterable !== null) {
      // avoid stack overflow
      const values = [...iterable];
      for (let i = 0; i < values.length; i += 2048) {
        this[_push](...values.slice(i, i + 2048));
      }
    }
  }
  get length() {
    return this[_length];
  }
  head() {
    return this[_length] > 0 ? this[_head].value : undefined;
  }
  tail() {
    return this[_length] > 0 ? this[_tail].value : undefined;
  }
  pop() {
    if (this[_length] === 0) return undefined;
    
    const result = this[_tail].value;
    this[_delete](result);
    return result;
  }
  push(...values) {
    return this[_push](...values);
  }
  [_push](...values) {
    values = [...new Set(values)].filter(value => !this[_has](value));

    let previousNode = this[_tail];
    for (const value of values) {
      const currentNode = new Node(value);
      this[_index].set(value, currentNode);
      currentNode.prev = previousNode;
      if (this[_length] === 0) {
        this[_head] = currentNode;
      } else {
        previousNode.next = currentNode;
      }
      this[_length]++;
      previousNode = currentNode;
    }
    this[_tail] = previousNode;
    
    return this[_length];
  }
  reverse() {
    return this[_reverse]();
  }
  [_reverse]() {
    const nodes = [];
    for (let node = this[_head]; node !== null; node = node.next) {
      nodes.push(node);
    }
    for (const node of nodes) {
      [node.prev, node.next] = [node.next, node.prev];
    }
    [this[_head], this[_tail]] = [this[_tail], this[_head]];
    return this;
  }
  shift() {
    if (this[_length] === 0) return undefined;
    
    const result = this[_head].value;
    this[_delete](result);
    return result;
  }
  sort(...args) {
    const values = [...this[_iterator]()];
    this[_clear]();
    values.sort(...args);
    // avoid stack overflow
    for (let i = 0; i < values.length; i += 2048) {
      this[_push](...values.slice(i, i + 2048));
    }
    return this;
  }
  sortBy(iteratee) {
    return this.sort((x, y) => {
      const x2 = iteratee.call(this, x);
      const y2 = iteratee.call(this, y);
      if (x2 > y2) return 1;
      else if (x2 < y2) return -1;
      return 0;
    });
  }
  splice(targetValue, howMany, ...newValues) {
    return this[_splice](targetValue, howMany, ...newValues);
  }
  [_splice](targetValue, howMany, ...newValues) {
    if (!this[_has](targetValue)) return this;

    const deleteValueSet = new Set();
    if (1 / howMany > 0) {
      for (let node = this[_index].get(targetValue).next, i = 0; node !== null && i < howMany; node = node.next, i++) {
        deleteValueSet.add(node.value);
      }
    } else {
      for (let node = this[_index].get(targetValue).prev, i = 0; node !== null && i < -howMany; node = node.prev, i++) {
        deleteValueSet.add(node.value);
      }
    }
    newValues = [...new Set(newValues)].filter(value => deleteValueSet.has(value) || !this[_has](value));

    for (const deleteValue of deleteValueSet) {
      this[_delete](deleteValue);
    }
    if (newValues.length === 0) return this;

    if (1 / howMany > 0) {
      if (sameValueZero(targetValue, this[_tail].value)) {
        this[_push](...newValues);
        return this;
      }

      const targetNode = this[_index].get(targetValue);
      const newNodes = newValues.map(newValue => new Node(newValue));
      for (let i = 0; i < newNodes.length; i++) {
        this[_index].set(newNodes[i].value, newNodes[i]);
        newNodes[i].prev = i > 0 ? newNodes[i - 1] : targetNode;
        newNodes[i].next = i < newNodes.length - 1 ? newNodes[i + 1] : targetNode.next;
      }
      targetNode.next.prev = newNodes[newNodes.length - 1];
      targetNode.next = newNodes[0];
      this[_length] += newValues.length;

      return this;
    } else {
      if (sameValueZero(targetValue, this[_head].value)) {
        this[_unshift](...newValues);
        return this;
      }

      const targetNode = this[_index].get(targetValue);
      const newNodes = newValues.map(newValue => new Node(newValue));
      for (let i = 0; i < newNodes.length; i++) {
        this[_index].set(newNodes[i].value, newNodes[i]);
        newNodes[i].prev = i > 0 ? newNodes[i - 1] : targetNode.prev;
        newNodes[i].next = i < newNodes.length - 1 ? newNodes[i + 1] : targetNode;
      }
      targetNode.prev.next = newNodes[0];
      targetNode.prev = newNodes[newNodes.length - 1];
      this[_length] += newValues.length;

      return this;
    }
  }
  unshift(...values) {
    return this[_unshift](...values);
  }
  [_unshift](...values) {
    values = [...new Set(values)].filter(value => !this[_has](value));

    let nextNode = this[_head];
    for (const value of values.reverse()) {
      const currentNode = new Node(value);
      this[_index].set(value, currentNode);
      currentNode.next = nextNode;
      if (this[_length] === 0) {
        this[_tail] = currentNode;
      } else {
        nextNode.prev = currentNode;
      }
      this[_length]++;
      nextNode = currentNode;
    }
    this[_head] = nextNode;
    
    return this[_length];
  }
  concat(...iterables) {
    return new LinkedChain((function *() {
      for (const value of this[_iterator]()) {
        yield value;
      }
      for (const iterable of iterables) {
        for (const value of iterable) {
          yield value;
        }
      }
    }).bind(this)());
  }
  slice(targetValue, includes, howMany = this[_length]) {
    return this[_slice](targetValue, includes, howMany);
  }
  [_slice](targetValue, includes, howMany = this[_length]) {
    if (!this[_has](targetValue)) return new LinkedChain();
    
    if (howMany === Infinity || (Number.isFinite(howMany) && 1 / howMany > 0)) {
      return new LinkedChain((function *() {
        if (includes) yield targetValue;
        for (let node = this[_index].get(targetValue).next, i = 0; node !== null && i < howMany; node = node.next, i++) {
          yield node.value;
        }
      }).bind(this)());
    } else {
      return new LinkedChain((function *() {
        if (includes) yield targetValue;
        for (let node = this[_index].get(targetValue).prev, i = 0; node !== null && i < -howMany; node = node.prev, i++) {
          yield node.value;
        }
      }).bind(this)())[_reverse]();
    }
  }
  forEach(callback, thisObj = undefined) {
    for (const [index, value] of this[_entries]()) {
      callback.call(thisObj, value, index, this);
    }
  }
  entries() {
    return this[_entries]();
  }
  *[_entries]() {
    let i = 0;
    for (const value of this[_iterator]()) {
      yield [i++, value];
    }
  }
  every(callback, thisObj = undefined) {
    for (const [index, value] of this[_entries]()) {
      if (!callback.call(thisObj, value, index, this)) return false;
    }
    return true;
  }
  some(callback, thisObj = undefined) {
    for (const [index, value] of this[_entries]()) {
      if (callback.call(thisObj, value, index, this)) return true;
    }
    return false;
  }
  filter(callback, thisObj = undefined) {
    return new LinkedChain((function *() {
      for (const [index, value] of this[_entries]()) {
        if (callback.call(thisObj, value, index, this)) yield value;
      }
    }).bind(this)());
  }
  find(callback, thisObj = undefined) {
    for (const [index, value] of this[_entries]()) {
      if (callback.call(thisObj, value, index, this)) return value;
    }
    return undefined;
  }
  findIndex(callback, thisObj = undefined) {
    for (const [index, value] of this[_entries]()) {
      if (callback.call(thisObj, value, index, this)) return index;
    }
    return -1;
  }
  map(callback, thisObj = undefined) {
    const result = [];
    for (const [index, value] of this[_entries]()) {
      result.push(callback.call(thisObj, value, index, this));
    }
    return result;
  }
  reduce(callback) {
    if (arguments.length <= 1) {
      if (this[_length] === 0) throw new TypeError("Reduce of empty array with no initial value");
      let result;
      for (const [index, value] of this[_entries]()) {
        if (index === 0) {
          result = value;
        } else {
          result = callback(result, value, index, this);
        }
      }
      return result;
    } else {
      let result = arguments[1];
      for (const [index, value] of this[_entries]()) {
        result = callback(result, value, index, this);
      }
      return result;
    }
  }
  reduceRight(callback) {
    if (arguments.length <= 1) {
      if (this[_length] === 0) throw new TypeError("Reduce of empty array with no initial value");
      let result;
      for (let node = this[_tail], index = this[_length] - 1; node !== null; node = node.prev, index--) {
        if (index === this[_length] - 1) {
          result = node.value;
        } else {
          result = callback(result, node.value, index, this);
        }
      }
      return result;
    } else {
      let result = arguments[1];
      for (let node = this[_tail], index = this[_length] - 1; node !== null; node = node.prev, index--) {
        result = callback(result, node.value, index, this);
      }
      return result;
    }
  }
  clear() {
    return this[_clear]();
  }
  [_clear]() {
    this[_length] = 0;
    this[_head] = null;
    this[_tail] = null;
    this[_index].clear();
  }
  delete(value) {
    return this[_delete](value);
  }
  [_delete](value) {
    if (!this[_has](value)) return false;

    const targetNode = this[_index].get(value);
    if (targetNode.prev !== null) targetNode.prev.next = targetNode.next;
    if (targetNode.next !== null) targetNode.next.prev = targetNode.prev;
    this[_length]--;
    if (sameValueZero(value, this[_head].value)) this[_head] = this[_head].next;
    if (sameValueZero(value, this[_tail].value)) this[_tail] = this[_tail].prev;
    this[_index].delete(value);
    return true;
  }
  has(value) {
    return this[_has](value);
  }
  [_has](value) {
    return this[_index].has(value);
  }
  [Symbol.iterator]() {
    return this[_iterator]();
  }
  *[_iterator]() {
    for (let node = this[_head]; node !== null; node = node.next) {
      yield node.value;
    }
  }
  move(targetValue, offset) {
    return this[_move](targetValue, offset);
  }
  [_move](targetValue, offset) {
    if (!this[_has](targetValue)) return this;

    if (offset > 0) {
      const guide = this[_slice](targetValue, false, offset).tail();
      if (guide !== undefined) {
        this[_delete](targetValue);
        this[_splice](guide, +0, targetValue);
      }
    } else if (offset < 0) {
      this[_reverse]()[_move](targetValue, -offset)[_reverse]();
    }
    return this;
  }
}

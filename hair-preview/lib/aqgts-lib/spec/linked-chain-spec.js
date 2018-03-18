import LinkedChain from "../src/linked-chain";

describe("LinkedChain", () => {
  it("constructor", () => {
    expect([...new LinkedChain()]).toEqual([]);
    expect([...new LinkedChain([1, 2, 3])]).toEqual([1, 2, 3]);
    expect([...new LinkedChain((function *() {
      yield "a";
      yield "b";
      yield "c";
    })())]).toEqual(["a", "b", "c"]);
    expect([...new LinkedChain(["a", "b", "a", "c"])]).toEqual(["a", "b", "c"]);
  });
  it("length", () => {
    expect(new LinkedChain().length).toBe(0);
    expect(new LinkedChain(["a", "b", "c"]).length).toBe(3);
  });
  it("head", () => {
    expect(new LinkedChain().head()).toBeUndefined();
    expect(new LinkedChain(["a", "b", "c"]).head()).toBe("a");
  });
  it("tail", () => {
    expect(new LinkedChain().tail()).toBeUndefined();
    expect(new LinkedChain(["a", "b", "c"]).tail()).toBe("c");
  });
  it("pop", () => {
    const chain1 = new LinkedChain();
    expect(chain1.pop()).toBeUndefined();
    expect([...chain1]).toEqual([]);
    
    const chain2 = new LinkedChain(["a", "b", "c"]);
    expect(chain2.pop()).toBe("c");
    expect([...chain2]).toEqual(["a", "b"]);
  });
  it("push", () => {
    const chain = new LinkedChain();
    expect(chain.push("a")).toBe(1);
    expect([...chain]).toEqual(["a"]);
    expect(chain.push("b", "c")).toBe(3);
    expect([...chain]).toEqual(["a", "b", "c"]);
    expect(chain.push("b")).toBe(3);
    expect([...chain]).toEqual(["a", "b", "c"])
  });
  it("reverse", () => {
    const chain = new LinkedChain(["a", "b", "c"]);
    expect([...chain.reverse()]).toEqual(["c", "b", "a"]);
    expect([...chain]).toEqual(["c", "b", "a"]);
  });
  it("shift", () => {
    const chain1 = new LinkedChain();
    expect(chain1.shift()).toBeUndefined();
    expect([...chain1]).toEqual([]);
    
    const chain2 = new LinkedChain(["a", "b", "c"]);
    expect(chain2.shift()).toBe("a");
    expect([...chain2]).toEqual(["b", "c"]);
  });
  it("splice", () => {
    const chain1 = new LinkedChain(["a", "X", "Y", "d"]);
    expect(chain1.splice("a", 2, "b", "c")).toBe(chain1);
    expect([...chain1]).toEqual(["a", "b", "c", "d"]);

    const chain2 = new LinkedChain(["a", "X", "Y", "d"]);
    expect(chain2.splice("d", -2, "b", "c")).toBe(chain2);
    expect([...chain2]).toEqual(["a", "b", "c", "d"]);

    const chain3 = new LinkedChain(["a"]);
    expect(chain3.splice("a", 0, "b", "c")).toBe(chain3);
    expect([...chain3]).toEqual(["a", "b", "c"]);

    const chain4 = new LinkedChain(["c"]);
    expect(chain4.splice("c", -0, "a", "b")).toBe(chain4);
    expect([...chain4]).toEqual(["a", "b", "c"]);

    const chain5 = new LinkedChain(["a", "b", "c"]);
    expect(chain5.splice("a", 0)).toBe(chain5);
    expect([...chain5]).toEqual(["a", "b", "c"]);

    const chain6 = new LinkedChain(["a", "b", "c"]);
    expect(chain6.splice("X", 1, "Y")).toBe(chain6);
    expect([...chain6]).toEqual(["a", "b", "c"]);

    const chain7 = new LinkedChain(["a", "d"]);
    expect(chain7.splice("a", 0, "b", "c", "b")).toBe(chain7);
    expect([...chain7]).toEqual(["a", "b", "c", "d"]);

    const chain8 = new LinkedChain(["a", "b", "c"]);
    expect(chain8.splice("a", 1, "c")).toBe(chain8);
    expect([...chain8]).toEqual(["a", "c"]);
  });
  it("unshift", () => {
    const chain = new LinkedChain();
    expect(chain.unshift("c")).toBe(1);
    expect([...chain]).toEqual(["c"]);
    expect(chain.unshift("a", "b")).toBe(3);
    expect([...chain]).toEqual(["a", "b", "c"]);
    expect(chain.unshift("b")).toBe(3);
    expect([...chain]).toEqual(["a", "b", "c"]);
  });
  it("entries", () => {
    expect([...new LinkedChain(["a", "b", "c"]).entries()]).toEqual([[0, "a"], [1, "b"], [2, "c"]]);
  });
  it("filter", () => {
    expect([...new LinkedChain([1, 2, 3]).filter(i => i % 2 === 1)]).toEqual([1, 3]);
  });
  it("slice", () => {
    const chain1 = new LinkedChain(["a", "b", "c"]);
    expect([...chain1.slice("b", true, -1)]).toEqual(["a", "b"]);

    const chain2 = new LinkedChain(["a", "b", "c"]);
    expect([...chain2.slice("b", true, 0)]).toEqual(["b"]);

    const chain3 = new LinkedChain(["a", "b", "c"]);
    expect([...chain3.slice("b", true, 1)]).toEqual(["b", "c"]);

    const chain4 = new LinkedChain(["a", "b", "c"]);
    expect([...chain4.slice("b", false, -1)]).toEqual(["a"]);

    const chain5 = new LinkedChain(["a", "b", "c"]);
    expect([...chain5.slice("b", false, 0)]).toEqual([]);

    const chain6 = new LinkedChain(["a", "b", "c"]);
    expect([...chain6.slice("b", false, 1)]).toEqual(["c"]);

    const chain7 = new LinkedChain(["a", "b", "c"]);
    expect([...chain7.slice("X", true, 0)]).toEqual([]);
  });
  it("forEach", () => {
    let callCount = 0;
    const chain = new LinkedChain(["a", "b", "c"]);
    chain.forEach(function (value, index, caller) {
      callCount++;
      switch (callCount) {
      case 1:
        expect(this).toBe("THISOBJ");
        expect(value).toBe("a");
        expect(index).toBe(0);
        expect(caller).toBe(chain);
        break;
      case 2:
        expect(this).toBe("THISOBJ");
        expect(value).toBe("b");
        expect(index).toBe(1);
        expect(caller).toBe(chain);
        break;
      case 3:
        expect(this).toBe("THISOBJ");
        expect(value).toBe("c");
        expect(index).toBe(2);
        expect(caller).toBe(chain);
        break;
      }
    }, "THISOBJ");
    expect(callCount).toBe(3);
  });
  it("map", () => {
    expect(new LinkedChain([1, 2, 3]).map(value => value * 2)).toEqual([2, 4, 6]);
  });
  it("reduce", () => {
    expect(new LinkedChain(["b", "c", "d"]).reduce((accumulator, value) => accumulator + value)).toBe("bcd");
    expect(new LinkedChain(["b", "c", "d"]).reduce((accumulator, value) => accumulator + value, "a")).toBe("abcd");
    expect(() => {
      new LinkedChain().reduce(() => {})
    }).toThrowError();
  });
  it("reduceRight", () => {
    expect(new LinkedChain(["b", "c", "d"]).reduceRight((accumulator, value) => accumulator + value)).toBe("dcb");
    expect(new LinkedChain(["b", "c", "d"]).reduceRight((accumulator, value) => accumulator + value, "e")).toBe("edcb");
    expect(() => {
      new LinkedChain().reduceRight(() => {})
    }).toThrowError();
  });
  it("clear", () => {
    const chain = new LinkedChain(["a", "b", "c"]);
    chain.clear();
    expect([...chain]).toEqual([]);
  });
  it("delete", () => {
    const chain1 = new LinkedChain(["a", "b", "c"]);
    expect(chain1.delete("a")).toBe(true);
    expect([...chain1]).toEqual(["b", "c"]);

    const chain2 = new LinkedChain(["a", "b", "c"]);
    expect(chain2.delete("b")).toBe(true);
    expect([...chain2]).toEqual(["a", "c"]);

    const chain3 = new LinkedChain(["a", "b", "c"]);
    expect(chain3.delete("c")).toBe(true);
    expect([...chain3]).toEqual(["a", "b"]);

    const chain4 = new LinkedChain(["a", "b", "c"]);
    expect(chain4.delete("d")).toBe(false);
    expect([...chain4]).toEqual(["a", "b", "c"]);
  });
  it("has", () => {
    const chain1 = new LinkedChain(["a", "b", "c"]);
    expect(chain1.has("b")).toBe(true);

    const chain2 = new LinkedChain(["a", "b", "c"]);
    expect(chain2.has("d")).toBe(false);
  });
});

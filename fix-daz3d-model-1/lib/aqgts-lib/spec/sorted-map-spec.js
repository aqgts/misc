import SortedMap from "../src/sorted-map";

describe("SortedMap", () => {
  it("constructor", () => {
    expect([...new SortedMap()]).toEqual([]);
    expect([...new SortedMap([[2, "b"], [3, "c"], [1, "a"]])]).toEqual([[1, "a"], [2, "b"], [3, "c"]]);
    expect([...new SortedMap([[2, "b"], [3, "c"], [1, "a"], [2, "B"]])]).toEqual([[1, "a"], [2, "B"], [3, "c"]]);
  });
  it("length", () => {
    expect(new SortedMap().size).toBe(0);
    expect(new SortedMap([[2, "b"], [3, "c"], [1, "a"]]).size).toBe(3);
  });
  it("prevKey", () => {
    const sortedMap = new SortedMap([[3, "b"], [1, "a"]]);
    expect(sortedMap.prevKey(0)).toBeUndefined();
    expect(sortedMap.prevKey(1)).toBe(1);
    expect(sortedMap.prevKey(2)).toBe(1);
    expect(sortedMap.prevKey(3)).toBe(3);
    expect(sortedMap.prevKey(4)).toBe(3);
  });
  it("nextKey", () => {
    const sortedMap = new SortedMap([[3, "b"], [1, "a"]]);
    expect(sortedMap.nextKey(0)).toBe(1);
    expect(sortedMap.nextKey(1)).toBe(1);
    expect(sortedMap.nextKey(2)).toBe(3);
    expect(sortedMap.nextKey(3)).toBe(3);
    expect(sortedMap.nextKey(4)).toBeUndefined();
  });
});

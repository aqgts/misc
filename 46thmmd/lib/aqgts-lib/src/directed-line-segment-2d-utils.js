export default {
  connect(originalLineSegments) {
    function keyFrom(p) {
      return Array.from(p).map(Math.fround).join(",");
    }
    const [lineSegmentsArray, p1Map, p2Map] = (() => {
      const valueMap = new Map(originalLineSegments.map(lineSegment => [lineSegment, [lineSegment]]));
      return [
        Array.from(valueMap.values()),
        new Map(_(originalLineSegments).groupBy(lineSegment => keyFrom(lineSegment.p1)).map((values, key) => [key, values.map(value => valueMap.get(value))]).value()),
        new Map(_(originalLineSegments).groupBy(lineSegment => keyFrom(lineSegment.p2)).map((values, key) => [key, values.map(value => valueMap.get(value))]).value())
      ];
    })();
    if (Array.from(p1Map.values()).some(arrays => arrays.length > 2) || Array.from(p2Map.values()).some(arrays => arrays.length > 2)) {
      throw new Error("Duplicate vertices were found.");
    }
    const loops = [];
    function update(p1MapIndexA, p1MapIndexB, p2MapIndexA, p2MapIndexB, lineSegmentsA, lineSegmentsB, connectionA, connectionB, p1KeyA, p2KeyA, p1KeyB, p2KeyB) {
      if (lineSegmentsA === lineSegmentsB) {
        p1Map.get(p1KeyA).splice(p1MapIndexA, 1);
        if (p1Map.get(p1KeyA).length === 0) p1Map.delete(p1KeyA);
      } else if (p1KeyA === p1KeyB) {
        p1Map.get(p1KeyA).splice(Math.max(p1MapIndexA, p1MapIndexB), 1);
        p1Map.get(p1KeyA).splice(Math.min(p1MapIndexA, p1MapIndexB), 1);
        if (p1Map.get(p1KeyA).length === 0) p1Map.delete(p1KeyA);
      } else {
        p1Map.get(p1KeyA).splice(p1MapIndexA, 1);
        if (p1Map.get(p1KeyA).length === 0) p1Map.delete(p1KeyA);
        p1Map.get(p1KeyB).splice(p1MapIndexB, 1);
        if (p1Map.get(p1KeyB).length === 0) p1Map.delete(p1KeyB);
      }
      if (lineSegmentsA === lineSegmentsB) {
        p2Map.get(p2KeyA).splice(p2MapIndexA, 1);
        if (p2Map.get(p2KeyA).length === 0) p2Map.delete(p2KeyA);
      } else if (p2KeyA === p2KeyB) {
        p2Map.get(p2KeyA).splice(Math.max(p2MapIndexA, p2MapIndexB), 1);
        p2Map.get(p2KeyA).splice(Math.min(p2MapIndexA, p2MapIndexB), 1);
        if (p2Map.get(p2KeyA).length === 0) p2Map.delete(p2KeyA);
      } else {
        p2Map.get(p2KeyA).splice(p2MapIndexA, 1);
        if (p2Map.get(p2KeyA).length === 0) p2Map.delete(p2KeyA);
        p2Map.get(p2KeyB).splice(p2MapIndexB, 1);
        if (p2Map.get(p2KeyB).length === 0) p2Map.delete(p2KeyB);
      }
      lineSegmentsA[{p1: "unshift", p2: "push"}[connectionA]](...(connectionA === connectionB ? lineSegmentsB.reverse() : lineSegmentsB));
      if (lineSegmentsA !== lineSegmentsB) {
        lineSegmentsB.splice(0, lineSegmentsB.length);
      }
      const p1KeyANew = connectionA === "p2" ? p1KeyA : {p1: p2KeyB, p2: p1KeyB}[connectionB];
      const p2KeyANew = connectionA === "p1" ? p2KeyA : {p1: p2KeyB, p2: p1KeyB}[connectionB];
      if (p1KeyANew === p2KeyANew) {
        loops.push(lineSegmentsA);
      } else {
        if (!p1Map.has(p1KeyANew)) p1Map.set(p1KeyANew, []);
        p1Map.get(p1KeyANew).push(lineSegmentsA);
        if (!p2Map.has(p2KeyANew)) p2Map.set(p2KeyANew, []);
        p2Map.get(p2KeyANew).push(lineSegmentsA);
      }
    }
    for (const lineSegment of originalLineSegments) {
      {
        const p1KeyA = keyFrom(lineSegment.p1);
        if (p1Map.has(p1KeyA)) {
          const p1MapIndexA = p1Map.get(p1KeyA).findIndex(lineSegments => lineSegments[0] === lineSegment);
          if (p1Map.get(p1KeyA).length > 1) {
            const p1KeyB = p1KeyA;
            const p1MapIndexB = p1MapIndexA === 0 ? 1 : 0;
            const lineSegmentsA = p1Map.get(p1KeyA)[p1MapIndexA];
            const lineSegmentsB = p1Map.get(p1KeyB)[p1MapIndexB];
            const p2KeyA = keyFrom(lineSegmentsA[lineSegmentsA.length - 1].p2);
            const p2MapIndexA = p2Map.get(p2KeyA).findIndex(lineSegments => lineSegments === lineSegmentsA);
            const p2KeyB = keyFrom(lineSegmentsB[lineSegmentsB.length - 1].p2);
            const p2MapIndexB = p2Map.get(p2KeyB).findIndex(lineSegments => lineSegments === lineSegmentsB);
            update(p1MapIndexA, p1MapIndexB, p2MapIndexA, p2MapIndexB, lineSegmentsA, lineSegmentsB, "p1", "p1", p1KeyA, p2KeyA, p1KeyB, p2KeyB);
          } else if (p2Map.has(p1KeyA)) {
            const p2KeyB = p1KeyA;
            const p2MapIndexB = 0;
            const lineSegmentsA = p1Map.get(p1KeyA)[p1MapIndexA];
            const lineSegmentsB = p2Map.get(p2KeyB)[p2MapIndexB];
            const p2KeyA = keyFrom(lineSegmentsA[lineSegmentsA.length - 1].p2);
            const p2MapIndexA = p2Map.get(p2KeyA).findIndex(lineSegments => lineSegments === lineSegmentsA);
            const p1KeyB = keyFrom(lineSegmentsB[0].p1);
            const p1MapIndexB = p1Map.get(p1KeyB).findIndex(lineSegments => lineSegments === lineSegmentsB);
            update(p1MapIndexA, p1MapIndexB, p2MapIndexA, p2MapIndexB, lineSegmentsA, lineSegmentsB, "p1", "p2", p1KeyA, p2KeyA, p1KeyB, p2KeyB);
          } else {
            // 端点が等しい線分が見つからなかった
          }
        }
      }
      {
        const p2KeyA = keyFrom(lineSegment.p2);
        if (p2Map.has(p2KeyA)) {
          const p2MapIndexA = p2Map.get(p2KeyA).findIndex(lineSegments => lineSegments[lineSegments.length - 1] === lineSegment);
          if (p1Map.has(p2KeyA)) {
            const p1KeyB = p2KeyA;
            const p1MapIndexB = 0;
            const lineSegmentsA = p2Map.get(p2KeyA)[p2MapIndexA];
            const lineSegmentsB = p1Map.get(p1KeyB)[p1MapIndexB];
            const p1KeyA = keyFrom(lineSegmentsA[0].p1);
            const p1MapIndexA = p1Map.get(p1KeyA).findIndex(lineSegments => lineSegments === lineSegmentsA);
            const p2KeyB = keyFrom(lineSegmentsB[lineSegmentsB.length - 1].p2);
            const p2MapIndexB = p2Map.get(p2KeyB).findIndex(lineSegments => lineSegments === lineSegmentsB);
            update(p1MapIndexA, p1MapIndexB, p2MapIndexA, p2MapIndexB, lineSegmentsA, lineSegmentsB, "p2", "p1", p1KeyA, p2KeyA, p1KeyB, p2KeyB);
          } else if (p2Map.get(p2KeyA).length > 1) {
            const p2KeyB = p2KeyA;
            const p2MapIndexB = p2MapIndexA === 0 ? 1 : 0;
            const lineSegmentsA = p2Map.get(p2KeyA)[p2MapIndexA];
            const lineSegmentsB = p2Map.get(p2KeyB)[p2MapIndexB];
            const p1KeyA = keyFrom(lineSegmentsA[0].p1);
            const p1MapIndexA = p1Map.get(p1KeyA).findIndex(lineSegments => lineSegments === lineSegmentsA);
            const p1KeyB = keyFrom(lineSegmentsB[0].p1);
            const p1MapIndexB = p1Map.get(p1KeyB).findIndex(lineSegments => lineSegments === lineSegmentsB);
            update(p1MapIndexA, p1MapIndexB, p2MapIndexA, p2MapIndexB, lineSegmentsA, lineSegmentsB, "p2", "p2", p1KeyA, p2KeyA, p1KeyB, p2KeyB);
          } else {
            // 端点が等しい線分が見つからなかった
          }
        }
      }
    }
    return {loops, curves: lineSegmentsArray.filter(lineSegments => lineSegments.length > 0)};
  }
};

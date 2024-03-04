export interface Grid<T> {
  cols: number;
  rows: number;
  items: Array<T>;
}

export interface GridItem {
  col: number;
  row: number;
}

export function iterateGrid<T>(
  grid: Grid<T>,
  handler: ({ col, row }: { col: number; row: number }) => void
) {
  for (let i = 0; i < grid.rows; i++) {
    for (let j = 0; j < grid.cols; j++) {
      // create the dots
      handler({ col: j, row: i });
    }
  }
}

export function createGrid<T extends GridItem>(
  cols: number,
  rows: number,
  itemFactory: ({ col, row }: { col: number; row: number }) => T
): Grid<T> {
  const items: Array<T> = [];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // create the dots

      const item = itemFactory({ col: j, row: i });
      items.push({
        ...item,
        col: j,
        row: i,
      });
    }
  }

  return {
    cols,
    rows,
    items,
  };
}

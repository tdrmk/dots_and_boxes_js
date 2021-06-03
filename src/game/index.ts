class ToString {
  toString() {
    return JSON.stringify(this);
  }
}

export class Grid extends ToString {
  rows: number;
  columns: number;
  constructor(rows: number, columns: number) {
    super();
    this.rows = rows;
    this.columns = columns;
  }
}
export class Dot extends ToString {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class Edge extends ToString {
  start: Dot;
  end: Dot;
  constructor(start: Dot, end: Dot) {
    super();
    // The start and the end dot
    this.start = start;
    this.end = end;
  }

  get horizontal() {
    return this.start.x === this.end.x;
  }

  get vertical() {
    return this.start.y === this.end.y;
  }

  static Vertical(start: Dot) {
    return new Edge(start, new Dot(start.x + 1, start.y));
  }

  static Horizontal(start: Dot) {
    return new Edge(start, new Dot(start.x, start.y + 1));
  }

  static Edges(grid: Grid) {
    const edges = [];
    for (let i = 0; i < grid.rows + 1; i++)
      for (let j = 0; j < grid.columns; j++)
        edges.push(Edge.Horizontal(new Dot(i, j)));
    for (let i = 0; i < grid.rows; i++)
      for (let j = 0; j < grid.columns + 1; j++)
        edges.push(Edge.Vertical(new Dot(i, j)));
    return edges;
  }

  adjacentBoxes(grid: Grid) {
    if (
      (this.start.x === 0 && this.horizontal) ||
      (this.start.y === 0 && this.vertical)
    )
      return [new Box(this.start)];
    else if (
      (this.end.x === grid.rows && this.horizontal) ||
      (this.end.y === grid.columns && this.vertical)
    )
      return [Box.End(this.end)];
    else return [new Box(this.start), Box.End(this.end)];
  }
}

export class Box extends ToString {
  start: Dot;
  constructor(start: Dot) {
    super();
    this.start = start;
  }

  static End(end: Dot) {
    return new Box(new Dot(end.x - 1, end.y - 1));
  }

  static Boxes(grid: Grid) {
    const boxes = [];
    for (let i = 0; i < grid.rows; i++)
      for (let j = 0; j < grid.columns; j++) boxes.push(new Box(new Dot(i, j)));
    return boxes;
  }
}

export class Player extends ToString {
  userID: string;
  username: string;
  constructor(userID: string, username: string) {
    super();
    this.userID = userID;
    this.username = username;
  }
}

export class DotsAndBoxes {
  players: Player[];
  grid: Grid;
  turn: number;
  pendingEdges: Edge[];
  pendingBoxes: [Box, number][];
  chosenEdges: [Player, Edge[]][];
  wonBoxes: [Player, Box[]][];
  lastMove: Edge | null;

  constructor(
    players: Player[],
    grid: Grid,
    turn: number,
    pendingEdges: Edge[],
    pendingBoxes: [Box, number][],
    chosenEdges: [Player, Edge[]][],
    wonBoxes: [Player, Box[]][],
    lastMove: Edge | null
  ) {
    this.players = players;
    this.grid = grid;
    this.turn = turn;
    this.pendingEdges = pendingEdges;
    this.pendingBoxes = pendingBoxes;
    this.chosenEdges = chosenEdges;
    this.wonBoxes = wonBoxes;
    this.lastMove = lastMove;
  }

  static New() {
    const players = [
      new Player("user_1", "johndoe"),
      new Player("user_2", "steve"),
    ];
    const grid = new Grid(5, 5);
    const pendingEdges = Edge.Edges(grid);
    const pendingBoxes: [Box, number][] = Box.Boxes(grid).map((box) => [
      box,
      4,
    ]);
    const chosenEdges: [Player, Edge[]][] = players.map((player) => [
      player,
      [],
    ]);
    const wonBoxes: [Player, Box[]][] = players.map((player) => [player, []]);
    return new DotsAndBoxes(
      players,
      grid,
      0,
      pendingEdges,
      pendingBoxes,
      chosenEdges,
      wonBoxes,
      null
    );
  }

  makeMove(player: Player, edge: Edge) {
    // TODO: Handle error cases
    // Move edge from pending edges to chosen edges
    const pendingEdges = this.pendingEdges.filter(
      (_edge) => `${_edge}` !== `${edge}`
    );
    const chosenEdges: [Player, Edge[]][] = this.chosenEdges.map(
      ([_player, _edges]) =>
        `${_player}` === `${player}`
          ? [_player, [..._edges, edge]]
          : [_player, _edges]
    );
    let turn = this.turn;

    // create a copy of pendingBoxes and wonBoxes for modifying
    let pendingBoxes: [Box, number][] = this.pendingBoxes.map(
      ([box, count]) => [box, count]
    );
    const wonBoxes: [Player, Box[]][] = this.wonBoxes.map(([player, boxes]) => [
      player,
      [...boxes],
    ]);

    let hasWonBox = false;
    edge.adjacentBoxes(this.grid).forEach((box) => {
      pendingBoxes.forEach((boxCountPair) => {
        if (`${boxCountPair[0]}` === `${box}`) {
          // lower pending edge count
          boxCountPair[1] = boxCountPair[1] - 1;
          if (boxCountPair[1] === 0) {
            hasWonBox = true;
            // Won the box, add it to the player
            wonBoxes.forEach((playerBoxesPair) => {
              if (`${playerBoxesPair[0]}` === `${player}`) {
                playerBoxesPair[1].push(box);
              }
            });
          }
        }
      });
    });
    // remove boxes with no pending edges
    pendingBoxes = pendingBoxes.filter(([box, count]) => count > 0);
    if (!hasWonBox) {
      turn = (turn + 1) % this.numPlayers;
    }
    return new DotsAndBoxes(
      this.players,
      this.grid,
      turn,
      pendingEdges,
      pendingBoxes,
      chosenEdges,
      wonBoxes,
      edge
    );
  }

  get currentPlayer() {
    return this.players[this.turn];
  }

  get gameOver() {
    return this.pendingEdges.length === 0;
  }

  get numPlayers() {
    return this.players.length;
  }

  score(player: Player) {
    return this.wonBoxes.find(([_player]) => `${player}` === `${_player}`)?.[1]
      .length;
  }

  get winners(): Player[] {
    let winners: Player[] = [],
      wonBoxes = 0;
    this.wonBoxes.forEach(([player, boxes]) => {
      if (boxes.length === wonBoxes) {
        winners.push(player);
      } else if (boxes.length > wonBoxes) {
        wonBoxes = boxes.length;
        winners = [player];
      }
    });
    return winners;
  }

  // Utility functions to help rendering
  isPendingEdge(edge: Edge): boolean {
    return this.pendingEdges.some((_edge) => `${_edge}` === `${edge}`);
  }

  chosenPlayerIndex(edge: Edge): number {
    return this.players.findIndex((player) =>
      this.chosenEdges.some(
        ([_player, edges]) =>
          `${player}` === `${_player}` &&
          edges.some((_edge) => `${edge}` === `${_edge}`)
      )
    );
  }

  isBoxWon(box: Box) {
    return this.wonBoxes.some(([player, boxes]) =>
      boxes.some((_box) => `${box}` === `${_box}`)
    );
  }

  wonPlayerIndex(box: Box) {
    return this.players.findIndex((player) =>
      this.wonBoxes.some(
        ([_player, boxes]) =>
          `${player}` === `${_player}` &&
          boxes.some((_box) => `${box}` === `${_box}`)
      )
    );
  }
}

import { Grid, Dot, Edge, Box, Player, DotsAndBoxes } from "./index";

// Used while serializing the objects related to DotsAndBoxes
// While sending to server
export function replacer(key: string, value: any) {
  if (value instanceof Grid) {
    return { __class__: "Grid", rows: value.rows, columns: value.columns };
  } else if (value instanceof Dot) {
    return { __class__: "Dot", x: value.x, y: value.y };
  } else if (value instanceof Edge) {
    return { __class__: "Edge", start: value.start, end: value.end };
  } else if (value instanceof Box) {
    return { __class__: "Box", start: value.start };
  } else if (value instanceof Player) {
    return {
      __class__: "Player",
      user_id: value.userID,
      username: value.username,
    };
  } else if (value instanceof DotsAndBoxes) {
    return {
      __class__: "DotsAndBoxes",
      grid: value.grid,
      players: value.players,
      turn: value.turn,
      pending_edges: value.pendingEdges,
      pending_boxes: value.pendingBoxes,
      chosen_edges: value.chosenEdges,
      won_boxes: value.wonBoxes,
      last_move: value.lastMove,
    };
  } else {
    return value;
  }
}

// Used while deserializing objects related to DotsAndBoxes
// while received from server
export function reviver(key: string, value: any) {
  if (typeof value !== "object" || value === null) return value;
  switch (value.__class__) {
    case "Grid":
      return new Grid(value["rows"], value["columns"]);
    case "Dot":
      return new Dot(value["x"], value["y"]);
    case "Edge":
      return new Edge(value["start"], value["end"]);
    case "Box":
      return new Box(value["start"]);
    case "Player":
      return new Player(value["user_id"], value["username"]);
    case "DotsAndBoxes":
      return new DotsAndBoxes(
        value["players"],
        value["grid"],
        value["turn"],
        value["pending_edges"],
        value["pending_boxes"],
        value["chosen_edges"],
        value["won_boxes"],
        value["last_move"]
      );
    default:
      return value;
  }
}

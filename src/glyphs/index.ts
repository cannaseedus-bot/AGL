import { Registry } from "../runtime/registry.js";
import { math } from "./builtins/math.js";
import { logic } from "./builtins/logic.js";
import { flow } from "./builtins/flow.js";
import { io } from "./builtins/io.js";

export const glyphs = new Registry({
  ...math,
  ...logic,
  ...flow,
  ...io
});

export * from "./builtins/math.js";
export * from "./builtins/logic.js";
export * from "./builtins/flow.js";
export * from "./builtins/io.js";

import { GlyphMeta } from "../meta.js";

export const addMeta: GlyphMeta = {
  name: "add",
  description: "Add two numbers together.",
  category: "math",
  inputs: [
    { name: "a", type: "number" },
    { name: "b", type: "number" }
  ],
  output: { type: "number" },
  examples: ["add(1, 2)"],
  ui: { color: "#4f8a8b", icon: "+" }
};

export const subtractMeta: GlyphMeta = {
  name: "subtract",
  description: "Subtract the second number from the first.",
  category: "math",
  inputs: [
    { name: "a", type: "number" },
    { name: "b", type: "number" }
  ],
  output: { type: "number" },
  examples: ["subtract(10, 3)"],
  ui: { color: "#4f8a8b", icon: "−" }
};

export const multiplyMeta: GlyphMeta = {
  name: "multiply",
  description: "Multiply two numbers.",
  category: "math",
  inputs: [
    { name: "a", type: "number" },
    { name: "b", type: "number" }
  ],
  output: { type: "number" },
  examples: ["multiply(2, 4)"],
  ui: { color: "#4f8a8b", icon: "×" }
};

export const divideMeta: GlyphMeta = {
  name: "divide",
  description: "Divide the first number by the second.",
  category: "math",
  inputs: [
    { name: "a", type: "number" },
    { name: "b", type: "number" }
  ],
  output: { type: "number" },
  examples: ["divide(8, 2)"],
  ui: { color: "#4f8a8b", icon: "÷" }
};

export const andMeta: GlyphMeta = {
  name: "and",
  description: "Logical AND between two values.",
  category: "logic",
  inputs: [
    { name: "a", type: "boolean" },
    { name: "b", type: "boolean" }
  ],
  output: { type: "boolean" },
  examples: ["and(true, false)"],
  ui: { color: "#8a6d3b", icon: "∧" }
};

export const orMeta: GlyphMeta = {
  name: "or",
  description: "Logical OR between two values.",
  category: "logic",
  inputs: [
    { name: "a", type: "boolean" },
    { name: "b", type: "boolean" }
  ],
  output: { type: "boolean" },
  examples: ["or(true, false)"],
  ui: { color: "#8a6d3b", icon: "∨" }
};

export const notMeta: GlyphMeta = {
  name: "not",
  description: "Logical NOT of a value.",
  category: "logic",
  inputs: [{ name: "value", type: "boolean" }],
  output: { type: "boolean" },
  examples: ["not(true)"],
  ui: { color: "#8a6d3b", icon: "¬" }
};

export const equalsMeta: GlyphMeta = {
  name: "equals",
  description: "Check if two values are equal.",
  category: "logic",
  inputs: [
    { name: "a", type: "any" },
    { name: "b", type: "any" }
  ],
  output: { type: "boolean" },
  examples: ["equals(1, 1)"],
  ui: { color: "#8a6d3b", icon: "=" }
};

export const pipeMeta: GlyphMeta = {
  name: "pipe",
  description: "Pass the left value through, keeping flow ordering.",
  category: "flow",
  inputs: [
    { name: "value", type: "any" },
    { name: "next", type: "any" }
  ],
  output: { type: "any" },
  examples: ["pipe(value, next)"],
  ui: { color: "#31708f", icon: "→" }
};

export const sequenceMeta: GlyphMeta = {
  name: "sequence",
  description: "Return the last value in a sequence.",
  category: "flow",
  inputs: [{ name: "values", type: "any" }],
  output: { type: "any" },
  examples: ["sequence(a, b, c)"],
  ui: { color: "#31708f", icon: "⋯" }
};

export const branchMeta: GlyphMeta = {
  name: "branch",
  description: "Choose between two values based on a condition.",
  category: "flow",
  inputs: [
    { name: "condition", type: "boolean" },
    { name: "ifTrue", type: "any" },
    { name: "ifFalse", type: "any" }
  ],
  output: { type: "any" },
  examples: ["branch(isReady, a, b)"],
  ui: { color: "#31708f", icon: "⎇" }
};

export const printMeta: GlyphMeta = {
  name: "print",
  description: "Print a value and return it.",
  category: "io",
  inputs: [{ name: "value", type: "any" }],
  output: { type: "any" },
  examples: ["print(value)"],
  ui: { color: "#3c763d", icon: "🖨" }
};

export const debugMeta: GlyphMeta = {
  name: "debug",
  description: "Log a debug value and return it.",
  category: "io",
  inputs: [{ name: "value", type: "any" }],
  output: { type: "any" },
  examples: ["debug(value)"],
  ui: { color: "#3c763d", icon: "🐞" }
};

export const builtinGlyphMeta = [
  addMeta,
  subtractMeta,
  multiplyMeta,
  divideMeta,
  andMeta,
  orMeta,
  notMeta,
  equalsMeta,
  pipeMeta,
  sequenceMeta,
  branchMeta,
  printMeta,
  debugMeta
];

import { Registry } from "agl-es/runtime";

export const custom = new Registry({
  shout: (input: string) => input.toUpperCase() + "!",
  repeat: (input: string, times: number) => input.repeat(times)
});

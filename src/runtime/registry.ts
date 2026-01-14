export class Registry {
  constructor(public glyphs: Record<string, Function> = {}) {}

  get(name: string) {
    if (!this.glyphs[name]) {
      throw new Error(`Unknown glyph: ${name}`);
    }
    return this.glyphs[name];
  }
}

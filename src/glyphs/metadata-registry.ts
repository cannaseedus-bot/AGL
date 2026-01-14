import { GlyphMeta } from "./meta.js";

export class GlyphMetadataRegistry {
  private registry = new Map<string, GlyphMeta>();

  register(meta: GlyphMeta) {
    this.registry.set(meta.name, meta);
  }

  get(name: string) {
    return this.registry.get(name);
  }

  all() {
    return Array.from(this.registry.values());
  }

  byCategory(category: string) {
    return this.all().filter(meta => meta.category === category);
  }

  search(query: string) {
    const normalized = query.toLowerCase();
    return this.all().filter(
      meta =>
        meta.name.toLowerCase().includes(normalized) ||
        meta.description.toLowerCase().includes(normalized)
    );
  }
}

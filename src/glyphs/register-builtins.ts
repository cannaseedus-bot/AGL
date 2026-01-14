import { GlyphMetadataRegistry } from "./metadata-registry.js";
import { builtinGlyphMeta } from "./builtins/meta.js";

export const glyphMeta = new GlyphMetadataRegistry();

for (const meta of builtinGlyphMeta) {
  glyphMeta.register(meta);
}

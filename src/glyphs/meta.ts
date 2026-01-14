export interface GlyphMeta {
  name: string;
  description: string;
  category: string;
  inputs: {
    name: string;
    type: string;
    optional?: boolean;
  }[];
  output: {
    type: string;
  };
  examples?: string[];
  ui?: {
    color?: string;
    icon?: string;
    group?: string;
  };
}

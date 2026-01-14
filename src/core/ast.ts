export interface ASTNode {
  type: "call";
  name: string;
  args: string[];
}

export type AST = ASTNode[];

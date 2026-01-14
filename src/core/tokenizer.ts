export function tokenize(source: string) {
  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((value) => ({ type: "token", value }));
}

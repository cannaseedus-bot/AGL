export const logic = {
  and: (a: any, b: any) => Boolean(a && b),
  or: (a: any, b: any) => Boolean(a || b),
  not: (a: any) => !Boolean(a),
  equals: (a: any, b: any) => a == b
};

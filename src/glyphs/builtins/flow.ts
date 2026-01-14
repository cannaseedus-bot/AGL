export const flow = {
  pipe: (a: any, b: any) => b,
  sequence: (...args: any[]) => args[args.length - 1],
  branch: (cond: any, ifTrue: any, ifFalse: any) =>
    cond ? ifTrue : ifFalse
};

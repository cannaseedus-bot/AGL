export const io = {
  print: (value: any) => {
    console.log(value);
    return value;
  },
  debug: (value: any) => {
    console.debug("[DEBUG]", value);
    return value;
  }
};

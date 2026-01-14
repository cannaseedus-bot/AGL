export class Context {
  constructor(public value: any = null) {}

  update(next: any) {
    this.value = next;
  }
}

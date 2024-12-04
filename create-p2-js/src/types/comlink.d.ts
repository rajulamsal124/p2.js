declare module 'comlink' {
  export function wrap<T>(endpoint: any): T;
  export function expose(obj: any): void;
  export function transfer(obj: any, transfers: ArrayBuffer[]): void;
  export function proxy<T>(obj: T): T;
}

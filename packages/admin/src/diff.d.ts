declare module 'diff' {
  export interface Change {
    count?: number;
    value: string;
    added?: boolean;
    removed?: boolean;
  }

  export function diffJson(oldObj: any, newObj: any, options?: any): Change[];
}

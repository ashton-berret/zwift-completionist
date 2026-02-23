declare module "papaparse" {
  export interface ParseError {
    message: string;
  }

  export interface ParseConfig<T> {
    header?: boolean;
    skipEmptyLines?: boolean;
    transformHeader?: (header: string) => string;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
  }

  export function parse<T>(input: string, config: ParseConfig<T>): ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}

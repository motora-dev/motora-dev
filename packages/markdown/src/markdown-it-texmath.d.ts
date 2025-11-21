declare module 'markdown-it-texmath' {
  import type MarkdownIt from 'markdown-it';

  interface TexmathOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    engine?: any;
    delimiters?: 'dollars' | 'brackets' | 'gitlab' | 'julia' | 'kramdown';
    katexOptions?: {
      throwOnError?: boolean;
      displayMode?: boolean;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  }

  function texmath(md: MarkdownIt, options?: TexmathOptions): void;

  export default texmath;
}

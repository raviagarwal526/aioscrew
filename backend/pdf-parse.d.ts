/**
 * Type definitions for pdf-parse
 * pdf-parse doesn't have official @types, so we declare the module types here
 */

declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function pdf(dataBuffer: Buffer): Promise<PDFData>;

  export = pdf;
}

// This file contains global type declarations to help with TypeScript errors

// Declare module for all Phaser-related files to suppress strict type checking
declare module '*.ts' {
  const content: any;
  export default content;
}

// Add any other global declarations here 
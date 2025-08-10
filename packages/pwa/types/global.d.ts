// Asset module declarations for PWA build
declare module "assets/*.svg" {
  const content: string;
  export default content;
}

declare module "assets/*.md" {
  const content: string;
  export default content;
}

declare module "assets/*.png" {
  const content: string;
  export default content;
}

declare module "assets/*.jpg" {
  const content: string;
  export default content;
}

declare module "assets/*.css" {
  const content: string;
  export default content;
}

declare module "assets/*.json" {
  const content: any;
  export default content;
}

declare module "assets/*.woff2" {
  const content: string;
  export default content;
}

export {};

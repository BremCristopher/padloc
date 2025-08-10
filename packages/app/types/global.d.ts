import { App } from "@padloc/core/src/app";
import { Router } from "../src/lib/route";
import { getPlatform } from "@padloc/core/src/platform";

declare global {
  interface Window {
    app: App;
    router: Router;
    getPlatform: typeof getPlatform;
  }

  interface Navigator {
    Backbutton?: {
      exitApp(): void;
      goBack(): void;
    };
  }
}

// Asset module declarations - generic patterns
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

// Specific asset file declarations
declare module "assets/logo-light.svg" {
  const content: string;
  export default content;
}

declare module "assets/logo-dark.svg" {
  const content: string;
  export default content;
}

declare module "assets/support.md" {
  const content: string;
  export default content;
}

export {};

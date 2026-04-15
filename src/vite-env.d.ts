/// <reference types="vite/client" />

// Vue files
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// CSS modules
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

// Plain CSS
declare module '*.css' {
  const content: string;
  export default content;
}

// declare module "*.module.css";
// declare module "*.module.scss";


declare module '*.module.css' {
  const content: string;
  export default content;
}

declare module "*.module.js" {
  const content: string;
  export default content;
}

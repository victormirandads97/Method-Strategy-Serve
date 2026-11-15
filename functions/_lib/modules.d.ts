// Wrangler bundles .bin imports as binary data.
declare module "*.bin" {
  const data: ArrayBuffer;
  export default data;
}

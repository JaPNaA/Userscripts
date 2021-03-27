declare module Terser {
    function minify(code: string, options: any): Promise<{ code: string }>;
}

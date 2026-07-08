// Fontsource variable packages are CSS-only side-effect imports with no JS
// entry, so TS has no module declaration for them. Declare them as empty
// modules to satisfy `astro check`.
declare module '@fontsource-variable/noto-sans-jp';

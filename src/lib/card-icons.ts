// Build-time SVG paths for the project-card link buttons. Simple Icons for
// the brands; a Material glyph for the generic external link. Paths are
// 24×24 and inlined at build — simple-icons never ships to the client.
import { siGithub, siModrinth, siCurseforge } from 'simple-icons';

export const GITHUB = siGithub.path;
export const MODRINTH = siModrinth.path;
export const CURSEFORGE = siCurseforge.path;
export const EXTERNAL =
  'M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z';

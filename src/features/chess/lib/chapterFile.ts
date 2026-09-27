/**
 * Where a chapter's text lives: its story's folder and its own file, relative to
 * the feature's `stories/` directory. The loader turns this into the bundler's
 * module path, and the spec checks every chapter the index lists against the file
 * this names, so an index entry can never point at a story that is not there.
 */
export const chapterFile = (storyId: string, chapterId: string): string =>
  `${storyId}/${chapterId}.md`

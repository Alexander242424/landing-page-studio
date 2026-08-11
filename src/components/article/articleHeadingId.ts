/** Stable slug for in-article heading anchors / TOC links. */
export function articleHeadingId(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

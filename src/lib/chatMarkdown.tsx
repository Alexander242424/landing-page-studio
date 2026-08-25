import { Fragment, type ReactNode } from "react";

/** Hide an unclosed ** / * on the last line so streaming does not flash raw markers. */
function hideOpenMarkers(text: string) {
  return text
    .replace(/\*\*[^*\n]*$/, (chunk) => chunk.slice(2))
    .replace(/(^|[^*\n])\*[^*\n]*$/, (chunk) =>
      chunk.endsWith("*") ? chunk.slice(0, -1) : chunk,
    );
}

/**
 * Model often writes section titles as `**Title` on its own line and drops the closer.
 * Close those so they parse as bold instead of raw asterisks.
 */
function closeUnmatchedBoldLines(text: string) {
  return text
    .split("\n")
    .map((line) => {
      const indent = line.match(/^\s*/)?.[0] ?? "";
      const trimmed = line.trim();
      if (!trimmed.startsWith("**")) return line;
      if (trimmed.slice(2).includes("**")) return line;
      const inner = trimmed.slice(2).replace(/\*+$/, "").trimEnd();
      if (!inner) return line;
      return `${indent}**${inner}**`;
    })
    .join("\n");
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
  let last = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const key = `${keyPrefix}-${index++}`;
    if (match[1] != null) {
      nodes.push(<strong key={key}>{match[1]}</strong>);
    } else if (match[2] != null) {
      nodes.push(match[2]);
    } else if (match[3] != null) {
      nodes.push(<code key={key}>{match[3]}</code>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }

  return nodes;
}

function isHeadingLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("**") || trimmed.length < 4) return false;
  if (!trimmed.endsWith("**")) return false;
  const inner = trimmed.slice(2, -2);
  return inner.length > 0 && !inner.includes("**");
}

function isBullet(line: string) {
  return /^[-*•]\s+/.test(line);
}

function isOrdered(line: string) {
  return /^\d+[.)]\s+/.test(line);
}

function headingText(line: string) {
  return line.trim().replace(/^\*\*|\*\*$/g, "");
}

function bulletText(line: string) {
  return line.replace(/^[-*•]\s+/, "");
}

function orderedText(line: string) {
  return line.replace(/^\d+[.)]\s+/, "");
}

/**
 * Lightweight chat markdown: bold, lists, paragraph breaks.
 * Single-asterisk markers are stripped (copy stays roman).
 * No HTML passthrough — safe for model output.
 */
export function ChatMarkdown({
  text,
  streaming = false,
}: {
  text: string;
  streaming?: boolean;
}) {
  const source = closeUnmatchedBoldLines(
    streaming ? hideOpenMarkers(text) : text,
  );
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let block = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (isHeadingLine(line)) {
      blocks.push(
        <p key={`h-${block++}`} className="rj-ask__md-heading">
          <strong>{headingText(line)}</strong>
        </p>,
      );
      i += 1;
      continue;
    }

    if (isBullet(line)) {
      const items: string[] = [];
      while (i < lines.length && isBullet(lines[i] ?? "")) {
        items.push(bulletText(lines[i] ?? ""));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${block++}`} className="rj-ask__md-list">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `ul-${block}-${itemIndex}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (isOrdered(line)) {
      const items: string[] = [];
      while (i < lines.length && isOrdered(lines[i] ?? "")) {
        items.push(orderedText(lines[i] ?? ""));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${block++}`} className="rj-ask__md-list">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `ol-${block}-${itemIndex}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !isHeadingLine(lines[i] ?? "") &&
      !isBullet(lines[i] ?? "") &&
      !isOrdered(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }

    blocks.push(
      <p key={`p-${block++}`} className="rj-ask__md-p">
        {para.map((row, rowIndex) => (
          <Fragment key={rowIndex}>
            {rowIndex > 0 ? <br /> : null}
            {renderInline(row, `p-${block}-${rowIndex}`)}
          </Fragment>
        ))}
      </p>,
    );
  }

  if (blocks.length === 0) {
    return text;
  }

  return <div className="rj-ask__md">{blocks}</div>;
}

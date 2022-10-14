export default function (text, columnLength) {
  const lines = text.split("\n");
  const unwrapped = unwrapNonStandaloneLines(lines);
  const rewrapped = wrapLines(unwrapped, columnLength);
  return rewrapped.join("\n");
}

function unwrapNonStandaloneLines(lines) {
  const unwrappedLines = [];

  let lastLineIsSmushable = false;
  for (const line of lines) {
    if (shouldStandalone(line)) {
      unwrappedLines.push(line);
      lastLineIsSmushable = false;
    } else {
      if (lastLineIsSmushable) {
        unwrappedLines[unwrappedLines.length - 1] += " " + line.trim();
      } else {
        unwrappedLines.push(line.trimRight());
      }
      lastLineIsSmushable = true;
    }
  }

  return unwrappedLines;
}

function wrapLines(lines, columnLength) {
  const linesRewrapped = [];
  for (const line of lines) {
    if (line.length <= columnLength || !shouldRewrap(line)) {
      linesRewrapped.push(line);
    } else {
      linesRewrapped.push(...wrapLine(line, columnLength));
    }
  }

  return linesRewrapped;
}

function wrapLine(line, columnLength) {
  const leadingIndent = getLeadingIndent(line, columnLength);

  const brokenLines = [];
  let currentLine = "";
  let spaceBefore = "";
  for (const word of line.split(" ")) {
    if (currentLine.length + spaceBefore.length + word.length < columnLength) {
      currentLine += spaceBefore + word;
    } else {
      brokenLines.push(currentLine);
      currentLine = leadingIndent + word;
    }
    spaceBefore = " ";
  }
  brokenLines.push(currentLine);

  return brokenLines;
}

function shouldStandalone(line) {
  const trimmed = line.trim();

  return trimmed.length === 0 ||
         /^<\/?[a-z- "=]+>$/i.test(trimmed) ||
         /^<!--.*?-->$/i.test(trimmed) ||
         !shouldRewrap(line);
}

function shouldRewrap(line) {
  const trimmed = line.trim();

  return !/^<dt(?:[a-z- "=]+)?>.*<\/dt>/.test(trimmed);
}

function getLeadingIndent(line) {
  return /^(\s*)/.exec(line)[1];
}

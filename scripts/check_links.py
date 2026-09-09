"""Check local inline Markdown link destinations without fetching or executing them."""

import argparse
import os
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

DEFAULT_EXCLUDES = (".git", "artifact", "node_modules", "__pycache__")
LINK = re.compile(r"\[[^\]\n]*\]\(([^\s)]+)\)")
INLINE_CODE = re.compile(r"(`+).*?\1")
FENCE = re.compile(r"^\s{0,3}(`{3,}|~{3,})")
MARKDOWN_SUFFIX = ".md"
ENCODING = "utf-8"
ERROR = 1
SUCCESS = 0


def destinations(text):
    fence = None
    for number, line in enumerate(text.splitlines(), start=1):
        marker = FENCE.match(line)
        if marker:
            token = marker.group(1)
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence) and not line[marker.end():].strip():
                fence = None
            continue
        if fence is None:
            yield from ((number, match.group(1)) for match in LINK.finditer(INLINE_CODE.sub("", line)))


def check(root, excludes):
    failures = []
    for directory, folders, files in os.walk(root, followlinks=False):
        folders[:] = sorted(name for name in folders if name not in excludes)
        for name in sorted(files):
            source = Path(directory) / name
            if source.suffix != MARKDOWN_SUFFIX or source.is_symlink():
                continue
            for line, href in destinations(source.read_text(encoding=ENCODING)):
                location = f"{source.relative_to(root)}:{line}"
                try:
                    url = urlsplit(href)
                    if url.scheme or url.netloc or not url.path:
                        continue
                    target = (source.parent / unquote(url.path)).resolve()
                    if not target.is_relative_to(root):
                        failures.append(f"{location}: outside root: {href}")
                    elif not target.exists():
                        failures.append(f"{location}: missing: {href}")
                except (ValueError, OSError) as error:
                    failures.append(f"{location}: invalid link: {href} ({type(error).__name__})")
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", type=Path)
    parser.add_argument("--exclude-dir", action="append", default=list(DEFAULT_EXCLUDES))
    args = parser.parse_args()
    root = args.root.resolve()
    if not root.is_dir():
        parser.error("root must be an existing directory")
    failures = check(root, set(args.exclude_dir))
    if failures:
        print("\n".join(failures))
        return ERROR
    print("Local inline link destinations verified; external URLs and anchors not checked.")
    return SUCCESS


if __name__ == "__main__":
    raise SystemExit(main())

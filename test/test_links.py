import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

CHECKER = Path(__file__).resolve().parents[1] / "scripts" / "check_links.py"
COMMAND = (sys.executable, str(CHECKER))
README = "README.md"
DESTINATION = "child page.md"
VALID_LINKS = "[child](child%20page.md#heading)\n[web](https://example.invalid/)\n[anchor](#local)\n"
MISSING_LINK = "[missing](missing.md)\n"
CODE_LINKS = "```md\n[example](absent.md)\n```\n`[example](absent.md)`\n~~~\n[example](absent.md)\n~~~\n"
TIMEOUT = 10


class LinkCheckTests(unittest.TestCase):
    def run_check(self, root):
        return subprocess.run((*COMMAND, str(root)), capture_output=True, text=True, timeout=TIMEOUT)

    def test_valid_local_links_and_non_file_references(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / README).write_text(VALID_LINKS)
            (root / DESTINATION).write_text("# Heading\n")
            result = self.run_check(root)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_missing_destination_names_source_and_line(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / README).write_text(MISSING_LINK)
            result = self.run_check(root)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn("README.md:1", result.stdout)
            self.assertIn("missing.md", result.stdout)

    def test_code_examples_are_not_destinations(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / README).write_text(CODE_LINKS)
            self.assertEqual(self.run_check(root).returncode, 0)

    def test_external_file_and_symlink_boundaries(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "root"
            root.mkdir()
            outside = Path(directory) / "outside.md"
            outside.write_text("private")
            (root / "linked.md").symlink_to(outside)
            (root / README).write_text("[outside](../outside.md)\n[symlink](linked.md)\n")
            result = self.run_check(root)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn("outside root", result.stdout)

    def test_ignored_artifacts_and_missing_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "artifact").mkdir()
            (root / "artifact" / README).write_text(MISSING_LINK)
            self.assertEqual(self.run_check(root).returncode, 0)
            self.assertNotEqual(self.run_check(root / "absent").returncode, 0)

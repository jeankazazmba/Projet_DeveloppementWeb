"""Tests des garde-fous des scripts de sauvegarde sans Docker ni MySQL."""

import json
import tempfile
import tarfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from deploy.scripts import db_ops


class DatabaseOperationsTest(unittest.TestCase):
    def test_backup_creates_manifest_and_refuses_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'backup.sql'
            args = SimpleNamespace(file=target)

            def fake_compose(_args, command, **kwargs):
                if 'printenv' in command:
                    return SimpleNamespace(stdout='mon_miam_miam\n')
                kwargs['stdout'].write(b'CREATE TABLE recette (id INT);\n')

            with patch.object(db_ops, 'compose', side_effect=fake_compose):
                db_ops.backup(args)
                with self.assertRaises(FileExistsError):
                    db_ops.backup(args)
            manifest = json.loads(target.with_suffix('.sql.json').read_text(encoding='utf-8'))
            self.assertEqual(manifest['database'], 'mon_miam_miam')
            self.assertEqual(manifest['sha256'], db_ops.digest(target))

    def test_restore_refuses_wrong_database_and_modified_archive(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'backup.sql'
            args = SimpleNamespace(file=target, confirm_database='wrong')
            target.write_bytes(b'SELECT 1;\n')
            target.with_suffix('.sql.json').write_text(json.dumps({
                'kind': 'mysql', 'database': 'mon_miam_miam', 'sha256': db_ops.digest(target), 'bytes': target.stat().st_size,
            }), encoding='utf-8')
            with patch.object(db_ops, 'compose', return_value=SimpleNamespace(stdout='mon_miam_miam\n')) as docker:
                with self.assertRaises(ValueError):
                    db_ops.restore(args)
                args.confirm_database = 'mon_miam_miam'
                target.write_bytes(b'SELECT 2;\n')
                with self.assertRaises(ValueError):
                    db_ops.restore(args)
                self.assertEqual(docker.call_count, 2)  # uniquement la lecture du nom de base

    def test_storage_restore_rejects_symlink_even_with_matching_manifest(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'storage.tar.gz'
            with tarfile.open(target, 'w:gz') as archive:
                entry = tarfile.TarInfo('storage/private-link')
                entry.type = tarfile.SYMTYPE
                entry.linkname = '/etc/passwd'
                archive.addfile(entry)
            target.with_suffix('.gz.json').write_text(json.dumps({
                'kind': 'storage', 'sha256': db_ops.digest(target), 'bytes': target.stat().st_size,
            }), encoding='utf-8')
            args = SimpleNamespace(file=target, confirm_storage='RESTORE_STORAGE')
            with patch.object(db_ops, 'compose') as docker:
                with self.assertRaises(ValueError):
                    db_ops.restore_storage(args)
                docker.assert_not_called()


if __name__ == '__main__':
    unittest.main()

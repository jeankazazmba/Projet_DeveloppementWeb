"""Opérations MySQL explicites via Docker Compose, sans exposer les mots de passe."""

import argparse
import hashlib
import json
import subprocess
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def compose(args, command, **kwargs):
    base = ['docker', 'compose', '--env-file', str(args.env_file), '-f', str(args.compose_file)]
    return subprocess.run(base + command, cwd=ROOT, check=True, **kwargs)


def database_name(args):
    result = compose(args, ['exec', '-T', 'db', 'printenv', 'MYSQL_DATABASE'], capture_output=True, text=True)
    name = result.stdout.strip()
    if not name or not name.replace('_', '').isalnum():
        raise ValueError('Nom de base de données invalide ou absent.')
    return name


def digest(path):
    sha = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            sha.update(chunk)
    return sha.hexdigest()


def backup(args):
    name = database_name(args)
    target = args.file.resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    manifest = target.with_suffix(target.suffix + '.json')
    if target.exists() or manifest.exists():
        raise FileExistsError('La sauvegarde ou son manifeste existe déjà : aucun écrasement.')
    command = ['exec', '-T', 'db', 'sh', '-c',
               'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --default-character-set=utf8mb4 '
               '--single-transaction --routines --triggers --events --hex-blob "$MYSQL_DATABASE"']
    try:
        with target.open('xb') as output:
            compose(args, command, stdout=output)
        if target.stat().st_size == 0:
            raise RuntimeError('Sauvegarde vide : refusée.')
        manifest.write_text(json.dumps({'kind': 'mysql', 'database': name, 'sha256': digest(target), 'bytes': target.stat().st_size}, indent=2), encoding='utf-8')
    except Exception:
        target.unlink(missing_ok=True)
        manifest.unlink(missing_ok=True)
        raise
    print(f'Sauvegarde créée : {target} ({target.stat().st_size} octets).')


def restore(args):
    name = database_name(args)
    if args.confirm_database != name:
        raise ValueError(f'Confirmation requise : --confirm-database {name}')
    source = args.file.resolve()
    manifest = source.with_suffix(source.suffix + '.json')
    if not source.is_file() or not manifest.is_file():
        raise FileNotFoundError('Fichier SQL et manifeste JSON requis.')
    expected = json.loads(manifest.read_text(encoding='utf-8'))
    if expected.get('kind') != 'mysql' or expected.get('database') != name or expected.get('sha256') != digest(source) or expected.get('bytes') != source.stat().st_size:
        raise ValueError('Base cible ou empreinte SHA-256 du fichier non conforme.')
    command = ['exec', '-T', 'db', 'sh', '-c',
               'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot --default-character-set=utf8mb4 "$MYSQL_DATABASE"']
    with source.open('rb') as sql:
        compose(args, command, stdin=sql)
    print(f'Restauration terminée pour {name}. Vérifier /api/ready et les tests de recette.')


def backup_storage(args):
    target = args.file.resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    manifest = target.with_suffix(target.suffix + '.json')
    if target.exists() or manifest.exists():
        raise FileExistsError('Archive ou manifeste existant : aucun écrasement.')
    try:
        with target.open('xb') as output:
            compose(args, ['exec', '-T', 'backend', 'tar', '-C', '/var/www/html', '-czf', '-', 'storage'], stdout=output)
        if target.stat().st_size == 0:
            raise RuntimeError('Archive vide : refusée.')
        manifest.write_text(json.dumps({'kind': 'storage', 'sha256': digest(target), 'bytes': target.stat().st_size}, indent=2), encoding='utf-8')
    except Exception:
        target.unlink(missing_ok=True)
        manifest.unlink(missing_ok=True)
        raise
    print(f'Archive du stockage créée : {target}.')


def restore_storage(args):
    if args.confirm_storage != 'RESTORE_STORAGE':
        raise ValueError('Confirmation requise : --confirm-storage RESTORE_STORAGE')
    source = args.file.resolve()
    manifest = source.with_suffix(source.suffix + '.json')
    if not source.is_file() or not manifest.is_file():
        raise FileNotFoundError('Archive et manifeste JSON requis.')
    expected = json.loads(manifest.read_text(encoding='utf-8'))
    if expected.get('kind') != 'storage' or expected.get('sha256') != digest(source) or expected.get('bytes') != source.stat().st_size:
        raise ValueError('Empreinte SHA-256 de l’archive non conforme.')
    with tarfile.open(source, 'r:gz') as archive:
        for member in archive:
            parts = Path(member.name).parts
            if not parts or parts[0] != 'storage' or '..' in parts or member.issym() or member.islnk():
                raise ValueError('Archive de stockage contenant un chemin ou un lien interdit.')
    with source.open('rb') as archive:
        compose(args, ['exec', '-T', 'backend', 'tar', '--no-same-owner', '-C', '/var/www/html', '-xzf', '-'], stdin=archive)
    print('Stockage restauré. Vérifier les pièces jointes privées et les exports.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--compose-file', type=Path, default=ROOT / 'compose.production.yaml')
    parser.add_argument('--env-file', type=Path, default=ROOT / '.env.production')
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('migrate')
    backup_parser = sub.add_parser('backup')
    backup_parser.add_argument('file', type=Path)
    restore_parser = sub.add_parser('restore')
    restore_parser.add_argument('file', type=Path)
    restore_parser.add_argument('--confirm-database', required=True)
    storage_backup_parser = sub.add_parser('backup-storage')
    storage_backup_parser.add_argument('file', type=Path)
    storage_restore_parser = sub.add_parser('restore-storage')
    storage_restore_parser.add_argument('file', type=Path)
    storage_restore_parser.add_argument('--confirm-storage', required=True)
    args = parser.parse_args()
    if not args.compose_file.is_file() or not args.env_file.is_file():
        parser.error('Fichier Compose ou environnement introuvable.')
    try:
        if args.action == 'migrate':
            compose(args, ['exec', '-T', 'backend', 'php', 'artisan', 'migrate', '--force'])
        elif args.action == 'backup':
            backup(args)
        elif args.action == 'restore':
            restore(args)
        elif args.action == 'backup-storage':
            backup_storage(args)
        else:
            restore_storage(args)
    except (subprocess.CalledProcessError, OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f'Échec : {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

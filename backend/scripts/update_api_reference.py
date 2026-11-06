"""Synchronise la liste des routes API dans la référence de recette."""

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ROUTES = ROOT / 'backend/routes/api.php'
DOC = ROOT / 'docs/sprint-3/09-integration-recette/REFERENCE_API.md'
START = '<!-- ROUTES:START -->'
END = '<!-- ROUTES:END -->'
ROUTE = re.compile(r"Route::(get|post|put|patch|delete)\('([^']+)'\s*,\s*\[([A-Za-z]+)::class,\s*'([^']+)'\]", re.I)


def access(path, scope):
    if scope == 'public':
        return 'Signature HMAC locale' if path.startswith('/webhooks/') else 'Public'
    if scope == 'token':
        return 'Jeton Sanctum'
    if path.startswith('/platform/'):
        return 'Admin plateforme'
    if path.startswith('/staff/'):
        return 'Personnel du restaurant, selon rôle'
    if path.startswith('/me/statistics/'):
        return 'Gérant ou admin restaurant'
    if path.startswith('/me/notifications') or path in ('/me', '/auth/email/verification/request', '/auth/email/verify'):
        return 'Compte actif'
    if path.startswith('/complaints/') or path.startswith('/complaint-attachments/'):
        return 'Étudiant ou personnel autorisé'
    return 'Étudiant'


def inventory():
    source = ROUTES.read_text(encoding='utf-8')
    token_start = source.index("Route::middleware('auth:sanctum')")
    protected_start = source.index("Route::middleware(['auth:sanctum', EnsureActiveAccount::class])")
    rows = ['| Méthode | Route `/api` | Accès | Contrôleur |', '| --- | --- | --- | --- |']
    matches = list(ROUTE.finditer(source))
    for match in matches:
        method, path, controller, action = match.groups()
        scope = 'public' if match.start() < token_start else 'token' if match.start() < protected_start else 'protected'
        rows.append(f'| {method.upper()} | `{path}` | {access(path, scope)} | `{controller}@{action}` |')
    if len(matches) < 120:
        raise ValueError(f'Inventaire anormalement court : {len(matches)} routes.')
    return '\n'.join(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Échouer si la documentation est obsolète')
    args = parser.parse_args()
    existing = DOC.read_text(encoding='utf-8')
    before, remainder = existing.split(START, 1)
    _, after = remainder.split(END, 1)
    updated = before + START + '\n' + inventory() + '\n' + END + after
    if args.check:
        if updated != existing:
            raise SystemExit('Référence API obsolète : exécuter update_api_reference.py.')
        print('Inventaire API à jour.')
    else:
        DOC.write_text(updated, encoding='utf-8')
        print('Référence API mise à jour.')


if __name__ == '__main__':
    main()

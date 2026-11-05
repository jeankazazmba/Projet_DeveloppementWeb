<?php
declare(strict_types=1);

require_once __DIR__.'/../src/Api.php';
require_once __DIR__.'/../src/Database.php';
require_once __DIR__.'/../src/Auth.php';
require_once __DIR__.'/../src/LoyaltyService.php';
require_once __DIR__.'/../src/ReferralService.php';

try {
    $db = Database::connection();
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = preg_replace('#^/api/v1#', '', $path);
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

    if ($method === 'GET' && preg_match('#^/utilisateurs/(\d+)/points$#', $path, $m)) {
        $u=Auth::user($db); $id=(int)$m[1];
        if ($u['role'] === 'etudiant' && (int)$u['id'] !== $id) Api::fail(403,'forbidden','Vous ne pouvez consulter que votre solde.');
        Api::ok(['utilisateur_id'=>$id,'solde'=>LoyaltyService::balance($db,$id)], 'Solde de points');
    }
    if ($method === 'GET' && preg_match('#^/utilisateurs/(\d+)/points/historique$#', $path, $m)) {
        $u=Auth::user($db); $id=(int)$m[1];
        if ($u['role'] === 'etudiant' && (int)$u['id'] !== $id) Api::fail(403,'forbidden','Accès refusé.');
        $page=max(1,(int)($_GET['page']??1)); $limit=min(100,max(1,(int)($_GET['limit']??20)));
        $q=$db->prepare('SELECT id,type,points,reason,order_id,created_at FROM loyalty_transactions WHERE user_id=? ORDER BY id DESC LIMIT ? OFFSET ?');
        $q->bindValue(1,$id,PDO::PARAM_INT); $q->bindValue(2,$limit,PDO::PARAM_INT); $q->bindValue(3,($page-1)*$limit,PDO::PARAM_INT); $q->execute();
        Api::ok(['items'=>$q->fetchAll(),'page'=>$page,'limit'=>$limit]);
    }
    if ($method === 'POST' && preg_match('#^/commandes/(\d+)/points$#', $path, $m)) {
        $u=Auth::user($db); Auth::requireRole($u,['etudiant']); $b=Api::body();
        $points=$b['points_utilises']??null; $key=trim($_SERVER['HTTP_IDEMPOTENCY_KEY']??'');
        if (!is_int($points) || $points<1) Api::fail(422,'validation_error','points_utilises doit être un entier positif.');
        if ($key==='' || strlen($key)>128) Api::fail(422,'idempotency_key_required','Un en-tête Idempotency-Key valide est requis.');
        $keyHash='redeem:'.hash('sha256',$key);
        $db->beginTransaction();
        $q=$db->prepare('SELECT id,user_id,total_amount,status,discount_amount,loyalty_points_used FROM orders WHERE id=? FOR UPDATE'); $q->execute([(int)$m[1]]); $order=$q->fetch();
        if (!$order) { $db->rollBack(); Api::fail(404,'order_not_found','Commande introuvable.'); }
        if ((int)$order['user_id']!==(int)$u['id']) { $db->rollBack(); Api::fail(403,'forbidden','Cette commande ne vous appartient pas.'); }
        $q=$db->prepare("SELECT user_id,order_id,points FROM loyalty_transactions WHERE type='debit' AND idempotency_key=?");
        $q->execute([$keyHash]); $prior=$q->fetch();
        if ($prior) {
            if ((int)$prior['user_id']!==(int)$u['id'] || (int)$prior['order_id']!==(int)$order['id'] || (int)$prior['points']!==$points) { $db->rollBack(); Api::fail(409,'idempotency_key_reused','Cette clé a déjà servi pour une autre opération.'); }
            $db->commit(); Api::ok(['commande_id'=>(int)$order['id'],'points_utilises'=>(int)$order['loyalty_points_used'],'reduction'=>(int)$order['discount_amount'],'montant_a_payer'=>max(0,(int)$order['total_amount']-(int)$order['discount_amount'])]);
        }
        if ((int)$order['loyalty_points_used']>0) { $db->rollBack(); Api::fail(409,'points_already_applied','Des points sont déjà appliqués à cette commande.'); }
        if (!in_array($order['status'],['en_attente','acceptee'],true)) { $db->rollBack(); Api::fail(409,'order_not_editable','Les points doivent être appliqués avant le traitement de la commande.'); }
        $rules=$db->query('SELECT points_per_reward,reward_amount FROM loyalty_rules WHERE id=1')->fetch();
        if (!$rules || (int)$rules['points_per_reward']<1 || (int)$rules['reward_amount']<1) { $db->rollBack(); Api::fail(409,'loyalty_not_configured','Les règles de fidélité ne sont pas encore configurées.'); }
        $maxPoints=intdiv((int)$order['total_amount'],(int)$rules['reward_amount'])*(int)$rules['points_per_reward'];
        if ($points>$maxPoints) { $db->rollBack(); Api::fail(422,'discount_exceeds_order','La réduction demandée dépasse le montant de la commande.'); }
        $discount=LoyaltyService::redeem($db,(int)$u['id'],(int)$order['id'],$points,$keyHash);
        $q=$db->prepare('UPDATE orders SET discount_amount=?,loyalty_points_used=? WHERE id=?'); $q->execute([$discount,$points,(int)$order['id']]);
        $db->commit(); Api::ok(['commande_id'=>(int)$order['id'],'points_utilises'=>$points,'reduction'=>$discount,'montant_a_payer'=>max(0,(int)$order['total_amount']-$discount)]);
    }
    if ($method === 'PUT' && $path === '/fidelite/regles') {
        $u=Auth::user($db); Auth::requireRole($u,['administrateur']); $b=Api::body();
        foreach (['currency_per_point','points_per_reward','reward_amount','referral_reward_points'] as $field) {
            if (!isset($b[$field]) || filter_var($b[$field],FILTER_VALIDATE_INT)===false || (int)$b[$field]<0) Api::fail(422,'validation_error',"Paramètre invalide: $field");
        }
        $q=$db->prepare('UPDATE loyalty_rules SET currency_per_point=?,points_per_reward=?,reward_amount=?,referral_reward_points=? WHERE id=1');
        $q->execute([(int)$b['currency_per_point'],(int)$b['points_per_reward'],(int)$b['reward_amount'],(int)$b['referral_reward_points']]);
        Api::ok(['regles'=>'mises à jour'],'Règles de fidélité actualisées');
    }
    if ($method === 'PUT' && $path === '/classement/consentement') {
        $u=Auth::user($db); Auth::requireRole($u,['etudiant']); $b=Api::body();
        if (!array_key_exists('autorise',$b) || !is_bool($b['autorise'])) Api::fail(422,'validation_error','autorise doit être un booléen.');
        $alias=$b['autorise'] ? 'Client-'.strtoupper(bin2hex(random_bytes(6))) : null;
        $q=$db->prepare('UPDATE users SET leaderboard_opt_in=?,leaderboard_alias=? WHERE id=?');
        $q->execute([$b['autorise']?1:0,$alias,(int)$u['id']]);
        Api::ok(['autorise'=>$b['autorise']],'Consentement au classement actualisé');
    }
    if ($method === 'POST' && $path === '/parrainage/generer') {
        $u=Auth::user($db); Auth::requireRole($u,['etudiant']);
        $code=strtoupper(bin2hex(random_bytes(5)));
        $q=$db->prepare('UPDATE users SET referral_code=COALESCE(referral_code,?) WHERE id=?'); $q->execute([$code,(int)$u['id']]);
        $q=$db->prepare('SELECT referral_code FROM users WHERE id=?'); $q->execute([(int)$u['id']]);
        Api::ok(['code'=>$q->fetchColumn()], 'Code de parrainage disponible', 201);
    }
    if ($method === 'POST' && $path === '/parrainage/utiliser') {
        $u=Auth::user($db); Auth::requireRole($u,['etudiant']); $body=Api::body(); $code=strtoupper(trim((string)($body['code']??'')));
        if (!preg_match('/^[A-Z0-9]{4,32}$/',$code)) Api::fail(422,'validation_error','Code invalide.');
        $db->beginTransaction();
        $q=$db->prepare('SELECT id FROM users WHERE referral_code=? FOR UPDATE'); $q->execute([$code]); $referrer=(int)$q->fetchColumn();
        if (!$referrer) { $db->rollBack(); Api::fail(404,'referral_not_found','Code de parrainage introuvable.'); }
        if ($referrer===(int)$u['id']) { $db->rollBack(); Api::fail(409,'self_referral','Le parrainage de son propre compte est interdit.'); }
        try { $q=$db->prepare("INSERT INTO referrals(referrer_id,referred_id,code) VALUES(?,?,?)"); $q->execute([$referrer,(int)$u['id'],$code]); }
        catch (PDOException $e) { $db->rollBack(); if ($e->getCode()==='23000') Api::fail(409,'referral_already_used','Un code a déjà été associé à ce compte.'); throw $e; }
        $db->commit(); Api::ok(['statut'=>'pending'],'Code associé; récompense après première commande réussie.',201);
    }
    if ($method === 'GET' && $path === '/parrainage') {
        $u=Auth::user($db); Auth::requireRole($u,['etudiant']);
        $q=$db->prepare("SELECT r.id,r.code,r.status,r.created_at,r.rewarded_at,CASE WHEN r.referrer_id=? THEN 'parrain' ELSE 'filleul' END AS role FROM referrals r WHERE r.referrer_id=? OR r.referred_id=? ORDER BY r.id DESC");
        $q->execute([(int)$u['id'],(int)$u['id'],(int)$u['id']]); Api::ok($q->fetchAll());
    }
    if ($method === 'GET' && in_array($path,['/promotions','/evenements'],true)) {
        $table=$path==='/promotions'?'promotions':'events';
        $q=$db->query("SELECT * FROM $table WHERE active=1 AND date_fin>=UTC_TIMESTAMP() ORDER BY date_debut");
        Api::ok($q->fetchAll());
    }
    if ($method === 'POST' && in_array($path,['/promotions','/evenements'],true)) {
        $u=Auth::user($db); Auth::requireRole($u,['administrateur']); $b=Api::body();
        $title=trim((string)($b['titre']??'')); $start=(string)($b['date_debut']??''); $end=(string)($b['date_fin']??'');
        if ($title==='' || mb_strlen($title)>160 || !$start || !$end || strtotime($end)<=strtotime($start)) Api::fail(422,'validation_error','Titre et dates valides requis.');
        if ($path==='/promotions') {
            $q=$db->prepare('INSERT INTO promotions(titre,description,date_debut,date_fin,active,created_by) VALUES(?,?,?,?,?,?)');
            $q->execute([$title,$b['description']??null,$start,$end,(bool)($b['active']??true),(int)$u['id']]);
        } else {
            $q=$db->prepare('INSERT INTO events(titre,description,lieu,date_debut,date_fin,affiche_url,active,created_by) VALUES(?,?,?,?,?,?,?,?)');
            $q->execute([$title,$b['description']??null,$b['lieu']??null,$start,$end,$b['affiche_url']??null,(bool)($b['active']??true),(int)$u['id']]);
        }
        Api::ok(['id'=>(int)$db->lastInsertId(),'titre'=>$title],'Publication créée',201);
    }
    if ($method === 'GET' && $path === '/classement') {
        $period=$_GET['periode']??'semaine';
        $now=new DateTimeImmutable('now',new DateTimeZone('UTC'));
        $start=match($period){'jour'=>$now->setTime(0,0),'semaine'=>$now->modify('monday this week')->setTime(0,0),'mois'=>$now->modify('first day of this month')->setTime(0,0),default=>null};
        if (!$start) Api::fail(422,'validation_error','Période invalide.');
        $q=$db->prepare("SELECT u.leaderboard_alias AS pseudonyme,COUNT(o.id) AS commandes,SUM(o.total_amount) AS montant_total FROM users u JOIN orders o ON o.user_id=u.id WHERE u.role='etudiant' AND u.leaderboard_opt_in=1 AND u.leaderboard_alias IS NOT NULL AND o.status IN ('servie','livree') AND o.completed_at>=? GROUP BY u.id,u.leaderboard_alias ORDER BY montant_total DESC,commandes DESC LIMIT 10");
        $q->execute([$start->format('Y-m-d H:i:s')]);
        Api::ok(['periode'=>$period,'classement'=>$q->fetchAll()]);
    }

    Api::fail(404,'not_found','Route introuvable.');
} catch (Throwable $e) {
    error_log((string)$e);
    Api::fail(500,'internal_error','Une erreur interne est survenue.');
}

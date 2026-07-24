<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM announcements ORDER BY createdAt DESC");
    $items = $stmt->fetchAll();
    foreach ($items as &$i) {
        $i['important'] = (bool)$i['important'];
    }
    sendResponse(['data' => $items]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('anc-' . time());
        $title = $data['title'] ?? '';
        $content = $data['content'] ?? '';
        $date = $data['date'] ?? date('d.m.Y');
        $important = !empty($data['important']) ? 1 : 0;

        $stmt = $pdo->prepare("
            INSERT INTO announcements (id, title, content, date, important)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                content = VALUES(content),
                date = VALUES(date),
                important = VALUES(important)
        ");
        $stmt->execute([$id, $title, $content, $date, $important]);
        sendResponse(['success' => true]);
    }
}

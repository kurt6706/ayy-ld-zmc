<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM forum_posts ORDER BY timestamp DESC");
    sendResponse(['data' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM forum_posts WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('post-' . time());
        $userId = $data['userId'] ?? '';
        $authorName = $data['authorName'] ?? '';
        $text = $data['text'] ?? '';
        $timestamp = intval($data['timestamp'] ?? (time() * 1000));

        $stmt = $pdo->prepare("
            INSERT INTO forum_posts (id, userId, authorName, text, timestamp)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                authorName = VALUES(authorName),
                text = VALUES(text),
                timestamp = VALUES(timestamp)
        ");
        $stmt->execute([$id, $userId, $authorName, $text, $timestamp]);
        sendResponse(['success' => true]);
    }
}

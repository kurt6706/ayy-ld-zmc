<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM meetings ORDER BY createdAt DESC");
    sendResponse(['data' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM meetings WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('meeting-' . time());
        $title = $data['title'] ?? '';
        $reason = $data['reason'] ?? '';
        $timeStr = $data['time'] ?? '';
        $link = $data['link'] ?? '';
        $status = $data['status'] ?? 'active';
        $createdByName = $data['createdByName'] ?? '';
        $createdAt = intval($data['createdAt'] ?? (time() * 1000));

        $stmt = $pdo->prepare("
            INSERT INTO meetings (id, title, reason, time, link, status, createdByName, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                reason = VALUES(reason),
                time = VALUES(time),
                link = VALUES(link),
                status = VALUES(status),
                createdByName = VALUES(createdByName)
        ");
        $stmt->execute([$id, $title, $reason, $timeStr, $link, $status, $createdByName, $createdAt]);
        sendResponse(['success' => true]);
    }
}

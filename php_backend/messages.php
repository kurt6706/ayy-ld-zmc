<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM messages ORDER BY timestamp ASC");
    $items = $stmt->fetchAll();
    foreach ($items as &$i) {
        $i['read'] = (bool)$i['read'];
    }
    sendResponse(['data' => $items]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'send') {
        $id = $data['id'] ?? ('msg-' . time());
        $senderId = $data['senderId'] ?? '';
        $receiverId = $data['receiverId'] ?? '';
        $senderName = $data['senderName'] ?? '';
        $text = $data['text'] ?? '';
        $timestamp = intval($data['timestamp'] ?? (time() * 1000));
        $read = 0;

        $stmt = $pdo->prepare("
            INSERT INTO messages (id, senderId, receiverId, senderName, text, timestamp, `read`)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$id, $senderId, $receiverId, $senderName, $text, $timestamp, $read]);
        sendResponse(['success' => true]);
    }
}

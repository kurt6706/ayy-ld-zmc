<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM news ORDER BY createdAt DESC");
    $items = $stmt->fetchAll();
    foreach ($items as &$item) {
        $item['tags'] = json_decode($item['tags'] ?: '[]', true);
        $item['comments'] = json_decode($item['comments'] ?: '[]', true);
    }
    sendResponse(['data' => $items]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('news-' . time());
        $title = $data['title'] ?? '';
        $summary = $data['summary'] ?? '';
        $content = $data['content'] ?? '';
        $image = $data['image'] ?? '';
        $category = $data['category'] ?? 'Duyuru';
        $date = $data['date'] ?? date('d.m.Y');
        $author = $data['author'] ?? 'AYMK Töre Konseyi';
        $tags = json_encode($data['tags'] ?? []);
        $comments = json_encode($data['comments'] ?? []);
        $likes = intval($data['likes'] ?? 0);

        $stmt = $pdo->prepare("
            INSERT INTO news (id, title, summary, content, image, category, date, author, tags, comments, likes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                summary = VALUES(summary),
                content = VALUES(content),
                image = VALUES(image),
                category = VALUES(category),
                date = VALUES(date),
                author = VALUES(author),
                tags = VALUES(tags),
                comments = VALUES(comments),
                likes = VALUES(likes)
        ");
        $stmt->execute([$id, $title, $summary, $content, $image, $category, $date, $author, $tags, $comments, $likes]);
        sendResponse(['success' => true]);
    }
}

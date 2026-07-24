<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM gallery ORDER BY createdAt DESC");
    sendResponse(['data' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('gallery-' . time());
        $url = $data['url'] ?? '';
        $category = $data['category'] ?? 'Genel';
        $description = $data['description'] ?? '';
        $date = $data['date'] ?? date('d.m.Y');
        $type = $data['type'] ?? 'image';
        $uploadedBy = $data['uploadedBy'] ?? '';
        $uploaderUid = $data['uploaderUid'] ?? '';
        $fileName = $data['fileName'] ?? '';
        $storagePath = $data['storagePath'] ?? '';
        $mimeType = $data['mimeType'] ?? '';
        $size = intval($data['size'] ?? 0);

        $stmt = $pdo->prepare("
            INSERT INTO gallery (id, url, category, description, date, type, uploadedBy, uploaderUid, fileName, storagePath, mimeType, size)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                url = VALUES(url),
                category = VALUES(category),
                description = VALUES(description),
                date = VALUES(date),
                type = VALUES(type),
                uploadedBy = VALUES(uploadedBy),
                uploaderUid = VALUES(uploaderUid),
                fileName = VALUES(fileName),
                storagePath = VALUES(storagePath),
                mimeType = VALUES(mimeType),
                size = VALUES(size)
        ");
        $stmt->execute([$id, $url, $category, $description, $date, $type, $uploadedBy, $uploaderUid, $fileName, $storagePath, $mimeType, $size]);
        sendResponse(['success' => true]);
    }
}

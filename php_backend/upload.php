<?php
/**
 * File Upload Handler for Hostinger
 * Images -> /public_html/uploads/images
 * Videos -> /public_html/uploads/videos
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Geçersiz istek yöntemi'], 405);
}

if (!isset($_FILES['file'])) {
    sendResponse(['error' => 'Dosya bulunamadı'], 400);
}

$file = $_FILES['file'];
$type = isset($_POST['type']) && $_POST['type'] === 'video' ? 'video' : 'image';

if ($file['error'] !== UPLOAD_ERR_OK) {
    sendResponse(['error' => 'Dosya yükleme hatası koda göre: ' . $file['error']], 400);
}

$baseDir = dirname(__DIR__); // /public_html
$targetSubDir = $type === 'video' ? 'uploads/videos' : 'uploads/images';
$targetDir = $baseDir . '/' . $targetSubDir;

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
$allowedVideoExts = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'];

$allowedExts = $type === 'video' ? $allowedVideoExts : $allowedImageExts;

if (!in_array($fileExt, $allowedExts)) {
    sendResponse(['error' => 'Desteklenmeyen dosya uzantısı: ' . $fileExt], 400);
}

// Güvenli benzersiz dosya adı üretimi
$fileName = $type . '_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $fileExt;
$targetFilePath = $targetDir . '/' . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $publicUrl = $protocol . '://' . $host . '/' . $targetSubDir . '/' . $fileName;

    sendResponse([
        'success' => true,
        'url' => $publicUrl,
        'fileName' => $fileName,
        'filePath' => $targetSubDir . '/' . $fileName,
        'type' => $type
    ]);
} else {
    sendResponse(['error' => 'Dosya hedefe taşınamadı'], 500);
}

<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM events ORDER BY createdAt DESC");
    sendResponse(['data' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('event-' . time());
        $title = $data['title'] ?? '';
        $image = $data['image'] ?? '';
        $date = $data['date'] ?? '';
        $time = $data['time'] ?? '';
        $location = $data['location'] ?? '';
        $coordinates = $data['coordinates'] ?? '';
        $status = $data['status'] ?? 'upcoming';
        $attendeesCount = intval($data['attendeesCount'] ?? 0);
        $description = $data['description'] ?? '';
        $routeLink = $data['routeLink'] ?? '';
        $gmapsLink = $data['gmapsLink'] ?? '';

        $stmt = $pdo->prepare("
            INSERT INTO events (id, title, image, date, time, location, coordinates, status, attendeesCount, description, routeLink, gmapsLink)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                image = VALUES(image),
                date = VALUES(date),
                time = VALUES(time),
                location = VALUES(location),
                coordinates = VALUES(coordinates),
                status = VALUES(status),
                attendeesCount = VALUES(attendeesCount),
                description = VALUES(description),
                routeLink = VALUES(routeLink),
                gmapsLink = VALUES(gmapsLink)
        ");
        $stmt->execute([$id, $title, $image, $date, $time, $location, $coordinates, $status, $attendeesCount, $description, $routeLink, $gmapsLink]);
        sendResponse(['success' => true]);
    }
}

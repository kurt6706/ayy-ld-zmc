<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM routes ORDER BY createdAt DESC");
    $items = $stmt->fetchAll();
    foreach ($items as &$item) {
        $item['stops'] = json_decode($item['stops'] ?: '[]', true);
    }
    sendResponse(['data' => $items]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $stmt = $pdo->prepare("DELETE FROM routes WHERE id = ?");
        $stmt->execute([$data['id']]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('route-' . time());
        $name = $data['name'] ?? '';
        $startPoint = $data['startPoint'] ?? '';
        $endPoint = $data['endPoint'] ?? '';
        $distanceKm = intval($data['distanceKm'] ?? 0);
        $estimatedHours = floatval($data['estimatedHours'] ?? 0);
        $roadCondition = $data['roadCondition'] ?? 'Premium Asfalt';
        $fuelRate = floatval($data['fuelRate'] ?? 0);
        $stops = json_encode($data['stops'] ?? []);
        $gpsUrl = $data['gpsUrl'] ?? '';
        $difficulty = $data['difficulty'] ?? 'Orta';
        $elevation = $data['elevation'] ?? '';

        $stmt = $pdo->prepare("
            INSERT INTO routes (id, name, startPoint, endPoint, distanceKm, estimatedHours, roadCondition, fuelRate, stops, gpsUrl, difficulty, elevation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                startPoint = VALUES(startPoint),
                endPoint = VALUES(endPoint),
                distanceKm = VALUES(distanceKm),
                estimatedHours = VALUES(estimatedHours),
                roadCondition = VALUES(roadCondition),
                fuelRate = VALUES(fuelRate),
                stops = VALUES(stops),
                gpsUrl = VALUES(gpsUrl),
                difficulty = VALUES(difficulty),
                elevation = VALUES(elevation)
        ");
        $stmt->execute([$id, $name, $startPoint, $endPoint, $distanceKm, $estimatedHours, $roadCondition, $fuelRate, $stops, $gpsUrl, $difficulty, $elevation]);
        sendResponse(['success' => true]);
    }
}

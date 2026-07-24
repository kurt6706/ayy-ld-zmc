<?php
require_once 'config.php';

$pdo = getDbConnection();
$action = $_GET['action'] ?? 'list';

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $action === 'list') {
    $stmt = $pdo->query("SELECT * FROM users ORDER BY createdAt DESC");
    $users = $stmt->fetchAll();
    
    foreach ($users as &$u) {
        $u['profile'] = json_decode($u['profile'] ?: '{}', true);
        $u['privacy'] = json_decode($u['privacy'] ?: '{}', true);
    }
    
    sendResponse(['data' => $users]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    
    if ($action === 'delete') {
        $id = $data['id'] ?? '';
        if (!$id) sendResponse(['error' => 'Kullanıcı ID gerekli'], 400);
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(['success' => true]);
    }
    
    if ($action === 'save') {
        $id = $data['id'] ?? ('user-' . time());
        $name = $data['name'] ?? '';
        $surname = $data['surname'] ?? '';
        $username = $data['username'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? 'member';
        $status = $data['status'] ?? 'approved';
        $avatarUrl = $data['avatarUrl'] ?? '';
        $statusText = $data['statusText'] ?? '';
        $motorcycle = $data['motorcycle'] ?? '';
        $bloodType = $data['bloodType'] ?? '';
        $phone = $data['phone'] ?? '';
        $githubUsername = $data['githubUsername'] ?? '';
        $githubUrl = $data['githubUrl'] ?? '';
        $bio = $data['bio'] ?? '';
        $profile = json_encode($data['profile'] ?? []);
        $privacy = json_encode($data['privacy'] ?? []);

        $stmt = $pdo->prepare("
            INSERT INTO users (id, name, surname, username, email, password, role, status, avatarUrl, statusText, motorcycle, bloodType, phone, githubUsername, githubUrl, bio, profile, privacy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                surname = VALUES(surname),
                email = VALUES(email),
                password = IF(VALUES(password) != '', VALUES(password), password),
                role = VALUES(role),
                status = VALUES(status),
                avatarUrl = VALUES(avatarUrl),
                statusText = VALUES(statusText),
                motorcycle = VALUES(motorcycle),
                bloodType = VALUES(bloodType),
                phone = VALUES(phone),
                githubUsername = VALUES(githubUsername),
                githubUrl = VALUES(githubUrl),
                bio = VALUES(bio),
                profile = VALUES(profile),
                privacy = VALUES(privacy)
        ");
        
        $stmt->execute([
            $id, $name, $surname, $username, $email, $password, $role, $status,
            $avatarUrl, $statusText, $motorcycle, $bloodType, $phone, $githubUsername,
            $githubUrl, $bio, $profile, $privacy
        ]);

        sendResponse(['success' => true, 'data' => ['id' => $id]]);
    }
}

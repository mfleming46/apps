<?php
$logfile = __DIR__ . '/log.txt';  // Absolute path
$ip = $_SERVER['REMOTE_ADDR'];
$time = date('Y-m-d H:i:s');
$page = $_GET['page'] ?? 'unknown';

$line = "$time,$ip,$page\n";
file_put_contents($logfile, $line, FILE_APPEND | LOCK_EX);

http_response_code(200);
?>

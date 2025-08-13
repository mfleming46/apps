<?php
// archive-log.php — archive ../log.txt to ../log-YYYY-MM-DD[ -N].txt, then start a fresh log.txt
$src   = __DIR__ . '/../log.txt';
$dir   = dirname($src);
$stamp = date('Y-m-d');
$dst   = "$dir/log-$stamp.txt";

// If today's archive exists, add -2, -3, ...
for ($n = 2; file_exists($dst); $n++) {
  $dst = "$dir/log-$stamp-$n.txt";
}

if (!is_file($src)) { http_response_code(404); header('Content-Type: text/plain'); echo "No log.txt"; exit; }
if (!@rename($src, $dst)) { http_response_code(500); header('Content-Type: text/plain'); echo "Rename failed"; exit; }
@touch($src);  // create a fresh empty log.txt

header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['ok' => true, 'archived' => basename($dst)]);

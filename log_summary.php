<?php
$logfile = __DIR__ . '/log.txt';
if (file_exists($logfile)) {
    header('Content-Type: text/plain');
    readfile($logfile);
} else {
    http_response_code(404);
    echo "log.txt not found";
}
?>

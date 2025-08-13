<?php
$logfile = __DIR__ . '/log.txt';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    file_put_contents($logfile, "");  // Clear contents
    echo "Log cleared.";
} else {
    http_response_code(405); // Method Not Allowed
    echo "Use POST to clear the log.";
}
?>

<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

// File in same directory
$logfile = __DIR__ . '/log.txt';

// Message to log
$message = "Hello World Test: " . date('Y-m-d H:i:s') . "\n";

// Try writing
if (file_put_contents($logfile, $message, FILE_APPEND | LOCK_EX)) {
    echo "Hello, world! Log write successful.";
} else {
    echo "Hello, world! ❌ Failed to write to log.txt.";
}
?>

<?php
require __DIR__ . '/../vendor/autoload.php';
use App\MetaFritterVerso\FritterDynamic;

$enc = $argv[1] ?? '';
if (!$enc) {
    fwrite(STDERR, "Usage: php scripts/decrypt_us.php <encrypted_string>\n");
    exit(1);
}
$dec = FritterDynamic::opensslDesEncrypt(urldecode($enc));
if ($dec === false || $dec === null) {
    fwrite(STDERR, "Decryption failed\n");
    exit(2);
}
echo $dec, "\n";

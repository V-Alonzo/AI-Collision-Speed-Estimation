<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
  "ok" => true,
  "servicio" => "backend",
  "fecha" => date("Y-m-d H:i:s")
], JSON_UNESCAPED_UNICODE);

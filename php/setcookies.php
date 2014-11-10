<?php

define("URL_TO_GO", "http://landing.com");

header("Location: ".URL_TO_GO, true, 302);

$sid = isset($_GET['sid']) ? $_GET['sid'] : "null";
$sign = isset($_GET['sign']) ? $_GET['sign'] : "null";

if(!empty($sid)){
    setcookie("wannads-sid", $sid, strtotime( '+30 days' ));
    setcookie("wannads-sign", $sign, strtotime( '+30 days' ));
}

exit;

?>
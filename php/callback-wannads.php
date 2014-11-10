<?php

$sid = isset($_COOKIE['wannads-sid']) ? $_COOKIE['wannads-sid'] : "null";
$sign = isset($_COOKIE['wannads-sign']) ? $_COOKIE['wannads-sign'] : "null";

$ip = getIp();

if(!empty($sid) && !empty($sign)){

    $url = "http://callback.wannads.com/callbacks/wannads?sid=$sid&sign=$sign&ip=$ip";
    try{
        $res = @file_get_contents($url);
        if($res = "KO"){
            // respuesta conocida negativa, se ha producido un error al reportar la conversion
        }else{
            // respuesta desconocida
        }
    }catch (Exception $exception){
        // error de comunicacion al reportar la conversion
    }

    setcookie("wannads-sid", null, -1);
    setcookie("wannads-sign", null, -1);

}

function getIp(){
    if(getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown")){
        $ip = getenv("HTTP_CLIENT_IP");
    }elseif(getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown")){
        $ip = getenv("HTTP_X_FORWARDED_FOR");
    }elseif(getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown")){
        $ip = getenv("REMOTE_ADDR");
    }elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], "unknown")){
        $ip = $_SERVER['REMOTE_ADDR'];
    }else {
        $ip = "Unknown";
    }
    return $ip;
}

?>
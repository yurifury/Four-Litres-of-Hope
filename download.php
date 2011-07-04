<?php
ini_set('log_errors', true);

// Include the SDK
require_once 'vendor/aws-sdk/sdk.class.php';

mysql_connect("127.0.0.1", "root", "root") or die(mysql_error());

mysql_select_db("ALL_CAPS") or die(mysql_error());


$url = $_SERVER['REQUEST_URI'];
$url_parts = explode('/', $url);

$download_code = end($url_parts);

$download_code = mysql_real_escape_string($download_code);

//var_dump($download_code);

if (!preg_match('/^[A-Za-z0-9]{8}$/', $download_code)) {
	echo "not right";
	die;
}

$query = "SELECT * FROM sekrit_codes INNER JOIN files ON sekrit_codes.file_id=files.id WHERE sekrit_codes.code='" . $download_code . " ';";
//echo $query;
$sql = mysql_query($query);

if (!$sql) {
	error_log("Query $query failed: " . mysql_error());
}

$row = mysql_fetch_array($sql);

if ($row["downloads"] > 0) {
	$dec_query = "UPDATE sekrit_codes SET downloads = downloads - 1 WHERE code = '" . $row["code"] . "';"
	$dec_sql = mysql_query($dec_query);

	if (!$dec_sql) {
		error_log("Query $query failed: " . mysql_error());
	}
}


var_dump($row);

//mysql_real_escape_string
//decrement
//get file name
//get download url
//echo















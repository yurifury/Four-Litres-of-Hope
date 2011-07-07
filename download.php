<?php

// we use these
$downloads_left = 0;
$downloads_status = 'titseverywhere';

ini_set('log_errors', true);

// Include the SDK
require_once 'vendor/aws-sdk/sdk.class.php';

mysql_connect("127.0.0.1", "root", "root") or die(mysql_error());

mysql_select_db("fourlitresofhope") or die(mysql_error());


$url = $_SERVER['REQUEST_URI'];
$url_parts = explode('/', $url);

$download_code = end($url_parts);

$download_code = mysql_real_escape_string($download_code);



if (!preg_match('/^[A-Za-z0-9]{8}$/', $download_code)) {

	$downloads_status = 'error';

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
	$dec_query = "UPDATE sekrit_codes SET downloads = downloads - 1 WHERE code = '" . $row["code"] . "';";
	$dec_sql = mysql_query($dec_query);

	if (!$dec_sql) {
		error_log("Query $query failed: " . mysql_error());
	}
}
else {

	$downloads_left = 0;

	die;
}

$sql = mysql_query($query);
$row = mysql_fetch_array($sql);


//var_dump($row);

$s3 = new AmazonS3();

$url = $s3->get_object_url('allcaps', $row["filename"], '+30 seconds');

?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
"http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
<head>
 <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>FOUR LITRES OF HOPE BY BANKAI AND ABORTIFACIENT</title>
	<meta name="author" content="Squareweave">

	<link rel="stylesheet" href="design/vendor/resetstyle.sw/reset.css" type="text/css" media="screen" charset="utf-8">


	<script src="design/vendor/jquery/jquery-1.4.2.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="design/scripts/toys.js" type="text/javascript" charset="utf-8"></script>
		
	<link rel="stylesheet" href="design/vendor/jquery-ui/css/smoothness/jquery-ui-1.8.4.custom.css" type="text/css" media="screen" charset="utf-8">
	<script src="design/vendor/jquery-ui/js/jquery-ui-1.8.4.min.js" type="text/javascript" charset="utf-8"></script>

	<!-- carousel -->
	<script src="design/scripts/jquery.jcarousel/jquery.jcarousel.min.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" href="design/scripts/jquery.jcarousel/jcarousel.css" type="text/css" media="screen" charset="utf-8">

	<!-- selects -->
	<script src="design/scripts/jquery.ui.selectmenu/jquery.ui.selectmenu.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" href="design/scripts/jquery.ui.selectmenu/jquery.ui.selectmenu.css" type="text/css" media="screen" charset="utf-8">	

	<!-- qtip -->
	<script src="design/vendor/jquery.qtip/jquery.qtip.pack.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" href="design/vendor/jquery.qtip/jquery.qtip.min.css" type="text/css" media="screen" charset="utf-8">	


	<link rel="stylesheet" href="design/css/layout.css" type="text/css" media="screen" charset="utf-8">


	<!--[if IE ]>
	 <link rel="stylesheet"  href="design/css/ie/generalfailure.css" type="text/css" media="screen, projection">
	<![endif]-->

	<!--[if lte IE 6]>
	 <link rel="stylesheet"  href="design/css/ie/6failshard.css" type="text/css" media="screen, projection">
	<![endif]-->

	<!--[if IE 7]>
	 <link rel="stylesheet"  href="design/css/ie/7fails.css" type="text/css" media="screen, projection">
	<![endif]-->	

	<!--[if gt IE 7]>
	 <link rel="stylesheet"  href="design/css/ie/futurefailure.css" type="text/css" media="screen, projection">
	<![endif]-->

	
</head>
 
<body class="download">

<div class="fuckyeah">
	<img src="awesome/plane.gif" alt="freshprince">
</div>

<form class="blat" action="download.php" method="get">
	<div>
	
		<?php if ($downloads_status == 'error')	{ ?>
		
			<p>You dun screwed something up. Try again.</p>
			<p>Email <a href="mailto:will@bankai.fm">will@bankai.fm</a> if you think we screwed up.</p>
		
		<?php } else { ?>

			<?php if ($downloads_left > 0 )	{ ?>
	
				<p class="download">
					You can download <a href="#" class="floh"><?php echo $downloads_filename; ?></a> <strong><?php echo $downloads_left; ?></strong> more times using this code. Don't fuck it up.
				</p>
				
			<?php } else { ?>
				
				<p class="download">The downloads on that code are all used up. Sorry dude. Hi five!</p>
		
			<?php } ?>

		<?php } ?>


	<input type="text" class="text">
	<input type="submit" class="submit" value="&nbsp;">
	<a target="_blank" href="#" class="wtf">ARGH! Help!<span>If you've scored a download code somewhere, you can enter it here to get the FUCKING SWEET DOWNLOAD PACK with all sorts of rad stuff in it. <strong>Click that link for more help &raquo;</strong></span></a>
	</div>
</form>


<div class="aboot">
	<p>Four litres of Hope is the new thing from <a class="dood" href="http://bankai.fm">Bankai</a> (<a href="http://soundcloud.com/bankaibash">soundcloud</a> / <a href="http://facebook.com/bankaibash">facebook</a>) and <a class="dood" href="http://soundcloud.com/abortifacient">Abortifiacient</a> (<a href="http://soundcloud.com/abortifacient">soundcloud</a> / <a href="http://facebook.com/abortifacient">facebook</a>)</p>
</div>

</body>
</html>
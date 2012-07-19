<?php

	$data = str_replace('data:', '', $_POST['data']);	// clean-up string
	$data = explode(',', $data);						// get parts (type;encoding, base64string)
	$meta = explode(';', $data[0]);						// get meta data (type, encoding)
	$imgdata = base64_decode($data[1]);					// decode image data

	// chop extension to attach our own based on the content type given
	$filename_temp	= 'uploads/' . substr($_POST['filename'], 0, strrpos($_POST['filename'], '.') );
	
	switch ($meta[0])
	{
		case 'image/png':
			$filename = $filename_temp . '.png';
		break;
		case 'image/jpg':
			$filename = $filename_temp . '.jpg';
		break;
		case 'image/gif':
			$filename = $filename_temp . '.gif';
		break;
		default:
			$filename = false;
		break;
	}
	
	// try to create an image resource from the data
	$img = imagecreatefromstring($imgdata); 
	
	$header = "HTTP/1.0 400 Bad Request";
	
	if ( $img )
	{
		if ( file_put_contents($filename, $imgdata) )
		{
			imagedestroy($img);
			$header = "HTTP/1.0 200 OK";
		}	
	}
	
	header($header);
?>
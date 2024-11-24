<?php

// $myfile = fopen("compiled.txt", "w") or die(false);
// $txt = $_POST['code'];
// fwrite($myfile, $txt);
// fclose($myfile);

// echo $_POST['code'];
$myfile = fopen('compiled.txt', "w");
$compiled = "";
$files = [
    "domo_functions.js",
    "value_calculator.js",
    "context.jsx",  
    "tabulated.jsx",
    "filters.jsx",
    "pagination.jsx",

    "index.jsx",
      ];	

      foreach ($files as $value) {
		$compiled .= file_get_contents($value)."\n";
	}

	fwrite($myfile, $compiled);	

	echo $compiled;

?>
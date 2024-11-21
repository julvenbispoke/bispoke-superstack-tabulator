<?php


// echo $_POST['code'];
// return

$myfile = fopen("compiled.txt", "w") or die(false);
$txt = $_POST['code'];
fwrite($myfile, $txt);
fclose($myfile);

echo $_POST['code'];

?>
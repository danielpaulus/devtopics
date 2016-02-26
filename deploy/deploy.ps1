
$scriptpath= Split-Path -Parent $PSCommandPath

$settings= cat ($scriptpath+"\settings.json") | ConvertFrom-Json
$ftp_host=$settings.ftp_host

$ftp_commands=@($settings.user,$settings.pwd,"cd "+$settings.remoteroot)
$localpath= $settings.localpath



$dirs= dir $localpath -recurse | ? {$_.GetType().Name -eq "DirectoryInfo"}


foreach ($dir in $dirs){
$remotepath=$dir.parent.fullname.replace($localpath, "/web")
$remotepath=$remotepath.replace("\","/")
$ftp_commands+="cd "+$remotepath
$ftp_commands+= "mkdir "+ $dir.Name
$ftp_commands+="cd "+$dir.Name

foreach($f in $dir.GetFiles()){
  $ftp_commands+="put "+$f.fullname
}
}

$rootfiles+= ls $localpath |? {$_.GetType().Name -eq "FileInfo"}
$ftp_commands+="cd /web"
foreach($f in $rootfiles){
  $ftp_commands+="put "+$f.fullname
}

$ftp_commands+="quit"

$ftp_commands| out-file ($scriptpath+"\ftpcmds.dat")
invoke-expression "ftp -s:$($scriptpath+"\ftpcmds.dat") $ftp_host"
rm ($scriptpath+"\ftpcmds.dat")
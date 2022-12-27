$ErrorActionPreference = 'Stop'
try {
    $email = (Invoke-RestMethod "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1")
    $email_split = $email.split("@")
    Write-Host "/register $email $email"
}
catch {
    Write-Error "Error when trying to set up email inbox."
    exit
}
while ($true) {
    Start-Sleep(1)
    $messages = (Invoke-RestMethod "https://www.1secmail.com/api/v1/?action=getMessages&login=$($email_split[0])&domain=$($email_split[1])")
    try {
        $message = ($messages | Where-Object {$_.from.split("@")[1] -eq "mc.herobrine.org"})
        $code = $message.subject.split()[0]
        Write-Host "/code $code"
        break
    }
    catch {
        Start-Sleep(2)
    }
}
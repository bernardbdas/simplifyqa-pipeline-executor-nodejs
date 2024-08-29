$env:INPUT_EXECTOKEN="U2FsdGVkX1/RK6wgb/tBGEmqX+B9Dps5hMJ3VAJIyVBpuxPgxO/pS3ZMvgEbThG+F3nIjQU8y85Vq1EXC8N0+w=="
$env:INPUT_APPURL="https://simplifyqa.app"
$env:INPUT_THRESHOLD=100
$env:INPUT_VERBOSE="true"

npm run build
node .\\dist\\src\\index.js
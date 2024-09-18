$env:INPUT_EXECTOKEN="U2FsdGVkX1+uOHUqndnzcou8ciXP8uI/71DWh/yAOPxlXtJBcEBDqrH2jvqydzVnVTdPgl5+A7AOv9RCaX64tQ=="
$env:INPUT_APPURL="https://qa.simplifyqa.app"
$env:INPUT_THRESHOLD=100
$env:INPUT_VERBOSE="true"

npm run build
node .\\dist\\src\\index.js
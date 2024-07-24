$env:INPUT_EXECTOKEN="U2FsdGVkX1+UwRbokdydtG4PzkIdg6HJZEWDdqsALV4Z5FUnSTwG8u/oU2oIoYMq8ywxisd23S6A1+p1HpiYtQ=="
$env:INPUT_APPURL="https://simplifyqa.app"
$env:INPUT_THRESHOLD=100
$env:INPUT_VERBOSE="true"

npm run build
node .\\dist\\src\\index.js
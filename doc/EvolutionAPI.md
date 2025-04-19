# Evolution API

server-url: "https://evolution-api.bienquoi.com "

intanceName: "LowprofixBot"

AUTHENTICATION_API_KEY="429683C4C977415CAAFCCE10F7D57E11"

instanceAPIKey: "75363209013A-4BD6-B9B1-B0DF8986FD57"

# Send Message

curl --request POST \
 --url https://{server-url}/message/sendText/{instance} \
 --header 'Content-Type: application/json' \
 --header 'apikey: <api-key>' \
 --data '{
"number": "<string>",
"text": "<string>",
"delay": 123,
"quoted": {
"key": {
"remoteJid": "<string>",
"fromMe": true,
"id": "<string>",
"participant": "<string>"
},
"message": {
"conversation": "<string>"
}
},
"linkPreview": true,
"mentionsEveryOne": true,
"mentioned": [
"<string>"
]
}'

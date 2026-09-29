# Morse Light message page

The page a Morse Light watch QR code opens (`https://lumnai.github.io/morselight/#<secret>`).
Type a message and it is encrypted on the phone (AES-128-CBC with the key from the watch code),
posted to the public ntfy.sh relay, and picked up by the watch while the Morse Light app is open.
The secret after `#` stays in the browser; this site never receives it. No analytics, no cookies.

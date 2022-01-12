# autopilot-remote
Remote control for Raymarine autopilots.

## Why
Sometimes nice to be able to steer from the foredeck, inside, over the internet etc.

## How
Assumes target autopilot is connected to an NMEA 2000 (CAN bus) network that is exposed to the web via ["RAW mode protocol"](https://www.yachtd.com/downloads/ydnu02.pdf#page=56) over WebSocket. Assumes the WebSocket server supports a simple auth scheme where the first message sent is a pre-shared key.

Overview of stack used for development and testing:
* This web app (saved to home screen of a mobile device)
* [UDP <> WebSocket bridge](https://github.com/jessetane/udp-ws) (running on a Raspberry Pi 4)
* [YDWG-02](https://www.yachtd.com/products/wifi_gateway.html) (speaking UDP over WiFi to the Pi)
* NMEA 2000 network
* Ev100 Raymarine autopilot

## Example
https://autopilot-remote.isotope.jessetane.com

## License
MIT

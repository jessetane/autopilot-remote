# autopilot-remote
Raymarine NMEA 2000 autopilot compatible remote control.

## Why
Sometimes nice to be able to steer from the foredeck, inside, over the internet etc.

## How
Assumes target autopilot is connected to an NMEA 2000 (CAN bus) network that is exposed to the web via Yacht Devices ["RAW mode protocol"](https://www.yachtd.com/downloads/ydnu02.pdf#page=56) over WebSocket bridge such as [`udp-ws`](https://github.com/jessetane/udp-ws).

## License
MIT

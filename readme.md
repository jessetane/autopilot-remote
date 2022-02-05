# autopilot-remote
Remote control for Raymarine autopilots.

<table>
  <tr>
    <td width=20%><img src=/screenshots/1.png></td>
    <td width=20%><img src=/screenshots/2.png></td>
    <td width=20%><img src=/screenshots/3.png></td>
    <td width=20%><img src=/screenshots/4.png></td>
    <td width=20%><img src=/screenshots/5.png></td>
  </tr>
  <tr>
    <td align=center>Connect</td>
    <td align=center>Standby</td>
    <td align=center>Auto</td>
    <td align=center>Press and hold for -/+5</td>
    <td align=center>Keep holding for -/+10 or more</td>
  </tr>
</table>

## Why
Sometimes nice to be able to steer from the foredeck, inside, over the internet etc.

## How
Assumes target autopilot is connected to an NMEA 2000 (CAN bus) network that is exposed to the web via [RAW mode protocol](https://www.yachtd.com/downloads/ydnu02.pdf#page=56) over WebSocket. Assumes the WebSocket server supports a simple auth scheme where the first message sent is a pre-shared key.

Overview of stack used for development:
* This web app (works offline, can be saved to home screen of a mobile device)
* [UDP <> WebSocket bridge](https://github.com/jessetane/udp-ws) (running on a Raspberry Pi 4)
* [YDWG-02](https://www.yachtd.com/products/wifi_gateway.html) (speaking UDP over WiFi to the Pi)
* NMEA 2000 network
* Ev100 Raymarine autopilot

The web app is written using ES modules and so does not require any build step, however ES modules cannot be loaded directly from the file system and so for development a static file server is included that can be run with `npm run dev`.

## Example
https://autopilot-remote.isotope.jessetane.com

## License
MIT

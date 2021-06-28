#!/usr/bin/env python3
from math import sin, cos, pi
from http.server import BaseHTTPRequestHandler, HTTPServer

import board
import neopixel
import json
import sys
import time
import threading

pixels = neopixel.NeoPixel(
  board.D18,
  12,
  brightness=1.0,#0.01,
  auto_write=False,
)

BLUE = (91, 206, 250)
PINK = (245, 169, 184)
WHITE = (255, 255, 255)

def lerpf(a, b, s):
  return (1.0 - s) * a + s * b

def lerpc(a, b, s):
  return tuple(clamp(0, 255, int(lerpf(i, j, s)))  for (i, j) in zip(a, b))


class Modes:
  @classmethod
  def pulse(cls, a, b, c, speed=1.0, brightness=1.0):
    def update(t):
      s = sin(t * speed) ** 2
      pixels.brightness = brightness
      #for i in range(12):
      #  pixels[i] = lerpc(lerpc(PINK, WHITE, s), lerpc(WHITE, BLUE, s), s)
      pixels.fill(lerpc(lerpc(a, b, s*2.), lerpc(b, c, s*2.0-1), s))
      pixels.show()
    return update

  @classmethod
  def solid(cls, color, brightness=1.0):
    first = [False]
    def update(t):
      if first[0]:
        return
      first[0] = True
      pixels.brightness = brightness
      pixels.fill(color)
      pixels.show()
    return update

  @classmethod
  def cycle(cls, colors, speed=1.0, brightness=1.0):
    def update(t):
      a = colors[int(t * speed) % len(colors)]
      b = colors[(int(t * speed) + 1) % len(colors)]
      s = (t * speed) - int(t * speed)
      pixels.brightness = brightness
      pixels.fill(lerpc(a, b, s))
      pixels.show()
    return update


mode = Modes.pulse(BLUE, (50,50,50), PINK, speed=0.2) 


def render():
  global mode
  step = 1.0 / 60.
  t = 0.1
  while True:
    mode(t)
    time.sleep(step)
    t += step
    if t > 60*60*24:
      t = 0.0

def clamp(a, b, s):
  if s < a:
    return a
  if s > b:
    return b
  return s


def parse_color(c):
  if isinstance(c, tuple):
    return c
  known = {
    'pink': PINK,
    'trans-pink': PINK,
    'trans-blue': BLUE,
    'white': WHITE,
    'trans-white': WHITE,
    'blue': (0, 0, 255),
    'green': (0, 255, 0),
    'cyan': (0, 255, 255),
    'magenta': (255, 0, 255),
    'red': (255, 0, 0),
    'yellow': (255, 255, 0),
    'black': (0, 0, 0),
  }
  if c in known:
    return known[c]
  c = c.split(',')
  if len(c) == 3:
    return tuple(clamp(0, 255, int(i)) for i in c)
  return WHITE


class Server(BaseHTTPRequestHandler):
  def do_GET(self):
    path = self.path
    query = ''
    query_params = {}
    qm = path.find('?')
    if qm > 0:
      query = path[qm:]
      path = path[:qm]
      for arg in query[1:].split('&'):
        eq = arg.find('=')
        key = arg[:eq]
        value = arg[eq+1:] if eq >= 0 else ''
        query_params[key] = value

    try:
      if path.startswith('/mode/'):
        self.set_mode(path[len('/mode/'):], query_params)
      self.send_response(200)
      self.send_header('Content-Type', 'text/plain')
      self.end_headers()
      self.wfile.write('success: {}'.format(self.path).encode('utf-8'))
    except Exception as e:
      self.send_response(400)
      self.send_header('Content-Type', 'text/plain')
      self.end_headers()
      self.wfile.write('failure: {}'.format(str(e)).encode('utf-8'))
      
  def set_mode(self, name, query):
    global mode
    sys.stderr.write('setting mode: {} {}'.format(name, json.dumps(query)))
    if name == 'solid':
      sys.stderr.write(json.dumps(query))
      sys.stderr.flush()
      mode = Modes.solid(
        color=parse_color(query.get('color', 'white')),
        brightness=float(query.get('brightness', 1.0)),
      )
    elif name == 'pulse':
      mode = Modes.pulse(
        a = parse_color(query.get('a', BLUE)),
        b = parse_color(query.get('b', WHITE)),
        c = parse_color(query.get('c', PINK)),
        speed = float(query.get('speed', '1.0')),
      )
    elif name == 'cycle':
      mode = Modes.cycle(
        colors = list(map(
          parse_color,
          query.get('colors', 'trans-pink;trans-white;trans-blue').split(';')
        )),
        speed = float(query.get('speed', '1.0')),
        brightness = float(query.get('brightness', '1.0')),
      )


def serve():
  server_address = ('', 80)
  httpd = HTTPServer(server_address, Server)
  try:
    httpd.serve_forever()
  except Exception as e:
    print(e)
  httpd.server_close()

t1 = threading.Thread(target=render)
t2 = threading.Thread(target=serve)

t1.start()
t2.start()

t1.join()
t2.join()

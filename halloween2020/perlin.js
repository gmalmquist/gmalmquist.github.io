const perlinNoise = (function() {
  // Found on https://stackoverflow.com/questions/8405526/javascript-simplex-perlin-noise
  // http://jsfiddle.net/Lk56f/
  var noise = [];
  function Noise(x, y) {
      if (!noise[x])
          noise[x] = [];
      if (!noise[x][y])
          noise[x][y] = (Math.random() - 0.5) * 2;
      return noise[x][y];
      var n = x + y * 57
      n = (n<<13) ^ n;
      return ( 1.0 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
  }

  function SmoothedNoise1(x, y) {
      corners = ( Noise(x-1, y-1)+Noise(x+1, y-1)+Noise(x-1, y+1)+Noise(x+1, y+1) ) / 16
      sides   = ( Noise(x-1, y)  +Noise(x+1, y)  +Noise(x, y-1)  +Noise(x, y+1) ) /  8
      center  =  Noise(x, y) / 4
      return corners + sides + center
  }

  function InterpolatedNoise(x, y) {

      integer_X    = Math.floor(x)
      fractional_X = x - integer_X

      integer_Y    = Math.floor(y)
      fractional_Y = y - integer_Y

      v1 = SmoothedNoise1(integer_X,     integer_Y)
      v2 = SmoothedNoise1(integer_X + 1, integer_Y)
      v3 = SmoothedNoise1(integer_X,     integer_Y + 1)
      v4 = SmoothedNoise1(integer_X + 1, integer_Y + 1)

      i1 = Interpolate(v1 , v2 , fractional_X)
      i2 = Interpolate(v3 , v4 , fractional_X)

      return Interpolate(i1 , i2 , fractional_Y)

  }


  function PerlinNoise_2D(x, y) {
      total = 0
      p = 0.4
      n = 2 - 1 //octaves

      for(var i = 0; i < n; i++) {

          frequency = 0.1;
          amplitude = 7;

          total = total + InterpolatedNoise(x * frequency, y * frequency) * amplitude

      }

      return total
  }

  function Interpolate(a, b, x) {
      ft = x * 3.1415927
      f = (1 - Math.cos(ft)) * .5

      return  a*(1-f) + b*f
  }

  return PerlinNoise_2D;
})();

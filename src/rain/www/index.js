import * as wasm from "rain";

(function() {
  const rain = wasm.Rain.new();
  rain.start();

  const render = () => {
    rain.render();
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();

mod utils;

// Boilerplate from:
// https://rustwasm.github.io/book/game-of-life/hello-world.html
// https://rustwasm.github.io/docs/wasm-bindgen/examples/2d-canvas.html

use std::f64;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct Rain {
  game_time: f64,
  last_time: f64,
  delta_time: f64,
  start_realtime: f64,
}

#[wasm_bindgen]
impl Rain {
    pub fn new() -> Self {
      Self {
        start_realtime: js_sys::Date::new_0().get_time(),
        game_time: 0.0,
        last_time: 0.0,
        delta_time: 0.0,
      }
    }

    pub fn start(&mut self) {
    }

	pub fn render(&mut self) {
		let document = web_sys::window().unwrap().document().unwrap();
		let canvas = document.get_element_by_id("canvas").unwrap();
		let canvas: web_sys::HtmlCanvasElement = canvas
			.dyn_into::<web_sys::HtmlCanvasElement>()
			.map_err(|_| ())
			.unwrap();

		let g = canvas.get_context("2d")
			.unwrap()
			.unwrap()
			.dyn_into::<web_sys::CanvasRenderingContext2d>()
			.unwrap();

		let width = canvas.width() as f64;
		let height = canvas.height() as f64;

        self.tick();

		g.clear_rect(0., 0., width, height);

        g.begin_path();
		g.move_to(width/2., height/2.);
		g.line_to(100., 400. + (self.game_time / 100.0).sin() * 10.);
		g.stroke();

        g.set_fill_style(&"#ff00ff".into());
        let message: String = format!("tick delta: {}", self.delta_time);
        g.fill_text(&message, width/2., height/2.).unwrap();
	}

    fn tick(&mut self) {
		let time = js_sys::Date::new_0().get_time();
        self.game_time = time - self.start_realtime;
        self.delta_time = self.game_time - self.last_time;
        self.last_time = self.game_time;
    }
}

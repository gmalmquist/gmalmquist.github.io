mod utils;

// Boilerplate from:
// https://rustwasm.github.io/book/game-of-life/hello-world.html
// https://rustwasm.github.io/docs/wasm-bindgen/examples/2d-canvas.html

use std::{f64, ops};
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
extern "C" {
    fn alert(s: &str);
}

trait VecN<T: VecN<T>> {
    fn size(&self) -> u32;

    fn get(&self, i: u32) -> f64;

    fn set(&mut self, i: u32, v: f64) -> ();

    fn dot(&self, other: &T) -> f64 {
        let size_a = self.size();
        let size_b = other.size();
        let size = if size_a < size_b { size_a } else { size_b };
        (0..size)
            .map(|i| self.get(i) * other.get(i))
            .fold(0., |acc, x| acc + x)
    }

    fn norm2(&self) -> f64 {
        (0..self.size())
            .map(|i| self.get(i))
            .fold(0., |acc, x| acc + x * x)
    }

    fn norm(&self) -> f64 {
        self.norm2().sqrt()
    }

    fn from_vec(v: Vec<f64>) -> T;

    fn sadd(&self, scale: f64, other: &T) -> T {
       T::from_vec((0..self.size()).map(|i| self.get(i) + scale * other.get(i)).collect()) 
    }
}

#[derive(Debug, PartialEq, Clone, Copy)]
struct Vec2 {
    x: f64,
    y: f64,
}

impl Vec2 {
    fn new(x: f64, y: f64) -> Self {
        Self { x, y }
    }
}

impl VecN<Vec2> for Vec2 {
    fn from_vec(v: Vec<f64>) -> Self {
        Self {
            x: v[0],
            y: v[1],
        }
    }

    fn size(&self) -> u32 {
        2
    }

    fn get(&self, i: u32) -> f64 {
        match i {
            0 => self.x,
            1 => self.y,
            _ => 0.,
        }
    }

    fn set(&mut self, i: u32, v: f64) {
        match i {
            0 => {
                self.x = v;
            }
            1 => {
                self.y = v;
            }
            _ => (),
        };
    }
}

struct Drop {
    pos: Vec2,
    vel: Vec2,
}

impl Drop {
  fn advect(&mut self, time: f64) {
      // TODO don't hardcode gravity.
      let acc: Vec2 = Vec2::new(0., 128.);

      self.pos = self.pos.sadd(time, &self.vel).sadd(0.5 * time * time, &acc);
      self.vel = self.vel.sadd(time, &acc);
  }
}

#[wasm_bindgen]
pub struct Rain {
    game_time: f64,
    last_time: f64,
    delta_time: f64,
    start_realtime: f64,
    drops: Vec<Drop>,
}

#[wasm_bindgen]
impl Rain {
    pub fn new() -> Self {
        Self {
            start_realtime: js_sys::Date::new_0().get_time(),
            game_time: 0.0,
            last_time: 0.0,
            delta_time: 0.0,
            drops: vec![],
        }
    }

    pub fn start(&mut self) {
        self.drops.push(Drop {
            pos: Vec2::new(100., 100.),
            vel: Vec2::new(20., 0.),
        });
    }

    pub fn render(&mut self) {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id("canvas").unwrap();
        let canvas: web_sys::HtmlCanvasElement = canvas
            .dyn_into::<web_sys::HtmlCanvasElement>()
            .map_err(|_| ())
            .unwrap();

        let g = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<web_sys::CanvasRenderingContext2d>()
            .unwrap();

        let width = canvas.width() as f64;
        let height = canvas.height() as f64;

        self.tick();

        g.clear_rect(0., 0., width, height);

        g.begin_path();
        g.move_to(width / 2., height / 2.);
        g.line_to(100., 400. + self.game_time.sin() * 10.);
        g.stroke();

        g.set_fill_style(&"#ff00ff".into());
        let message: String = format!("tick delta: {}", self.delta_time);
        g.fill_text(&message, width / 2., height / 2.).unwrap();

        let drops = &mut self.drops;
        for drop in drops {
            let trail_time = 0.1;
            g.save();
            g.translate(drop.pos.x, drop.pos.y);
            g.begin_path();
            g.move_to(0., 0.);
            g.line_to(-drop.vel.x * trail_time, -drop.vel.y * trail_time);
            g.stroke();
            g.restore();

            drop.advect(self.delta_time);
        }
    }

    fn tick(&mut self) {
        let time = js_sys::Date::new_0().get_time();
        self.game_time = (time - self.start_realtime) / 1000.0;
        self.delta_time = self.game_time - self.last_time;
        self.last_time = self.game_time;
    }
}

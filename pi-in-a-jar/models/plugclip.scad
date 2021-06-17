$fn = 128;

// plastic part of male plugs at the end of cables
plug_width = 2.6;
plug_length = 12; 

thickness = 1;
height = 4;
fit = 0.2;

// distance from edge of poe hat board to first pins
edge_width = 1.5;

// thickness of poe hat circuit board
board_thickness = 1.7;

// top of poe hat board to bottom of rpi board
assembly_width = 18.9;


module pin_clip(pattern=[0,1,1,0,0,1,0,1]) {
    echo("width:", plug_width * len(pattern));
    left_margin = pattern[0] == 0 ? 0 : 1;
    right_margin = pattern[len(pattern) - 1] == 0 ? 0 : 1;
    part_width = plug_width * len(pattern) + left_margin + right_margin;
    translate([
        0,
        thickness - 0.001,
        0
    ]) {
        difference() {
            cube([
                part_width,
                plug_width + thickness*2 + (edge_width - thickness) - 0.1,
                height,
            ]);
            
            for (i = [0:len(pattern) - 1]) {
                if (pattern[i] == 0) {
                    // round holes for free pins
                    translate([
                        plug_width/2 + plug_width * i + left_margin,
                        plug_width/2 + edge_width,
                        -0.001
                    ])
                    cylinder(r=0.75, h=10);
                } else {
                    // rectangular hole for plug
                    translate([
                        plug_width * i - fit*1.5 + left_margin,
                        edge_width - fit*1.5,
                        -0.001
                    ])
                    cube([
                        plug_width + fit*3,
                        plug_width + fit*3,
                        10
                    ]);
                }
            }
        }
        
        // bottom clip
        translate([
            0,
            0,
            -assembly_width - board_thickness - fit,
        ])
        cube([
            part_width,
            edge_width,
            board_thickness
        ]);
    }

    // back plate
    color([0,1,1])
    translate([
        0,
        0,
        -assembly_width - board_thickness - fit
    ])
    cube([
        part_width,
        thickness,
        assembly_width + height + board_thickness + fit,
    ]);
}

translate([0, height, 0])
rotate([90, 0, 0])
pin_clip();

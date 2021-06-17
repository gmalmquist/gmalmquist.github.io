use <../util/constructions.scad>;
use <../util/screws.scad>;

// inside diameter of the mouth of the jar
mouth_diameter = 75;
// diameter of the center part of the lid
lid_diameter = 65;

// led ring
ring_outer_diameter = 38.2;
ring_inner_diameter = 23.3;
ring_board_height = 1.68;
ring_total_height = 3.2;

// voltage converter chip
converter_length = 19.6;
converter_chip_width = 6.4;
converter_chip_height = 3.3;
converter_chip_edge = 0.95;
converter_total_width = 14;
converter_assembly_diameter = 45;
converter_height = 7;

ethernet_plug_width = 12;
ethernet_cable_diameter = 6.5;

// plastic part of male plugs at the end of cables
plug_width = 2.6;
plug_length = 12;

screw_thread_diameter = 2.45;
screw_thread_length = 14.5;
screw_head_diameter = 4.3;
nut_depth = 2;
nut_diameter = 5;

fit = 0.2;

$fn = 128;

module ring_chip(mask=false) {
    eps = mask ? fit : 0;
    led_width = 5 + eps;
    led_height = ring_total_height - ring_board_height + eps;
    
    for (a=[0:11]) {
        color([1,1,1])
        rotate([0, 0, 360 * a / 12])
        translate([ring_outer_diameter/4 + ring_inner_diameter/4 - 0.5, 0, 0])
        translate([-led_width/2, -led_width/2, ring_board_height])
        cube([led_width, led_width, led_height]);
    }
    
    
    color([0, 0.8, 0])
    translate([0, 0, -eps/2])
    difference() {
        cylinder(
            r = ring_outer_diameter / 2 + eps,
            h = ring_board_height + eps
        );
        
        translate([0,0,-1])
        cylinder(
            r = ring_inner_diameter / 2 - eps,
            h = ring_board_height + 2 + eps
        );
    
        if (!mask) {
            for (a=[0:11]) {
                color([1,0.5,0])
                rotate([0, 0, 360 * (a + 0.5) / 12])
                translate([ring_outer_diameter/2 - 1, 0, 0])
                translate([0, 0, -0.5])
                cylinder(r=0.5, h=ring_board_height + 1);
            }
        }
    }
    
    if (mask || true) {
        for (a=[0:11]) {
            color([1,0.5,0])
            rotate([0, 0, 360 * (a + 0.5) / 12])
            translate([
                ring_outer_diameter/2 - 2,
                0, 
                ring_board_height - 0.01
            ])
            translate([0, 0, led_height/4])
            cube([3, 1.3, led_height/2], center = true);
        }
    }
}

module enclosure(view="assembled") {
    enclosure_radius = mouth_diameter/2 - 0.2;
    enclosure_height = screw_thread_length - nut_depth - 2;
    bottom_thickness = ring_total_height;
    lip_width = 1;
    lip_height = enclosure_height - bottom_thickness;
    
    module converter_chip_clasp(mask=false) {
        eps = mask ? 0.2 : 0;
        color([1,1,1])
        translate([
            ring_outer_diameter/2 + converter_chip_width + 1,
            0,
            -eps,
        ]) {
            reflectY() {
                reflectX()
                translate([converter_chip_width/2 + 2, converter_length/2, 0])
                cylinder(r=1 + eps, h=converter_chip_height + 1 + bottom_thickness - converter_chip_height/2 + eps);
                
                hull() {
                    reflectX()
                    translate([
                        converter_chip_width/2 + 2, 
                        converter_length/2, 
                        converter_chip_height + bottom_thickness - converter_chip_height/2
                    ])
                    cylinder(r=1 + eps, h=1);
                }
            }
        }
    }
    
    module main_component() {
        difference() {
            union() {
                // bottom
                cylinder(
                    r = enclosure_radius,
                    h = bottom_thickness
                );
                
                // lip
                translate([0,0,0.01])
                difference() {
                    cylinder(
                        r = enclosure_radius,
                        h = bottom_thickness + lip_height
                    );
                    translate([0, 0, -.1])
                    cylinder(
                        r = enclosure_radius - lip_width,
                        h = bottom_thickness + lip_height + 1
                    );
                }
                
                // screw pillars
                for (a=[0:3]) {
                    rotate([0, 0, a * 90 + 45])
                    translate([
                        lid_diameter/2 - screw_thread_diameter/2 - 1, 
                        0, 
                        0.001
                    ])
                    color([.5, .5, .5])
                    cylinder(r=screw_thread_diameter/2 + 1.5, h=enclosure_height - 0.001);
                }
            }
            
            // cut out slot for led ring
            translate([0, 0, ring_total_height])
            scale([1, 1, -1])
            ring_chip(mask=true);
        
            // cut out socket for ethernet
            translate([0, 0, -1])
            cylinder(r = ethernet_cable_diameter/2, h=bottom_thickness + 2);
            
            // cut outs for incoming power / ground
            // and outgoing control / ground
            // technically we could just have 3
            // because the ground is the same, but
            // I think it makes the wiring a
            // bit tidier this way
            for (a=[0:3]) {
                rotate([0, 0, a * 90])
                color([.3, .3, .3])
                translate([plug_width + ethernet_cable_diameter/2 + 1, 0, 0])
                cube([plug_width + fit, plug_width + fit, plug_length], center=true);
            }
        
            // screw holes
            for (a=[0:3]) {
                rotate([0, 0, a * 90 + 45])
                translate([
                    lid_diameter/2 - screw_thread_diameter/2 - 1, 
                    0, 
                    -screw_thread_length + enclosure_height
                ])
                color([.5, .5, .5])
                cylinder(r=screw_thread_diameter/2, h=screw_thread_length + 1);
            }
            
            // place for converter chip
            translate([
                ring_outer_diameter/2 + converter_chip_width + 1,
                0, 
                bottom_thickness/2 + converter_chip_height/2]) {
                color([0.2, 0.2, 0.2])
                cube([
                    converter_chip_width + 1, 
                    converter_length + 1, 
                    converter_chip_height
                ], center = true);
            }
            
            converter_chip_clasp(mask = true);
            
            // pouring hole
            translate([0, -(ring_outer_diameter/2 + enclosure_radius/4), -1])
            threaded_rod(radius=4 + 0.2, length=enclosure_height);
        }
        
        // bolts to hold ring in place
        for (a = [0:2]) {
            rotate([0, 0, a * 120 + 180])
            translate([ring_outer_diameter/2 + 3.5, 0, bottom_thickness - 0.01])
            threaded_rod(length=4.5/2, radius=3);
        }
    }
    
    module oil_cap() {
        bolt(radius=6, height=2, head="flat") {
            threaded_rod(radius=4, length=bottom_thickness);
        }
    }
    
    module screw_caps() {
        for (a = [0:2]) {
            rotate([0, 0, a * 120 + 180])
            translate([
                view == "assembled" ? ring_outer_diameter/2 + 3.5 : 10, 
                0, 
                view == "assembled" ? bottom_thickness : 0
            ])
            color([0.8, 1.0, 0.8])
            screw_cap(radius=3);
        }
    }
    
    if (view == "main" || view == "assembled")
    main_component();
    
    if (view == "assembled") {
        translate([
            0, 
            -(ring_outer_diameter/2 + enclosure_radius/4), 
            bottom_thickness + 2
        ])
        rotate([0, 180, 0])
        oil_cap();
        
        converter_chip_clasp();
        
        screw_caps();
    }
    
    if (view == "parts" || view == "oil_cap")
    oil_cap();
    
    if (view == "parts" || view == "clasps")
    translate([0, 0, converter_chip_height + 1 + bottom_thickness - converter_chip_height/2])
    rotate([180, 0, 0]) converter_chip_clasp();
    
    if (view == "parts" || view == "ring_nuts")
    translate([-30, 0, 0])
    screw_caps();
}

intersection() {
    enclosure(view=MODE);
    
    // cut out just the center part for testing
    if (test_ring_socket)
    translate([0, 0, -1]) hull() {
        cylinder(r = ring_outer_diameter/2 + 1, h = 30);
        
        for (a = [0:2]) {
            rotate([0, 0, a * 120 + 180])
            translate([ring_outer_diameter/2 + 3.5, 0, 0])
            cylinder(r=4, h=30);
        }
    }
    
    // cut out the converter chip dock for testing
    if (test_chip_socket)
    translate([ring_outer_diameter/2 + converter_chip_width/2 + 4.4, 0, -1])
    cube([converter_chip_width + 8, converter_length + 5, 50], center = true);
}


// set to TRUE to render the mouth of the jar
if (false)
color([.6, .6, 1, 0.1])
difference() {
    cylinder(r=mouth_diameter / 2 + 1, h = 20);
    translate([0, 0, -.1])
    cylinder(r=mouth_diameter / 2, h = 21);
}

// make small test pieces
// only set one of these to true at a time
test_ring_socket = false;
test_chip_socket = false;

// MODES
// assembled: show all parts how they will be put together
// main: render the main body of the part for printing
// parts: render the screws etc that will attach to the main part
// ring_nuts: render the nuts that hold the led ring down
// clasps: render the clasps that hold down the converter chip
// oil_cap: render the bolt that screws into the hole used to pour oil in
MODE = "main";

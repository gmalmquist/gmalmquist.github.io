$fn = 128;

jar_base_diameter = 75;
jar_base_radius = jar_base_diameter / 2;
jar_base_height = 5;

jar_bottom_radius = 0.5 * jar_base_height + (1/8) * pow(jar_base_diameter, 2) / jar_base_height;

plant_base_diameter = 24;
plant_base_radius = plant_base_diameter / 2;
plant_base_top_radius = 9;
plant_base_height = 9;

jar_cap_height = 3;

echo("jar bottom radius:", jar_bottom_radius);

function lerp(a, b, s) = (1.0 - s) * a + s * b;

module jar_bump() {
    module bump() {
        intersection() {
            cylinder(r=jar_base_radius- 1.5, h=50);

            color([1,0,0])
            translate([0, 0, -jar_bottom_radius + jar_base_height])
            sphere(r=jar_bottom_radius);
        }
    }

    difference() {
        hull() {
            bump();
            
            translate([0, 0, jar_cap_height])
            bump();
        }
        translate([0, 0, -1])
        bump();
    }
}

module plant_base() {
    N = 20;
    hull() {
        for (a = [0:N]) {
            translate([0, 0, a * plant_base_height / N])
            cylinder(r=lerp(
              plant_base_radius, 
              plant_base_top_radius, 
              1-sin((N-a)/N * 90)
            ), h=1);
        }
    }
}

difference() {
    difference() {
        jar_bump();

        translate([20, 0, 2])
        rotate([0, 8, 0])
        color([0, 1, 0])
        plant_base();
    }
    //translate([0, 0, -5])
    //cylinder(r=jar_base_radius - 6, h=30);
}


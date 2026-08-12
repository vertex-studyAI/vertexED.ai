// T2424-0037 controlled NLP-to-CAD
difference() {
    cube([120, 80, 5], center=false);
    translate([10, 10, -1]) cylinder(h=7, r=3, $fn=48);
    translate([110, 10, -1]) cylinder(h=7, r=3, $fn=48);
    translate([110, 70, -1]) cylinder(h=7, r=3, $fn=48);
    translate([10, 70, -1]) cylinder(h=7, r=3, $fn=48);
}

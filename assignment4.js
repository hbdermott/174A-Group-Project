import {Body, Simulation} from "./examples/collisions-demo.js";
import { defs, tiny } from "./examples/common.js";

const {Cube, Axis_Arrows, Textured_Phong, Fake_Bump_Map} = defs

const {
	Vector,
	Vector3,
	vec,
	vec3,
	vec4,
	color,
	hex_color,
	Shader,
	Matrix,
	Mat4,
	Light,
	Shape,
	Material,
	Scene,
	Texture,
} = tiny;

class Note {
    constructor(time, lane){
        this.time = time;
        this.lane = lane;
    }
}

export class Assignment4 extends Simulation {
	// **Collision_Demo** demonstration: Detect when some flying objects
	// collide with one another, coloring them red.
	constructor() {
		super();
		// Shapes:
		this.shapes = {
			cube: new defs.Cube(),
			floor: new defs.Cube(),
			cube_neck: new defs.Cube(),
			triangle: new defs.Triangle(),
			square: new defs.Square(),
			//tetrahedron: new defs.Tetrahedron(),
			//windmill: new defs.Windmill(4),
			sub_sphere: new defs.Subdivision_Sphere(4),
			//daasfaaasurface: new defs.Surface_Of_Revolution(20,20,[0,1]),
			cylinder: new defs.Capped_Cylinder(60,60),
			tube: new defs.Cylindrical_Tube(20,20),
            cone_tip: new defs.Cone_Tip(30,30),
            closed_cone: new defs.Closed_Cone(20,20),
            torus: new defs.Torus(30,30),
            torus_shoe: new defs.Torus(2,2),
            torus_star: new defs.Torus(1,1),
            reg2d: new defs.Regular_2D_Polygon(35,35),
            axis_arrow: new defs.Axis_Arrows(),
            note: new defs.Torus1(20,20)
		};

		this.fire_raises = {
			green: false,
			green_count: 0,
			red: false,
			red_count: 0,
			yellow: false,
			yellow_count: 0,
			blue: false,
			blue_count: 0,
		}

		this.pocket_raises = {
			green_count: 0,
			red_count: 0,
			yellow_count: 0,
			blue_count: 0,
		}

        // humanoid randomizer
		this.x_pos_arr_rand = []
		for(var i = 0; i < 30; i++) {


			// Assign randomizers
			this.x_pos_arr_rand.push([Math.random()-0.5, Math.random()-0.5, Math.floor(Math.random()*3), Math.floor(Math.random()*6)])

		}


		// Collider:
		this.collider = {intersect_test: Body.intersect_cube, points: new defs.Cube(), leeway: .1};


		// Shader stretching adjustments
		for (let i = 0; i < this.shapes.cube_neck.arrays.texture_coord.length; i++) {
            this.shapes.cube_neck.arrays.texture_coord[i][0] *= 2.25;
            this.shapes.cube_neck.arrays.texture_coord[i][1] *= 2;
        }

        // Floor Shader stretching adjustments
		for (let i = 0; i < this.shapes.floor.arrays.texture_coord.length; i++) {
            this.shapes.cube_neck.arrays.texture_coord[i][0] *= 0.5;
            this.shapes.cube_neck.arrays.texture_coord[i][1] *= 0.5;
        }



		// Materials:
		const phong = new defs.Phong_Shader(1);
		this.note_material = new Material(phong, {
			color: color(1, 1, 1, 1),
			ambient: .5,
		});
		this.you_rock = new Material(new Textured_Phong, {
			color: color(0, 0, 0, 1),
			ambient: 1,
			texture: new Texture("assets/you_rock.png"),
		});
		this.game_over = new Material(new Textured_Phong, {
			color: color(0, 0, 0, 1),
			ambient: 1,
			texture: new Texture("assets/game_over.png"),
		});
		this.note_material_circ = new Material(phong, {
			color: color(1, 1, 1, 1),
			ambient: .2,
			specularity:0.3,
		});
		this.note_light_material = new Material(phong, {
			color: color(1, 1, 1, 1),
			ambient: 0.9,
		});

		this.hit_material = new Material(phong, {
			color: color(0, 1, 0, 1)
		})

		this.transparent = new Material(phong, {
			color: color(1, 1, 1, 0)
		})
        this.neck_overlay = new Material(new Texture_Rotate(),{
        	    color: color(0,0,0,0.9),
                ambient: 1.0,
                diffusivity: 0.1,
                specularity: 0.0,
                texture: new Texture("assets/neck.png"),
        })
        this.stage_material = new Material(new Textured_Phong, {
			ambient: .4,
			texture: new Texture("assets/stage.jpg"),
		});
		this.floor_material = new Material(new Textured_Phong, {
			ambient: .4,
			texture: new Texture("assets/floor2.jpeg"),
		});
		this.fire = new Material(new Textured_Phong, {
			color: color(0,0,0,0.7),
            ambient: 1.0,
            diffusivity: 0.1,
            specularity: 0.0,
			texture: new Texture("assets/fire7.png"),
		});
		this.clothes_jeans = new Material(new Textured_Phong, {
			ambient: 1.0,
			texture: new Texture("assets/denim.jpeg"),
		});
		this.clothes_pants_black = new Material(new Textured_Phong, {
			ambient: 1.0,
			texture: new Texture("assets/pants_black.jpeg"),
		});
		this.clothes_khaki = new Material(new Textured_Phong, {
			ambient: 1.0,
			texture: new Texture("assets/khaki.jpeg"),
		});
		this.clothes_head = new Material(new Textured_Phong, {
			ambient: 1.0,
			specularity:0.1,
			texture: new Texture("assets/head1.jpeg"),
		});
		this.stage_material = new Material(new Textured_Phong, {
			ambient: .4,
			texture: new Texture("assets/stage.jpg"),
		});
		this.score_material_yellow = new Material(new Textured_Phong, {
			ambient: .9,
			texture: new Texture("assets/yellow_rock.png"),
		});
		this.score_material_red = new Material(new Textured_Phong, {
			ambient: .9,
			texture: new Texture("assets/red_no_transp.png"),
		});
		this.score_material_green = new Material(new Textured_Phong, {
			ambient: .9,
			texture: new Texture("assets/green_rock.png"),
		});
		this.back_mat = new Material(new Textured_Phong, {
			ambient: 0.5,
			specularity: 1,
			diffusivity:0.5,
			texture: new Texture("assets/back2.jpeg"),
		});
		this.face_mat = new Material(new Textured_Phong, {
			color: color(0,0,0,0.9),
            ambient: 1.0,
            diffusivity: 0.1,
            specularity: 0.0,
			texture: new Texture("assets/face.png"),
		});


		this.start = true; //Used to create hitboxes as
		                     //we cant create them outside
							//of the update_state function
		//Song Data:
		//Notes of format time(s), lane
		//where time is when note appears
		//not when it should be hit
		//TODO: may change in future
		this.ending_animation = false;
		this.notes = [
					new Note(7, 0),
					new Note(7, 2),
					new Note(8, 1),
					new Note(8.3, 2),
					new Note(9.3, 2),
					new Note(9.6, 3),
					new Note(11.3, 3),
					new Note(11.6, 2),
					new Note(11.8, 1),
					new Note(12.1, 0),
					new Note(12.1, 2),
					new Note(13.2, 1),
					new Note(13.5, 2),
					new Note(14.5, 2),
					new Note(14.8, 3),
					new Note(15.4, 0),
					new Note(15.6, 3),
					new Note(15.8, 0),
					new Note(16, 3),
					new Note(16.2, 0),
					new Note(16.4, 3),
					new Note(16.6, 0),
					new Note(16.8, 3),
					new Note(17.4, 0),
					new Note(17.4, 2),
					new Note(18.4, 1),
					new Note(18.7, 2),
					new Note(19.7, 2),
					new Note(20, 3),
					new Note(21.7, 3),
					new Note(22, 2),
					new Note(22.2, 1),
					new Note(22.8, 0),
					new Note(22.8, 2),
					new Note(23.8, 1),
					new Note(24.1, 2),
					new Note(25.1, 2),
					new Note(25.4, 3),
					new Note(26, 0),
					new Note(26.2, 3),
					new Note(26.4, 0),
					new Note(26.6, 3),
					new Note(26.8, 0),
					new Note(27, 3),
					new Note(27.2, 0),
					new Note(27.4, 3),
					new Note(28, 0),
					new Note(28, 2),
					new Note(29, 1),
					new Note(29.3, 2),
					new Note(30.3, 2),
					new Note(30.6, 3),
					new Note(32.3, 3),
					new Note(32.6, 2),
					new Note(32.8, 1),
					new Note(33.2, 0),
					new Note(33.2, 2),
					new Note(34.2, 1),
					new Note(34.5, 2),
					new Note(35.5, 2),
					new Note(35.8, 3),
					new Note(36.4, 0),
					new Note(36.6, 3),
					new Note(36.8, 0),
					new Note(37, 3),
					new Note(37.2, 0),
					new Note(37.4, 3),
					new Note(37.6, 0),
					new Note(37.8, 3),
					new Note(38.4, 0),
					new Note(38.4, 2),
					new Note(39.4, 1),
					new Note(39.7, 2),
					new Note(40.7, 2),
					new Note(41, 3),
					new Note(42.7, 3),
					new Note(43, 2),
					new Note(43.2, 1),
					new Note(43.7, 0),
					new Note(43.7, 2),
					new Note(44.7, 1),
					new Note(45, 2),
					new Note(46, 2),
					new Note(46.3, 3),
					new Note(46.9, 0),
					new Note(47.1, 3),
					new Note(47.3, 0),
					new Note(47.5, 3),
					new Note(47.7, 0),
					new Note(47.9, 3),
					new Note(48.1, 0),
					new Note(48.3, 3),
					new Note(49.3, 3),
					new Note(49.8, 2),
					new Note(50.3, 3),
					new Note(50.8, 2),
					new Note(51.2, 0),
					new Note(51.8, 3),
					new Note(52.3, 2),
					new Note(52.8, 3),
					new Note(53.3, 2),
					new Note(53.7, 0),
					new Note(54.3, 0),
					new Note(54.8, 1),
					new Note(55.3, 3),
					new Note(55.8, 2),
					new Note(56.2, 3),
					new Note(56.8, 0),
					new Note(57.3, 1),
					new Note(57.8, 3),
					new Note(58.3, 2),
					new Note(58.7, 3),
					new Note(59.3, 3),
					new Note(59.8, 2),
					new Note(60.3, 3),
					new Note(60.8, 2),
					new Note(61.2, 0),
					new Note(61.8, 3),
					new Note(62.3, 2),
					new Note(62.8, 3),
					new Note(63.3, 2),
					new Note(63.7, 0),
					new Note(66.6, 0),
					new Note(66.6, 1),
					new Note(67, 2),
					new Note(67, 3),
					new Note(67.4, 0),
					new Note(67.4, 1)
				];

		this.distance = -20;
		this.velocity = 25;

		this.lanes = [
			Mat4.identity().times(Mat4.translation(-3, 0, 0)),
			Mat4.identity().times(Mat4.translation(-1, 0, 0)),
			Mat4.identity().times(Mat4.translation(1, 0, 0)),
			Mat4.identity().times(Mat4.translation(3, 0, 0)),
		]

		this.clicks = [false, false, false, false]

		this.hitboxes = null;

		this.stats = {
			streak: 0,
			points: 0,
			misses: 0,
			hits: 0,
			combo: 1,
			total_hits: 0
		}
		
		
		this.audio = new Audio("assets/Back_In_Black.mp3");
		this.audio.loop = false;
		this.cheer = new Audio("assets/cheer.mp3");
		this.cheer.loop = false;
		this.clap = new Audio("assets/clap.mp3");
        this.clap.loop = false;
        this.boo = new Audio("assets/boo.mp3");
        this.boo.loop = false;
        this.playboo = true;
        this.playclap = false;
		this.playcheer = true;
		this.playaudio = true;
		this.end_cheer = 0;
		this.ending_cheer = new Audio("assets/end_cheer.mp3");
		this.ending_cheer.loop = true;
		this.miss = new Audio("assets/missed.mp3");
		this.miss.loop = false;

        this.gameover_sound = new Audio("assets/game_over_boo.mp3")
		this.gameover = false;
	}

	make_control_panel() {
		this.key_triggered_button(
			"First",
			["a"],
			() => (this.clicks[0] = true),
			"#ff00a2",
			() => (this.clicks[0] = false)
		);
		this.key_triggered_button(
			"Second",
			["s"],
			() => (this.clicks[1] = true),
			"#4400ff",
			() => (this.clicks[1] = false),
		);
		this.key_triggered_button(
			"Third",
			["d"],
			() => (this.clicks[2] = true),
			"#00fff7",
			() => (this.clicks[2] = false)
		);
		this.key_triggered_button(
			"Fourth",
			["f"],
			() => (this.clicks[3] = true),
			"#ff8400",
			() => (this.clicks[3] = false)
		);
		super.make_control_panel();
	}


	update_state(dt) {
		// update_state():  Override the base time-stepping code to say what this particular
		// scene should do to its bodies every frame -- including applying forces.
		//If first iteration generate hitbox block
		if (!this.gameover) {
		    if (this.start) {
		    	var iter = 0
		    	for (let i of this.lanes) {
		    		var clr = hex_color('#1d8522')
		    		if (iter == 1)
		    			clr = hex_color('#c21021')
		    		else if (iter == 2)
		    			clr = hex_color('#e6da3c')
		    		else if (iter == 3)
		    			clr = hex_color('#143973')
		    		this.bodies.push(
		    			new Body(this.shapes.sub_sphere, this.transparent, vec3(1, 1, 1)).emplace(
		    				i.times(Mat4.translation(0,-0.2,0.7)).times(Mat4.rotation(1.7,1,0,0)).times(Mat4.translation(0,0,0)),//.times(Mat4.scale(1,1,0.2)),
		    				vec3(0, 0, 0)/**/,
		    				0
		    			)
		    		);
		    		iter++;
		    	}
    
		    	//WHY TF do i need this??
		    	for (let a of this.bodies) {
		    		a.inverse = Mat4.inverse(a.drawn_location);
		    	}
    
		    	this.start = false;
		    	this.hitboxes = this.bodies.slice();
		    }
    
		    for (let a of this.bodies.filter((n) => n.linear_velocity != 0)) {
		    	a.inverse = Mat4.inverse(a.drawn_location);
		    }
    
		    //Create new notes
		    for (let i = 0; i < this.notes.length; i++) {
		    	if (this.notes[i].time <= this.t) {
		    		var clr = hex_color('#1d8522')
		    		if (this.notes[i].lane == 1)
		    		    clr = hex_color('#c21021')
		    		else if (this.notes[i].lane == 2)
		    		    clr = hex_color('#e6da3c')
		    		else if (this.notes[i].lane == 3)
		    		    clr = hex_color('#143973')
		    		var rot = 160/100;
		    		// Note torus
		    		this.bodies.push(
		    			new Body(this.shapes.torus, this.note_material.override({color: clr, ambient:0.15, specularity:0.3}), vec3(1, 1, 1)).emplace(
		    				this.lanes[this.notes[i].lane].times(
		    					Mat4.translation(0, 1, this.distance)
		    				).times(Mat4.rotation(rot,1,0,0)).times(Mat4.translation(0,0,1.7))/*.times(Mat4.scale(1.5,1.5,1))*/,
		    				vec3(0, 0, 1).normalized().times(this.velocity),
		    				0
		    			)
		    		);
		    		// Note bottom white
		    		this.bodies.push(
		    			new Body(this.shapes.cylinder, this.note_material.override({ambient:0.1, specularity:0.1}), vec3(1, 1, 1)).emplace(
		    				this.lanes[this.notes[i].lane].times(
		    					Mat4.translation(0, 1, this.distance)
		    				).times(Mat4.rotation(rot,1,0,0)).times(Mat4.translation(0,0,1.7)).times(Mat4.scale(1,1,.18)),
		    				vec3(0, 0, 1).normalized().times(this.velocity),
		    				0
		    			)
		    		);
                    //Note light
		    		this.bodies.push(
		    			new Body(this.shapes.cylinder, this.note_material.override({ambient:0.6,specularity: 1.0}), vec3(1, 1, 1)).emplace(
		    				this.lanes[this.notes[i].lane].times(
		    					Mat4.translation(0, 1, this.distance)
		    				).times(Mat4.rotation(rot,1,0,0)).times(Mat4.translation(0,0,1.55)).times(Mat4.scale(0.59,0.59,.6)),
		    				vec3(0, 0, 1).normalized().times(this.velocity),
		    				0
		    			)
		    		);
		    		//Note light ring
		    		this.bodies.push(
		    			new Body(this.shapes.cylinder, this.note_material.override({color: hex_color("#000000")}), vec3(1, 1, 1)).emplace(
		    				this.lanes[this.notes[i].lane].times(
		    					Mat4.translation(0, 1, this.distance)
		    				).times(Mat4.rotation(rot,1,0,0)).times(Mat4.translation(0,0,1.6)).times(Mat4.scale(0.61,0.61,.64)),
		    				vec3(0, 0, 1).normalized().times(this.velocity),
		    				0
		    			)
		    		);
		    	} else {
		    		break;
		    	}
		    }
    
		    //Remove all newly created notes from array
		    this.notes = this.notes.filter((n) => n.time >= this.t);
    
		    //lane is x coordiante
		    //Called when a key is pressed
		    //used to check if there is a note in hitbox
		    //Returns true if note hit
		    //False if no note
		    //Updates hits, streak, combo, points, and materials
		    const check_hit = (lane) => {
		    	let res = false;
		    	const lane_notes = this.bodies.filter(
		    		(n) => n.center[0] == lane && n.linear_velocity != 0
		    	);
		    	const hit_box = this.hitboxes.filter((n) => n.center[0] == lane)[0];
		    	for (let note of lane_notes) {
		    		
		    		if (hit_box.check_if_colliding(note, this.collider)) {
		    			note.material = this.transparent; //TODO color or animation for hit
		    	
		    	        if (this.stats.hits - this.stats.misses < 64)
		    			    this.stats.hits++;
                        this.stats.total_hits++;
		    			this.stats.streak++;
    
		    			// Activate fire raise
		    			if (note.drawn_location[0][3] == -3) {this.fire_raises.green = true;}
		    			if (note.drawn_location[0][3] == -1) {this.fire_raises.red = true;}
		    			if (note.drawn_location[0][3] == 1) {this.fire_raises.yellow = true;}
		    			if (note.drawn_location[0][3] == 3) {this.fire_raises.blue = true;}
		    			
		    			this.stats.combo = Math.min(
		    				8,
		    				1 + Math.floor(this.stats.streak / 20)
		    			);
		    			this.stats.points +=
		    				this.stats.combo *
		    				100 *
		    				(1 - (Math.abs(note.center[2]) - hit_box.center[2]));
		    			res = true;
		    		}
		    	}
		    	if (!res) {
		    		//Pressed key but no note
		    		//TODO add special color / animation
		    		this.stats.streak = 0;
		    		this.stats.combo = 1;
		    	}
		    	return res;
		    };
    
		    //Check key presses and call to see if notes hit
		    for (let hitbox = 0; hitbox < this.hitboxes.length; hitbox++) {
		    	if (this.clicks[hitbox]) {
		    		check_hit(this.hitboxes[hitbox].center[0]);
		    	}
		    }
    
		    //Check if notes were missed
		    const missed_notes = this.bodies.filter((n) => n.center[2] >= 2).length;
		    if (missed_notes) {
		    	this.stats.combo = 1;
		    	if (this.stats.hits - this.stats.misses > -64)
		    	    this.stats.misses += missed_notes;
		    	this.stats.streak = 0;
		    	this.miss.play();
		    	//TODO add note missed animation / color
		    }
    
		    //Delete passed notes
    
		    this.bodies = this.bodies.filter(
		    	(n) => n.material !== this.transparent && n.center[2] < 2
		    );
		}
	}

	display(context, program_state) {
		// display(): Draw everything else in the scene besides the moving bodies.
		super.display(context, program_state);
		if (!context.scratchpad.controls) {
			// this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
			// this.children.push(new defs.Program_State_Viewer());
			
			//program_state.set_camera(Mat4.translation(0, -6, -20)); // original camera position
            program_state.set_camera(Mat4.look_at(vec3(0, 9, 14), vec3(0, -3, -20), vec3(0, 1, 0)));

			// Locate the camera here (inverted matrix).
		}
		if (this.playaudio && !this.gameover) {
		    this.audio.play();
		    this.playaudio = false;
		}
		if (this.audio.ended && this.end_cheer <= 1 && !this.gameover) {
			this.ending_cheer.play();
			this.playcheer = false;
			this.end_cheer++;
			this.ending_animation = true;
		}
		if (this.ending_animation && !this.gameover) {
			program_state.set_camera(Mat4.translation(0, -6, -20));
			let end_transform = Mat4.identity();
            end_transform = end_transform.times(Mat4.translation(0, 6, 0));
            end_transform = end_transform.times(Mat4.scale(14, 8, 4));
            this.shapes.cube.draw(context, program_state, end_transform, this.you_rock);
		}
		    
			program_state.projection_transform = Mat4.perspective(
				Math.PI / 4,
				context.width / context.height,
				1,
				100
			);

			const light_position = vec4(0, 10, 5, 1);
			const second_light_position = vec4(0, 10, -30, -1);
			const stage_light1 = vec4(0, 5, 5, 1);
			program_state.lights = [
				new Light(light_position, color(1, 1, 1, 1), 1000000),
				new Light(second_light_position, color(1, 1, 1, 1), 1000),
			];

		// Draw an extra bounding sphere around each drawn shape to show
		// the physical shape that is really being collided with:
		//const {points, leeway} = this.collider[this.collider_selection];
		//const size = vec3(1 + leeway, 1 + leeway, 1 + leeway);
		//for (let b of this.bodies)
		//    points.draw(context, program_state, b.drawn_location.times(Mat4.scale(...size)), this.bright, "LINE_STRIP");
        
        let t = (program_state.animation_time) / 10000;
        //console.log('Misses: ', this.stats.misses)

		let guitar_neck_transform = Mat4.identity();

		// Guitarneck
		//
        // neck/body
        if (!this.gameover) {
            guitar_neck_transform = guitar_neck_transform.times(Mat4.translation(0, -1, -5));
		    guitar_neck_transform = guitar_neck_transform.times(Mat4.scale(-4.1, 0.1, 16));
	        guitar_neck_transform = guitar_neck_transform.times(Mat4.rotation(1, -1, 0, 0));
            this.shapes.cube_neck.draw(context, program_state, guitar_neck_transform, this.neck_overlay)
            // neck edges      
            let edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(4.2, -1.175, -5.3))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.1, 0.1, 22))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#bfbbbb')}))
            edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(-4.2, -1.175, -5.3))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.1, 0.1, 22))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#bfbbbb')}))
            // lane lines
            edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(3, -0.91, -13.5))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.02, 0.05, 13))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#8f9294'), ambient:0.1}))
            edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(1, -0.91, -13.5))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.02, 0.05, 13))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#8f9294'), ambient:0.1}))
            edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(-1, -0.91, -13.5))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.02, 0.05, 13))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#8f9294'), ambient:0.1}))
            edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(-3, -0.91, -13.5))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.02, 0.05, 13))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#8f9294'), ambient:0.1}))
            // perp line 
            edge_neck_transform = Mat4.identity();
            edge_neck_transform = edge_neck_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            edge_neck_transform = edge_neck_transform.times(Mat4.translation(1.09, -0.93, 0))
            edge_neck_transform = edge_neck_transform.times(Mat4.scale(.025, 0.1, 4.1))
            this.shapes.cube_neck.draw(context, program_state, edge_neck_transform, this.note_material.override({color: hex_color('#bfbbbb')}))
        }


        // Note pockets
        let note_pocket = Mat4.identity();
        note_pocket = note_pocket.times(Mat4.translation(-3,-0.05,0))
        note_pocket = note_pocket.times(Mat4.translation(0,-0.85,0.0)).times(Mat4.rotation(157.5/100,1,0,0)).times(Mat4.translation(0,0,0)).times(Mat4.scale(1,1,0.1));
        this.shapes.reg2d.draw(context, program_state, note_pocket, this.note_material.override({color: hex_color('#1d8522'), ambient: 0.7, specularity: 0.3}))
        note_pocket = note_pocket.times(Mat4.translation(2,0,0))
        this.shapes.reg2d.draw(context, program_state, note_pocket, this.note_material.override({color: hex_color('#c21021'), ambient: 0.8 }))
        note_pocket = note_pocket.times(Mat4.translation(2,0,0))
        this.shapes.reg2d.draw(context, program_state, note_pocket, this.note_material.override({color: hex_color('#e6da3c'), ambient: 0.8 }))
        note_pocket = note_pocket.times(Mat4.translation(2,0,0))
        this.shapes.reg2d.draw(context, program_state, note_pocket, this.note_material.override({color: hex_color('#143973'), ambient: 0.8 }))










        

        
        // audience
        let human_transform = Mat4.identity();
        var hum_rot = 3.14
        var hum_tranX = -15
        var hum_tranY = -5
        var hum_tranZ = -25
        var pants;
        var shirt;
        var i_hum;
        var j_hum;


        for(j_hum = -25; j_hum >= -25; j_hum-=25) {
			var x_pos_arr_idx = 0
			hum_tranZ = j_hum;

			for(i_hum = -30; i_hum < 30; i_hum+=3) {

				// Add randomness to xpos
			
				hum_tranX = i_hum + this.x_pos_arr_rand[x_pos_arr_idx][0];
				hum_tranZ = hum_tranZ + this.x_pos_arr_rand[x_pos_arr_idx][1];

				// Assign pants
				if(this.x_pos_arr_rand[x_pos_arr_idx][2] == 0) {pants = this.clothes_jeans}
				if(this.x_pos_arr_rand[x_pos_arr_idx][2] == 1) {pants = this.clothes_pants_black}
				if(this.x_pos_arr_rand[x_pos_arr_idx][2] == 2) {pants = this.clothes_khaki}

				// Assign shirt color
				if(this.x_pos_arr_rand[x_pos_arr_idx][3] == 0) {shirt = hex_color('#2811bf')} //blue
				if(this.x_pos_arr_rand[x_pos_arr_idx][3] == 1) {shirt = hex_color('#000000')} //balck
				if(this.x_pos_arr_rand[x_pos_arr_idx][3] == 2) {shirt = hex_color('#ebe1e1')} //white
				if(this.x_pos_arr_rand[x_pos_arr_idx][3] == 3) {shirt = hex_color('#bf1b1b')} //red
				if(this.x_pos_arr_rand[x_pos_arr_idx][3] == 4) {shirt = hex_color('#56ad4e')} //gree 
				if(this.x_pos_arr_rand[x_pos_arr_idx][3] == 5) {shirt = hex_color('#87177a')} //purp

				x_pos_arr_idx++;

				var hum_rot2 = hum_rot-(i_hum/-50)

				// Torso
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0,2,0))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				human_transform = human_transform.times(Mat4.scale(0.3,0.2,1))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				/*rst*/ human_transform = human_transform.times(Mat4.scale(10/3.0,10/2.0,1))
				// Shoulders
				human_transform = human_transform.times(Mat4.translation(0,0,-0.5))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,0,1,0))
				human_transform = human_transform.times(Mat4.scale(0.2,0.2,0.85))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				/*rst*/ human_transform = human_transform.times(Mat4.scale(10.0/2,10.0/2,10/8.5))
				let human_transform2 = human_transform;
				// Left tricep (root of left forearem)
				human_transform = human_transform.times(Mat4.translation(-0.2,0.3,-0.6))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,1))
				human_transform = human_transform.times(Mat4.scale(0.11,0.1,0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				// Left forearm
				human_transform = human_transform.times(Mat4.scale(100/11,100/10,100/80))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/4,0,1,0))
				human_transform = human_transform.times(Mat4.scale(0.11,0.1,0.8))
				human_transform = human_transform.times(Mat4.translation(-2.9,0.2,-0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				// Right tricep
				human_transform2 = human_transform2.times(Mat4.translation(-0.6,0.3,1.1))
				human_transform2 = human_transform2.times(Mat4.rotation(Math.PI/2,-1,0,1))
				human_transform2 = human_transform2.times(Mat4.scale(0.11,0.1,0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform2, this.note_material.override({color: shirt}))
				// right forearm
				human_transform2 = human_transform2.times(Mat4.scale(100/11,100/10,100/80))
				human_transform2 = human_transform2.times(Mat4.rotation(-Math.PI/4,0,1,0))
				human_transform2 = human_transform2.times(Mat4.scale(0.11,0.1,0.8))
				human_transform2 = human_transform2.times(Mat4.translation(-2.9,0.2,-0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform2, this.note_material.override({color: shirt}))
				// Right thigh
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0.2,1,0))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/16,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				this.shapes.cylinder.draw(context, program_state, human_transform, pants)
				// Right calf
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0.3,0.05,0))
				human_transform = human_transform.times(Mat4.rotation(0,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				this.shapes.cylinder.draw(context, program_state, human_transform, pants)
				// Right shoe
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/4,0,-1,0))
				human_transform = human_transform.times(Mat4.translation(0.4,-0.5,-0.2))
				human_transform = human_transform.times(Mat4.scale(0.3,0.5,0.1))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/2,-3,0.4,0))
				this.shapes.torus.draw(context, program_state, human_transform, this.note_material.override({color: hex_color('#000000')}))
				// Left thigh
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(-0.2,1,0))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/16,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))    
				this.shapes.cylinder.draw(context, program_state, human_transform, pants)
				// Left calf
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(-0.3,0.05,0))
				human_transform = human_transform.times(Mat4.rotation(0,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				this.shapes.cylinder.draw(context, program_state, human_transform, pants)
				// Left shoe
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/4,0,-1,0))
				human_transform = human_transform.times(Mat4.translation(-0.4,-0.5,-0.2))
				human_transform = human_transform.times(Mat4.scale(0.3,0.5,0.1))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/2,-3,0.4,0))
				this.shapes.torus.draw(context, program_state, human_transform, this.note_material.override({color: hex_color('#000000')}))
				// Waist
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0,1.5,0))
				human_transform = human_transform.times(Mat4.scale(0.32,0.2,0.2))
				this.shapes.sub_sphere.draw(context, program_state, human_transform, pants)
				// head
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2/2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0,3,0))
				human_transform = human_transform.times(Mat4.scale(0.4,0.4,0.4))
				this.shapes.sub_sphere.draw(context, program_state, human_transform, this.clothes_head)
			}
	    }





	    // Stage
	    let stage_transform = Mat4.identity();
	    stage_transform = stage_transform.times(Mat4.translation(0,-5, -40))
	    stage_transform = stage_transform.times(Mat4.scale(40,1.5,8))
        this.shapes.cube.draw(context, program_state, stage_transform, this.stage_material)


        //audience floor
        stage_transform = Mat4.identity();
        stage_transform = stage_transform.times(Mat4.translation(0,-8, 0))
        stage_transform = stage_transform.times(Mat4.scale(40,1.5,40))
        this.shapes.floor.draw(context, program_state, stage_transform, this.floor_material)


        // score
        let score_dif = this.stats.hits - this.stats.misses;
        if (score_dif == 0) {
        	score_dif == 0
        }
        else {
        	score_dif = score_dif / 4;
        }
        let score_disX = 5;
        let score_disY = 3;
        let score_disZ = 0;
        let score_sensitivity = 4.3
        let score_transform = Mat4.identity();
        score_transform = score_transform.times(Mat4.translation(score_disX, score_disY, score_disZ));
        score_transform = score_transform.times(Mat4.scale(1.5,1.5,0.2))
        if (score_dif < -6) {
        	this.shapes.cylinder.draw(context, program_state, score_transform, this.score_material_red);
        	if (this.playboo) {
        		this.boo.play();
        		this.playclap = true;
        		this.playboo = false;
        	}
        }
        else if (score_dif > 7){
            this.shapes.cylinder.draw(context, program_state, score_transform, this.score_material_green);
            if (this.playcheer) {
                this.cheer.play();
                this.playclap = true;
                this.playcheer = false;
            }
        }
        else {
        	this.shapes.cylinder.draw(context, program_state, score_transform, this.score_material_yellow);
        	if (this.playclap) {
        		this.clap.play();
        		this.playcheer = true;
        		this.playboo = true;
        		this.playclap = false;
        	}
        }

        if (score_dif < -15) {
        	this.gameover = true;
        }
        if (this.gameover) {
			this.audio.pause();
			program_state.set_camera(Mat4.translation(0, -6, -20));
			let end_transform = Mat4.identity();
            end_transform = end_transform.times(Mat4.translation(0, 6, 1.5));
            end_transform = end_transform.times(Mat4.scale(11, 8, 4));
            this.shapes.cube.draw(context, program_state, end_transform, this.game_over);
            this.gameover_sound.play();
		}
        score_transform = score_transform.times(Mat4.scale(1/1.5,1/1.5,1/0.2))

        score_transform = Mat4.identity();        
        score_transform = score_transform.times(Mat4.translation(score_disX, score_disY, score_disZ));  
        score_transform = score_transform.times(Mat4.rotation(-score_dif/Math.PI/score_sensitivity,0,0,1)) 
        score_transform = score_transform.times(Mat4.translation(0, 0.7, 0));  
        score_transform = score_transform.times(Mat4.rotation(Math.PI/2,1,0,0)) 
        score_transform = score_transform.times(Mat4.scale(0.1,0.15,1.4))  
        this.shapes.cylinder.draw(context, program_state, score_transform, this.note_material.override({ambient:0, diffusivity:0.1}))


		    
        

        ///////////////////////// Pocket RAISES
        // Green Note pocket
        let pocket_transform = Mat4.identity();
        if (this.clicks[0] == true && this.pocket_raises.green_count > 2) {
        	this.clicks[0] = false;
        	this.pocket_raises.green_count = 0;
        }
        else if (this.clicks[0] == true && this.pocket_raises.green_count < 1) {
        	var perc = this.pocket_raises.green_count - Math.floor(this.pocket_raises.green_count)
        	pocket_transform = pocket_transform.times(Mat4.translation(0,1.4*perc,0))
        	this.pocket_raises.green_count += 0.2
        }
        else if(this.clicks[0] == true && this.pocket_raises.green_count >= 1) {
        	var perc = this.pocket_raises.green_count - Math.floor(this.pocket_raises.green_count)
        	pocket_transform = pocket_transform.times(Mat4.translation(0,-1.4*perc,0))
        	this.pocket_raises.green_count += 0.2
        }
        pocket_transform = pocket_transform.times(Mat4.translation(0,0.93,0))
        pocket_transform = pocket_transform.times(Mat4.scale(1,2,1))
        pocket_transform = pocket_transform.times(Mat4.translation(-3,-0.87,0))
        pocket_transform = pocket_transform.times(Mat4.scale(0.85,0.85,0.85))
        pocket_transform = pocket_transform.times(Mat4.rotation(157.5/100,1,0,0))

        this.shapes.reg2d.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#1d8522'), ambient: 0.9, specularity: 1}));
        pocket_transform = pocket_transform.times(Mat4.translation(0,0,0.501))
        this.shapes.cylinder.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#3e4042')}));
        pocket_transform = pocket_transform.times(Mat4.translation(0,300,0))

        // Yelow Note pocket
        pocket_transform = Mat4.identity();
        if (this.clicks[2] == true && this.pocket_raises.red_count > 2) {
        	this.clicks[2] = false;
        	this.pocket_raises.red_count = 0;
        }
        else if (this.clicks[2] == true && this.pocket_raises.red_count < 1) {
        	var perc = this.pocket_raises.red_count - Math.floor(this.pocket_raises.red_count)
        	pocket_transform = pocket_transform.times(Mat4.translation(0,1.4*perc,0))
        	this.pocket_raises.red_count += 0.2
        }
        else if(this.clicks[2] == true && this.pocket_raises.red_count >= 1) {
        	pocket_transform = pocket_transform.times(Mat4.translation(0,-1.4*perc,0))
        	this.pocket_raises.red_count += 0.2
        }
        pocket_transform = pocket_transform.times(Mat4.translation(0,0.93,0))
        pocket_transform = pocket_transform.times(Mat4.scale(1,2,1))
        pocket_transform = pocket_transform.times(Mat4.translation(1,-0.87,0))
        pocket_transform = pocket_transform.times(Mat4.scale(0.85,0.85,0.85))
        pocket_transform = pocket_transform.times(Mat4.rotation(157.5/100,1,0,0))
        this.shapes.reg2d.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#e6da3c'), ambient: 0.9, specularity: 1}));
        pocket_transform = pocket_transform.times(Mat4.translation(0,0,0.501))
        this.shapes.cylinder.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#3e4042')}));

        // Red Note pocket
        pocket_transform = Mat4.identity();
        if (this.clicks[1] == true && this.pocket_raises.yellow_count > 2) {
        	this.clicks[1] = false;
        	this.pocket_raises.yellow_count = 0;
        }
        else if (this.clicks[1] == true && this.pocket_raises.yellow_count < 1) {
        	var perc = this.pocket_raises.yellow_count - Math.floor(this.pocket_raises.yellow_count)
        	pocket_transform = pocket_transform.times(Mat4.translation(0,1.4*perc,0))
        	this.pocket_raises.yellow_count += 0.2
        }
        else if(this.clicks[1] == true && this.pocket_raises.yellow_count >= 1) {
        	pocket_transform = pocket_transform.times(Mat4.translation(0,-1.4*perc,0))
        	this.pocket_raises.yellow_count += 0.2
        }
        pocket_transform = pocket_transform.times(Mat4.translation(0,0.93,0))
        pocket_transform = pocket_transform.times(Mat4.scale(1,2,1))
        pocket_transform = pocket_transform.times(Mat4.translation(-1,-0.87,0))
        pocket_transform = pocket_transform.times(Mat4.scale(0.85,0.85,0.85))
        pocket_transform = pocket_transform.times(Mat4.rotation(157.5/100,1,0,0))
        this.shapes.reg2d.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#c21021'), ambient: 0.9, specularity: 1}));
        pocket_transform = pocket_transform.times(Mat4.translation(0,0,0.501))
        this.shapes.cylinder.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#3e4042')}));
        // Blue Note pocket
        pocket_transform = Mat4.identity();
        if (this.clicks[3] == true && this.pocket_raises.blue_count > 2) {
        	this.clicks[3] = false;
        	this.pocket_raises.blue_count = 0;
        }
        else if (this.clicks[3] == true && this.pocket_raises.blue_count < 1) {
        	var perc = this.pocket_raises.blue_count - Math.floor(this.pocket_raises.blue_count)
        	pocket_transform = pocket_transform.times(Mat4.translation(0,1.4*perc,0))
        	this.pocket_raises.blue_count += 0.2
        }
        else if(this.clicks[3] == true && this.pocket_raises.blue_count >= 1) {
        	pocket_transform = pocket_transform.times(Mat4.translation(0,-1.4*perc,0))
        	this.pocket_raises.blue_count += 0.2
        }
        pocket_transform = pocket_transform.times(Mat4.translation(0,0.93,0))
        pocket_transform = pocket_transform.times(Mat4.scale(1,2,1))
        pocket_transform = pocket_transform.times(Mat4.translation(3,-0.87,0))
        pocket_transform = pocket_transform.times(Mat4.scale(0.85,0.85,0.85))
        pocket_transform = pocket_transform.times(Mat4.rotation(157.5/100,1,0,0))
        this.shapes.reg2d.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#143973'), ambient: 0.9, specularity: 1}));
        pocket_transform = pocket_transform.times(Mat4.translation(0,0,0.501))
        this.shapes.cylinder.draw(context, program_state, pocket_transform, this.note_material.override({color: hex_color('#3e4042')}));






        ///////////////////////// FIRE RAISES
        // Green Note fire
        let fire_transform = Mat4.identity();
        if (this.fire_raises.green == true && this.fire_raises.green_count > 2) {
        	this.fire_raises.green = false;
        	this.fire_raises.green_count = 0;
        }
        else if (this.fire_raises.green == true && this.fire_raises.green_count < 1) {
        	var perc = this.fire_raises.green_count - Math.floor(this.fire_raises.green_count)
        	fire_transform = fire_transform.times(Mat4.translation(0,3*perc,0))
        	this.fire_raises.green_count += 0.1
        }
        else if(this.fire_raises.green == true && this.fire_raises.green_count >= 1) {
        	var perc = this.fire_raises.green_count - Math.floor(this.fire_raises.green_count)
        	fire_transform = fire_transform.times(Mat4.translation(0,-3*perc,0))
        	this.fire_raises.green_count += 0.1
        }
        fire_transform = fire_transform.times(Mat4.scale(1,2,0.000001))
        fire_transform = fire_transform.times(Mat4.translation(-3,-1.42,0))
        fire_transform = fire_transform.times(Mat4.scale(1.25,1,1))
        this.shapes.cube.draw(context, program_state, fire_transform, this.fire);
        // Red Note fire
        fire_transform = Mat4.identity();
        if (this.fire_raises.red == true && this.fire_raises.red_count > 2) {
        	this.fire_raises.red = false;
        	this.fire_raises.red_count = 0;
        }
        else if (this.fire_raises.red == true && this.fire_raises.red_count < 1) {
        	var perc = this.fire_raises.red_count - Math.floor(this.fire_raises.red_count)
        	fire_transform = fire_transform.times(Mat4.translation(0,3*perc,0))
        	this.fire_raises.red_count += 0.1
        }
        else if(this.fire_raises.red == true && this.fire_raises.red_count >= 1) {
        	fire_transform = fire_transform.times(Mat4.translation(0,-3*perc,0))
        	this.fire_raises.red_count += 0.1
        }
        fire_transform = fire_transform.times(Mat4.scale(1,2,0.000001))
        fire_transform = fire_transform.times(Mat4.translation(-1,-1.42,0))
        fire_transform = fire_transform.times(Mat4.scale(1.25,1,1))
        this.shapes.cube.draw(context, program_state, fire_transform, this.fire);
        // Yellow Note fire
        fire_transform = Mat4.identity();
        if (this.fire_raises.yellow == true && this.fire_raises.yellow_count > 2) {
        	this.fire_raises.yellow = false;
        	this.fire_raises.yellow_count = 0;
        }
        else if (this.fire_raises.yellow == true && this.fire_raises.yellow_count < 1) {
        	var perc = this.fire_raises.yellow_count - Math.floor(this.fire_raises.yellow_count)
        	fire_transform = fire_transform.times(Mat4.translation(0,3*perc,0))
        	this.fire_raises.yellow_count += 0.1
        }
        else if(this.fire_raises.yellow == true && this.fire_raises.yellow_count >= 1) {
        	fire_transform = fire_transform.times(Mat4.translation(0,-3*perc,0))
        	this.fire_raises.yellow_count += 0.1
        }
        fire_transform = fire_transform.times(Mat4.scale(1,2,0.000001))
        fire_transform = fire_transform.times(Mat4.translation(1,-1.42,0))
        fire_transform = fire_transform.times(Mat4.scale(1.25,1,1))
        this.shapes.cube.draw(context, program_state, fire_transform, this.fire);
        // Blue Note fire
        fire_transform = Mat4.identity();
        if (this.fire_raises.blue == true && this.fire_raises.blue_count > 2) {
        	this.fire_raises.blue = false;
        	this.fire_raises.blue_count = 0;
        }
        else if (this.fire_raises.blue == true && this.fire_raises.blue_count < 1) {
        	var perc = this.fire_raises.blue_count - Math.floor(this.fire_raises.blue_count)
        	fire_transform = fire_transform.times(Mat4.translation(0,3*perc,0))
        	this.fire_raises.blue_count += 0.1
        }
        else if(this.fire_raises.blue == true && this.fire_raises.blue_count >= 1) {
        	fire_transform = fire_transform.times(Mat4.translation(0,-3*perc,0))
        	this.fire_raises.blue_count += 0.1
        }
        fire_transform = fire_transform.times(Mat4.scale(1,2,0.000001))
        fire_transform = fire_transform.times(Mat4.translation(3,-1.42,0))
        fire_transform = fire_transform.times(Mat4.scale(1.25,1,1))
        this.shapes.cube.draw(context, program_state, fire_transform, this.fire);







        //Guitar player

        // Torso
        shirt = hex_color('#56ad4e')
        hum_tranX = 0;
        hum_tranY = -3;
        hum_tranZ = -42;
        hum_rot2 = 0;
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0,2,0))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				human_transform = human_transform.times(Mat4.scale(0.3,0.2,1))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				/*rst*/ human_transform = human_transform.times(Mat4.scale(10/3.0,10/2.0,1))
				// Shoulders
				human_transform = human_transform.times(Mat4.translation(0,0,-0.5))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,0,1,0))
				human_transform = human_transform.times(Mat4.scale(0.2,0.2,0.85))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				/*rst*/ human_transform = human_transform.times(Mat4.scale(10.0/2,10.0/2,10/8.5))
				let human_transform2 = human_transform;
				// Left tricep (root of left forearem)
				human_transform = human_transform.times(Mat4.translation(-0.2,0.3,-0.6))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,1))
				human_transform = human_transform.times(Mat4.scale(0.11,0.1,0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				// Left forearm
				human_transform = human_transform.times(Mat4.scale(100/11,100/10,100/80))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/4,0,1,0))
				human_transform = human_transform.times(Mat4.scale(0.11,0.1,0.8))
				human_transform = human_transform.times(Mat4.translation(-2.9,0.2,-0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.note_material.override({color: shirt}))
				// Right tricep
				human_transform2 = human_transform2.times(Mat4.translation(-0.6,0.3,1.1))
				human_transform2 = human_transform2.times(Mat4.rotation(Math.PI/2,-1,0,1))
				human_transform2 = human_transform2.times(Mat4.scale(0.11,0.1,0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform2, this.note_material.override({color: shirt}))
				// right forearm
				human_transform2 = human_transform2.times(Mat4.scale(100/11,100/10,100/80))
				human_transform2 = human_transform2.times(Mat4.rotation(-Math.PI/4,0,1,0))
				human_transform2 = human_transform2.times(Mat4.scale(0.11,0.1,0.8))
				human_transform2 = human_transform2.times(Mat4.translation(-2.9,0.2,-0.8))
				this.shapes.cylinder.draw(context, program_state, human_transform2, this.note_material.override({color: shirt}))
				// Right thigh
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0.2,1,0))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/16,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.clothes_pants_black)
				// Right calf
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0.3,0.05,0))
				human_transform = human_transform.times(Mat4.rotation(0,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.clothes_pants_black)
				// Right shoe
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/4,0,-1,0))
				human_transform = human_transform.times(Mat4.translation(0.4,-0.5,-0.2))
				human_transform = human_transform.times(Mat4.scale(0.3,0.5,0.1))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/2,-3,0.4,0))
				this.shapes.torus.draw(context, program_state, human_transform, this.note_material.override({color: hex_color('#000000')}))
				// Left thigh
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(-0.2,1,0))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/16,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))    
				this.shapes.cylinder.draw(context, program_state, human_transform, this.clothes_pants_black)
				// Left calf
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(-0.3,0.05,0))
				human_transform = human_transform.times(Mat4.rotation(0,0,0,1))
				human_transform = human_transform.times(Mat4.scale(0.15,1,0.15))
				human_transform = human_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
				this.shapes.cylinder.draw(context, program_state, human_transform, this.clothes_pants_black)
				// Left shoe
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/4,0,-1,0))
				human_transform = human_transform.times(Mat4.translation(-0.4,-0.5,-0.2))
				human_transform = human_transform.times(Mat4.scale(0.3,0.5,0.1))
				human_transform = human_transform.times(Mat4.rotation(-Math.PI/2,-3,0.4,0))
				this.shapes.torus.draw(context, program_state, human_transform, this.note_material.override({color: hex_color('#000000')}))
				// Waist
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0,1.5,0))
				human_transform = human_transform.times(Mat4.scale(0.32,0.2,0.2))
				this.shapes.sub_sphere.draw(context, program_state, human_transform, this.clothes_pants_black)
				// head
				human_transform = Mat4.identity();
				/* DIS */ human_transform = human_transform.times(Mat4.translation(hum_tranX,hum_tranY,hum_tranZ))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(hum_rot2/4,0,1,0))
				/* DIS */ human_transform = human_transform.times(Mat4.rotation(-Math.PI/2,0,1,0))
				human_transform = human_transform.times(Mat4.translation(0,3,0))
				human_transform = human_transform.times(Mat4.scale(0.4,0.4,0.4))
				this.shapes.sub_sphere.draw(context, program_state, human_transform, this.clothes_head)

		
		// Guitar
		let guitar_transform = Mat4.identity()

	    //bottom body
	    guitar_transform = guitar_transform.times(Mat4.translation(hum_tranX-0.8,hum_tranY+0.8,hum_tranZ+0.5))
	    guitar_transform = guitar_transform.times(Mat4.scale(0.48,0.48,0.1))
	    this.shapes.cylinder.draw(context,program_state,guitar_transform, this.note_material.override({color: hex_color('#000000')}))
	    //top body
	    guitar_transform = Mat4.identity()
	    guitar_transform = guitar_transform.times(Mat4.translation(hum_tranX-0.2,hum_tranY+1.2,hum_tranZ+0.5))
	    guitar_transform = guitar_transform.times(Mat4.scale(0.4,0.4,0.1))
	    this.shapes.cylinder.draw(context,program_state,guitar_transform, this.note_material.override({color: hex_color('#000000')}))
	    guitar_transform = Mat4.identity()
        guitar_transform = guitar_transform.times(Mat4.translation(hum_tranX+0.8,hum_tranY+1.9,hum_tranZ+0.5))
	    guitar_transform = guitar_transform.times(Mat4.rotation(-Math.PI/3.3,0,0,1))
	    guitar_transform = guitar_transform.times(Mat4.scale(0.1,1,0.02))
	    this.shapes.cube.draw(context,program_state,guitar_transform, this.note_material.override({color: hex_color('#4c4d4f')}))

	    let background = Mat4.identity();
	    background = background.times(Mat4.translation(0,4,-48))
	    background = background.times(Mat4.scale(40,15,1))
	    this.shapes.cube.draw(context,program_state,background, this.back_mat)
   
	}

}















class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:

                vec2 f_tex_new = f_tex_coord;
                f_tex_new.x = f_tex_new.x - animation_time;
                vec4 tex_color = texture2D( texture, f_tex_new);



                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
    

            void main(){
                // Sample the texture image in the correct place:

                vec2 f_tex_new = f_tex_coord;
                f_tex_new.x = f_tex_new.x - 0.5;
                f_tex_new.y = f_tex_new.y - 0.5;
                f_tex_new =  mat2( cos(animation_time), -sin(animation_time), sin(animation_time), cos(animation_time) ) * f_tex_new;
                f_tex_new.x = f_tex_new.x + 0.5;
                f_tex_new.y = f_tex_new.y + 0.5;

                vec4 tex_color = texture2D( texture, f_tex_new);

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}
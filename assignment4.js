import {Body, Simulation} from "./examples/collisions-demo.js";
import { defs, tiny } from "./examples/common.js";

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
			cube: new defs.Cube()
		};


		// Collider:
		this.collider = {intersect_test: Body.intersect_cube, points: new defs.Cube(), leeway: .1};

		// Materials:
		const phong = new defs.Phong_Shader(1);
		this.note_material = new Material(phong, {
			color: color(1, 1, 1, 1),
			ambient: .4,
		});

		this.hit_material = new Material(phong, {
			color: color(0, 1, 0, 1)
		})

		this.transparent = new Material(phong, {
			color: color(1, 1, 1, 0)
		})

		this.start = true; //Used to create hitboxes as
							//we cant create them outside
							//of the update_state function
		//Song Data:
		//Notes of format time(s), lane
		//where time is when note appears
		//not when it should be hit
		//TODO: may change in future
		this.notes = [
					new Note(1, 0),
					new Note(1, 2),
					new Note(4, 1),
					new Note(4, 0),
					new Note(5, 3),
					new Note(6, 0),
					new Note(7, 0),
					new Note(8, 0),
				];

		this.distance = -30;
		this.velocity = 6;

		this.lanes = [
			Mat4.identity().times(Mat4.translation(-6, 0, 0)),
			Mat4.identity().times(Mat4.translation(-2, 0, 0)),
			Mat4.identity().times(Mat4.translation(2, 0, 0)),
			Mat4.identity().times(Mat4.translation(6, 0, 0)),
		]

		this.clicks = [false, false, false, false]

		this.hitboxes = null;

		this.stats = {
			streak: 0,
			points: 0,
			misses: 0,
			hits: 0,
			combo: 1
		}
		
		var audio = new Audio("bnb.mp3");
		audio.play();
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
			["w"],
			() => (this.clicks[1] = true),
			"#4400ff",
			() => (this.clicks[1] = false)
		);
		this.key_triggered_button(
			"Third",
			["s"],
			() => (this.clicks[2] = true),
			"#00fff7",
			() => (this.clicks[2] = false)
		);
		this.key_triggered_button(
			"Fourth",
			["d"],
			() => (this.clicks[3] = true),
			"#ff8400",
			() => (this.clicks[3] = false)
		);
		super.make_control_panel();
	}


	update_state(dt) {
		// update_state():  Override the base time-stepping code to say what this particular
		// scene should do to its bodies every frame -- including applying forces.
		//If first iteration generate hitbox blocks
		if (this.start) {
			for (let i of this.lanes) {
				this.bodies.push(
					new Body(this.shapes.cube, this.note_material, vec3(1, 1, 1)).emplace(
						i,
						vec3(0, 0, 0),
						0
					)
				);
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
				this.bodies.push(
					new Body(this.shapes.cube, this.note_material, vec3(1, 1, 1)).emplace(
						this.lanes[this.notes[i].lane].times(
							Mat4.translation(0, 1, this.distance)
						),
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
					this.stats.hits++;
					this.stats.streak++;
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
			this.stats.misses += missed_notes;
			this.stats.streak = 0;
			//TODO add note missed animation / color
		}

		//Delete passed notes

		this.bodies = this.bodies.filter(
			(n) => n.material !== this.transparent && n.center[2] < 2
		);
	}

	display(context, program_state) {
		// display(): Draw everything else in the scene besides the moving bodies.
		super.display(context, program_state);
		if (!context.scratchpad.controls) {
			// this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
			// this.children.push(new defs.Program_State_Viewer());
			program_state.set_camera(Mat4.translation(0, -5, -15));
			// Locate the camera here (inverted matrix).
		}
			program_state.projection_transform = Mat4.perspective(
				Math.PI / 4,
				context.width / context.height,
				1,
				100
			);

			const light_position = vec4(0, 10, 5, 1);
			const second_light_position = vec4(0, 10, -30, -1);
			program_state.lights = [
				new Light(light_position, color(1, 1, 1, 1), 1000000),
				new Light(second_light_position, color(1, 1, 1, 1), 1000000),
			];

		// Draw an extra bounding sphere around each drawn shape to show
		// the physical shape that is really being collided with:
		// const {points, leeway} = this.colliders[this.collider_selection];
		// const size = vec3(1 + leeway, 1 + leeway, 1 + leeway);
		// for (let b of this.bodies)
		// 	points.draw(context, program_state, b.drawn_location.times(Mat4.scale(...size)), this.bright, "LINE_STRIP");
	}

}
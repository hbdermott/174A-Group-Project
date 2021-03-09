import {Body, Simulation, Test_Data} from "./examples/collisions-demo.js";
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

		this.lanes = [
			Mat4.identity().times(Mat4.translation(-6, 0, 0)),
			Mat4.identity().times(Mat4.translation(-2, 0, 0)),
			Mat4.identity().times(Mat4.translation(2, 0, 0)),
			Mat4.identity().times(Mat4.translation(6, 0, 0)),
		]

		this.clicks = [false, false, false, false]

		this.hitboxes = null;
	}

	make_control_panel() {
		this.key_triggered_button(
			"First",
			["g"],
			() => (this.clicks[0] = true),
			"#ff00a2",
			() => (this.clicks[0] = false)
		);
		this.key_triggered_button(
			"Second",
			["h"],
			() => (this.clicks[1] = true),
			"#4400ff",
			() => (this.clicks[1] = false)
		);
		this.key_triggered_button(
			"Third",
			["j"],
			() => (this.clicks[2] = true),
			"#00fff7",
			() => (this.clicks[2] = false)
		);
		this.key_triggered_button(
			"Fourth",
			["k"],
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
		if(this.start){
			for (let i of this.lanes) {
				this.bodies.push(
					new Body(this.shapes.cube, undefined, vec3(1, 1, 1)).emplace(
						i,
						vec3(0, 0, 0),
						0
					)
				);
			}
			this.start = false;
			this.hitboxes = this.bodies.slice();
		}

		//Create new notes
		for(let i = 0; i < this.notes.length; i++){
			if(this.notes[i].time <= this.t){
				this.bodies.push(
					new Body(this.shapes.cube, this.note_material, vec3(1, 1, 1)).emplace(
						this.lanes[this.notes[i].lane].times(Mat4.translation(0, 1, -30)),
						vec3(0, 0, 5),
						0
					)
				);
			}	
			else{
				break;
			}
		}

		//Remove all newly created notes from array
		this.notes = this.notes.filter(n => n.time > this.t);

		for (let a of this.bodies) {
			a.inverse = Mat4.inverse(a.drawn_location);
			a.material = a.material === this.hit_material ? this.hit_material : this.note_material;

			// *** Collision process is here ***
			// Loop through all bodies again (call each "b"):
			for (let b = 0; b < this.hitboxes.length; b++) {
				// Pass the two bodies and the collision shape to check_if_colliding():
				if (a !== b && a.check_if_colliding(this.hitboxes[b], this.collider)){
					let flag = false;
					switch(b){
						case 0:
							if(this.clicks[0]){
								flag = true;
							}
							break;
						case 1:
							if (this.clicks[1]) {
								flag = true;
							}
							break;
						case 2:
							if (this.clicks[2]) {
								flag = true;
							}
							break;
						case 3:
							if (this.clicks[3]) {
								flag = true;
							}
							break;
					}
					if(flag){
						this.hitboxes[b].material = this.hit_material;
						a.material = this.transparent;
					}
				}
			}
		}
		this.bodies = this.bodies.filter(n => n.material !== this.transparent);
	}

	display(context, program_state) {
		// display(): Draw everything else in the scene besides the moving bodies.
		super.display(context, program_state);
		if (!context.scratchpad.controls) {
			this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
			this.children.push(new defs.Program_State_Viewer());
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
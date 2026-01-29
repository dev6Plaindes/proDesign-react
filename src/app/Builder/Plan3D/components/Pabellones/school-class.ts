import { Classroom } from "./components/Classroom/classrooms-class";
import { Bathroom } from "./bathroom-class";
import { SoccerField } from "./soccerField-class";
import { Stairs } from "./stairs-class";
import { Terrain } from "./terrain-class";
import { Corridor } from "./corridor-class";
import { Levels } from "./levels-class";
import { getSky } from "./getSky";
import AreaVertices from "../../../../components/AreaData/AreaVertices";
import AreaMaxRectangle from "../../../../components/AreaData/AreaMaxRectangle";

export class School {
	public classroom: Classroom;
	public bathroom: Bathroom;
	public terrain: Terrain;
	public stairs: Stairs;
	public soccerField: SoccerField;
	public corridor: Corridor;

	public zone: string;
	public type: string;

	public numberOfClassrooms: Levels;
	public numberOfStudents: Levels;

	public levels: string[];
	public vertices: string[];
	public verticesRectangle: string[];
	public angle: number;
	public numberFloors: string[];
	public complementaryEnvironment: string[];

	public totalStudents: number;

	public maxCapacity: number;

	public partialArea: number;
	public totalArea: number;
	public circulationArea: number;
	public length: number;
	public width: number;

	public generalArea: number;
	public floors: number;

	public sky: any;

	// amount of classrooms and bathrooms del school.
	public _classrooms: any;
	public _bathrooms: any;

	public classrooms: any;
	public bathrooms: any; // momentaneo - cambiar manera, nombre o algo... pensando

	private maxClassroomsForPeine: number;
	private maxClassroomsPeineForFloor: number;

	private _remainingClassrooms: number;

	public pab: any;

	constructor() {
		// Seria algo como crear todo la clase School una vez y cambiar los parametros con setters segun se requiera por proyecto (maqueta).
		//?Cuando se crea una instancia school, se inicializan las estructuras basicas
		this.classroom = new Classroom();
		this.terrain = new Terrain();
		this.bathroom = new Bathroom();
		this.stairs = new Stairs();
		this.soccerField = new SoccerField();
		this.corridor = new Corridor();

		this.sky = getSky();
	}

	setMaxCapacity(value: number) {
		this.maxCapacity = value;
	}

	setPartialArea(area: number) {
		this.partialArea = area;
	}

	setTotalArea(area: number) {
		this.totalArea = area;
	}

	setCirculationArea(area: number) {
		this.circulationArea = area;
	}
	setLength(value: number) {
		this.length = value;
	}
	setWidth(value: number) {
		this.width = value;
	}
	setComplementaryEnvironment(value: any) {
		if (Array.isArray(value)) {
			this.complementaryEnvironment = value;
		} else {
			console.warn(
				"Valor inválido para complementaryEnvironment:",
				value
			);
			this.complementaryEnvironment = []; // fallback seguro
		}
	}

	//?Establece el area general, ajusta la posicion del pasillo y el campo de futbol
	setGeneralArea(area: number) {
		this.generalArea = area;
		this.terrain.setLength(area);
		this.corridor.setPosition(this.terrain.length, this.classroom.width);
		//this.soccerField.setPosition(-674.5368781616021);
		this.soccerField.setPosition(this.terrain.length);
	}

	setNumberOfClassrooms(
		inicial: number,
		primaria: number,
		secundaria: number
	) {
		this.numberOfClassrooms = new Levels(inicial, primaria, secundaria);
	}

	setNumberOfStudents(inicial: number, primaria: number, secundaria: number) {
		this.numberOfStudents = new Levels(inicial, primaria, secundaria);
	}

	setLevels(levels: string[]) {
		this.levels = levels;
	}
	setVertices(vertices: string[] | string) {
		if (typeof vertices === "string") {
			try {
				// Primer parse
				let parsed = JSON.parse(vertices);

				// Si después del parse sigue siendo string, parsear de nuevo
				if (typeof parsed === "string") {
					parsed = JSON.parse(parsed);
				}

				this.vertices = parsed;
			} catch (error) {
				console.error("Error al parsear vertices:", error);
				this.vertices = [];
			}
		} else {
			this.vertices = vertices;
		}
	}

	setVerticesRectangle(verticesRectangle: string[] | string) {
		if (typeof verticesRectangle === "string") {
			try {
				// Primer parse
				let parsed = JSON.parse(verticesRectangle);

				// Si después del parse sigue siendo string, parsear de nuevo
				if (typeof parsed === "string") {
					parsed = JSON.parse(parsed);
				}

				this.verticesRectangle = parsed;
			} catch (error) {
				console.error("Error al parsear verticesRectangle:", error);
				this.verticesRectangle = [];
			}
		} else {
			this.verticesRectangle = verticesRectangle;
		}
	}
	setNumberFloors(numberFloors: string[]) {
		this.numberFloors = numberFloors;
	}
	setAngle(value: number) {
		this.angle = value;
	}
	setType(type: string) {
		this.type = type;
	}

	setZone(zone: string) {
		this.zone = zone;
	}

	//?Este método recibe un objeto con los datos del proyecto (como el JSON de state) y configura toda la escuela en base a ellos.

	setProjectData(state: any) {
		this.setVertices(state.vertices);
		this.setVerticesRectangle(state.vertices_rectangle);

		if (state.vertices && state.vertices.length >= 3) {
			const { area } = AreaVertices(this.vertices);
			this.setTotalArea(area);
		} else {
			this.setTotalArea(0); // o manejarlo como desees
		}
		this.setPartialArea(state.width);
		this.setWidth(state.width);
		this.setLength(state.height);
		// if (state.vertices_rectangle && state.vertices_rectangle.length >= 3) {
		// 	const { areaMax, length, width } = AreaMaxRectangle(
		// 		this.verticesRectangle
		// 	);
		// 	this.setPartialArea(areaMax);
		// 	this.setWidth(width);
		// 	this.setLength(length);
		// } else {
		// 	this.setPartialArea(0);
		// 	this.setWidth(0);
		// 	this.setLength(0);
		// }
		const niveles = (() => {
			try {
				return typeof state.level === "string"
					? JSON.parse(state.level)
					: state.level;
			} catch (e) {
				console.error("Error parseando niveles:", e);
				return [];
			}
		})();
		this.setLevels(Array.isArray(niveles) ? niveles : []);
		//this.setLevels(state.level);

		this.setAngle(state.angle);
		this.setType(state.sublevel);
		this.setZone(state.zone);
		const buildData =
			typeof state.build_data === "string" && state.build_data
				? JSON.parse(state.build_data)
				: state.build_data;
		this.setMaxCapacity(buildData?.result_data?.aforo_maximo);
		//this.setTotalArea(area);
		//this.setPartialArea(areaMax);
		//this.setWidth(width);
		//this.setLength(length);
		this.setNumberFloors(state.number_floors);
		//this.setPartialArea(buildData.result_data?.area_parcial);
		//this.setTotalArea(buildData.result_data?.area_total);
		this.setCirculationArea(buildData?.result_data?.circulacion);
		this.setGeneralArea(buildData?.construction_info?.area_general);

		let parsedAmbientes = [];

		try {
			let ambientesData =
				typeof state.ambientes === "string"
					? JSON.parse(state.ambientes)
					: state.ambientes;

			if (typeof ambientesData === "string") {
				console.log(
					"⚠️ Detectado doble escape en ambientes, parseando nuevamente"
				);
				ambientesData = JSON.parse(ambientesData);
			}

			parsedAmbientes = ambientesData;
		} catch (e) {
			console.error("Error al parsear 'state.ambientes':", e);
			parsedAmbientes = [];
		}
		this.setComplementaryEnvironment(parsedAmbientes);
		this.setGeneralArea(4550);

		const aforo =
			typeof state.aforo === "string"
				? JSON.parse(state.aforo)
				: state.aforo;
		this.setNumberOfStudents(
			aforo?.aforoInicial,
			aforo?.aforoPrimaria,
			aforo?.aforoSecundaria
		);
		this.setNumberOfClassrooms(
			aforo?.aulaInicial,
			aforo?.aulaPrimaria,
			aforo?.aulaSecundaria
		);

		this.pab = {
			1: {
				x: this.classroom.length,
				y: 0,
				z: this.terrain.length / 2,
				rotation: [0, Math.PI, 0],
				floors: [],
			},
			2: {
				x: -this.classroom.length,
				y: 0,
				z: this.terrain.length / -2,
				floors: [],
			},
		};

		this.setClassrooms();
		this.setBathrooms();
		this.setMaxClassroomsPeine();
	}

	//?Llena la lista classrooms con la cantidad de aulas según los niveles.
	setClassrooms() {
		const classrooms = [] as any;

		for (let level of this.levels) {
			classrooms.push(
				...Array(this.numberOfClassrooms[level]).fill(level)
			);
		}

		this.classrooms = classrooms;
		this._classrooms = classrooms.slice();
		this._remainingClassrooms = classrooms.length;
	}

	//?Calcula cuántos baños se necesitan por nivel y los almacena.
	setBathrooms() {
		const amountBaths = {
			inicial: Math.ceil(this.numberOfStudents.inicial / 25),
			primaria: Math.ceil(this.numberOfStudents.primaria / 60),
			secundaria: Math.ceil(this.numberOfStudents.secundaria / 60),
		};

		const bathrooms = [] as any[];

		for (let level of this.levels) {
			while (amountBaths[level] > 0) {
				const baths = amountBaths[level] >= 6 ? 6 : amountBaths[level];

				bathrooms.push({
					level,
					baths,
				});
				amountBaths[level] -= baths;
			}
		}

		this.bathrooms = bathrooms;
		this._bathrooms = bathrooms;
	}

	setMaxClassroomsPeine() {
		const maxClassroomsForPeine = Math.floor(
			(this.terrain.length -
				2 * (this.corridor.width + this.classroom.width)) /
				this.classroom.length
		);
		const maxClassroomsPeineForFloor = maxClassroomsForPeine * 3;

		this.maxClassroomsForPeine = maxClassroomsForPeine;
		this.maxClassroomsPeineForFloor = maxClassroomsPeineForFloor;
	}

	computeFloorClassrooms({ haveBathroom = true, haveStairs = false }) {
		let buildableTerrain = this.terrain.length;
		if (haveBathroom) buildableTerrain -= this.classroom.length;
		if (haveStairs) buildableTerrain -= this.stairs.width;

		return Math.floor(buildableTerrain / this.classroom.length);
	}

	//?Extrae una cantidad de baños disponibles.
	getBaths() {
		if (this._bathrooms.length > 0) {
			return this._bathrooms.shift().baths;
		} else return 0;
	}

	//?Extrae una cierta cantidad de aulas disponibles.
	getClassrooms(amount: number) {
		const arr = [] as any;
		for (let i = 0; i < amount; i++) {
			arr.push(this._classrooms.shift());
		}

		return arr;
	}

	//?Agrega un piso en un pabellón, distribuyendo aulas y baños.
	addFloor({ pab_n, floor_n }) {
		const baths = this.getBaths();
		const maxClassrooms = this.computeFloorClassrooms({
			haveBathroom: baths,
		});

		const amount =
			this._remainingClassrooms > maxClassrooms
				? maxClassrooms
				: this._remainingClassrooms;

		this.pab[pab_n].floors.push({
			classrooms: this.getClassrooms(amount),
			pab: pab_n,
			floor: floor_n,
			baths,
			maxClassrooms: maxClassrooms,
		});
		this._remainingClassrooms -= amount;
	}

	//? Agrega aulas en una disposición en "peine" a un piso específico.
	addPeine({ floor_n }) {
		let remainingClassrooms = this._remainingClassrooms;
		let currentFloor = floor_n;

		while (
			remainingClassrooms > 0 &&
			currentFloor <= this.pab[2].floors.length
		) {
			const availableSpace = this.maxClassroomsPeineForFloor;
			const classroomsToAssign = Math.min(
				availableSpace,
				remainingClassrooms
			);

			this.pab[2].floors[currentFloor - 1].classrooms_for_peine =
				this.getClassrooms(classroomsToAssign);

			remainingClassrooms -= classroomsToAssign;
			currentFloor++; // Pasar al siguiente piso
		}

		this._remainingClassrooms = 0; // Asegurarse de que ya no hay aulas pendientes
	}
}

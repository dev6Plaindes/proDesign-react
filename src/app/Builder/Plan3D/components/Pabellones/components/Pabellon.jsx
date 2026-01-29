import ClassroomGroup from "../../ClassroomGroup/ClassroomGroup";
import Entrance from "../../Entrance/Entrance";
import SSHH from "../../SSHH/SSHH";
import Stairs from "../../Stairs/Stairs";
import Classroom2D from "../../../../PlanFloor/components/Classroom2D/Classroom2D";
import Entrance2D from "../../../../PlanFloor/components/Entrance2D/Entrance2D";
import SSHH2D from "../../../../PlanFloor/components/SSHH2D/SSHH2D";
import Stairs2D from "../../../../PlanFloor/components/Stairs2D/Stairs2D";
import Floor from "../../Floor";
import FloorPeine from "../../FloorPeine";
import ComplementaryEnvironment2D from "../../../../PlanFloor/components/ComplementaryEnvironment2D/ComplementaryEnvironment2D";
import SSHH2D2 from "../../../../PlanFloor/components/SSHH2D/SSHH2D2";
import SSHHPeine from "../../SSHH/SSHHPeine";

export default function Pabellon({
	position,
	rotation,
	environment,
	classroom,
	bathroom,
	stairs,
	space,
	corridor,
	floors,
	length,
	view,
	_classrooms,
	_classroomsPrimaria,
	spaceEntrance,
	option,
	espacioDisponibleTop,
	// Nuevas props para selección
	onAulaSelect,
	onAulaHover,
	onAulaHoverEnd,
	selectedAula,
	hoveredAula,
}) {
	const _floors = [];

	const _floorsPeine2 = [];

	console.log("spaceentrance:::::::", spaceEntrance);

	const ordenarEnvironment = (environment, ambientesPorPiso) => {
		const prioridadEntrada = [
			"dirección administrativa",
			"sala de reuniones",
			"sala de maestros",
		];
		const ambientesEntrada = [];
		const laboratorios = [];
		const otrosAmbientes = [];

		for (const ambiente of environment) {
			const nombre = ambiente.ambienteComplementario?.toLowerCase();

			if (
				prioridadEntrada.some((p) => nombre?.includes(p.toLowerCase()))
			) {
				ambientesEntrada.push(ambiente);
			} else if (nombre?.includes("laboratorio de ciencias")) {
				laboratorios.push(ambiente);
			} else {
				otrosAmbientes.push(ambiente);
			}
		}

		const environmentByFloor = [];
		let primerPiso = [...ambientesEntrada];
		const espacioDisponible = ambientesPorPiso - primerPiso.length;

		if (espacioDisponible > 0) {
			primerPiso = primerPiso.concat(
				otrosAmbientes.splice(0, espacioDisponible)
			);
		}

		environmentByFloor.push(primerPiso);
		const restantes = [...otrosAmbientes, ...laboratorios];

		if (ambientesPorPiso > 0) {
			for (let i = 0; i < restantes.length; i += ambientesPorPiso) {
				environmentByFloor.push(
					restantes.slice(i, i + ambientesPorPiso)
				);
			}
		}

		return environmentByFloor;
	};

	const buildPeine2 = ({
		classrooms,
		floor,
		environment,
		totalEnvironment,
		space,
		ambientesExtra = [],
	}) => {
		const escaleras = 2;
		const baño = 3;

		const espacioParaAulas = space - baño - escaleras;

		let aulasPorPiso = Math.floor(espacioParaAulas / 9);
		const VAR_WIDTH = 300;
		const pabellonWidth = (aulasPorPiso * VAR_WIDTH) / 2;
		const separationBase = (aulasPorPiso / 2 - 2) * 100;
		const separationBaseBot = (aulasPorPiso / 2 - 2) * 450;

		const VAR_TOPZ = view.view === "3D" ? 500 : 600;
		const VAR_TOP = view.view === "3D" ? -1650 : -1650;
		const VAR_BOTTOMZ = view.view === "3D" ? 500 : 650;
		const VAR_BOTTOM = view.view === "3D" ? 1800 : 1480;

		const posicionesPorAulas = {
			7: {
				top: VAR_TOP,
				bottom: VAR_BOTTOM,
				topZ: VAR_TOPZ,
				bottomZ: VAR_BOTTOMZ,
			},
			5: {
				//top: -pabellonWidth + separationBase - 700,
				top: option === "A" ? -2000 : -600,
				//bottom: pabellonWidth + separationBaseBot - 450,
				//bottom: 0,
				topZ: option === "A" ? -1650 : -800,
				bottomZ: -900,
			}, // jose carlos mariategui
			6: {
				top: -pabellonWidth + separationBase - 700,
				//bottom: pabellonWidth + separationBaseBot - 470,
				topZ: -50,
				bottomZ: -100,
			}, // jose carlos mariategui
			4: { top: -1350, bottom: -60, topZ: 400, bottomZ: 450 },
			8: { top: -1620, bottom: 2320, topZ: 400, bottomZ: 250 }, // mushcay
			3: { top: -1000, bottom: 800, topZ: 400, bottomZ: 650 },
			10: {
				top: -pabellonWidth + separationBase,
				bottom: pabellonWidth + separationBaseBot,
				topZ: 400,
				bottomZ: 750,
			},
			11: { top: -1800, bottom: 3400, topZ: 300, bottomZ: 650 },
			12: { top: -2150, bottom: 4350, topZ: 400, bottomZ: 950 }, // moyorarca
			9: { top: -1850, bottom: 1800, topZ: -1300, bottomZ: 650 },
			13: { top: -1800, topZ: 400, bottomZ: 650 }, // Cesar Vallejo
			14: {
				top: -pabellonWidth + separationBase,
				bottom: pabellonWidth + separationBaseBot,
				topZ: 900,
				bottomZ: 1500,
			},
			15: { top: -1800, bottom: 1600 },
			17: { top: -1800, bottom: 1600 },
		};

		const aulasLaterales =
			_classrooms[0].classrooms.length +
			_classrooms[0].ambientesExtra.length; // cambio de cantidad de aulas en top y botton

		console.log("aulas laterales ::::sss::::", aulasLaterales);

		const posX = posicionesPorAulas[aulasLaterales];

		const posY = (floor - 1) * (view.view === "3D" ? 140 : 60);
		const sides = { top: [], bottom: [], midTop: [], midBottom: [] };

		const createSide = (side, elements, isEnv = false) => {
			let currentZ;

			if (side === "top") {
				currentZ =
					floor === 1 ? (elements.length < 3 ? 1370 : 700) : 700; // Valor fijo para pisos superiores
			} else {
				currentZ =
					floor === 1 ? (elements.length < 3 ? 2000 : 2800) : 2800; // Valor fijo para pisos superiores // 2800
			}

			for (let i = 0; i < elements.length; i++) {
				const el = elements[i];
				let room,
					level,
					isEntrance = false;

				if (el?.isEntrance) {
					room = el.component;
					level = "entrance";
					isEntrance = true;
				} else if (
					el?.level === "baño" ||
					el?.ambienteComplementario === "baño"
				) {
					// ← CAMBIO PRINCIPAL: Usar SSHHPeine para vista 3D
					room = view.view === "3D" ? SSHHPeine : SSHH2D2;
					level = "baño";
				} else if (el?.isSecundariaAula && espacioDisponibleTop > 75) {
					// NUEVO: Manejar aulas de secundaria
					room = view.view === "3D" ? ClassroomGroup : Classroom2D;
					level = el.level; // El nombre del aula de secundaria
				} else if (isEnv) {
					room =
						view.view === "3D"
							? ClassroomGroup
							: ComplementaryEnvironment2D;
					level = el.ambienteComplementario || "ambiente";
				} else if (typeof el === "string") {
					const ambientesComplementarios = [
						"Almacén general / Depósito de materiales",
						"Laboratorio",
						"Biblioteca escolar",
						"Taller creativo",
						"Lactario", //------> nuevo ambiente
					];

					const esAmbienteComplementario =
						ambientesComplementarios.includes(el) ||
						el.toLowerCase().includes("lactario");
					const esAmbienteEspecial = el
						.toLowerCase()
						.includes("sala de psicomotricidad");

					room =
						view.view === "3D"
							? ClassroomGroup
							: esAmbienteComplementario || esAmbienteEspecial
							? ComplementaryEnvironment2D
							: Classroom2D;
					level = el;
				}

				const aulasPorPiso = elements.length;
				const posX = elements.length <= 6 ? -100 : -140; // -40

				// ← SIMPLIFICADO: Ya no necesitamos props especiales para el baño
				const elementConfig = {
					position: [side === "top" ? posX : 350, 0, currentZ],
					rotation: [0, Math.PI / 2, 0],
					room,
					floor,
					level,
					n: isEntrance ? "entrance" : i,
					...(el?.isSecundariaAula &&
						espacioDisponibleTop > 75 && {
							onAulaSelect,
							onAulaHover,
							onAulaHoverEnd,
							selectedAula,
							hoveredAula,
						}),
				};

				sides[side].push(elementConfig);

				const longitudBase =
					side === "top"
						? aulasPorPiso === 5
							? classroom.length - 40
							: classroom.length
						: classroom.length + 10;
				let espaciadoInteligente;

				if (el?.isSecundariaAula && espacioDisponibleTop > 75) {
					// Espaciado específico para aulas de secundaria
					espaciadoInteligente = classroom.length; // O el espaciado que prefieras
				} else if (isEnv && el.ambienteComplementario) {
					espaciadoInteligente = getEspaciadoPorAmbientePeine(
						el.ambienteComplementario,
						longitudBase,
						view
					);
				} else if (typeof el === "string") {
					// Para ambientes extra y aulas regulares
					espaciadoInteligente = getEspaciadoPorAmbientePeine(
						el,
						longitudBase,
						view
					);
				} else {
					// Para baños, entradas, etc.
					espaciadoInteligente = longitudBase;
				}

				// Actualizar posición Z con espaciado inteligente
				currentZ +=
					side === "top"
						? espaciadoInteligente
						: -espaciadoInteligente;
			}
		};

		// Lado top: ambientes complementarios + baño + entrada
		let envWithEntrance = [...environment];

		// Insertar las aulas de secundaria al principio de los ambientes
		if (espacioDisponibleTop > 75) {
			const aulasSecundaria = _classrooms[1].classrooms.map((aula) => ({
				level: aula,
				isSecundariaAula: true, // Flag para identificarlas
			}));
			const aulasPrimaria = _classroomsPrimaria[1].classrooms.map(
				(aula) => ({
					level: aula,
					isSecundariaAula: true, // Flag para identificarlas
				})
			);
			envWithEntrance = [
				...aulasPrimaria,
				...envWithEntrance,
				...aulasSecundaria,
			];
		}

		//renderizacion del baño
		if (floor === 1) {
			const bañoTop = {
				ambienteComplementario: "baño",
				component: view.view === "3D" ? SSHHPeine : SSHH2D2,
			};
			const topIndex = Math.floor(envWithEntrance.length / 2); /// posicion de baño para ambientes complementarios
			envWithEntrance.splice(3, 0, bañoTop);
		}

		const needsEntranceTop = envWithEntrance.length >= 1;
		if (needsEntranceTop) {
			const entranceIndex = Math.floor(envWithEntrance.length / 2);
			const entranceComponent =
				view.view === "3D" ? Entrance : Entrance2D;
			envWithEntrance.splice(entranceIndex, 0, {
				isEntrance: true,
				component: entranceComponent,
			});
		}

		createSide("top", envWithEntrance, true);

		// Lado bottom: aulas del nivel inicial + baño
		if (Array.isArray(classrooms) && classrooms.length > 0) {
			let classroomsWithExtras = [
				...classrooms,
				...ambientesExtra, // Agregar los ambientes extra al final
			];

			//renderizacion del baño
			if (floor === 1) {
				const bañoBottom = {
					level: "baño",
					component: view.view === "3D" ? SSHHPeine : SSHH2D2,
				};
				const bottomIndex = Math.floor(classroomsWithExtras.length / 2);
				classroomsWithExtras.splice(bottomIndex, 0, bañoBottom);
			}

			createSide("bottom", classroomsWithExtras);
		}

		// Creación de espacio en medio
		const createMid = (elements) => {
			// topMid: EPT + SUM + Comedor + Cocina (AGREGAMOS Comedor y Cocina)
			const topMid = elements
				.filter(
					(element) =>
						element.ambienteComplementario === "Aula para EPT" ||
						element.ambienteComplementario ===
							"Sala de Usos Múltiples (SUM)" //||
					// element.ambienteComplementario === "Comedor" ||
					// element.ambienteComplementario === "Cocina escolar"
				)
				.sort((a, b) => {
					// Orden: EPT > SUM > Comedor > Cocina
					const orden = {
						"Aula para EPT": 1,
						"Sala de Usos Múltiples (SUM)": 2,
						// Comedor: 3,
						// "Cocina escolar": 4,
					};
					return (
						orden[a.ambienteComplementario] -
						orden[b.ambienteComplementario]
					);
				});

			// bottomMid: Comedor + Cocina (MANTIENEN su posición original)
			const bottomMid = elements
				.filter(
					(element) =>
						element.ambienteComplementario === "Cocina escolar" ||
						element.ambienteComplementario === "Comedor" ||
						element.ambienteComplementario === "Patio Inicial" ||
						element.ambienteComplementario === "Lactario" ||
						element.ambienteComplementario === "Topico" ||
						element.ambienteComplementario === "Auditorio multiusos"
				)
				.sort((a, b) => {
					const order = [
						//----> ordenamos los ambientes en bottomMid
						"Comedor",
						"Cocina escolar",
						"Patio Inicial",
						"Auditorio multiusos",
						"Lactario",
						"Topico",
					];
					return (
						order.indexOf(a.ambienteComplementario) -
						order.indexOf(b.ambienteComplementario)
					);
				});

			createSide("midTop", topMid, true);
			createSide("midBottom", bottomMid, true);
		};

		if (floor === 1 && totalEnvironment?.length > 0) {
			createMid(totalEnvironment);
		}

		// let midTopX;
		// let midTopZ;
		// let midBottomX;
		// let midTop3D;
		// let midTopZ3D;
		// let midBottom3D;
		// let midBottomZ3D;
		// let midBottomZ;
		// if (spaceEntrance < 80) {
		// 	midTopX = option === "A" ? -1500 : -500;
		// 	midBottomX = option === "A" ? 500 : 850; //700
		// 	midTop3D = option === "A" ? -1350 : -1500; //1150
		// 	midBottom3D = option === "A" ? 900 : 700;
		// 	midTopZ = option === "A" ? -2500 : -1200;
		// 	midBottomZ = -1800;
		// 	midTopZ3D = option === "A" ? -2300 : -400;
		// 	midBottomZ3D = option === "A" ? -1700 : 0;
		// } else {
		// 	(midTopZ = 0), (midTopX = -1500);
		// 	midBottomX = option === "A" ? 900 : 1700; //900
		// 	midTop3D = -1400;
		// 	midBottom3D = option === "A" ? 1000 : 2300;
		// 	midBottomZ = 500;
		// 	midTopZ3D = -100;
		// 	midBottomZ3D = option === "A" ? 400 : 250;
		// }
		const getConfig = (spaceEntrance, option) => {
			// Configuración base para spaceEntrance >= 80
			if (spaceEntrance >= 80) {
				return (
					{
						A: {
							midTopX: -1500,
							midBottomX: 900,
							midTop3D: -1350,
							midBottom3D: 1000,
							midTopZ: 0, // valor para >= 80
							midBottomZ: 500,
							midTopZ3D: -100,
							midBottomZ3D: 400,
						},
						B: {
							midTopX: -1500,
							midBottomX: 300, //1700
							midTop3D: -1500,
							midBottom3D: 2300,
							midTopZ: 0,
							midBottomZ: 500,
							midTopZ3D: -100,
							midBottomZ3D: 250,
						},
					}[option] || null
				);
			}

			// Para spaceEntrance < 80, empezamos con valores base
			const baseConfig = {
				A: {
					midTopX: -1500,
					midBottomX: 500,
					midTop3D: -1350,
					midBottom3D: 900,
					midTopZ: -2500, // valor base original 2500
					midBottomZ: -1800,
					midTopZ3D: -2300,
					midBottomZ3D: -1700,
				},
				B: {
					midTopX: -500,
					midBottomX: 850,
					midTop3D: -1500,
					midBottom3D: 700,
					midTopZ: -1200,
					midBottomZ: -1800,
					midTopZ3D: -400,
					midBottomZ3D: 0,
				},
			};

			const config = { ...baseConfig[option] };

			// Aplicar ajustes específicos según rangos
			if (option === "A") {
				if (spaceEntrance < 62) {
					config.midTopZ = -1900; // Valor específico para < 62 // -2500
				} else if (spaceEntrance >= 70 && spaceEntrance <= 79) {
					config.midTopZ = -300; // Valor específico para 70-79
					config.midBottomX = 4600;
					config.midBottomZ = 100;
				}
				// Entre 62-69 mantiene el valor base (-2500)
			}

			return config;
		};

		// Uso
		const config = getConfig(spaceEntrance, option);
		const {
			midTopX,
			midBottomX,
			midTop3D,
			midBottom3D,
			midTopZ,
			midBottomZ,
			midTopZ3D,
			midBottomZ3D,
		} = config;

		_floorsPeine2.push({
			sides: [
				{
					side: "top",
					classrooms: sides.top,
					position: [posX.top, posY, posX.topZ],
				},
				{
					side: "bottom",
					classrooms: sides.bottom,
					position: [posX.bottom, posY, posX.bottomZ],
				},
				{
					side: "midTop",
					classrooms: sides.midTop,
					position:
						// option === "A" ? [-800, posY, 400] : [-500, posY, 400], // ejemplo 1--->x: -1000, y:400
						view.view === "3D"
							? [midTop3D, posY, midTopZ3D]
							: option === "A"
							? [midTopX, posY, midTopZ]
							: //: [-500, posY, 400],
							  [midTopX, posY, midTopZ],
				},
				{
					side: "midBottom",
					classrooms: sides.midBottom,
					position:
						view.view === "3D"
							? [midBottom3D, posY, midBottomZ3D]
							: option === "A"
							? [midBottomX, posY, midBottomZ]
							: //[450, posY, -300] -------> falta buscar parametros
							  //: [1600, posY, 400], // ejemplo 1 ---> x:400 , y:400
							  [midBottomX, posY, midBottomZ],
				},
			],
			floor,
		});
	};

	const actualSize = spaceEntrance - 7.2 - 7.2 - 4 - 4 - 5;
	const aulasPorPisoMax = Math.floor(actualSize / 8);

	const filteredEnvironment = environment?.filter(
		(a) =>
			![
				"Sala de Psicomotricidad",
				"Almacén general / Depósito de materiales",
				"Sala de Usos Múltiples (SUM)",
				"Aula para EPT",
				"Cocina escolar",
				"Biblioteca escolar",
				"Laboratorio",
				"Comedor",
				"Lactario",
				"Patio Inicial",
				"Topico",
				"Auditorio multiusos",
			].includes(a.ambienteComplementario)
	);

	const filteredEnvironmentPeine = environment?.filter(
		(a) =>
			!["Almacén general / Depósito de materiales"].includes(
				a.ambienteComplementario
			)
	);

	let variable;

	if (length < 70) {
		variable = 2;
	} else {
		variable = 4;
	}

	const environmentByFloor = ordenarEnvironment(
		filteredEnvironment,
		variable
	);

	const buildFloor = (data, space) => {
		const classrooms = [];
		let bathroom = null;
		let stairs = null;

		let x = 0;
		let y = (data.floor - 1) * (view.view === "3D" ? 140 : 10);
		let z = 0;

		const totalAulas = data.classrooms.length;

		let classroomIndex = 0;
		const isNotLastFloor = data.floor < floors.length;
		const side1 = Math.ceil(data.classrooms.length / 2);
		const side2 = data.classrooms.length - side1;

		const ambientesComplementarios = [
			"Almacén general / Depósito de materiales",
			"Laboratorio",
			"Biblioteca escolar",
			"Taller creativo",
		];

		//posicionamiento de ambientes de primaria al inicio
		if (
			data.classrooms[0] === "primaria" &&
			data.ambientesExtra?.length > 0
		) {
			data.ambientesExtra.forEach((amb, index) => {
				classrooms.push({
					position: [x, y, z],
					floor: data.floor,
					level: amb,
					room:
						view.view === "3D"
							? ClassroomGroup
							: ComplementaryEnvironment2D,
					n: index,
				});
				// *** CAMBIO: Pasar el ambiente actual ***
				x = addClassroomPosition(x, totalAulas, amb, "primaria");
			});
		}

		// SIDE 1
		for (let i = 0; i < side1; i++) {
			const nombreAula = data.classrooms[classroomIndex];

			const esAmbienteComplementario =
				ambientesComplementarios.includes(nombreAula);

			classrooms.push({
				position: [x, y, z],
				floor: data.floor,
				level: nombreAula,
				room:
					view.view === "3D"
						? ClassroomGroup
						: esAmbienteComplementario
						? ComplementaryEnvironment2D
						: Classroom2D,
				n: classroomIndex,
			});

			// *** CAMBIO: Pasar el nombre del aula actual ***
			x = addClassroomPosition(x, totalAulas, nombreAula);
			classroomIndex++;
		}

		const hasMoreThanOneFloor = floors.length > 1;
		const isLastFloor = data.floor === floors.length;
		if (hasMoreThanOneFloor && !isLastFloor && data.floor) {
			x = stairsOffset(x, totalAulas);
			if (data.floor) {
				stairs = {
					position: [x, y, z],
					room: view.view === "3D" ? Stairs : Stairs2D,
					extraRoofWidth: isNotLastFloor,
					floor: data.floor,
				};
			}

			// *** CAMBIO: Sin ambiente específico para escaleras ***
			x = addClassroomPosition(x, totalAulas);
		}

		// BATHROOM
		if (floors[data.floor - 1].baths) {
			bathroom = {
				position: [x, y, z],
				room: view.view === "3D" ? SSHH : SSHH2D,
				baths: data.baths,
				floor: data.floor,
			};

			// *** CAMBIO: Sin ambiente específico para baño ***
			x = addClassroomPosition(x, totalAulas);
		}

		// SIDE 2
		for (let i = 0; i < side2; i++) {
			const nombreAula = data.classrooms[classroomIndex];
			const esAmbienteComplementario =
				ambientesComplementarios.includes(nombreAula);

			classrooms.push({
				position: [x, y, z],
				room:
					view.view === "3D"
						? ClassroomGroup
						: esAmbienteComplementario
						? ComplementaryEnvironment2D
						: Classroom2D,
				level: data.classrooms[classroomIndex],
				extraRoofWidth: true,
				floor: data.floor,
				n: classroomIndex,
			});

			// *** CAMBIO: Pasar el nombre del aula actual ***
			x = addClassroomPosition(x, totalAulas, nombreAula);
			classroomIndex++;
		}
		// posicionamiento de ambientes complemenatarios de Secundaria al final
		if (
			data.classrooms[0] === "secundaria" &&
			data.ambientesExtra?.length > 0
		) {
			data.ambientesExtra.forEach((amb, index) => {
				classrooms.push({
					position: [x, y, z],
					floor: data.floor,
					level: amb,
					room:
						view.view === "3D"
							? ClassroomGroup
							: ComplementaryEnvironment2D,
					n: classroomIndex + index,
				});
				// *** CAMBIO: Pasar el ambiente actual ***
				x = addClassroomPosition(x, totalAulas, amb, "secundaria");
			});
		}
		// posicionamiento de ambientes complementarios en inicial
		if (
			data.classrooms[0] === "inicial" &&
			data.ambientesExtra?.length > 0
		) {
			const ambientesOrdenados = [...data.ambientesExtra].sort((a, b) => {
				if (a.toLowerCase().includes("lactario")) return -1; // Lactario va primero
				if (b.toLowerCase().includes("lactario")) return 1;
				return 0; // Mantener orden original para los demás
			});

			ambientesOrdenados.forEach((amb, index) => {
				classrooms.push({
					position: [x, y, z], // puedes ajustar Z o X para posicionarlos
					floor: data.floor,
					level: amb,
					room:
						view.view === "3D"
							? ClassroomGroup
							: ComplementaryEnvironment2D,
					n: classroomIndex + index,
				});
				x = addClassroomPosition(x, totalAulas, amb, "inicial");
			});
		}

		if (data.classrooms[0] === "inicial") {
			const ambientesOrdenados = data.ambientesExtra
				? [...data.ambientesExtra].sort((a, b) => {
						if (a.toLowerCase().includes("lactario")) return -1;
						if (b.toLowerCase().includes("lactario")) return 1;
						return 0;
				  })
				: [];
			buildPeine2({
				classrooms: data.classrooms,
				floor: data.floor,
				environment: environmentByFloor[data.floor - 1] || [],
				length: length,
				totalEnvironment: filteredEnvironmentPeine,
				space,
				ambientesExtra: ambientesOrdenados,
			});
		} else {
			_floors.push({
				classrooms,
				bathroom,
				stairs,
				floor: data.floor,
				pab: data.pab,
			});
		}
	};

	for (let i = 0; i < floors.length; i++) {
		buildFloor(floors[i], space);
	}

	return (
		<group position={position} rotation={rotation}>
			{_floors.map((floor, index) => (
				<Floor
					key={index}
					classrooms={floor.classrooms}
					bathroom={floor.bathroom}
					stairs={floor.stairs}
					floor={floor.floor}
					view={view}
					//haveCorridor={false}
					haveCorridor={false}
					//havePeine={_floorsPeine[index + 1]}
					havePeine={false}
					_classroom={classroom}
					_bathroom={bathroom}
					_stairs={stairs}
					pab={floor.pab}
					length={length}
					name={"Aula_"}
					// Props de selección
					onAulaSelect={onAulaSelect}
					onAulaHover={onAulaHover}
					onAulaHoverEnd={onAulaHoverEnd}
					selectedAula={selectedAula}
					hoveredAula={hoveredAula}
				/>
			))}
			{_floorsPeine2.map((floor, index) => (
				<FloorPeine
					key={index}
					sides={floor.sides}
					floor={floor.floor}
					_classroom={classroom}
					floorsLength={_floorsPeine2.length}
					view={view}
					environment={floor.environment}
					_bathroom={bathroom}
					// Props de selección
					onAulaSelect={onAulaSelect}
					onAulaHover={onAulaHover}
					onAulaHoverEnd={onAulaHoverEnd}
					selectedAula={selectedAula}
					hoveredAula={hoveredAula}
				/>
			))}
		</group>
	);
}

// *** FUNCIÓN MODIFICADA: addClassroomPosition con espaciado dinámico ***
const addClassroomPosition = (
	x,
	nAulas,
	currentEnvironment = null,
	ambientes
) => {
	let baseSpacing;

	// Espaciado base según número de aulas
	if (nAulas === 4) {
		baseSpacing = -385;
	} else if (nAulas === 6 || nAulas === 7) {
		baseSpacing = -415;
	} else {
		baseSpacing = -400;
	}

	// Ajuste adicional según el tipo de ambiente
	let extraSpacing = 0;

	if (currentEnvironment) {
		const ambiente = currentEnvironment.toLowerCase();

		// Espaciado extra para ambientes específicos
		if (ambiente.includes("taller creativo")) {
			extraSpacing = -320;
		} else if (
			ambiente.includes("sala de usos múltiples") ||
			ambiente.includes("sum")
		) {
			extraSpacing = -800; // Extra para SUM (más grande)
		} else if (ambiente.includes("cocina escolar")) {
			extraSpacing = -1200; // Menos espacio para cocina (más pequeña)
		} else if (ambiente.includes("sala de reuniones")) {
			extraSpacing = 0; // Menos espacio para sala de reuniones (más pequeña)
		} else if (ambiente.includes("biblioteca escolar")) {
			extraSpacing = -310;
		} else if (ambiente.includes("laboratorio")) {
			extraSpacing = -10;
		} else if (ambiente.includes("comedor")) {
			extraSpacing = 300; // Menos espacio para sala de reuniones (más pequeña)
		}
	}

	return x + baseSpacing + extraSpacing;
};

const getEspaciadoPorAmbientePeine = (ambiente, longitudBase, view) => {
	if (!ambiente) return longitudBase;

	const ambienteLower = ambiente.toLowerCase();
	let ajuste = 0;

	// Ajustes específicos por tipo de ambiente (similar a addClassroomPosition)
	if (
		ambienteLower.includes("sala de usos múltiples") ||
		ambienteLower.includes("sum")
	) {
		ajuste = 720; // SUM es más grande, necesita más espacio
	} else if (ambienteLower.includes("cocina escolar")) {
		ajuste = -100; // Cocina es más pequeña
	} else if (ambienteLower.includes("comedor")) {
		ajuste = 0; // Comedor necesita más espacio
	} else if (ambienteLower.includes("aula para ept")) {
		ajuste = -100; // EPT necesita un poco más de espacio
	} else if (ambienteLower.includes("sala de reuniones")) {
		ajuste = 0; // Sala de reuniones es más pequeña
	} else if (ambienteLower.includes("biblioteca escolar")) {
		ajuste = -110; // Biblioteca necesita más espacio
	} else if (ambienteLower.includes("laboratorio")) {
		ajuste = -50; // Laboratorio necesita un poco más
	} else if (ambienteLower.includes("patio inicial")) {
		ajuste = 300;
	} else if (ambienteLower.includes("lactario")) {
		ajuste = -300;
	} else if (ambienteLower.includes("auditorio multiusos")) {
		ajuste = view.view === "3D" ? 210 : 410;
	}

	return longitudBase + ajuste;
};

const stairsOffset = (x, nAulas) => {
	if (nAulas === 4) return x + 415 - 155;
	if (nAulas === 6 || nAulas === 7) return x + 415 - 120;
	return x + 415 - 130;
};

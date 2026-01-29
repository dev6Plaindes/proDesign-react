import Pabellon from "./components/Pabellon";

export default function Pabellones({
	school,
	view,
	space,
	spaceEntrance,
	option,
	// Nuevas props para selección
	onAulaSelect,
	onAulaHover,
	onAulaHoverEnd,
	selectedAula,
	hoveredAula,
}) {
	const {
		classroom,
		bathroom,
		terrain,
		stairs,
		corridor,
		numberFloors,
		length,
		complementaryEnvironment,
		verticesRectangle,
		width,
		vertices,
	} = school;

	const pabellones = [];

	const SCALE_FACTOR = 80;

	// Función para calcular posiciones fijas en distribución rectangular perfecta
	const getFixedRectangularPositions = (aulasPorPiso) => {
		// Parámetros dinámicos basados en el número real de aulas
		const AULA_WIDTH = 400; //400 // Ancho estándar de aula en unidades 3D
		const SEPARATION_BASE = -50; // Separación base entre pabellones------> aqui esta el ajuste para alinear los pabellones
		//const SEPARATION_BASE = (length - 7 - 15) * 10;
		const CORRIDOR_WIDTH = 300; //ancho del corredor central

		// Calcular el largo real de cada pabellón basado en el número de aulas
		//const pabellonLength = aulasPorPiso * AULA_WIDTH;
		const pabellonLength = aulasPorPiso * AULA_WIDTH;
		// Calcular las dimensiones totales del rectángulo
		const rectangleWidth = pabellonLength + SEPARATION_BASE * 2;
		const rectangleHeight = pabellonLength + SEPARATION_BASE;

		// Posiciones calculadas dinámicamente para formar un rectángulo perfecto
		const VAR_SECUNDARIA = option === "A" ? -80 : 450;
		const VAR_INICIAL_X = option === "A" ? 8 : 16;
		const VAR_INICIAL_Z = option === "A" ? 750 : 50;

		//const VAR_PRIMARIA = option === "A" ? 800 : 500;
		const PRIMARIA_Z_B = view.view === "3D" ? -1400 : -1200;
		const PRIMARIA_Z_A = view.view === "3D" ? -1800 : -1520;
		const SECUNDARIA_Z_A = view.view === "3D" ? 800 : 700;

		const valoresPrimariaX = {
			A: {
				78.38354264944792: 1200,
				97.28360545635223: 2650,
				60.66778710857034: 450,
				65.6228068433702: 1500,
				38.50779786333442: 600,
				150.80931116640568: 1800,
			},
			B: {
				78.38354264944792: 950, // ejemplo
				97.28360545635223: 2200,
				60.66778710857034: 950,
				65.6228068433702: 1350,
				150.80931116640568: 1100,
			},
		};

		const valoresSecundariaX = {
			A: {
				78.38354264944792: -1712,
				97.28360545635223: -1050,
				60.66778710857034: -1250,
				65.6228068433702: -150,
				150.80931116640568: -3000,
			},
			B: {
				78.38354264944792: -1450, // ejemplo
				97.28360545635223: -2300,
				60.66778710857034: -1950,
				65.6228068433702: -350,
				150.80931116640568: -1000,
			},
		};

		const valoresPrimariaZ = {
			A: {
				78.38354264944792: -1880, /// 2180 se modifico por posicion en 3d--->-1880
				97.28360545635223: -4150,
				60.66778710857034: -2380,
				65.6228068433702: PRIMARIA_Z_A,
				38.50779786333442: -950,
				150.80931116640568: -1500,
			},
			B: {
				78.38354264944792: -1750, // ejemplo
				97.28360545635223: PRIMARIA_Z_B, ////////////
				60.66778710857034: -1500,
				65.6228068433702: -1150,
				150.80931116640568: -4750,
			},
		};

		const valoresSecundariaZ = {
			A: {
				78.38354264944792: 1770, ///1970 se modifico por posiscion en 3d
				97.28360545635223: 3370,
				60.66778710857034: 2350,
				65.6228068433702: SECUNDARIA_Z_A,
				150.80931116640568: 1300,
			},
			B: {
				78.38354264944792: 2150, // ejemplo
				97.28360545635223: 2450,
				60.66778710857034: 1680,
				65.6228068433702: 2350,
				150.80931116640568: 4100,
			},
		};
		const valoresInicialX = {
			A: {
				78.38354264944792: -387.5,
				97.28360545635223: 500,
				60.66778710857034: -70,
				65.6228068433702: 1000,
				38.50779786333442: 1000,
				150.80931116640568: -2500,
			},
			B: {
				78.38354264944792: -150, // ejemplo
				97.28360545635223: -800,
				60.66778710857034: -650,
				150.80931116640568: 400,
			},
		};
		const valoresInicialZ = {
			A: {
				78.38354264944792: -2150,
				97.28360545635223: -2500,
				60.66778710857034: -1150,
				38.50779786333442: 600,
				150.80931116640568: -1700,
			},
			B: {
				78.38354264944792: -1250, // ejemplo
				97.28360545635223: -1200,
				60.66778710857034: -1500,
				150.80931116640568: -4000,
			},
		};
		const prueba1 = valoresPrimariaX[option]?.[length] ?? 0;

		const prueba2 = valoresSecundariaX[option]?.[length] ?? 0;
		//const prueba2 = 4750.011377171613;

		const prueba3 = valoresPrimariaZ[option]?.[length] ?? 0;

		const prueba4 = valoresSecundariaZ[option]?.[length] ?? 0;

		const prueba5 = valoresInicialX[option]?.[length] ?? 0;

		const prueba6 = valoresInicialZ[option]?.[length] ?? 0;

		const positions = {
			// SECUNDARIA: Lado izquierdo (vertical)
			secundaria: {
				//x: -(rectangleWidth / 2) + CORRIDOR_WIDTH / 2 - 312, // lenght * 8 = ??280
				//x: -VAR_X_SECUNDARIA,
				x: prueba2, //-1050//prueba2
				y: 0, //-200
				//z: rectangleWidth / 2 + CORRIDOR_WIDTH + VAR_SECUNDARIA, // Centro del lado izquierdo
				z: prueba4, //3370
				//z: -VAR_Z,
				r: Math.PI, // Rotación 90° para orientación vertical
			},

			// PRIMARIA: Lado derecho (vertical)
			primaria: {
				//x: VAR_PRIMARIA,
				x: prueba1, //prueba1
				//x: VAR_X_SECUNDARIA,
				y: 0,
				//z: -(rectangleWidth / 2 - CORRIDOR_WIDTH) - 600, // Centro del lado derecho, mismo Z que secundaria
				z: prueba3,
				//z: VAR_Z - 100,
				r: 0, // Rotación -90° para orientación vertical
			},

			// INICIAL: Parte inferior (horizontal)
			inicial: {
				//x: -(rectangleWidth / VAR_INICIAL_X), // Centro horizontal entre secundaria y primaria
				x: prueba5,
				y: 0,
				z: prueba6,
				r: 0, // Sin rotación para orientación horizontal
			},
		};

		// Log para debugging
		console.log("Configuración de pabellones:", {
			aulasPorPiso,
			pabellonLength,
			rectangleWidth,
			rectangleHeight,
			positions,
		});

		return positions;
	};

	const almacen = complementaryEnvironment?.find(
		(item) =>
			item.ambienteComplementario ===
			"Almacén general / Depósito de materiales"
	);
	const psicomotricidad = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Sala de Psicomotricidad"
	);
	const laboratorio = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Laboratorio"
	);
	const biblioteca = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Biblioteca escolar"
	);
	const tallerCreativo = complementaryEnvironment.find(
		(item) => item.ambienteComplementario === "Taller creativo"
	);

	const aulasPorNivel = {
		secundaria: school.classrooms.filter((c) => c === "secundaria"),
		primaria: school.classrooms.filter((c) => c === "primaria"),
		inicial: school.classrooms.filter((c) => c === "inicial"),
	};

	const escaleras = 2;
	const baño = 3;

	const espacioParaAulas = space - baño - escaleras;
	console.log("space:", space);
	let aulasPorPiso = Math.floor(espacioParaAulas / 9);
	console.log("aulas por piso:", aulasPorPiso);

	// Obtener posiciones fijas con cálculo dinámico
	const nivelesConPosiciones = getFixedRectangularPositions(
		aulasPorPiso,
		school
	);

	// Nueva función: Distribuir aulas en las 4 posiciones fijas
	const distribuirAulasEnPosiciones = (
		school,
		complementaryEnvironment,
		aulasPorPiso
	) => {
		// Las 4 posiciones fijas en forma de U (NUNCA cambian)
		const POSICIONES_FIJAS = {
			izquierda: {
				// Secundaria por defecto
				x: -1050,
				y: -200,
				z: 3370,
				r: Math.PI,
				nombre: "izquierda",
			},
			derecha: {
				// Primaria por defecto
				x: 2650,
				y: -200,
				z: -4150,
				r: 0,
				nombre: "derecha",
			},
			bottom: {
				// Inicial por defecto
				x: 500,
				y: -200,
				z: -2500,
				r: 0,
				nombre: "bottom",
			},
			top: {
				// Ambientes por defecto
				x: -800,
				y: -200,
				z: 4000,
				r: 0,
				nombre: "top",
			},
		};

		// Detectar qué aulas/ambientes existen
		const aulasSecundaria = school.classrooms.filter(
			(c) => c === "secundaria"
		);
		const aulasPrimaria = school.classrooms.filter((c) => c === "primaria");
		const aulasInicial = school.classrooms.filter((c) => c === "inicial");

		const ambientesExcluidos = [
			"Sala de Psicomotricidad",
			"Almacén general / Depósito de materiales",
			"Biblioteca escolar",
			"Laboratorio",
			"Taller creativo",
		];

		const ambientesIndependientes =
			complementaryEnvironment?.filter(
				(a) => !ambientesExcluidos.includes(a.ambienteComplementario)
			) || [];

		// Objeto resultado: qué va en cada posición
		const distribucion = {};

		// ESTRATEGIA DE DISTRIBUCIÓN

		// CASO 1: Todos los niveles existen (distribución normal)
		if (
			aulasSecundaria.length > 0 &&
			aulasPrimaria.length > 0 &&
			aulasInicial.length > 0 &&
			ambientesIndependientes.length > 0
		) {
			distribucion.izquierda = {
				...POSICIONES_FIJAS.izquierda,
				aulas: aulasSecundaria,
				nivel: "secundaria",
			};
			distribucion.derecha = {
				...POSICIONES_FIJAS.derecha,
				aulas: aulasPrimaria,
				nivel: "primaria",
			};
			distribucion.bottom = {
				...POSICIONES_FIJAS.bottom,
				aulas: aulasInicial,
				nivel: "inicial",
			};
			distribucion.top = {
				...POSICIONES_FIJAS.top,
				aulas: [],
				ambientes: ambientesIndependientes,
				nivel: "ambientes",
			};
		}

		// CASO 2: NO hay primaria → Secundaria ocupa izquierda Y derecha
		else if (aulasSecundaria.length > 0 && aulasPrimaria.length === 0) {
			const mitad = Math.ceil(aulasSecundaria.length / 2);

			distribucion.izquierda = {
				...POSICIONES_FIJAS.izquierda,
				aulas: aulasSecundaria.slice(0, mitad), // Primera mitad
				nivel: "secundaria",
			};
			distribucion.derecha = {
				...POSICIONES_FIJAS.derecha,
				aulas: aulasSecundaria.slice(mitad), // Segunda mitad
				nivel: "secundaria",
			};

			// Inicial y ambientes en sus posiciones normales
			if (aulasInicial.length > 0) {
				distribucion.bottom = {
					...POSICIONES_FIJAS.bottom,
					aulas: aulasInicial,
					nivel: "inicial",
				};
			}
			if (ambientesIndependientes.length > 0) {
				distribucion.top = {
					...POSICIONES_FIJAS.top,
					aulas: [],
					ambientes: ambientesIndependientes,
					nivel: "ambientes",
				};
			}
		}

		// CASO 3: NO hay secundaria → Primaria ocupa izquierda Y derecha
		else if (aulasPrimaria.length > 0 && aulasSecundaria.length === 0) {
			const mitad = Math.ceil(aulasPrimaria.length / 2);

			distribucion.izquierda = {
				...POSICIONES_FIJAS.izquierda,
				aulas: aulasPrimaria.slice(0, mitad),
				nivel: "primaria",
			};
			distribucion.derecha = {
				...POSICIONES_FIJAS.derecha,
				aulas: aulasPrimaria.slice(mitad),
				nivel: "primaria",
			};

			if (aulasInicial.length > 0) {
				distribucion.bottom = {
					...POSICIONES_FIJAS.bottom,
					aulas: aulasInicial,
					nivel: "inicial",
				};
			}
			if (ambientesIndependientes.length > 0) {
				distribucion.top = {
					...POSICIONES_FIJAS.top,
					aulas: [],
					ambientes: ambientesIndependientes,
					nivel: "ambientes",
				};
			}
		}

		// CASO 4: NO hay inicial → Distribuir secundaria/primaria también en bottom
		else if (
			aulasInicial.length === 0 &&
			(aulasSecundaria.length > 0 || aulasPrimaria.length > 0)
		) {
			// Distribución normal de secundaria y primaria
			if (aulasSecundaria.length > 0) {
				distribucion.izquierda = {
					...POSICIONES_FIJAS.izquierda,
					aulas: aulasSecundaria,
					nivel: "secundaria",
				};
			}
			if (aulasPrimaria.length > 0) {
				distribucion.derecha = {
					...POSICIONES_FIJAS.derecha,
					aulas: aulasPrimaria,
					nivel: "primaria",
				};
			}

			// Bottom: usar el nivel que tenga más aulas o distribuir ambos
			if (aulasSecundaria.length > aulasPrimaria.length) {
				// Si secundaria tiene más, usar parte de secundaria en bottom
				const sobrantesSecundaria = aulasSecundaria.slice(aulasPorPiso);
				if (sobrantesSecundaria.length > 0) {
					distribucion.bottom = {
						...POSICIONES_FIJAS.bottom,
						aulas: sobrantesSecundaria,
						nivel: "secundaria",
					};
				}
			} else if (aulasPrimaria.length > 0) {
				const sobrantesPrimaria = aulasPrimaria.slice(aulasPorPiso);
				if (sobrantesPrimaria.length > 0) {
					distribucion.bottom = {
						...POSICIONES_FIJAS.bottom,
						aulas: sobrantesPrimaria,
						nivel: "primaria",
					};
				}
			}

			if (ambientesIndependientes.length > 0) {
				distribucion.top = {
					...POSICIONES_FIJAS.top,
					aulas: [],
					ambientes: ambientesIndependientes,
					nivel: "ambientes",
				};
			}
		}

		// CASO 5: NO hay ambientes → Distribuir aulas también en top
		else if (
			ambientesIndependientes.length === 0 &&
			(aulasSecundaria.length > 0 ||
				aulasPrimaria.length > 0 ||
				aulasInicial.length > 0)
		) {
			// Distribución normal
			if (aulasSecundaria.length > 0) {
				distribucion.izquierda = {
					...POSICIONES_FIJAS.izquierda,
					aulas: aulasSecundaria,
					nivel: "secundaria",
				};
			}
			if (aulasPrimaria.length > 0) {
				distribucion.derecha = {
					...POSICIONES_FIJAS.derecha,
					aulas: aulasPrimaria,
					nivel: "primaria",
				};
			}
			if (aulasInicial.length > 0) {
				distribucion.bottom = {
					...POSICIONES_FIJAS.bottom,
					aulas: aulasInicial,
					nivel: "inicial",
				};
			}

			// Top: usar sobrantes de algún nivel
			// (puedes definir tu lógica aquí)
		}

		console.log("📦 Distribución final:", distribucion);
		return distribucion;
	};

	//console.log("Posiciones fijas calculadas:", nivelesConPosiciones);

	const largoTerreno = spaceEntrance;
	const entrada = 5;
	const aulaSecundaria = 7.2;
	const aulaPrimaria = 7.2;
	const anchoAula = 8;
	const espacioDeCirculacion = 4;
	console.log("largo del terreno", largoTerreno);
	const espacioDisponibleTop =
		largoTerreno -
		aulaSecundaria -
		aulaPrimaria -
		espacioDeCirculacion -
		espacioDeCirculacion;
	console.log("espacio disponible en top::", espacioDisponibleTop);
	const aulasEnBot = Math.floor(espacioDisponibleTop / anchoAula);
	console.log("aulas en bot", aulasEnBot);

	// const distribucionFinal = distribuirAulasEnPosiciones(
	// 	school,
	// 	complementaryEnvironment,
	// 	aulasPorPiso
	// );

	Object.entries(nivelesConPosiciones).forEach(([nivel, pos]) => {
		let aulas = aulasPorNivel[nivel] || [];
		// let aulas = config.aulas || [];
		// const nivel = config.nivel;

		// // Si no hay aulas en esta posición, skip
		// if (
		// 	aulas.length === 0 &&
		// 	(!config.ambientes || config.ambientes.length === 0)
		// ) {
		// 	return;
		// }

		const pisos = Number(numberFloors);
		let aulasRestantes = [...aulas];

		// Recalcular aulasPorPiso cada vez
		let _aulasPorPiso = Math.floor(espacioParaAulas / 9);

		// Limitar aulas del nivel inicial si deseas
		if (nivel === "inicial") {
			_aulasPorPiso = Math.min(_aulasPorPiso, aulasEnBot) - 1;
		}

		if (nivel === "secundaria" || nivel === "primaria") {
			_aulasPorPiso = Math.max(_aulasPorPiso - 1, 0); // nueva logica para el espacio
		}

		let ambientesExtraNivel = [];

		if (nivel === "secundaria") {
			if (biblioteca)
				ambientesExtraNivel.push(biblioteca.ambienteComplementario);
			if (almacen)
				ambientesExtraNivel.push(almacen.ambienteComplementario);
		}

		if (nivel === "primaria") {
			if (tallerCreativo)
				ambientesExtraNivel.push(tallerCreativo.ambienteComplementario);
			if (laboratorio)
				ambientesExtraNivel.push(laboratorio.ambienteComplementario);
		}

		if (nivel === "inicial") {
			if (psicomotricidad)
				ambientesExtraNivel.push(
					psicomotricidad.ambienteComplementario
				);
		}

		let floors = [];

		for (let i = 0; i < pisos; i++) {
			let aulasFloor = [];

			// Primer piso: agregar ambientes complementarios
			if (i === 0) {
				const espacioDisponible =
					_aulasPorPiso - ambientesExtraNivel.length;
				aulasFloor = aulasRestantes.splice(
					0,
					Math.max(espacioDisponible, 0)
				);
				floors.push({
					floor: i + 1,
					classrooms: aulasFloor,
					ambientesExtra: ambientesExtraNivel,
					baths: 1,
				});
			} else {
				const aulasEnEstePiso = aulasRestantes.splice(0, _aulasPorPiso);
				floors.push({
					floor: i + 1,
					classrooms: aulasEnEstePiso,
					ambientesExtra: [],
					baths: 0,
				});
			}
		}

		pabellones.push({
			position: [pos.x, pos.y, pos.z],
			rotation: [0, pos.r, 0],
			floors: floors,
			nivel: nivel, // Agregar identificador de nivel
		});
	});

	console.log("Pabellones con posiciones fijas:", pabellones);

	const aulasSecundaria =
		pabellones.find((p) => p.nivel === "secundaria")?.floors || [];
	const aulasPrimaria =
		pabellones.find((p) => p.nivel === "primaria")?.floors || [];

	console.log("aulas primaria:::::", aulasPrimaria);

	return (
		<group name="Pabellones">
			{pabellones.map((el, index) => (
				<Pabellon
					position={el.position}
					rotation={el.rotation}
					maxClassroomsForPeine={school.maxClassroomsForPeine}
					classroom={classroom}
					bathroom={bathroom}
					stairs={stairs}
					corridor={corridor}
					space={space}
					terrain={terrain}
					floors={el.floors}
					view={view}
					key={index}
					environment={complementaryEnvironment}
					length={length}
					_classrooms={aulasSecundaria}
					_classroomsPrimaria={aulasPrimaria}
					option={option}
					spaceEntrance={spaceEntrance}
					school={school}
					nivel={el.nivel} // Pasar el nivel para debugging
					espacioDisponibleTop={espacioDisponibleTop}
					// Pasar las props de selección
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

// Función auxiliar mejorada para posiciones predefinidas específicas
function getPosicionPorNivelYAulas(nivel, aulasPorPiso) {
	// Configuración específica por número de aulas para casos especiales
	const AULA_WIDTH = 400;
	const BASE_SEPARATION = 1200;

	// Calcular posiciones dinámicamente
	const pabellonLength = aulasPorPiso * AULA_WIDTH;
	const rectangleWidth = pabellonLength + BASE_SEPARATION * 2;
	const rectangleHeight = pabellonLength + BASE_SEPARATION;

	const positions = {
		secundaria: {
			x: -(rectangleWidth / 2) + 100,
			y: 0,
			z: 0,
			r: Math.PI / 2,
		},
		primaria: {
			x: rectangleWidth / 2 - 100,
			y: 0,
			z: 0,
			r: -Math.PI / 2,
		},
		inicial: {
			x: 0,
			y: 0,
			z: -(rectangleHeight / 2) + 100,
			r: 0,
		},
	};

	return (
		positions[nivel] || {
			x: 0,
			y: 0,
			z: 0,
			r: 0,
		}
	);
}

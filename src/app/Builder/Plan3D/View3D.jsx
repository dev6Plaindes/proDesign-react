// SceneX.jsx
import { useSelector } from "react-redux";
import { Canvas, useThree } from "@react-three/fiber";
import {
	OrbitControls,
	PerspectiveCamera,
	Grid,
	Sky,
	Text,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import AulaDetallada from "./components/Components3d/DetailedClassroom";
import BañoDetallado from "./components/Components3d/Bathroom";
import EscaleraDetallada from "./components/Components3d/Stairs";
import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	Checkbox,
	Chip,
	Divider,
	FormControlLabel,
	FormGroup,
	IconButton,
	Paper,
	Snackbar,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	CenterFocusStrong,
	Flight,
	ViewInAr,
	Visibility,
} from "@mui/icons-material";
import {
	exportMetadata,
	exportReadme,
	exportToGLTF,
	exportToOBJ,
	exportToSTL,
} from "../../../utils/3dExporter";
import {
	exportEditableOBJ,
	exportFlatGLB,
} from "../../../utils/directGeometryExporter";
import Corredor3D from "./components/Components3d/Corredor3D";
import CercoPerimetrico from "./components/Components3d/PerimeterFence";

const View3D = ({ school, view, space, spaceEntrance }) => {
	// ✅ LEER DATOS DE REDUX
	const {
		elementos,
		coordinates,
		maxRectangle,
		distribution,
		capacityInfo,
		currentFloor,
		totalFloors,
		layoutMode,
		isReady,
	} = useSelector((state) => state.view3D);

	console.log("elementos:::", elementos);

	// Ejemplo de primeras 2 aulas primaria para ver si coords son diferentes:
	if (elementos.primaria?.length >= 2) {
		console.log(
			"Primera aula primaria coords:",
			elementos.primaria[0].realCorners
		);
		console.log(
			"Segunda aula primaria coords:",
			elementos.primaria[1].realCorners
		);
	}

	const [selectedElement, setSelectedElement] = useState(null);
	const [visibleFloors, setVisibleFloors] = useState(() => {
		// Por defecto, mostrar todos los pisos
		return Array.from({ length: totalFloors }, (_, i) => i + 1);
	});
	const [exportStatus, setExportStatus] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	// const completarElementosConDistribution = useMemo(() => {
	// 	if (!distribution?.floors || !elementos || totalFloors <= 1) {
	// 		return elementos; // Sin cambios si es un solo piso
	// 	}

	// 	console.log("🔧 Completando elementos con distribution.floors...");

	// 	// Clonar elementos existentes
	// 	const elementosCompletos = {
	// 		inicial: [...(elementos.inicial || [])],
	// 		primaria: [...(elementos.primaria || [])],
	// 		secundaria: [...(elementos.secundaria || [])],
	// 		banos: [...(elementos.banos || [])],
	// 		escaleras: [...(elementos.escaleras || [])],
	// 		ambientes: [...(elementos.ambientes || [])],
	// 		laterales: [...(elementos.laterales || [])],
	// 		entrada: elementos.entrada,
	// 		cancha: elementos.cancha,
	// 	};

	// 	// ✅ COMPLETAR INICIAL
	// 	let totalInicialNecesarias = 0;
	// 	for (let floor = 1; floor <= totalFloors; floor++) {
	// 		const count = distribution.floors[floor]?.inicial || 0;
	// 		totalInicialNecesarias += count;
	// 		console.log(`  Piso ${floor}: necesita ${count} aulas inicial`);
	// 	}

	// 	console.log(
	// 		`📊 Inicial - Necesarias: ${totalInicialNecesarias}, Existentes: ${elementosCompletos.inicial.length}`
	// 	);

	// 	const inicialFaltantes =
	// 		totalInicialNecesarias - elementosCompletos.inicial.length;
	// 	if (inicialFaltantes > 0 && elementosCompletos.inicial.length > 0) {
	// 		console.log(`  ✅ Generando ${inicialFaltantes} aulas inicial`);
	// 		const baseAula = elementosCompletos.inicial[0];

	// 		for (let i = 0; i < inicialFaltantes; i++) {
	// 			elementosCompletos.inicial.push({
	// 				...baseAula,
	// 				realCorners: baseAula.realCorners.map((c) => ({ ...c })),
	// 				_generated: true,
	// 			});
	// 		}
	// 	}

	// 	// ✅ COMPLETAR PRIMARIA
	// 	let totalPrimariaNecesarias = 0;
	// 	for (let floor = 1; floor <= totalFloors; floor++) {
	// 		const count = distribution.floors[floor]?.primaria || 0;
	// 		totalPrimariaNecesarias += count;
	// 		console.log(`  Piso ${floor}: necesita ${count} aulas primaria`);
	// 	}

	// 	console.log(
	// 		`📊 Primaria - Necesarias: ${totalPrimariaNecesarias}, Existentes: ${elementosCompletos.primaria.length}`
	// 	);

	// 	const primariaFaltantes =
	// 		totalPrimariaNecesarias - elementosCompletos.primaria.length;
	// 	if (primariaFaltantes > 0 && elementosCompletos.primaria.length > 0) {
	// 		console.log(`  ✅ Generando ${primariaFaltantes} aulas primaria`);
	// 		const baseAula = elementosCompletos.primaria[0];

	// 		for (let i = 0; i < primariaFaltantes; i++) {
	// 			elementosCompletos.primaria.push({
	// 				...baseAula,
	// 				realCorners: baseAula.realCorners.map((c) => ({ ...c })),
	// 				_generated: true,
	// 			});
	// 		}
	// 	}

	// 	// ✅ COMPLETAR SECUNDARIA
	// 	let totalSecundariaNecesarias = 0;
	// 	for (let floor = 1; floor <= totalFloors; floor++) {
	// 		const count = distribution.floors[floor]?.secundaria || 0;
	// 		totalSecundariaNecesarias += count;
	// 		console.log(`  Piso ${floor}: necesita ${count} aulas secundaria`);
	// 	}

	// 	console.log(
	// 		`📊 Secundaria - Necesarias: ${totalSecundariaNecesarias}, Existentes: ${elementosCompletos.secundaria.length}`
	// 	);

	// 	const secundariaFaltantes =
	// 		totalSecundariaNecesarias - elementosCompletos.secundaria.length;
	// 	if (
	// 		secundariaFaltantes > 0 &&
	// 		elementosCompletos.secundaria.length > 0
	// 	) {
	// 		console.log(
	// 			`  ✅ Generando ${secundariaFaltantes} aulas secundaria`
	// 		);
	// 		const baseAula = elementosCompletos.secundaria[0];

	// 		for (let i = 0; i < secundariaFaltantes; i++) {
	// 			elementosCompletos.secundaria.push({
	// 				...baseAula,
	// 				realCorners: baseAula.realCorners.map((c) => ({ ...c })),
	// 				_generated: true,
	// 			});
	// 		}
	// 	}
	// 	console.log("🔍 DEBUG - Necesidades por piso:", {
	// 		piso1: {
	// 			inicial: distribution.floors[1]?.inicial || 0,
	// 			primaria: distribution.floors[1]?.primaria || 0,
	// 			secundaria: distribution.floors[1]?.secundaria || 0,
	// 		},
	// 		piso2: {
	// 			inicial: distribution.floors[2]?.inicial || 0,
	// 			primaria: distribution.floors[2]?.primaria || 0,
	// 			secundaria: distribution.floors[2]?.secundaria || 0,
	// 		},
	// 	});

	// 	console.log("🔍 DEBUG - Elementos originales:", {
	// 		inicial: elementos.inicial?.length || 0,
	// 		primaria: elementos.primaria?.length || 0,
	// 		secundaria: elementos.secundaria?.length || 0,
	// 		banos: elementos.banos?.length || 0,
	// 	});

	// 	console.log("✅ Elementos FINALES después de completar:", {
	// 		inicial: elementosCompletos.inicial.length,
	// 		primaria: elementosCompletos.primaria.length,
	// 		secundaria: elementosCompletos.secundaria.length,
	// 		banos: elementosCompletos.banos.length,
	// 	});

	// 	return elementosCompletos;
	// }, [elementos, distribution, totalFloors]);
	const completarElementosConDistribution = useMemo(() => {
		if (!distribution?.floors || !elementos || totalFloors <= 1) {
			return elementos;
		}
		// Clonar elementos existentes
		const elementosCompletos = {
			inicial: [...(elementos.inicial || [])],
			primaria: [...(elementos.primaria || [])],
			secundaria: [...(elementos.secundaria || [])],
			banos: [...(elementos.banos || [])],
			escaleras: [...(elementos.escaleras || [])],
			ambientes: [...(elementos.ambientes || [])],
			laterales: [...(elementos.laterales || [])],
			entrada: elementos.entrada,
			cancha: elementos.cancha,
		};

		// ✅ CREAR "PLANTILLAS" PARA AULAS EXTRA
		// Las plantillas incluyen: aulas del piso 1 + espacios de baños (que se pueden usar en piso 2+)
		const crearPlantillas = (aulasBase, banosBase, nivel) => {
			// ✅ INSERTAR baño después de la primera aula (donde realmente está)
			const plantillas = [];

			if (aulasBase.length > 0) {
				// Primera aula
				plantillas.push(aulasBase[0]);

				// ✅ BUSCAR Y AGREGAR BAÑO DE ESTE NIVEL (va después de la primera aula)
				if (banosBase && banosBase.length > 0) {
					const banoDeEstePabellon = banosBase.find(
						(bano) =>
							bano.nivel === nivel ||
							(nivel === "Inicial" && bano.nivel === "Inicial") ||
							(nivel === "Primaria" &&
								bano.nivel === "Primaria") ||
							(nivel === "Secundaria" &&
								bano.nivel === "Secundaria")
					);

					if (banoDeEstePabellon) {
						console.log(
							`  📦 Insertando baño ${banoDeEstePabellon.nivel} en posición 1 para ${nivel}`
						);
						plantillas.push({
							...banoDeEstePabellon,
							realCorners: banoDeEstePabellon.realCorners,
							_fromBano: true,
							_banoNivel: banoDeEstePabellon.nivel,
						});
					}
				}

				// Resto de aulas (desde índice 1 en adelante)
				for (let i = 1; i < aulasBase.length; i++) {
					plantillas.push(aulasBase[i]);
				}
			}

			console.log(
				`    Orden de plantillas para ${nivel}:`,
				plantillas
					.map((p, i) => `${i}: ${p._fromBano ? "Baño" : "Aula"}`)
					.join(", ")
			);

			return plantillas;
		};

		// ✅ COMPLETAR INICIAL
		const inicialPiso1Count = distribution.floors[1]?.inicial || 0;
		let totalInicialNecesarias = 0;
		for (let floor = 1; floor <= totalFloors; floor++) {
			totalInicialNecesarias += distribution.floors[floor]?.inicial || 0;
		}

		const inicialFaltantes =
			totalInicialNecesarias - elementosCompletos.inicial.length;
		if (inicialFaltantes > 0 && elementosCompletos.inicial.length > 0) {
			console.log(
				`  ✅ Generando ${inicialFaltantes} aulas inicial para piso 2+`
			);

			const plantillas = crearPlantillas(
				elementosCompletos.inicial.slice(0, inicialPiso1Count),
				elementosCompletos.banos,
				"Inicial"
			);

			for (let i = 0; i < inicialFaltantes; i++) {
				const baseIndex = i % plantillas.length;
				const baseAula = plantillas[baseIndex];

				console.log(
					`    Aula inicial ${i} → plantilla ${baseIndex}${
						baseAula._fromBano ? " (ex-baño)" : ""
					}`
				);

				elementosCompletos.inicial.push({
					...baseAula,
					realCorners: baseAula.realCorners.map((c) => ({ ...c })),
					_generated: true,
					_baseIndex: baseIndex,
					_fromBano: baseAula._fromBano,
				});
			}
		}

		// ✅ COMPLETAR PRIMARIA
		const primariaPiso1Count = distribution.floors[1]?.primaria || 0;
		let totalPrimariaNecesarias = 0;
		for (let floor = 1; floor <= totalFloors; floor++) {
			totalPrimariaNecesarias +=
				distribution.floors[floor]?.primaria || 0;
		}

		const primariaFaltantes =
			totalPrimariaNecesarias - elementosCompletos.primaria.length;
		if (primariaFaltantes > 0 && elementosCompletos.primaria.length > 0) {
			console.log(
				`  ✅ Generando ${primariaFaltantes} aulas primaria para piso 2+`
			);

			const plantillas = crearPlantillas(
				elementosCompletos.primaria.slice(0, primariaPiso1Count),
				elementosCompletos.banos,
				"Primaria"
			);

			console.log(`    Plantillas primaria: ${plantillas.length} total`);

			for (let i = 0; i < primariaFaltantes; i++) {
				const baseIndex = i % plantillas.length;
				const baseAula = plantillas[baseIndex];

				console.log(
					`    Aula primaria ${i} → plantilla ${baseIndex}${
						baseAula._fromBano ? " (🚽 ex-baño)" : " (🏫 aula)"
					}`
				);

				elementosCompletos.primaria.push({
					...baseAula,
					realCorners: baseAula.realCorners.map((c) => ({ ...c })),
					_generated: true,
					_baseIndex: baseIndex,
					_fromBano: baseAula._fromBano,
				});
			}
		}

		// ✅ COMPLETAR SECUNDARIA (igual)
		const secundariaPiso1Count = distribution.floors[1]?.secundaria || 0;
		let totalSecundariaNecesarias = 0;
		for (let floor = 1; floor <= totalFloors; floor++) {
			totalSecundariaNecesarias +=
				distribution.floors[floor]?.secundaria || 0;
		}

		const secundariaFaltantes =
			totalSecundariaNecesarias - elementosCompletos.secundaria.length;
		if (
			secundariaFaltantes > 0 &&
			elementosCompletos.secundaria.length > 0
		) {
			console.log(
				`  ✅ Generando ${secundariaFaltantes} aulas secundaria para piso 2+`
			);

			const plantillas = crearPlantillas(
				elementosCompletos.secundaria.slice(0, secundariaPiso1Count),
				elementosCompletos.banos,
				"Secundaria"
			);

			console.log(
				`    Plantillas secundaria: ${plantillas.length} total`
			);

			for (let i = 0; i < secundariaFaltantes; i++) {
				const baseIndex = i % plantillas.length;
				const baseAula = plantillas[baseIndex];

				console.log(
					`    Aula secundaria ${i} → plantilla ${baseIndex}${
						baseAula._fromBano ? " (🚽 ex-baño)" : " (🏫 aula)"
					}`
				);

				elementosCompletos.secundaria.push({
					...baseAula,
					realCorners: baseAula.realCorners.map((c) => ({ ...c })),
					_generated: true,
					_baseIndex: baseIndex,
					_fromBano: baseAula._fromBano,
				});
			}
		}

		console.log("✅ Elementos FINALES después de completar:", {
			inicial: elementosCompletos.inicial.length,
			primaria: elementosCompletos.primaria.length,
			secundaria: elementosCompletos.secundaria.length,
			banos: elementosCompletos.banos.length,
		});

		return elementosCompletos;
	}, [elementos, distribution, totalFloors]);

	// Toggle visibilidad de un piso
	const toggleFloor = (floor) => {
		setVisibleFloors((prev) => {
			if (prev.includes(floor)) {
				// Si ya está visible, quitarlo (pero mantener al menos 1)
				return prev.length > 1 ? prev.filter((f) => f !== floor) : prev;
			} else {
				// Si no está visible, agregarlo
				return [...prev, floor].sort((a, b) => a - b);
			}
		});
	};

	// Mostrar todos los pisos
	const showAllFloors = () => {
		setVisibleFloors(Array.from({ length: totalFloors }, (_, i) => i + 1));
	};

	// Mostrar solo un piso
	const showOnlyFloor = (floor) => {
		setVisibleFloors([floor]);
	};

	// ✅ NORMALIZAR COORDENADAS - Restar el mínimo
	// const normalizedData = useMemo(() => {
	// 	if (
	// 		!isReady ||
	// 		!elementos ||
	// 		!coordinates ||
	// 		coordinates.length === 0
	// 	) {
	// 		return null;
	// 	}

	// 	// Encontrar valores mínimos
	// 	const allEasts = [];
	// 	const allNorths = [];

	// 	// Recolectar todas las coordenadas
	// 	coordinates.forEach((c) => {
	// 		allEasts.push(c.east);
	// 		allNorths.push(c.north);
	// 	});

	// 	// Recolectar de elementos
	// 	const collectFromElements = (items) => {
	// 		if (!items) return;
	// 		items.forEach((item) => {
	// 			if (item.realCorners) {
	// 				item.realCorners.forEach((c) => {
	// 					allEasts.push(c.east);
	// 					allNorths.push(c.north);
	// 				});
	// 			}
	// 		});
	// 	};

	// 	collectFromElements(elementos.inicial);
	// 	collectFromElements(elementos.primaria);
	// 	collectFromElements(elementos.secundaria);
	// 	collectFromElements(elementos.banos);
	// 	collectFromElements(elementos.escaleras);
	// 	collectFromElements(elementos.ambientes);
	// 	collectFromElements(elementos.laterales);

	// 	if (elementos.entrada?.realCorners) {
	// 		collectFromElements([elementos.entrada]);
	// 	}

	// 	if (elementos.cancha?.realCorners) {
	// 		collectFromElements([elementos.cancha]);
	// 	}

	// 	const minEast = Math.min(...allEasts);
	// 	const minNorth = Math.min(...allNorths);

	// 	console.log("📍 Normalización:", { minEast, minNorth });

	// 	// Función para normalizar corners
	// 	const normalizeCorners = (corners) => {
	// 		if (!corners) return corners;
	// 		return corners.map((c) => ({
	// 			east: c.east - minEast,
	// 			north: c.north - minNorth,
	// 		}));
	// 	};

	// 	// Función para normalizar un array de items
	// 	const normalizeItems = (items) => {
	// 		if (!items) return items;
	// 		return items.map((item) => ({
	// 			...item,
	// 			realCorners: normalizeCorners(item.realCorners),
	// 		}));
	// 	};

	// 	// Normalizar todos los elementos
	// 	const normalizedElementos = {
	// 		inicial: normalizeItems(elementos.inicial),
	// 		primaria: normalizeItems(elementos.primaria),
	// 		secundaria: normalizeItems(elementos.secundaria),
	// 		banos: normalizeItems(elementos.banos),
	// 		escaleras: normalizeItems(elementos.escaleras),
	// 		ambientes: normalizeItems(elementos.ambientes),
	// 		laterales: normalizeItems(elementos.laterales),
	// 		entrada: elementos.entrada
	// 			? {
	// 					...elementos.entrada,
	// 					realCorners: normalizeCorners(
	// 						elementos.entrada.realCorners
	// 					),
	// 			  }
	// 			: null,
	// 		cancha: elementos.cancha
	// 			? {
	// 					...elementos.cancha,
	// 					realCorners: normalizeCorners(
	// 						elementos.cancha.realCorners
	// 					),
	// 			  }
	// 			: null,
	// 	};

	// 	const normalizedCoordinates = normalizeCorners(coordinates);

	// 	console.log("✅ Datos normalizados:", {
	// 		coordenadasOriginales: coordinates[0],
	// 		coordenadasNormalizadas: normalizedCoordinates[0],
	// 		primerAulaOriginal: elementos.inicial[0]?.realCorners[0],
	// 		primerAulaNormalizada:
	// 			normalizedElementos.inicial[0]?.realCorners[0],
	// 	});

	// 	return {
	// 		elementos: normalizedElementos,
	// 		coordinates: normalizedCoordinates,
	// 	};
	// }, [isReady, elementos, coordinates]);
	const normalizedData = useMemo(() => {
		if (!isReady || !completarElementosConDistribution || !coordinates)
			return null;

		// Normalizar coordenadas
		const easts = coordinates.map((c) => c.east);
		const norths = coordinates.map((c) => c.north);
		const minEast = Math.min(...easts);
		const maxEast = Math.max(...easts);
		const minNorth = Math.min(...norths);
		const maxNorth = Math.max(...norths);

		const centerEast = (minEast + maxEast) / 2;
		const centerNorth = (minNorth + maxNorth) / 2;

		const normalizedCoordinates = coordinates.map((coord) => ({
			east: coord.east - centerEast,
			north: coord.north - centerNorth,
		}));

		// ✅ Normalizar elementos COMPLETOS
		const normalizeElement = (element) => {
			if (!element?.realCorners) return element;

			return {
				...element,
				realCorners: element.realCorners.map((corner) => ({
					east: corner.east - centerEast,
					north: corner.north - centerNorth,
				})),
			};
		};

		const normalizedElementos = {
			inicial:
				completarElementosConDistribution.inicial?.map(
					normalizeElement
				) || [],
			primaria:
				completarElementosConDistribution.primaria?.map(
					normalizeElement
				) || [],
			secundaria:
				completarElementosConDistribution.secundaria?.map(
					normalizeElement
				) || [],
			banos:
				completarElementosConDistribution.banos?.map(
					normalizeElement
				) || [],
			escaleras:
				completarElementosConDistribution.escaleras?.map(
					normalizeElement
				) || [],
			ambientes:
				completarElementosConDistribution.ambientes?.map(
					normalizeElement
				) || [],
			laterales:
				completarElementosConDistribution.laterales?.map(
					normalizeElement
				) || [],
			entrada: normalizeElement(
				completarElementosConDistribution.entrada
			),
			cancha: normalizeElement(completarElementosConDistribution.cancha),
		};

		const normalizedMaxRectangle = maxRectangle
			? {
					...maxRectangle,
					corners: maxRectangle.corners.map((corner) => ({
						east: corner.east - centerEast,
						north: corner.north - centerNorth,
					})),
			  }
			: null;

		return {
			elementos: normalizedElementos,
			coordinates: normalizedCoordinates,
			maxRectangle: normalizedMaxRectangle,
		};
	}, [isReady, completarElementosConDistribution, coordinates, maxRectangle]);

	// ✅ Si no hay datos, mostrar mensaje
	if (!isReady || !elementos || !normalizedData) {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					bgcolor: "grey.100",
				}}
			>
				<Paper
					elevation={3}
					sx={{
						p: 4,
						textAlign: "center",
						maxWidth: 400,
					}}
				>
					<SchoolIcon
						sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
					/>
					<Typography
						variant="h5"
						fontWeight="bold"
						color="text.primary"
						gutterBottom
					>
						Vista 3D no disponible
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mb: 3 }}
					>
						Primero genera la distribución en la vista 2D
					</Typography>
					<Button
						variant="contained"
						onClick={() => window.history.back()}
					>
						← Volver a vista 2D
					</Button>
				</Paper>
			</Box>
		);
	}

	// ✅ Usar datos normalizados
	const {
		elementos: normalizedElementos,
		coordinates: normalizedCoordinates,
		maxRectangle: normalizedMaxRectangle,
	} = normalizedData;

	// ✅ CALCULAR CENTRO REAL DEL COLEGIO (usando todos los elementos)
	const collegeCenter = useMemo(() => {
		const allPoints = [];

		// Recolectar todos los puntos de todos los elementos
		const collectPoints = (items) => {
			if (!items || items.length === 0) return;
			items.forEach((item) => {
				if (item.realCorners) {
					item.realCorners.forEach((c) => {
						allPoints.push({ east: c.east, north: c.north });
					});
				}
			});
		};

		collectPoints(normalizedElementos.inicial);
		collectPoints(normalizedElementos.primaria);
		collectPoints(normalizedElementos.secundaria);
		collectPoints(normalizedElementos.banos);
		collectPoints(normalizedElementos.escaleras);
		collectPoints(normalizedElementos.ambientes);
		collectPoints(normalizedElementos.laterales);

		if (normalizedElementos.entrada?.realCorners) {
			collectPoints([normalizedElementos.entrada]);
		}

		if (normalizedElementos.cancha?.realCorners) {
			collectPoints([normalizedElementos.cancha]);
		}

		// Si no hay puntos, usar el centro del terreno
		if (allPoints.length === 0) {
			return {
				x:
					normalizedCoordinates.reduce((sum, c) => sum + c.east, 0) /
					normalizedCoordinates.length,
				y:
					normalizedCoordinates.reduce((sum, c) => sum + c.north, 0) /
					normalizedCoordinates.length,
				z: 0,
			};
		}

		const centerX =
			allPoints.reduce((sum, p) => sum + p.east, 0) / allPoints.length;
		const centerY =
			allPoints.reduce((sum, p) => sum + p.north, 0) / allPoints.length;

		// Calcular dimensiones para saber la altura promedio
		const maxEast = Math.max(...allPoints.map((p) => p.east));
		const minEast = Math.min(...allPoints.map((p) => p.east));
		const maxNorth = Math.max(...allPoints.map((p) => p.north));
		const minNorth = Math.min(...allPoints.map((p) => p.north));

		const width = maxEast - minEast;
		const depth = maxNorth - minNorth;
		const avgHeight = (totalFloors * 3) / 2; // Altura promedio del edificio

		return {
			x: centerX,
			y: centerY,
			z: avgHeight, // ✅ Apuntar a la mitad de la altura del edificio
			width,
			depth,
		};
	}, [normalizedElementos, normalizedCoordinates, totalFloors]);

	const distanciaMaxima = Math.max(collegeCenter.width, collegeCenter.depth);

	// ✅ Posición inicial de cámara (vista isométrica del colegio)
	const cameraDistance = distanciaMaxima * 0.7;
	const initialCameraPosition = [
		collegeCenter.x + cameraDistance * 0.7,
		collegeCenter.y - cameraDistance * 0.7,
		cameraDistance * 0.6,
	];

	// ✅ Handler para vistas predefinidas
	const handleViewChange = (viewType, element = null, elementType = null) => {
		let position, target;

		if (element) {
			// ✅ Vista cercana de un elemento específico
			const corners = element.realCorners;
			const centerX =
				corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
			const centerY =
				corners.reduce((sum, c) => sum + c.north, 0) / corners.length;
			const elementHeight = 3; // Altura del elemento

			// ✅ Calcular tamaño del elemento para ajustar distancia
			const width = Math.sqrt(
				Math.pow(corners[1].east - corners[0].east, 2) +
					Math.pow(corners[1].north - corners[0].north, 2)
			);

			const depth = Math.sqrt(
				Math.pow(corners[2].east - corners[1].east, 2) +
					Math.pow(corners[2].north - corners[1].north, 2)
			);

			const elementSize = Math.max(width, depth);
			const distance = elementSize * 1.5; // Distancia proporcional al tamaño

			// ✅ Posición cercana con mejor ángulo
			position = [
				centerX + distance * 0.8,
				centerY - distance * 0.8,
				elementHeight + distance * 0.5,
			];

			target = [centerX, centerY, elementHeight / 2];

			console.log(`📍 Acercando a ${elementType}:`, {
				centro: [centerX.toFixed(2), centerY.toFixed(2)],
				tamaño: elementSize.toFixed(2),
				posiciónCámara: position.map((p) => p.toFixed(2)),
				target: target.map((t) => t.toFixed(2)),
			});
		} else {
			// ... resto de vistas existentes
			switch (viewType) {
				case "isometric":
					position = [
						collegeCenter.x + cameraDistance * 0.7,
						collegeCenter.y - cameraDistance * 0.7,
						cameraDistance * 0.6,
					];
					target = [
						collegeCenter.x,
						collegeCenter.y,
						collegeCenter.z,
					];
					break;
				case "aerial":
					position = [
						collegeCenter.x,
						collegeCenter.y,
						distanciaMaxima * 1.5,
					];
					target = [collegeCenter.x, collegeCenter.y, 0];
					break;
				case "lateral":
					position = [
						collegeCenter.x - distanciaMaxima * 1.2,
						collegeCenter.y,
						collegeCenter.z + 5,
					];
					target = [
						collegeCenter.x,
						collegeCenter.y,
						collegeCenter.z,
					];
					break;
				case "frontal":
					position = [
						collegeCenter.x,
						collegeCenter.y - distanciaMaxima * 1.2,
						collegeCenter.z + 5,
					];
					target = [
						collegeCenter.x,
						collegeCenter.y,
						collegeCenter.z,
					];
					break;
				case "center":
					position = initialCameraPosition;
					target = [
						collegeCenter.x,
						collegeCenter.y,
						collegeCenter.z,
					];
					break;
				default:
					return;
			}
		}

		window.dispatchEvent(
			new CustomEvent("setCameraView", {
				detail: { position, target },
			})
		);
	};

	const handleExport = async (format) => {
		const scene = window.__threeScene;

		// if (format === "glb") {
		// 	try {
		// 		setExportStatus({
		// 			open: true,
		// 			message: "Generando modelo GLB desde datos...",
		// 			severity: "info",
		// 		});
		// 		const projectName =
		// 			school?.name?.replace(/[^a-z0-9]/gi, "_").toLowerCase() ||
		// 			"colegio_3d";

		// 		const result = await exportDirectGLB(
		// 			normalizedElementos,
		// 			normalizedCoordinates,
		// 			totalFloors,
		// 			projectName
		// 		);

		// 		setExportStatus({
		// 			open: true,
		// 			message: result.message,
		// 			severity: result.success ? "success" : "error",
		// 		});
		// 	} catch (error) {
		// 		setExportStatus({
		// 			open: true,
		// 			message: "Error: " + error.message,
		// 			severity: "error",
		// 		});
		// 	}
		// 	return;
		// }

		if (format === "glb") {
			try {
				setExportStatus({
					open: true,
					message: "Generando objetos independientes...",
					severity: "info",
				});

				const result = await exportFlatGLB(
					normalizedElementos,
					normalizedCoordinates,
					totalFloors,
					projectName
				);

				setExportStatus({
					open: true,
					message: result.message,
					severity: result.success ? "success" : "error",
				});
			} catch (error) {
				setExportStatus({
					open: true,
					message: "Error: " + error.message,
					severity: "error",
				});
			}
			return;
		}

		// ✅ CASO ESPECIAL PARA OBJ - USAR EXPORTADOR DIRECTO
		if (format === "obj") {
			try {
				setExportStatus({
					open: true,
					message: "Generando objetos editables para Rhino...",
					severity: "info",
				});

				const result = await exportEditableOBJ(
					normalizedElementos,
					normalizedCoordinates,
					totalFloors,
					projectName
				);

				setExportStatus({
					open: true,
					message: result.message,
					severity: result.success ? "success" : "error",
				});
			} catch (error) {
				setExportStatus({
					open: true,
					message: "Error: " + error.message,
					severity: "error",
				});
			}
			return;
		}

		// ✅ RESTO DE FORMATOS (STL, GLTF, etc.) - SE MANTIENE IGUAL
		if (!scene) {
			setExportStatus({
				open: true,
				message:
					"Error: Escena no disponible. Espere a que el modelo se cargue.",
				severity: "error",
			});
			return;
		}

		const geometryInfo = verifyGeometry(scene);

		if (!geometryInfo.hasGeometry) {
			setExportStatus({
				open: true,
				message: "No hay geometría 3D para exportar",
				severity: "warning",
			});
			return;
		}

		const projectName =
			school?.name?.replace(/[^a-z0-9]/gi, "_").toLowerCase() ||
			"colegio_3d";

		try {
			let result;

			switch (format) {
				case "stl":
					setExportStatus({
						open: true,
						message: "Exportando a STL...",
						severity: "info",
					});
					result = exportToSTL(scene, projectName, true);
					break;

				case "gltf":
					setExportStatus({
						open: true,
						message: "Exportando a GLTF...",
						severity: "info",
					});
					result = await exportToGLTF(scene, projectName, true);
					break;

				case "metadata":
					result = exportMetadata(
						school,
						{
							totalFloors,
							layoutMode,
							capacityInfo,
							inicial: normalizedElementos.inicial,
							primaria: normalizedElementos.primaria,
							secundaria: normalizedElementos.secundaria,
							banos: normalizedElementos.banos,
							escaleras: normalizedElementos.escaleras,
							ambientes: normalizedElementos.ambientes,
						},
						projectName
					);
					break;

				case "all":
					setExportStatus({
						open: true,
						message: "Exportando todos los formatos...",
						severity: "info",
					});

					// OBJ con exportador directo
					await exportEditableOBJ(
						normalizedElementos,
						normalizedCoordinates,
						totalFloors,
						projectName
					);
					await new Promise((resolve) => setTimeout(resolve, 1000));

					// Resto de formatos
					exportToSTL(scene, projectName, true);
					await new Promise((resolve) => setTimeout(resolve, 1000));
					await exportToGLTF(scene, projectName, true);
					await new Promise((resolve) => setTimeout(resolve, 1000));
					exportMetadata(
						school,
						{
							totalFloors,
							layoutMode,
							capacityInfo,
							inicial: normalizedElementos.inicial,
							primaria: normalizedElementos.primaria,
							secundaria: normalizedElementos.secundaria,
							banos: normalizedElementos.banos,
							escaleras: normalizedElementos.escaleras,
							ambientes: normalizedElementos.ambientes,
						},
						projectName
					);
					exportReadme(projectName);

					result = {
						success: true,
						message: `✅ Exportados ${geometryInfo.meshes} objetos 3D en todos los formatos`,
					};
					break;

				default:
					result = {
						success: false,
						message: "Formato no soportado",
					};
			}

			setExportStatus({
				open: true,
				message: result.message,
				severity: result.success ? "success" : "error",
			});
		} catch (error) {
			console.error("Error en exportación:", error);
			setExportStatus({
				open: true,
				message: "Error al exportar: " + error.message,
				severity: "error",
			});
		}
	};

	// ✅ Handler para zoom a elemento seleccionado
	const handleElementClick = (element, type) => {
		setSelectedElement({ element, type });
		handleViewChange(null, element, type);
	};

	return (
		<Box sx={{ width: "100%", height: "100vh", position: "relative" }}>
			{/* ✅ Panel de información con MUI */}
			<Paper
				elevation={4}
				sx={{
					position: "absolute",
					top: 16,
					left: 16,
					p: 2.5,
					maxWidth: 280,
					zIndex: 10,
					bgcolor: "background.paper",
				}}
			>
				<Typography variant="h6" fontWeight="bold" gutterBottom>
					Vista 3D
				</Typography>

				{school?.name && (
					<Typography
						variant="caption"
						color="text.secondary"
						display="block"
						sx={{ mb: 1 }}
					>
						{school.name}
					</Typography>
				)}

				<Stack direction="row" spacing={1} sx={{ mb: 1 }}>
					<Chip
						label={`Piso ${currentFloor}/${totalFloors}`}
						size="small"
						color="primary"
						variant="outlined"
					/>
					<Chip
						label={
							layoutMode === "horizontal"
								? "↔️ Horizontal"
								: "↕️ Vertical"
						}
						size="small"
						color="secondary"
						variant="outlined"
					/>
				</Stack>
				{/* ✅ CONTROLES DE PISOS */}
				{totalFloors > 1 && (
					<>
						<Typography
							variant="caption"
							fontWeight="bold"
							display="block"
							sx={{ mb: 1 }}
						>
							Pisos visibles:
						</Typography>

						<FormGroup sx={{ mb: 1 }}>
							{Array.from(
								{ length: totalFloors },
								(_, i) => i + 1
							).map((floor) => (
								<FormControlLabel
									key={floor}
									control={
										<Checkbox
											size="small"
											checked={visibleFloors.includes(
												floor
											)}
											onChange={() => toggleFloor(floor)}
										/>
									}
									label={
										<Typography variant="caption">
											Piso {floor}
										</Typography>
									}
								/>
							))}
						</FormGroup>

						<Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
							<Button
								size="small"
								variant="outlined"
								onClick={showAllFloors}
								sx={{ fontSize: "0.65rem", py: 0.5 }}
							>
								Ver todos
							</Button>
							<Button
								size="small"
								variant="outlined"
								onClick={() => showOnlyFloor(1)}
								sx={{ fontSize: "0.65rem", py: 0.5 }}
							>
								Solo piso 1
							</Button>
						</Stack>

						<Divider sx={{ my: 1.5 }} />
					</>
				)}

				<Divider sx={{ my: 1.5 }} />

				<Stack spacing={0.5} sx={{ fontSize: "0.75rem" }}>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#eab308",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Inicial: {normalizedElementos.inicial.length} aulas
						</Typography>
					</Box>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#3b82f6",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Primaria: {normalizedElementos.primaria.length}{" "}
							aulas
						</Typography>
					</Box>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#ef4444",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Secundaria: {normalizedElementos.secundaria.length}{" "}
							aulas
						</Typography>
					</Box>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#a855f7",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Baños: {normalizedElementos.banos.length}
						</Typography>
					</Box>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#6b7280",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Escaleras: {normalizedElementos.escaleras.length}
						</Typography>
					</Box>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#ec4899",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Ambientes: {normalizedElementos.ambientes.length}
						</Typography>
					</Box>
					<Box
						sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
					>
						<Box
							sx={{
								width: 12,
								height: 12,
								bgcolor: "#fb923c",
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">
							Laterales: {normalizedElementos.laterales.length}
						</Typography>
					</Box>
				</Stack>
				<Typography variant="subtitle2" fontWeight="bold" gutterBottom>
					Exportar modelo 3D
				</Typography>

				<Stack spacing={1}>
					<Button
						variant="contained"
						size="small"
						//startIcon={<DownloadIcon />}
						onClick={() => handleExport("glb")}
						fullWidth
						color="success"
					>
						GLB (Rhino 7+) ⭐
					</Button>
					<Button
						variant="contained"
						size="small"
						//startIcon={<DownloadIcon />}
						onClick={() => handleExport("obj")}
						fullWidth
					>
						OBJ (Rhino/AutoCAD)
					</Button>
				</Stack>

				<Snackbar
					open={exportStatus.open}
					autoHideDuration={4000}
					onClose={() =>
						setExportStatus({ ...exportStatus, open: false })
					}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						severity={exportStatus.severity}
						onClose={() =>
							setExportStatus({ ...exportStatus, open: false })
						}
					>
						{exportStatus.message}
					</Alert>
				</Snackbar>

				<Divider sx={{ my: 1.5 }} />
			</Paper>

			{/* ✅ Botones de vista con MUI */}
			<Stack
				spacing={1}
				sx={{
					position: "absolute",
					top: 16,
					right: 16,
					zIndex: 10,
				}}
			>
				<Tooltip title="Volver al centro" placement="left">
					<IconButton
						color="primary"
						sx={{
							bgcolor: "white",
							"&:hover": { bgcolor: "grey.100" },
						}}
						onClick={() => handleViewChange("center")}
					>
						<CenterFocusStrong />
					</IconButton>
				</Tooltip>

				<Divider />

				<ButtonGroup orientation="vertical" variant="contained">
					<Button
						color="primary"
						startIcon={<ViewInAr />}
						onClick={() => handleViewChange("isometric")}
						sx={{ textTransform: "none", minWidth: 140 }}
					>
						Isométrica
					</Button>

					<Button
						color="success"
						startIcon={<Flight />}
						onClick={() => handleViewChange("aerial")}
						sx={{ textTransform: "none" }}
					>
						Aérea
					</Button>

					<Button
						color="secondary"
						startIcon={<Visibility />}
						onClick={() => handleViewChange("lateral")}
						sx={{ textTransform: "none" }}
					>
						Lateral
					</Button>

					<Button
						color="info"
						startIcon={<Visibility />}
						onClick={() => handleViewChange("frontal")}
						sx={{ textTransform: "none" }}
					>
						Frontal
					</Button>
				</ButtonGroup>

				<Divider />

				{/* ✅ Vistas rápidas por tipo */}
				<Paper sx={{ p: 1 }}>
					<Typography
						variant="caption"
						fontWeight="bold"
						display="block"
						sx={{ mb: 0.5 }}
					>
						Ver de cerca:
					</Typography>
					<Stack spacing={0.5}>
						{normalizedElementos.inicial.length > 0 && (
							<Button
								size="small"
								variant="outlined"
								sx={{
									textTransform: "none",
									fontSize: "0.7rem",
								}}
								onClick={() =>
									handleElementClick(
										normalizedElementos.inicial[0],
										"inicial"
									)
								}
							>
								🟨 Aula Inicial
							</Button>
						)}
						{normalizedElementos.primaria.length > 0 && (
							<Button
								size="small"
								variant="outlined"
								sx={{
									textTransform: "none",
									fontSize: "0.7rem",
								}}
								onClick={() =>
									handleElementClick(
										normalizedElementos.primaria[0],
										"primaria"
									)
								}
							>
								🟦 Aula Primaria
							</Button>
						)}
						{normalizedElementos.secundaria.length > 0 && (
							<Button
								size="small"
								variant="outlined"
								sx={{
									textTransform: "none",
									fontSize: "0.7rem",
								}}
								onClick={() =>
									handleElementClick(
										normalizedElementos.secundaria[0],
										"secundaria"
									)
								}
							>
								🟥 Aula Secundaria
							</Button>
						)}
						{normalizedElementos.banos.length > 0 && (
							<Button
								size="small"
								variant="outlined"
								sx={{
									textTransform: "none",
									fontSize: "0.7rem",
								}}
								onClick={() =>
									handleElementClick(
										normalizedElementos.banos[0],
										"baño"
									)
								}
							>
								🟪 Baño
							</Button>
						)}
						{normalizedElementos.escaleras.length > 0 && (
							<Button
								size="small"
								variant="outlined"
								sx={{
									textTransform: "none",
									fontSize: "0.7rem",
								}}
								onClick={() =>
									handleElementClick(
										normalizedElementos.escaleras[0],
										"escalera"
									)
								}
							>
								⬜ Escalera
							</Button>
						)}
						{normalizedElementos.cancha && (
							<Button
								size="small"
								variant="outlined"
								sx={{
									textTransform: "none",
									fontSize: "0.7rem",
								}}
								onClick={() =>
									handleElementClick(
										normalizedElementos.cancha,
										"cancha"
									)
								}
							>
								⚽ Cancha
							</Button>
						)}
					</Stack>
				</Paper>
			</Stack>

			{/* Canvas de Three.js */}
			<Canvas
				shadows
				camera={{
					position: initialCameraPosition,
					fov: 50,
					near: 0.1,
					far: 2000,
				}}
				onCreated={({ camera }) => {
					// Posición inicial corregida
					camera.position.set(...initialCameraPosition);

					// ¡La parte clave!
					camera.lookAt(
						collegeCenter.x,
						collegeCenter.y,
						collegeCenter.z
					);

					camera.updateProjectionMatrix();
				}}
			>
				<Sky sunPosition={[100, 50, 100]} turbidity={8} rayleigh={2} />

				<ambientLight intensity={0.6} />

				<directionalLight
					position={[collegeCenter.x + 50, collegeCenter.y - 30, 50]}
					intensity={1.2}
					castShadow
					shadow-mapSize-width={4096}
					shadow-mapSize-height={4096}
					shadow-camera-left={-distanciaMaxima}
					shadow-camera-right={distanciaMaxima}
					shadow-camera-top={distanciaMaxima}
					shadow-camera-bottom={-distanciaMaxima}
				/>

				<hemisphereLight
					skyColor="#87ceeb"
					groundColor="#8b7355"
					intensity={0.4}
				/>

				<CameraController
					centerX={collegeCenter.x}
					centerY={collegeCenter.y}
					centerZ={collegeCenter.z}
				/>

				<OrbitControls
					makeDefault
					// enablePan={true}
					// enableZoom={true}
					// enableRotate={true}
					// enableDamping={true}
					// dampingFactor={0.05}
					// target={[collegeCenter.x, collegeCenter.y, collegeCenter.z]} // ✅ Target corregido
					// minPolarAngle={Math.PI / 8}
					// maxPolarAngle={Math.PI / 2.05}
					// minDistance={2}
					// maxDistance={distanciaMaxima * 4}
					// panSpeed={1.2}
					// rotateSpeed={0.8}
					// zoomSpeed={1.5}
					enablePan={true}
					enableZoom={true}
					enableRotate={true}
					enableDamping={true}
					dampingFactor={0.07}
					target={[collegeCenter.x, collegeCenter.y, collegeCenter.z]}
					up={[0, 0, 1]}
					minDistance={0.2}
					maxDistance={distanciaMaxima * 10}
					minPolarAngle={0}
					maxPolarAngle={Math.PI - 0.1}
					panSpeed={1.3}
					rotateSpeed={1.0}
					zoomSpeed={1.2}
				/>
				<ExportHelper
					onExportRequest={(format) => handleExportFromScene(format)}
				/>

				<group rotation={[-Math.PI / 2, 0, 0]}>
					<gridHelper
						args={[distanciaMaxima * 3, 100, "#888888", "#cccccc"]}
						position={[collegeCenter.x, collegeCenter.y, -0.1]}
						rotation={[Math.PI / 2, 0, 0]}
					/>

					<Suspense fallback={null}>
						<Terreno coordinates={normalizedCoordinates} />

						{normalizedElementos.cancha && (
							<Cancha cancha={normalizedElementos.cancha} />
						)}
						{maxRectangle && (
							<>
								<CercoPerimetrico
									corners={normalizedMaxRectangle.corners}
									offset={1.0} // 1 metro de separación
									height={0.5} // 2.5 metros de altura
									hasEntrance={true} // Con puerta de entrada
								/>
								<CercoPerimetrico
									corners={normalizedCoordinates}
									offset={1.0} // 1 metro de separación
									height={2.5} // 2.5 metros de altura
									hasEntrance={true} // Con puerta de entrada
								/>
							</>
						)}

						<EdificioMultiPiso
							elementos={normalizedElementos}
							totalFloors={totalFloors}
							visibleFloors={visibleFloors}
							onElementClick={handleElementClick}
							distribution={distribution}
						/>
					</Suspense>
				</group>
			</Canvas>
		</Box>
	);
};
const ExportHelper = ({ onExportRequest }) => {
	const { scene } = useThree();

	useEffect(() => {
		// Hacer la escena accesible globalmente para exportación
		window.__threeScene = scene;
	}, [scene]);

	return null;
};

// ✅ Handler de exportación

const CameraController = ({ centerX, centerY, centerZ }) => {
	const { camera, controls } = useThree();
	camera.near = 0.01;
	camera.updateProjectionMatrix();
	useEffect(() => {
		const handleCameraView = (event) => {
			const { position, target } = event.detail;

			// Animar la transición
			const startPos = camera.position.clone();
			const endPos = new THREE.Vector3(...position);
			const startTarget =
				controls?.target.clone() ||
				new THREE.Vector3(centerX, centerY, centerZ);
			const endTarget = new THREE.Vector3(...target);

			const duration = 1000; // 1 segundo
			const startTime = Date.now();

			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);

				// Ease in-out
				const eased =
					progress < 0.5
						? 2 * progress * progress
						: 1 - Math.pow(-2 * progress + 2, 2) / 2;

				camera.position.lerpVectors(startPos, endPos, eased);

				if (controls) {
					controls.target.lerpVectors(startTarget, endTarget, eased);
					controls.update();
				}

				if (progress < 1) {
					requestAnimationFrame(animate);
				}
			};

			animate();
		};

		window.addEventListener("setCameraView", handleCameraView);
		return () =>
			window.removeEventListener("setCameraView", handleCameraView);
	}, [camera, controls, centerX, centerY, centerZ]);

	return null;
};

export default View3D;

// En View3D.jsx o donde tengas el componente Edificio

const Edificio = ({ elementos, currentFloor, totalFloors, onElementClick }) => {
	const ALTURA_PISO = 3;
	const offsetZ = (currentFloor - 1) * ALTURA_PISO;

	// ✅ CALCULAR CENTRO DEL COLEGIO
	const collegeCenter = useMemo(() => {
		const allPoints = [];

		const collectPoints = (items) => {
			if (!items || items.length === 0) return;
			items.forEach((item) => {
				if (item.realCorners) {
					item.realCorners.forEach((c) => {
						allPoints.push({ east: c.east, north: c.north });
					});
				}
			});
		};

		collectPoints(elementos.inicial);
		collectPoints(elementos.primaria);
		collectPoints(elementos.secundaria);
		collectPoints(elementos.banos);
		collectPoints(elementos.escaleras);
		collectPoints(elementos.ambientes);
		collectPoints(elementos.laterales);

		if (elementos.entrada?.realCorners) {
			collectPoints([elementos.entrada]);
		}

		if (allPoints.length === 0) return { x: 0, y: 0 };

		const centerX =
			allPoints.reduce((sum, p) => sum + p.east, 0) / allPoints.length;
		const centerY =
			allPoints.reduce((sum, p) => sum + p.north, 0) / allPoints.length;

		return { x: centerX, y: centerY };
	}, [elementos]);

	return (
		<group position={[0, 0, offsetZ]}>
			{/* Aulas Inicial */}
			{elementos.inicial.map((aula, idx) => (
				<AulaDetallada
					key={`inicial-${idx}`}
					corners={aula.realCorners}
					height={ALTURA_PISO}
					color="#eab308"
					nombre={`Inicial ${idx + 1}`}
					level="inicial"
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			))}

			{/* Aulas Primaria */}
			{elementos.primaria.map((aula, idx) => (
				<AulaDetallada
					key={`primaria-${idx}`}
					corners={aula.realCorners}
					height={ALTURA_PISO}
					color="#3b82f6"
					nombre={`Primaria ${idx + 1}`}
					level="primaria"
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			))}

			{/* Aulas Secundaria */}
			{elementos.secundaria.map((aula, idx) => (
				<AulaDetallada
					key={`secundaria-${idx}`}
					corners={aula.realCorners}
					height={ALTURA_PISO}
					color="#ef4444"
					nombre={`Secundaria ${idx + 1}`}
					level="secundaria"
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			))}

			{/* Baños */}
			{elementos.banos.map((bano, idx) => (
				<BañoDetallado
					key={`bano-${idx}`}
					corners={bano.realCorners}
					height={ALTURA_PISO}
					nombre={`Baño ${bano.nivel || ""}`}
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			))}

			{/* Escaleras */}
			{elementos.escaleras.map((escalera, idx) => (
				<EscaleraDetallada
					key={`escalera-${idx}`}
					corners={escalera.realCorners}
					height={ALTURA_PISO}
					totalFloors={totalFloors}
					nombre={`Escalera ${escalera.nivel || ""}`}
					collegeCenter={collegeCenter}
				/>
			))}

			{/* Ambientes complementarios */}
			{elementos.ambientes.map((ambiente, idx) => (
				<AulaDetallada
					key={`ambiente-${idx}`}
					corners={ambiente.realCorners}
					height={ALTURA_PISO}
					color="#ec4899"
					nombre={ambiente.nombre || `Ambiente ${idx + 1}`}
					level="ambiente"
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			))}

			{/* Laterales */}
			{elementos.laterales.map((lateral, idx) => (
				<AulaDetallada
					key={`lateral-${idx}`}
					corners={lateral.realCorners}
					height={ALTURA_PISO}
					color="#fb923c"
					nombre={lateral.nombre || `Lateral ${idx + 1}`}
					level="lateral"
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			))}

			{/* Entrada */}
			{elementos.entrada && (
				<AulaDetallada
					corners={elementos.entrada.realCorners}
					height={ALTURA_PISO}
					color="#64748b"
					nombre="Entrada"
					level="entrada"
					collegeCenter={collegeCenter} // ✅ Pasar centro
				/>
			)}
		</group>
	);
};

const Terreno = ({ coordinates }) => {
	if (!coordinates || coordinates.length < 3) return null;

	const shape = new THREE.Shape();
	shape.moveTo(coordinates[0].east, coordinates[0].north);
	for (let i = 1; i < coordinates.length; i++) {
		shape.lineTo(coordinates[i].east, coordinates[i].north);
	}
	shape.closePath();

	return (
		<group>
			{/* ✅ CAMBIO: Quitar rotation y position Z en 0 */}
			<mesh
				receiveShadow
				position={[0, 0, 0]} // Era -0.05
			>
				<shapeGeometry args={[shape]} />
				<meshStandardMaterial
					color="#8b7355"
					side={THREE.DoubleSide}
					roughness={0.8}
				/>
			</mesh>

			{/* Borde del terreno */}
			<lineSegments position={[0, 0, 0.01]}>
				<edgesGeometry
					attach="geometry"
					args={[new THREE.ShapeGeometry(shape)]}
				/>
				<lineBasicMaterial
					attach="material"
					color="#3b82f6"
					linewidth={3}
				/>
			</lineSegments>
		</group>
	);
};

// components3D/Cancha.jsx
const Cancha = ({ cancha }) => {
	if (!cancha || !cancha.realCorners || cancha.realCorners.length < 4) {
		return null;
	}

	const corners = cancha.realCorners;
	const shape = new THREE.Shape();
	shape.moveTo(corners[0].east, corners[0].north);
	for (let i = 1; i < corners.length; i++) {
		shape.lineTo(corners[i].east, corners[i].north);
	}
	shape.closePath();

	const centerX =
		corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
	const centerY =
		corners.reduce((sum, c) => sum + c.north, 0) / corners.length;

	return (
		<group>
			{/* ✅ CAMBIO: Quitar rotation, solo position Z */}
			<mesh receiveShadow position={[0, 0, 0.02]}>
				<shapeGeometry args={[shape]} />
				<meshStandardMaterial color="#22c55e" roughness={0.7} />
			</mesh>

			{/* Líneas de la cancha */}
			<lineSegments position={[0, 0, 0.05]}>
				<edgesGeometry
					attach="geometry"
					args={[new THREE.ShapeGeometry(shape)]}
				/>
				<lineBasicMaterial
					attach="material"
					color="#ffffff"
					linewidth={2}
				/>
			</lineSegments>

			{/* Texto de cancha */}
			<Text
				position={[centerX, centerY, 0.1]}
				fontSize={1.5}
				color="white"
				anchorX="center"
				anchorY="middle"
				outlineWidth={0.08}
				outlineColor="#16a34a"
			>
				⚽ CANCHA
			</Text>
		</group>
	);
};

// components3D/EdificioMultiPiso.jsx o en el mismo archivo
// const EdificioMultiPiso = ({
// 	elementos,
// 	totalFloors,
// 	visibleFloors,
// 	distribution,
// 	onElementClick,
// }) => {
// 	const ALTURA_PISO = 3;

// 	const ANCHO_CORREDOR = 1.5;

// 	// ✅ Calcular centro del colegio
// 	const collegeCenter = useMemo(() => {
// 		const allPoints = [];

// 		const collectPoints = (items) => {
// 			if (!items || items.length === 0) return;
// 			items.forEach((item) => {
// 				if (item.realCorners) {
// 					item.realCorners.forEach((c) => {
// 						allPoints.push({ east: c.east, north: c.north });
// 					});
// 				}
// 			});
// 		};

// 		collectPoints(elementos.inicial);
// 		collectPoints(elementos.primaria);
// 		collectPoints(elementos.secundaria);
// 		collectPoints(elementos.banos);
// 		collectPoints(elementos.escaleras);
// 		collectPoints(elementos.ambientes);
// 		collectPoints(elementos.laterales);

// 		if (elementos.entrada?.realCorners) {
// 			collectPoints([elementos.entrada]);
// 		}

// 		if (allPoints.length === 0) return { x: 0, y: 0 };

// 		const centerX =
// 			allPoints.reduce((sum, p) => sum + p.east, 0) / allPoints.length;
// 		const centerY =
// 			allPoints.reduce((sum, p) => sum + p.north, 0) / allPoints.length;

// 		return { x: centerX, y: centerY };
// 	}, [elementos]);

// 	// ✅ FUNCIÓN PARA DISTRIBUIR AULAS POR PISO
// 	// const distributeByFloor = useMemo(() => {
// 	// 	if (!distribution?.floors) {
// 	// 		console.warn("No hay información de distribución por pisos");
// 	// 		return null;
// 	// 	}

// 	// 	const result = {};

// 	// 	// Inicializar arrays para cada piso
// 	// 	for (let floor = 1; floor <= totalFloors; floor++) {
// 	// 		result[floor] = {
// 	// 			inicial: [],
// 	// 			primaria: [],
// 	// 			secundaria: [],
// 	// 			banos: [],
// 	// 			ambientes: [],
// 	// 			laterales: [],
// 	// 		};
// 	// 	}

// 	// 	// ✅ DISTRIBUIR INICIAL
// 	// 	if (elementos.inicial && elementos.inicial.length > 0) {
// 	// 		let index = 0;
// 	// 		for (let floor = 1; floor <= totalFloors; floor++) {
// 	// 			const count = distribution.floors[floor]?.inicial || 0;

// 	// 			for (
// 	// 				let i = 0;
// 	// 				i < count && index < elementos.inicial.length;
// 	// 				i++
// 	// 			) {
// 	// 				result[floor].inicial.push(elementos.inicial[index]);
// 	// 				index++;
// 	// 			}
// 	// 		}
// 	// 	}

// 	// 	// ✅ DISTRIBUIR PRIMARIA
// 	// 	if (elementos.primaria && elementos.primaria.length > 0) {
// 	// 		let index = 0;
// 	// 		for (let floor = 1; floor <= totalFloors; floor++) {
// 	// 			const count = distribution.floors[floor]?.primaria || 0;

// 	// 			for (
// 	// 				let i = 0;
// 	// 				i < count && index < elementos.primaria.length;
// 	// 				i++
// 	// 			) {
// 	// 				result[floor].primaria.push(elementos.primaria[index]);
// 	// 				index++;
// 	// 			}
// 	// 		}
// 	// 	}

// 	// 	// ✅ DISTRIBUIR SECUNDARIA
// 	// 	if (elementos.secundaria && elementos.secundaria.length > 0) {
// 	// 		let index = 0;
// 	// 		for (let floor = 1; floor <= totalFloors; floor++) {
// 	// 			const count = distribution.floors[floor]?.secundaria || 0;
// 	// 			console.log("count::::", count);
// 	// 			for (
// 	// 				let i = 0;
// 	// 				i < count && index < elementos.secundaria.length;
// 	// 				i++
// 	// 			) {
// 	// 				result[floor].secundaria.push(elementos.secundaria[index]);
// 	// 				index++;
// 	// 			}
// 	// 		}
// 	// 	}

// 	// 	// ✅ DISTRIBUIR BAÑOS (1 por piso)
// 	// 	if (elementos.banos) {
// 	// 		elementos.banos.forEach((bano, index) => {
// 	// 			const floor = Math.min(index + 1, totalFloors);
// 	// 			if (result[floor]) {
// 	// 				result[floor].banos.push(bano);
// 	// 			}
// 	// 		});
// 	// 	}

// 	// 	// ✅ DISTRIBUIR AMBIENTES (según su configuración)
// 	// 	if (elementos.ambientes) {
// 	// 		elementos.ambientes.forEach((ambiente) => {
// 	// 			const floor = ambiente.floor || ambiente.piso || 1;
// 	// 			if (result[floor]) {
// 	// 				result[floor].ambientes.push(ambiente);
// 	// 			}
// 	// 		});
// 	// 	}

// 	// 	// ✅ DISTRIBUIR LATERALES
// 	// 	if (elementos.laterales) {
// 	// 		elementos.laterales.forEach((lateral) => {
// 	// 			const floor = lateral.floor || lateral.piso || 1;
// 	// 			if (result[floor]) {
// 	// 				result[floor].laterales.push(lateral);
// 	// 			}
// 	// 		});
// 	// 	}

// 	// 	console.log("📊 Distribución final por pisos:", result);

// 	// 	return result;
// 	// }, [elementos, distribution, totalFloors]);
// 	const distributeByFloor = useMemo(() => {
// 		if (!distribution?.floors) {
// 			console.warn("No hay información de distribución por pisos");
// 			return null;
// 		}

// 		const result = {};

// 		// Inicializar arrays para cada piso
// 		for (let floor = 1; floor <= totalFloors; floor++) {
// 			result[floor] = {
// 				inicial: [],
// 				primaria: [],
// 				secundaria: [],
// 				banos: [],
// 				ambientes: [],
// 				laterales: [],
// 			};
// 		}

// 		// ✅ DISTRIBUIR INICIAL
// 		if (elementos.inicial && elementos.inicial.length > 0) {
// 			let index = 0;
// 			for (let floor = 1; floor <= totalFloors; floor++) {
// 				const count = distribution.floors[floor]?.inicial || 0;

// 				for (
// 					let i = 0;
// 					i < count && index < elementos.inicial.length;
// 					i++
// 				) {
// 					result[floor].inicial.push(elementos.inicial[index]);
// 					index++;
// 				}
// 			}

// 			console.log(
// 				`📊 Inicial distribuido: ${index} de ${elementos.inicial.length}`
// 			);
// 		}

// 		// ✅ DISTRIBUIR PRIMARIA
// 		if (elementos.primaria && elementos.primaria.length > 0) {
// 			let index = 0;
// 			console.log(
// 				"🔵 Distribuyendo PRIMARIA:",
// 				elementos.primaria.length,
// 				"aulas disponibles"
// 			);

// 			for (let floor = 1; floor <= totalFloors; floor++) {
// 				const count = distribution.floors[floor]?.primaria || 0;
// 				console.log(
// 					`  🔵 Piso ${floor}: necesita ${count} aulas, index actual: ${index}`
// 				);

// 				for (
// 					let i = 0;
// 					i < count && index < elementos.primaria.length;
// 					i++
// 				) {
// 					console.log(
// 						`    ➕ Agregando aula primaria ${index} al piso ${floor}`
// 					);
// 					result[floor].primaria.push(elementos.primaria[index]);
// 					index++;
// 				}

// 				console.log(
// 					`  ✅ Piso ${floor}: ahora tiene ${result[floor].primaria.length} aulas primaria`
// 				);
// 			}

// 			console.log(
// 				`📊 Primaria distribuido: ${index} de ${elementos.primaria.length}`
// 			);
// 		}

// 		// ✅ DISTRIBUIR SECUNDARIA
// 		if (elementos.secundaria && elementos.secundaria.length > 0) {
// 			let index = 0;
// 			console.log(
// 				"🔴 Distribuyendo SECUNDARIA:",
// 				elementos.secundaria.length,
// 				"aulas disponibles"
// 			);

// 			for (let floor = 1; floor <= totalFloors; floor++) {
// 				const count = distribution.floors[floor]?.secundaria || 0;
// 				console.log(
// 					`  🔴 Piso ${floor}: necesita ${count} aulas, index actual: ${index}`
// 				);

// 				for (
// 					let i = 0;
// 					i < count && index < elementos.secundaria.length;
// 					i++
// 				) {
// 					console.log(
// 						`    ➕ Agregando aula secundaria ${index} al piso ${floor}`
// 					);
// 					result[floor].secundaria.push(elementos.secundaria[index]);
// 					index++;
// 				}

// 				console.log(
// 					`  ✅ Piso ${floor}: ahora tiene ${result[floor].secundaria.length} aulas secundaria`
// 				);
// 			}

// 			console.log(
// 				`📊 Secundaria distribuido: ${index} de ${elementos.secundaria.length}`
// 			);
// 		}

// 		// ✅ DISTRIBUIR BAÑOS - TODOS EN PISO 1
// 		if (elementos.banos && elementos.banos.length > 0) {
// 			// TODOS los baños van al piso 1
// 			result[1].banos = [...elementos.banos];
// 			console.log(`📊 Baños: ${elementos.banos.length} todos en piso 1`);
// 		}

// 		// ✅ DISTRIBUIR AMBIENTES - TODOS EN PISO 1
// 		if (elementos.ambientes && elementos.ambientes.length > 0) {
// 			// Los ambientes típicamente van en piso 1
// 			result[1].ambientes = [...elementos.ambientes];
// 			console.log(
// 				`📊 Ambientes: ${elementos.ambientes.length} todos en piso 1`
// 			);
// 		}

// 		// ✅ DISTRIBUIR LATERALES - TODOS EN PISO 1
// 		if (elementos.laterales && elementos.laterales.length > 0) {
// 			result[1].laterales = [...elementos.laterales];
// 			console.log(
// 				`📊 Laterales: ${elementos.laterales.length} todos en piso 1`
// 			);
// 		}

// 		// ✅ LOG FINAL DE DISTRIBUCIÓN
// 		console.log("📊 Distribución final por pisos:");
// 		for (let floor = 1; floor <= totalFloors; floor++) {
// 			console.log(`  Piso ${floor}:`, {
// 				inicial: result[floor].inicial.length,
// 				primaria: result[floor].primaria.length,
// 				secundaria: result[floor].secundaria.length,
// 				banos: result[floor].banos.length,
// 				ambientes: result[floor].ambientes.length,
// 			});
// 		}

// 		return result;
// 	}, [elementos, distribution, totalFloors]);

// 	if (!distributeByFloor) {
// 		console.error("No se pudo calcular la distribución por pisos");
// 		return null;
// 	}

// 	const calcularCorredores = useMemo(() => {
// 		if (!distributeByFloor || totalFloors <= 1) return {};

// 		const corredores = {};

// 		for (let floor = 2; floor <= totalFloors; floor++) {
// 			corredores[floor] = {
// 				primaria: null,
// 				secundaria: null,
// 				inicial: null,
// 			};

// 			// CORREDOR PRIMARIA
// 			const primarias = distributeByFloor[floor]?.primaria || [];
// 			if (primarias.length > 0) {
// 				const firstAula = primarias[0];
// 				const lastAula = primarias[primarias.length - 1];

// 				if (firstAula?.realCorners && lastAula?.realCorners) {
// 					// Calcular inicio y fin del corredor
// 					corredores[floor].primaria = {
// 						start: {
// 							east: firstAula.realCorners[0].east,
// 							north: firstAula.realCorners[0].north,
// 						},
// 						end: {
// 							east: lastAula.realCorners[1].east,
// 							north: lastAula.realCorners[1].north,
// 						},
// 						lado: "derecha", // O calcular según layoutMode
// 					};
// 				}
// 			}

// 			// CORREDOR SECUNDARIA
// 			const secundarias = distributeByFloor[floor]?.secundaria || [];
// 			if (secundarias.length > 0) {
// 				const firstAula = secundarias[0];
// 				const lastAula = secundarias[secundarias.length - 1];

// 				if (firstAula?.realCorners && lastAula?.realCorners) {
// 					corredores[floor].secundaria = {
// 						start: {
// 							east: firstAula.realCorners[0].east,
// 							north: firstAula.realCorners[0].north,
// 						},
// 						end: {
// 							east: lastAula.realCorners[1].east,
// 							north: lastAula.realCorners[1].north,
// 						},
// 						lado: "izquierda",
// 					};
// 				}
// 			}

// 			// CORREDOR INICIAL (si hay)
// 			const iniciales = distributeByFloor[floor]?.inicial || [];
// 			if (iniciales.length > 0) {
// 				const firstAula = iniciales[0];
// 				const lastAula = iniciales[iniciales.length - 1];

// 				if (firstAula?.realCorners && lastAula?.realCorners) {
// 					corredores[floor].inicial = {
// 						start: {
// 							east: firstAula.realCorners[0].east,
// 							north: firstAula.realCorners[0].north,
// 						},
// 						end: {
// 							east: lastAula.realCorners[1].east,
// 							north: lastAula.realCorners[1].north,
// 						},
// 						lado: "superior",
// 					};
// 				}
// 			}
// 		}

// 		console.log("🚶 Corredores calculados:", corredores);
// 		return corredores;
// 	}, [distributeByFloor, totalFloors]);

// 	return (
// 		<>
// 			{/* ✅ RENDERIZAR CADA PISO CON SUS ELEMENTOS ESPECÍFICOS */}
// 			{Array.from({ length: totalFloors }, (_, i) => i + 1).map(
// 				(floor) => {
// 					if (!visibleFloors.includes(floor)) return null;

// 					const offsetZ = (floor - 1) * ALTURA_PISO;
// 					const floorElements = distributeByFloor[floor];

// 					if (!floorElements) return null;

// 					return (
// 						<group
// 							key={`floor-${floor}`}
// 							position={[0, 0, offsetZ]}
// 						>
// 							{/* Inicial */}
// 							{floorElements.inicial.map((aula, idx) => (
// 								<AulaDetallada
// 									key={`inicial-${floor}-${idx}`}
// 									corners={aula.realCorners}
// 									height={ALTURA_PISO}
// 									color="#eab308"
// 									nombre={`Inicial ${idx + 1}${
// 										totalFloors > 1 ? ` - P${floor}` : ""
// 									}`}
// 									level="inicial"
// 									collegeCenter={collegeCenter}
// 								/>
// 							))}

// 							{/* Primaria */}
// 							{/* {floorElements.primaria.map((aula, idx) => (
// 								<AulaDetallada
// 									key={`primaria-${floor}-${idx}`}
// 									corners={aula.realCorners}
// 									height={ALTURA_PISO}
// 									color="#3b82f6"
// 									nombre={`Primaria ${idx + 1}${
// 										totalFloors > 1 ? ` - P${floor}` : ""
// 									}`}
// 									level="primaria"
// 									collegeCenter={collegeCenter}
// 								/>
// 							))} */}
// 							{floorElements.primaria.map((aula, idx) => {
// 								// ✅ LOG TEMPORAL
// 								if (floor === 2) {
// 									console.log(
// 										`🔵 Renderizando Primaria ${idx} en piso 2:`,
// 										{
// 											firstCorner: aula.realCorners[0],
// 											generated: aula._generated,
// 										}
// 									);
// 								}

// 								return (
// 									<AulaDetallada
// 										key={`primaria-${floor}-${idx}`}
// 										corners={aula.realCorners}
// 										height={ALTURA_PISO}
// 										color="#3b82f6"
// 										nombre={`Primaria ${idx + 1}${
// 											totalFloors > 1
// 												? ` - P${floor}`
// 												: ""
// 										}`}
// 										level="primaria"
// 										collegeCenter={collegeCenter}
// 									/>
// 								);
// 							})}

// 							{/* Secundaria */}
// 							{/* {floorElements.secundaria.map((aula, idx) => (
// 								<AulaDetallada
// 									key={`secundaria-${floor}-${idx}`}
// 									corners={aula.realCorners}
// 									height={ALTURA_PISO}
// 									color="#ef4444"
// 									nombre={`Secundaria ${idx + 1}${
// 										totalFloors > 1 ? ` - P${floor}` : ""
// 									}`}
// 									level="secundaria"
// 									collegeCenter={collegeCenter}
// 								/>
// 							))} */}
// 							{floorElements.secundaria.map((aula, idx) => {
// 								// ✅ LOG TEMPORAL
// 								if (floor === 2) {
// 									console.log(
// 										`🔴 Renderizando Secundaria ${idx} en piso 2:`,
// 										{
// 											firstCorner: aula.realCorners[0],
// 											generated: aula._generated,
// 										}
// 									);
// 								}

// 								return (
// 									<AulaDetallada
// 										key={`secundaria-${floor}-${idx}`}
// 										corners={aula.realCorners}
// 										height={ALTURA_PISO}
// 										color="#ef4444"
// 										nombre={`Secundaria ${idx + 1}${
// 											totalFloors > 1
// 												? ` - P${floor}`
// 												: ""
// 										}`}
// 										level="secundaria"
// 										collegeCenter={collegeCenter}
// 									/>
// 								);
// 							})}

// 							{/* Baños */}
// 							{floorElements.banos.map((bano, idx) => (
// 								<BañoDetallado
// 									key={`bano-${floor}-${idx}`}
// 									corners={bano.realCorners}
// 									height={ALTURA_PISO}
// 									nombre={`Baño${
// 										totalFloors > 1 ? ` P${floor}` : ""
// 									}`}
// 									collegeCenter={collegeCenter}
// 								/>
// 							))}

// 							{/* Ambientes */}
// 							{floorElements.ambientes.map((ambiente, idx) => (
// 								<AulaDetallada
// 									key={`ambiente-${floor}-${idx}`}
// 									corners={ambiente.realCorners}
// 									height={ALTURA_PISO}
// 									color="#ec4899"
// 									nombre={`${ambiente.nombre || "Ambiente"}${
// 										totalFloors > 1 ? ` - P${floor}` : ""
// 									}`}
// 									level="ambiente"
// 									collegeCenter={collegeCenter}
// 								/>
// 							))}

// 							{/* Laterales */}
// 							{floorElements.laterales.map((lateral, idx) => (
// 								<AulaDetallada
// 									key={`lateral-${floor}-${idx}`}
// 									corners={lateral.realCorners}
// 									height={ALTURA_PISO}
// 									color="#fb923c"
// 									nombre={`${lateral.nombre || "Lateral"}${
// 										totalFloors > 1 ? ` - P${floor}` : ""
// 									}`}
// 									level="lateral"
// 									collegeCenter={collegeCenter}
// 								/>
// 							))}

// 							{/* ✅ CORREDORES (solo piso 2+) */}
// 							{floor >= 2 && calcularCorredores[floor] && (
// 								<>
// 									{/* Corredor Primaria */}
// 									{calcularCorredores[floor].primaria && (
// 										<Corredor3D
// 											startPoint={
// 												calcularCorredores[floor]
// 													.primaria.start
// 											}
// 											endPoint={
// 												calcularCorredores[floor]
// 													.primaria.end
// 											}
// 											width={ANCHO_CORREDOR}
// 											height={ALTURA_PISO}
// 											lado={
// 												calcularCorredores[floor]
// 													.primaria.lado
// 											}
// 										/>
// 									)}

// 									{/* Corredor Secundaria */}
// 									{calcularCorredores[floor].secundaria && (
// 										<Corredor3D
// 											startPoint={
// 												calcularCorredores[floor]
// 													.secundaria.start
// 											}
// 											endPoint={
// 												calcularCorredores[floor]
// 													.secundaria.end
// 											}
// 											width={ANCHO_CORREDOR}
// 											height={ALTURA_PISO}
// 											lado={
// 												calcularCorredores[floor]
// 													.secundaria.lado
// 											}
// 										/>
// 									)}

// 									{/* Corredor Inicial */}
// 									{calcularCorredores[floor].inicial && (
// 										<Corredor3D
// 											startPoint={
// 												calcularCorredores[floor]
// 													.inicial.start
// 											}
// 											endPoint={
// 												calcularCorredores[floor]
// 													.inicial.end
// 											}
// 											width={ANCHO_CORREDOR}
// 											height={ALTURA_PISO}
// 											lado={
// 												calcularCorredores[floor]
// 													.inicial.lado
// 											}
// 										/>
// 									)}
// 								</>
// 							)}

// 							{/* Entrada solo piso 1 */}
// 							{floor === 1 && elementos.entrada && (
// 								<AulaDetallada
// 									corners={elementos.entrada.realCorners}
// 									height={ALTURA_PISO}
// 									color="#64748b"
// 									nombre="Entrada"
// 									level="entrada"
// 									collegeCenter={collegeCenter}
// 								/>
// 							)}
// 						</group>
// 					);
// 				}
// 			)}

// 			{/* Escaleras */}
// 			{elementos.escaleras?.map((escalera, idx) => (
// 				<EscaleraDetallada
// 					key={`escalera-${idx}`}
// 					corners={escalera.realCorners}
// 					height={ALTURA_PISO}
// 					totalFloors={totalFloors}
// 					nombre={`Escalera ${idx + 1}`}
// 					collegeCenter={collegeCenter}
// 				/>
// 			))}
// 		</>
// 	);
// };

const EdificioMultiPiso = ({
	elementos,
	totalFloors,
	visibleFloors,
	distribution,
	onElementClick,
}) => {
	const ALTURA_PISO = 3;
	const ANCHO_CORREDOR = 1.5;

	// Calcular centro del colegio
	const collegeCenter = useMemo(() => {
		const allPoints = [];

		const collectPoints = (items) => {
			if (!items || items.length === 0) return;
			items.forEach((item) => {
				if (item.realCorners) {
					item.realCorners.forEach((c) => {
						allPoints.push({ east: c.east, north: c.north });
					});
				}
			});
		};

		collectPoints(elementos.inicial);
		collectPoints(elementos.primaria);
		collectPoints(elementos.secundaria);
		collectPoints(elementos.banos);
		collectPoints(elementos.escaleras);
		collectPoints(elementos.ambientes);
		collectPoints(elementos.laterales);

		if (elementos.entrada?.realCorners) {
			collectPoints([elementos.entrada]);
		}

		if (allPoints.length === 0) return { x: 0, y: 0 };

		const centerX =
			allPoints.reduce((sum, p) => sum + p.east, 0) / allPoints.length;
		const centerY =
			allPoints.reduce((sum, p) => sum + p.north, 0) / allPoints.length;

		return { x: centerX, y: centerY };
	}, [elementos]);

	// Distribuir elementos por piso
	const distributeByFloor = useMemo(() => {
		if (!distribution?.floors) {
			console.warn("No hay información de distribución por pisos");
			return null;
		}

		const result = {};

		for (let floor = 1; floor <= totalFloors; floor++) {
			result[floor] = {
				inicial: [],
				primaria: [],
				secundaria: [],
				banos: [],
				ambientes: [],
				laterales: [],
			};
		}

		// DISTRIBUIR INICIAL
		if (elementos.inicial && elementos.inicial.length > 0) {
			let index = 0;
			for (let floor = 1; floor <= totalFloors; floor++) {
				const count = distribution.floors[floor]?.inicial || 0;
				for (
					let i = 0;
					i < count && index < elementos.inicial.length;
					i++
				) {
					result[floor].inicial.push(elementos.inicial[index]);
					index++;
				}
			}
		}

		// DISTRIBUIR PRIMARIA
		if (elementos.primaria && elementos.primaria.length > 0) {
			let index = 0;
			for (let floor = 1; floor <= totalFloors; floor++) {
				const count = distribution.floors[floor]?.primaria || 0;
				for (
					let i = 0;
					i < count && index < elementos.primaria.length;
					i++
				) {
					result[floor].primaria.push(elementos.primaria[index]);
					index++;
				}
			}
		}

		// DISTRIBUIR SECUNDARIA
		if (elementos.secundaria && elementos.secundaria.length > 0) {
			let index = 0;
			for (let floor = 1; floor <= totalFloors; floor++) {
				const count = distribution.floors[floor]?.secundaria || 0;
				for (
					let i = 0;
					i < count && index < elementos.secundaria.length;
					i++
				) {
					result[floor].secundaria.push(elementos.secundaria[index]);
					index++;
				}
			}
		}

		// DISTRIBUIR BAÑOS - TODOS EN PISO 1
		if (elementos.banos && elementos.banos.length > 0) {
			result[1].banos = [...elementos.banos];
		}

		// DISTRIBUIR AMBIENTES - TODOS EN PISO 1
		if (elementos.ambientes && elementos.ambientes.length > 0) {
			result[1].ambientes = [...elementos.ambientes];
		}

		// DISTRIBUIR LATERALES - TODOS EN PISO 1
		if (elementos.laterales && elementos.laterales.length > 0) {
			result[1].laterales = [...elementos.laterales];
		}

		return result;
	}, [elementos, distribution, totalFloors]);

	// ✅ CALCULAR CORREDORES MEJORADO
	const calcularCorredores = useMemo(() => {
		if (!distributeByFloor || totalFloors <= 1) return {};

		const corredores = {};
		const layoutMode = distribution?.layoutMode || "horizontal";

		for (let floor = 2; floor <= totalFloors; floor++) {
			corredores[floor] = {
				primaria: null,
				secundaria: null,
				inicial: null,
			};

			// ✅ CORREDOR PRIMARIA
			const primarias = distributeByFloor[floor]?.primaria || [];
			if (primarias.length > 1) {
				const firstAula = primarias[0];
				const lastAula = primarias[primarias.length - 1];

				if (firstAula?.realCorners && lastAula?.realCorners) {
					// El corredor va del frente de la primera aula al frente de la última
					// Usar corners[0] y corners[1] que son el frente del aula

					if (layoutMode === "horizontal") {
						// Primaria en vertical (izquierda)
						// El corredor va en el lado DERECHO de las aulas (hacia el centro)
						corredores[floor].primaria = {
							start: {
								east: firstAula.realCorners[1].east, // Esquina frontal derecha primera aula
								north: firstAula.realCorners[1].north,
							},
							end: {
								east: lastAula.realCorners[2].east, // Esquina trasera derecha última aula
								north: lastAula.realCorners[2].north,
							},
							lado: "derecha",
						};
					} else {
						// Vertical: Primaria en horizontal (abajo)
						// El corredor va en el lado SUPERIOR de las aulas
						corredores[floor].primaria = {
							start: {
								east: firstAula.realCorners[0].east,
								north: firstAula.realCorners[0].north,
							},
							end: {
								east: lastAula.realCorners[1].east,
								north: lastAula.realCorners[1].north,
							},
							lado: "superior",
						};
					}
				}
			}

			// ✅ CORREDOR SECUNDARIA
			const secundarias = distributeByFloor[floor]?.secundaria || [];
			if (secundarias.length > 1) {
				const firstAula = secundarias[0];
				const lastAula = secundarias[secundarias.length - 1];

				if (firstAula?.realCorners && lastAula?.realCorners) {
					if (layoutMode === "horizontal") {
						// Secundaria en vertical (derecha)
						// El corredor va en el lado IZQUIERDO de las aulas (hacia el centro)
						corredores[floor].secundaria = {
							start: {
								east: firstAula.realCorners[0].east, // Esquina frontal izquierda primera aula
								north: firstAula.realCorners[0].north,
							},
							end: {
								east: lastAula.realCorners[3].east, // Esquina trasera izquierda última aula
								north: lastAula.realCorners[3].north,
							},
							lado: "izquierda",
						};
					} else {
						// Vertical: Secundaria en horizontal (arriba)
						// El corredor va en el lado INFERIOR de las aulas
						corredores[floor].secundaria = {
							start: {
								east: firstAula.realCorners[3].east,
								north: firstAula.realCorners[3].north,
							},
							end: {
								east: lastAula.realCorners[2].east,
								north: lastAula.realCorners[2].north,
							},
							lado: "inferior",
						};
					}
				}
			}

			// ✅ CORREDOR INICIAL
			const iniciales = distributeByFloor[floor]?.inicial || [];
			if (iniciales.length > 1) {
				const firstAula = iniciales[0];
				const lastAula = iniciales[iniciales.length - 1];

				if (firstAula?.realCorners && lastAula?.realCorners) {
					if (layoutMode === "horizontal") {
						// Inicial en horizontal (abajo)
						corredores[floor].inicial = {
							start: {
								east: firstAula.realCorners[3].east,
								north: firstAula.realCorners[3].north,
							},
							end: {
								east: lastAula.realCorners[2].east,
								north: lastAula.realCorners[2].north,
							},
							lado: "superior",
						};
					} else {
						// Vertical: Inicial en vertical (izquierda)
						corredores[floor].inicial = {
							start: {
								east: firstAula.realCorners[1].east,
								north: firstAula.realCorners[1].north,
							},
							end: {
								east: lastAula.realCorners[2].east,
								north: lastAula.realCorners[2].north,
							},
							lado: "derecha",
						};
					}
				}
			}
		}

		console.log("🚶 Corredores calculados:", corredores);
		return corredores;
	}, [distributeByFloor, totalFloors, distribution]);

	if (!distributeByFloor) return null;

	return (
		<>
			{/* RENDERIZAR CADA PISO */}
			{Array.from({ length: totalFloors }, (_, i) => i + 1).map(
				(floor) => {
					if (!visibleFloors.includes(floor)) return null;

					const offsetZ = (floor - 1) * ALTURA_PISO;
					const floorElements = distributeByFloor[floor];

					if (!floorElements) return null;

					return (
						<group
							key={`floor-${floor}`}
							position={[0, 0, offsetZ]}
						>
							{/* AULAS INICIAL */}
							{floorElements.inicial.map((aula, idx) => (
								// <AulaDetallada
								// 	key={`inicial-${floor}-${idx}`}
								// 	corners={aula.realCorners}
								// 	height={ALTURA_PISO}
								// 	color="#eab308"
								// 	nombre={`Inicial ${idx + 1}${
								// 		totalFloors > 1 ? ` - P${floor}` : ""
								// 	}`}
								// 	level="inicial"
								// 	collegeCenter={collegeCenter}
								// 	onClick={() =>
								// 		onElementClick?.(aula, "inicial")
								// 	}
								// />
								<AulaDetallada
									key={`inicial-${floor}-${idx}`}
									corners={aula.realCorners}
									height={ALTURA_PISO}
									color="#eab308"
									nombre={`Inicial ${idx + 1}${
										totalFloors > 1 ? ` - P${floor}` : ""
									}`}
									level="inicial"
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(aula, "inicial")
									}
									isTopFloor={floor === totalFloors} // ✅ NUEVO
									corridorSide={
										floor >= 2
											? distribution?.layoutMode ===
											  "horizontal"
												? "bottom"
												: "right"
											: null
									} // ✅ NUEVO
								/>
							))}

							{/* AULAS PRIMARIA */}
							{floorElements.primaria.map((aula, idx) => (
								// <AulaDetallada
								// 	key={`primaria-${floor}-${idx}`}
								// 	corners={aula.realCorners}
								// 	height={ALTURA_PISO}
								// 	color="#3b82f6"
								// 	nombre={`Primaria ${idx + 1}${
								// 		totalFloors > 1 ? ` - P${floor}` : ""
								// 	}`}
								// 	level="primaria"
								// 	collegeCenter={collegeCenter}
								// 	onClick={() =>
								// 		onElementClick?.(aula, "primaria")
								// 	}
								// />
								<AulaDetallada
									key={`primaria-${floor}-${idx}`}
									corners={aula.realCorners}
									height={ALTURA_PISO}
									color="#3b82f6"
									nombre={`Primaria ${idx + 1}${
										totalFloors > 1 ? ` - P${floor}` : ""
									}`}
									level="primaria"
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(aula, "primaria")
									}
									isTopFloor={floor === totalFloors} // ✅ NUEVO
									corridorSide={
										floor >= 2
											? distribution?.layoutMode ===
											  "horizontal"
												? "right"
												: "top"
											: null
									} // ✅ NUEVO
								/>
							))}

							{/* AULAS SECUNDARIA */}
							{floorElements.secundaria.map((aula, idx) => (
								// <AulaDetallada
								// 	key={`secundaria-${floor}-${idx}`}
								// 	corners={aula.realCorners}
								// 	height={ALTURA_PISO}
								// 	color="#ef4444"
								// 	nombre={`Secundaria ${idx + 1}${
								// 		totalFloors > 1 ? ` - P${floor}` : ""
								// 	}`}
								// 	level="secundaria"
								// 	collegeCenter={collegeCenter}
								// 	onClick={() =>
								// 		onElementClick?.(aula, "secundaria")
								// 	}
								// />
								<AulaDetallada
									key={`secundaria-${floor}-${idx}`}
									corners={aula.realCorners}
									height={ALTURA_PISO}
									color="#ef4444"
									nombre={`Secundaria ${idx + 1}${
										totalFloors > 1 ? ` - P${floor}` : ""
									}`}
									level="secundaria"
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(aula, "secundaria")
									}
									isTopFloor={floor === totalFloors} // ✅ NUEVO
									corridorSide={
										floor >= 2
											? distribution?.layoutMode ===
											  "horizontal"
												? "right"
												: "top"
											: null
									} // ✅ NUEVO
								/>
							))}

							{/* BAÑOS */}
							{floorElements.banos.map((bano, idx) => (
								<BañoDetallado
									key={`bano-${floor}-${idx}`}
									corners={bano.realCorners}
									height={ALTURA_PISO}
									nombre={`Baño${
										totalFloors > 1 ? ` P${floor}` : ""
									}`}
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(bano, "bano")
									}
								/>
							))}

							{/* AMBIENTES */}
							{floorElements.ambientes.map((ambiente, idx) => (
								<AulaDetallada
									key={`ambiente-${floor}-${idx}`}
									corners={ambiente.realCorners}
									height={ALTURA_PISO}
									color="#ec4899"
									nombre={`${ambiente.nombre || "Ambiente"}${
										totalFloors > 1 ? ` - P${floor}` : ""
									}`}
									level="ambiente"
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(ambiente, "ambiente")
									}
								/>
							))}

							{/* LATERALES */}
							{floorElements.laterales.map((lateral, idx) => (
								<AulaDetallada
									key={`lateral-${floor}-${idx}`}
									corners={lateral.realCorners}
									height={ALTURA_PISO}
									color="#fb923c"
									nombre={`${lateral.nombre || "Lateral"}${
										totalFloors > 1 ? ` - P${floor}` : ""
									}`}
									level="lateral"
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(lateral, "lateral")
									}
								/>
							))}

							{/* ✅ CORREDORES (solo piso 2+) */}
							{floor >= 2 && calcularCorredores[floor] && (
								<>
									{/* Corredor Primaria */}
									{calcularCorredores[floor].primaria && (
										<Corredor3D
											startPoint={
												calcularCorredores[floor]
													.primaria.start
											}
											endPoint={
												calcularCorredores[floor]
													.primaria.end
											}
											width={ANCHO_CORREDOR}
											height={ALTURA_PISO}
											lado={
												calcularCorredores[floor]
													.primaria.lado
											}
										/>
									)}

									{/* Corredor Secundaria */}
									{calcularCorredores[floor].secundaria && (
										<Corredor3D
											startPoint={
												calcularCorredores[floor]
													.secundaria.start
											}
											endPoint={
												calcularCorredores[floor]
													.secundaria.end
											}
											width={ANCHO_CORREDOR}
											height={ALTURA_PISO}
											lado={
												calcularCorredores[floor]
													.secundaria.lado
											}
										/>
									)}

									{/* Corredor Inicial */}
									{calcularCorredores[floor].inicial && (
										<Corredor3D
											startPoint={
												calcularCorredores[floor]
													.inicial.start
											}
											endPoint={
												calcularCorredores[floor]
													.inicial.end
											}
											width={ANCHO_CORREDOR}
											height={ALTURA_PISO}
											lado={
												calcularCorredores[floor]
													.inicial.lado
											}
										/>
									)}
								</>
							)}

							{/* ENTRADA (solo piso 1) */}
							{floor === 1 && elementos.entrada && (
								<AulaDetallada
									corners={elementos.entrada.realCorners}
									height={ALTURA_PISO}
									color="#64748b"
									nombre="Entrada"
									level="entrada"
									collegeCenter={collegeCenter}
									onClick={() =>
										onElementClick?.(
											elementos.entrada,
											"entrada"
										)
									}
								/>
							)}
						</group>
					);
				}
			)}

			{/* ESCALERAS (atraviesan todos los pisos) */}
			{elementos.escaleras?.map((escalera, idx) => (
				<EscaleraDetallada
					key={`escalera-${idx}`}
					corners={escalera.realCorners}
					height={ALTURA_PISO}
					totalFloors={totalFloors}
					nombre={`Escalera ${idx + 1}`}
					collegeCenter={collegeCenter}
					onClick={() => onElementClick?.(escalera, "escalera")}
				/>
			))}
		</>
	);
};

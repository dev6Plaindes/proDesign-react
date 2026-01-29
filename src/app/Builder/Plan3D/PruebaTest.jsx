import React, { useState } from "react";
import {
	Trash2,
	Plus,
	Calculator,
	Building2,
	RotateCw,
	AlertCircle,
	Upload,
	X,
	Layers,
	Info,
	ChevronUp,
	ChevronDown,
} from "lucide-react";

export default function TerrainPlanner() {
	const [coordinates, setCoordinates] = useState([]);
	const [currentCoord, setCurrentCoord] = useState({ east: "", north: "" });
	const [rectangleOptions, setRectangleOptions] = useState([]);
	const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
	const [maxRectangle, setMaxRectangle] = useState(null);
	const [isCalculating, setIsCalculating] = useState(false);

	const [classroomsInicial, setClassroomsInicial] = useState("");
	const [classroomsPrimaria, setClassroomsPrimaria] = useState("");
	const [classroomsSecundaria, setClassroomsSecundaria] = useState("");
	const [distribution, setDistribution] = useState(null);
	const [capacityInfo, setCapacityInfo] = useState(null);

	const [ambientesComplementarios, setAmbientesComplementarios] = useState(
		[]
	);
	const [showAmbientesInput, setShowAmbientesInput] = useState(false);
	const [ambientesInput, setAmbientesInput] = useState("");

	const [showBulkInput, setShowBulkInput] = useState(false);
	const [bulkInput, setBulkInput] = useState("");

	const [currentFloor, setCurrentFloor] = useState(1);
	const [totalFloors, setTotalFloors] = useState(1);

	// Dimensiones
	const CLASSROOM_WIDTH = 7.8;
	const CLASSROOM_HEIGHT = 7.2;
	const CANCHA_WIDTH = 28;
	const CANCHA_HEIGHT = 15;
	const BANO_WIDTH = 4.2;
	const BANO_HEIGHT = 7.2;
	const ESCALERA_WIDTH = 3.2;
	const ESCALERA_HEIGHT = 4.2;
	const CIRCULACION_LATERAL = 5;
	const CIRCULACION_ENTRE_PABELLONES = 10;
	const ENTRADA_WIDTH = 5;
	const SEPARACION_CANCHA = 5;

	const loadVerticesFromArray = (vertices) => {
		try {
			const parsedCoords = vertices.map((vertex, index) => ({
				id: Date.now() + index,
				east: parseFloat(vertex[0]),
				north: parseFloat(vertex[1]),
			}));

			setCoordinates(parsedCoords);
			setMaxRectangle(null);
			setDistribution(null);
			setCapacityInfo(null);
			setShowBulkInput(false);
			setBulkInput("");
			setCurrentFloor(1);
			setTotalFloors(1);
		} catch (error) {
			alert("Error al procesar las coordenadas.");
		}
	};

	const handleBulkLoad = () => {
		try {
			const parsed = JSON.parse(bulkInput);
			if (
				Array.isArray(parsed) &&
				parsed.length > 0 &&
				Array.isArray(parsed[0]) &&
				parsed[0].length === 2
			) {
				loadVerticesFromArray(parsed);
			} else {
				alert("Formato incorrecto");
			}
		} catch (error) {
			alert("Error al parsear JSON");
		}
	};

	const handleLoadAmbientes = () => {
		try {
			const parsed = JSON.parse(ambientesInput);
			if (Array.isArray(parsed) && parsed.length > 0) {
				const valid = parsed.every(
					(amb) =>
						amb.nombre &&
						typeof amb.ancho === "number" &&
						typeof amb.alto === "number"
				);
				if (valid) {
					setAmbientesComplementarios(parsed);
					setShowAmbientesInput(false);
					setAmbientesInput("");
					if (maxRectangle) {
						calculateCapacity();
					}
				} else {
					alert("Cada ambiente debe tener: nombre, ancho, alto");
				}
			}
		} catch (error) {
			alert("Error al parsear JSON");
		}
	};

	// Clasificar ambientes
	const classifyAmbientes = (ambientes) => {
		const enPabellones = [];
		const lateralesCancha = [];
		const superiores = [];

		ambientes.forEach((amb) => {
			const nombre = amb.nombre.toLowerCase();
			if (nombre.includes("laboratorio")) {
				enPabellones.push({ ...amb, pabellon: "secundaria" });
			} else if (nombre.includes("biblioteca")) {
				enPabellones.push({ ...amb, pabellon: "primaria" });
			} else if (
				nombre.includes("cocina") ||
				nombre.includes("comedor")
			) {
				lateralesCancha.push(amb);
			} else {
				superiores.push(amb);
			}
		});

		return { enPabellones, lateralesCancha, superiores };
	};

	const addCoordinate = () => {
		if (currentCoord.east && currentCoord.north) {
			setCoordinates([
				...coordinates,
				{
					id: Date.now(),
					east: parseFloat(currentCoord.east),
					north: parseFloat(currentCoord.north),
				},
			]);
			setCurrentCoord({ east: "", north: "" });
			setMaxRectangle(null);
			setDistribution(null);
			setCapacityInfo(null);
		}
	};

	const deleteCoordinate = (id) => {
		setCoordinates(coordinates.filter((coord) => coord.id !== id));
		setMaxRectangle(null);
		setDistribution(null);
		setCapacityInfo(null);
	};

	const clearAllCoordinates = () => {
		setCoordinates([]);
		setMaxRectangle(null);
		setDistribution(null);
		setCapacityInfo(null);
	};

	const isPointInPolygon = (point, polygon) => {
		let inside = false;
		for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			const xi = polygon[i].east,
				yi = polygon[i].north;
			const xj = polygon[j].east,
				yj = polygon[j].north;
			const intersect =
				yi > point.north !== yj > point.north &&
				point.east < ((xj - xi) * (point.north - yi)) / (yj - yi) + xi;
			if (intersect) inside = !inside;
		}
		return inside;
	};

	const rotatePoint = (point, angle, center) => {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const dx = point.east - center.east;
		const dy = point.north - center.north;
		return {
			east: cos * dx - sin * dy + center.east,
			north: sin * dx + cos * dy + center.north,
		};
	};

	const findMaxRectangleAtAngle = (polygon, angle) => {
		const center = {
			east: polygon.reduce((sum, p) => sum + p.east, 0) / polygon.length,
			north:
				polygon.reduce((sum, p) => sum + p.north, 0) / polygon.length,
		};
		const rotatedPolygon = polygon.map((p) =>
			rotatePoint(p, -angle, center)
		);
		const easts = rotatedPolygon.map((p) => p.east);
		const norths = rotatedPolygon.map((p) => p.north);
		const minE = Math.min(...easts);
		const maxE = Math.max(...easts);
		const minN = Math.min(...norths);
		const maxN = Math.max(...norths);
		let maxArea = 0;
		let bestRect = null;
		const step = (maxE - minE) / 20;
		for (let x1 = minE; x1 < maxE; x1 += step) {
			for (let y1 = minN; y1 < maxN; y1 += step) {
				for (let x2 = x1 + step; x2 <= maxE; x2 += step) {
					for (let y2 = y1 + step; y2 <= maxN; y2 += step) {
						const corners = [
							{ east: x1, north: y1 },
							{ east: x2, north: y1 },
							{ east: x2, north: y2 },
							{ east: x1, north: y2 },
						];
						const allInside = corners.every((corner) =>
							isPointInPolygon(corner, rotatedPolygon)
						);
						if (allInside) {
							const area = (x2 - x1) * (y2 - y1);
							if (area > maxArea) {
								maxArea = area;
								bestRect = { x1, y1, x2, y2 };
							}
						}
					}
				}
			}
		}
		if (!bestRect) return null;
		const rectCorners = [
			{ east: bestRect.x1, north: bestRect.y1 },
			{ east: bestRect.x2, north: bestRect.y1 },
			{ east: bestRect.x2, north: bestRect.y2 },
			{ east: bestRect.x1, north: bestRect.y2 },
		].map((p) => rotatePoint(p, angle, center));
		return {
			corners: rectCorners,
			area: maxArea,
			width: Math.abs(bestRect.x2 - bestRect.x1),
			height: Math.abs(bestRect.y2 - bestRect.y1),
			angle: (angle * 180) / Math.PI,
		};
	};

	const calculateMaxRectangle = () => {
		if (coordinates.length < 3) return;

		setIsCalculating(true);
		setRectangleOptions([]);
		setSelectedRectangleIndex(null);
		setMaxRectangle(null);
		setDistribution(null);

		setTimeout(() => {
			const allRectangles = [];

			// Buscar rectángulos en diferentes ángulos
			for (let degrees = 0; degrees < 180; degrees += 5) {
				const angle = (degrees * Math.PI) / 180;
				const rect = findMaxRectangleAtAngle(coordinates, angle);

				if (rect) {
					allRectangles.push(rect);
				}
			}

			// Refinamiento de los mejores
			const topRectangles = allRectangles
				.sort((a, b) => b.area - a.area)
				.slice(0, 5);

			topRectangles.forEach((rect) => {
				const bestAngle = (rect.angle * Math.PI) / 180;
				for (let offset = -5; offset <= 5; offset += 0.5) {
					const angle = bestAngle + (offset * Math.PI) / 180;
					const refinedRect = findMaxRectangleAtAngle(
						coordinates,
						angle
					);
					if (refinedRect) {
						allRectangles.push(refinedRect);
					}
				}
			});

			// Seleccionar las mejores 3 opciones diversas
			const sortedByArea = allRectangles.sort((a, b) => b.area - a.area);
			const options = [];

			// Opción 1: Rectángulo con mayor área
			if (sortedByArea[0]) {
				options.push({ ...sortedByArea[0], reason: "Mayor área" });
			}

			// Opción 2: Buscar uno con proporciones diferentes (más cuadrado o más alargado)
			const firstRatio = sortedByArea[0]
				? sortedByArea[0].width / sortedByArea[0].height
				: 0;
			for (let i = 1; i < sortedByArea.length; i++) {
				const rect = sortedByArea[i];
				const ratio = rect.width / rect.height;
				const ratioDiff = Math.abs(ratio - firstRatio);

				// Si tiene proporciones significativamente diferentes y área razonable
				if (
					ratioDiff > 0.2 &&
					rect.area > sortedByArea[0].area * 0.85 &&
					options.length < 3
				) {
					const isAlreadySimilar = options.some(
						(opt) =>
							Math.abs(opt.angle - rect.angle) < 10 &&
							Math.abs(opt.area - rect.area) < opt.area * 0.05
					);

					if (!isAlreadySimilar) {
						const aspectRatio = rect.width / rect.height;
						let reason = "Proporciones diferentes";
						if (aspectRatio > 1.5) {
							reason = "Más alargado";
						} else if (aspectRatio < 0.8) {
							reason = "Más vertical";
						} else {
							reason = "Más equilibrado";
						}
						options.push({ ...rect, reason });
					}
				}

				if (options.length >= 3) break;
			}

			// Si solo tenemos 1-2 opciones, agregar las siguientes mejores por área
			for (
				let i = 1;
				i < sortedByArea.length && options.length < 3;
				i++
			) {
				const rect = sortedByArea[i];
				const isAlreadyAdded = options.some(
					(opt) =>
						Math.abs(opt.angle - rect.angle) < 5 &&
						Math.abs(opt.area - rect.area) < opt.area * 0.02
				);

				if (!isAlreadyAdded) {
					options.push({
						...rect,
						reason: `Opción ${options.length + 1}`,
					});
				}
			}

			setRectangleOptions(options);
			setIsCalculating(false);
		}, 100);
	};

	const selectRectangle = (index) => {
		setSelectedRectangleIndex(index);
		setMaxRectangle(rectangleOptions[index]);
		calculateCapacityForRectangle(rectangleOptions[index]);
	};

	const calculateCapacityForRectangle = (rect) => {
		const rectWidth = rect.width;
		const rectHeight = rect.height;
		const verticalSpace = rectHeight - CIRCULACION_LATERAL;
		const horizontalSpace = rectWidth - CIRCULACION_LATERAL * 2;

		const { enPabellones, superiores } = classifyAmbientes(
			ambientesComplementarios
		);

		const labEnSecundaria = enPabellones.some(
			(a) => a.pabellon === "secundaria"
		);
		const bibEnPrimaria = enPabellones.some(
			(a) => a.pabellon === "primaria"
		);

		// Calcular espacio ocupado por ambientes superiores + entrada
		const totalAmbientesSuperioresWidth =
			superiores.reduce((sum, amb) => sum + amb.ancho, 0) + ENTRADA_WIDTH;
		const maxAmbientesSuperioresHeight =
			superiores.length > 0
				? Math.max(...superiores.map((amb) => amb.alto))
				: CLASSROOM_HEIGHT;

		// INICIAL (pabellón horizontal inferior)
		const inicialSpace = horizontalSpace;
		const inicialNeedsServices = BANO_WIDTH + ESCALERA_WIDTH;
		const inicialAvailableForClassrooms =
			inicialSpace - inicialNeedsServices;
		const maxInicialClassrooms = Math.floor(
			inicialAvailableForClassrooms / CLASSROOM_WIDTH
		);

		// PRIMARIA (pabellón vertical izquierdo)
		const primariaSpace =
			verticalSpace - CLASSROOM_HEIGHT - CIRCULACION_ENTRE_PABELLONES;
		const primariaNeedsServices = BANO_HEIGHT + ESCALERA_HEIGHT;
		const primariaAvailableForClassrooms =
			primariaSpace - primariaNeedsServices;
		let maxPrimariaClassrooms = Math.floor(
			primariaAvailableForClassrooms / CLASSROOM_HEIGHT
		);
		if (bibEnPrimaria)
			maxPrimariaClassrooms = Math.max(0, maxPrimariaClassrooms - 1);

		// SECUNDARIA (pabellón vertical derecho)
		const secundariaSpace =
			verticalSpace - CLASSROOM_HEIGHT - CIRCULACION_ENTRE_PABELLONES;
		const secundariaNeedsServices = BANO_HEIGHT + ESCALERA_HEIGHT;
		const secundariaAvailableForClassrooms =
			secundariaSpace - secundariaNeedsServices;
		let maxSecundariaClassrooms = Math.floor(
			secundariaAvailableForClassrooms / CLASSROOM_HEIGHT
		);
		if (labEnSecundaria)
			maxSecundariaClassrooms = Math.max(0, maxSecundariaClassrooms - 1);

		setCapacityInfo({
			inicial: { max: maxInicialClassrooms },
			primaria: {
				max: maxPrimariaClassrooms,
				hasBiblioteca: bibEnPrimaria,
			},
			secundaria: {
				max: maxSecundariaClassrooms,
				hasLaboratorio: labEnSecundaria,
			},
			ambientesSuperiores: {
				totalWidth: totalAmbientesSuperioresWidth,
				maxHeight: maxAmbientesSuperioresHeight,
				availableWidth: rectWidth - CIRCULACION_LATERAL * 2,
			},
		});
	};

	const calculateCapacity = () => {
		if (maxRectangle) {
			calculateCapacityForRectangle(maxRectangle);
		}
	};

	const calculateDistribution = () => {
		if (!maxRectangle || !capacityInfo) return;

		const inicialTotal = parseInt(classroomsInicial) || 0;
		const primariaTotal = parseInt(classroomsPrimaria) || 0;
		const secundariaTotal = parseInt(classroomsSecundaria) || 0;

		if (inicialTotal + primariaTotal + secundariaTotal === 0) {
			alert("Debes ingresar al menos una cantidad de aulas");
			return;
		}

		const { enPabellones, lateralesCancha, superiores } = classifyAmbientes(
			ambientesComplementarios
		);

		// Validar espacio para ambientes superiores + entrada
		const totalSuperioresWidth =
			superiores.reduce((sum, amb) => sum + amb.ancho, 0) + ENTRADA_WIDTH;
		if (
			totalSuperioresWidth >
			capacityInfo.ambientesSuperiores.availableWidth
		) {
			alert(`Ambientes superiores + entrada exceden el ancho disponible`);
			return;
		}

		// LÓGICA: Si no hay inicial, usar ese pabellón para el nivel con más aulas
		let usarPabellonInferiorPara = "inicial"; // Por defecto
		let aulasEnPabellonInferior = inicialTotal;

		if (inicialTotal === 0) {
			// Decidir qué nivel usa el pabellón inferior
			if (primariaTotal > secundariaTotal) {
				usarPabellonInferiorPara = "primaria";
				aulasEnPabellonInferior = Math.min(
					primariaTotal,
					capacityInfo.inicial.max
				);
			} else if (secundariaTotal > 0) {
				usarPabellonInferiorPara = "secundaria";
				aulasEnPabellonInferior = Math.min(
					secundariaTotal,
					capacityInfo.inicial.max
				);
			}
		}

		// Calcular distribución según el caso
		let inicialFloor1 = 0,
			inicialFloor2 = 0;
		let primariaFloor1 = 0,
			primariaFloor2 = 0;
		let secundariaFloor1 = 0,
			secundariaFloor2 = 0;

		if (usarPabellonInferiorPara === "inicial") {
			// Caso normal: hay aulas de inicial
			inicialFloor1 = Math.min(inicialTotal, capacityInfo.inicial.max);
			inicialFloor2 = inicialTotal - inicialFloor1;

			primariaFloor1 = Math.min(primariaTotal, capacityInfo.primaria.max);
			primariaFloor2 = primariaTotal - primariaFloor1;

			secundariaFloor1 = Math.min(
				secundariaTotal,
				capacityInfo.secundaria.max
			);
			secundariaFloor2 = secundariaTotal - secundariaFloor1;
		} else if (usarPabellonInferiorPara === "primaria") {
			// No hay inicial, primaria usa el pabellón inferior
			const primariaEnInferior = Math.min(
				primariaTotal,
				capacityInfo.inicial.max
			);
			const primariaRestante = primariaTotal - primariaEnInferior;

			inicialFloor1 = primariaEnInferior; // Se dibuja en zona inicial pero son aulas de primaria
			primariaFloor1 = Math.min(
				primariaRestante,
				capacityInfo.primaria.max
			);
			primariaFloor2 = primariaRestante - primariaFloor1;

			secundariaFloor1 = Math.min(
				secundariaTotal,
				capacityInfo.secundaria.max
			);
			secundariaFloor2 = secundariaTotal - secundariaFloor1;
		} else if (usarPabellonInferiorPara === "secundaria") {
			// No hay inicial, secundaria usa el pabellón inferior
			const secundariaEnInferior = Math.min(
				secundariaTotal,
				capacityInfo.inicial.max
			);
			const secundariaRestante = secundariaTotal - secundariaEnInferior;

			inicialFloor1 = secundariaEnInferior; // Se dibuja en zona inicial pero son aulas de secundaria
			secundariaFloor1 = Math.min(
				secundariaRestante,
				capacityInfo.secundaria.max
			);
			secundariaFloor2 = secundariaRestante - secundariaFloor1;

			primariaFloor1 = Math.min(primariaTotal, capacityInfo.primaria.max);
			primariaFloor2 = primariaTotal - primariaFloor1;
		}

		// Distribuir ambientes superiores
		const superioresFloor1 = [];
		const superioresFloor2 = [];
		let currentWidth = 0;

		superiores.forEach((amb) => {
			if (
				currentWidth + amb.ancho <=
				capacityInfo.ambientesSuperiores.availableWidth - ENTRADA_WIDTH
			) {
				superioresFloor1.push(amb);
				currentWidth += amb.ancho;
			} else {
				superioresFloor2.push(amb);
			}
		});

		const needsSecondFloor =
			inicialFloor2 +
				primariaFloor2 +
				secundariaFloor2 +
				superioresFloor2.length >
			0;
		const floors = needsSecondFloor ? 2 : 1;

		setTotalFloors(floors);
		setCurrentFloor(1);

		setDistribution({
			floors: {
				1: {
					inicial: inicialFloor1,
					primaria: primariaFloor1,
					secundaria: secundariaFloor1,
					inicialBanoPos: Math.floor(inicialFloor1 / 2),
					primariaBanoPos: Math.floor(primariaFloor1 / 2),
					secundariaBanoPos: Math.floor(secundariaFloor1 / 2),
					ambientesSuperiores: superioresFloor1,
				},
				2: {
					inicial: inicialFloor2,
					primaria: primariaFloor2,
					secundaria: secundariaFloor2,
					inicialBanoPos: Math.floor(inicialFloor2 / 2),
					primariaBanoPos: Math.floor(primariaFloor2 / 2),
					secundariaBanoPos: Math.floor(secundariaFloor2 / 2),
					ambientesSuperiores: superioresFloor2,
				},
			},
			totalFloors: floors,
			ambientesEnPabellones: enPabellones,
			ambientesLateralesCancha: lateralesCancha,
			pabellonInferiorEs: usarPabellonInferiorPara, // Para saber qué color usar
		});
	};

	const convertToSVG = () => {
		if (coordinates.length < 3) return { points: [], bounds: null };

		const easts = coordinates.map((c) => c.east);
		const norths = coordinates.map((c) => c.north);
		const minEast = Math.min(...easts);
		const maxEast = Math.max(...easts);
		const minNorth = Math.min(...norths);
		const maxNorth = Math.max(...norths);

		const width = 600;
		const height = 600;
		const padding = 50;
		const rangeEast = maxEast - minEast || 1;
		const rangeNorth = maxNorth - minNorth || 1;
		const scale = Math.min(
			(width - 2 * padding) / rangeEast,
			(height - 2 * padding) / rangeNorth
		);

		const points = coordinates.map((coord) => ({
			x: (coord.east - minEast) * scale + padding,
			y: height - ((coord.north - minNorth) * scale + padding),
			east: coord.east,
			north: coord.north,
		}));

		let rectangleSVG = null;
		let elementos = {
			inicial: [],
			primaria: [],
			secundaria: [],
			ambientes: [],
			banos: [],
			escaleras: [],
			laterales: [],
			entrada: null,
		};
		let canchaSVG = null;

		if (maxRectangle) {
			rectangleSVG = maxRectangle.corners.map((corner) => ({
				x: (corner.east - minEast) * scale + padding,
				y: height - ((corner.north - minNorth) * scale + padding),
			}));

			if (!distribution) {
				return {
					points,
					rectangleSVG,
					elementos,
					canchaSVG,
					bounds: { minEast, maxEast, minNorth, maxNorth, scale },
				};
			}

			const floorData = distribution.floors[currentFloor];
			const rectWidth = maxRectangle.width;
			const rectHeight = maxRectangle.height;
			const origin = maxRectangle.corners[0];
			const angle = (maxRectangle.angle * Math.PI) / 180;
			const dirX = { east: Math.cos(angle), north: Math.sin(angle) };
			const dirY = { east: -Math.sin(angle), north: Math.cos(angle) };

			const createRoomCorners = (x, y, w, h) => {
				return [
					{ east: x, north: y },
					{ east: x + dirX.east * w, north: y + dirX.north * w },
					{
						east: x + dirX.east * w + dirY.east * h,
						north: y + dirX.north * w + dirY.north * h,
					},
					{ east: x + dirY.east * h, north: y + dirY.north * h },
				].map((c) => ({
					x: (c.east - minEast) * scale + padding,
					y: height - ((c.north - minNorth) * scale + padding),
				}));
			};

			// ENTRADA - en pabellón superior junto con ambientes (solo piso 1)
			if (currentFloor === 1 && floorData.ambientesSuperiores) {
				const totalAmbientesWidth =
					floorData.ambientesSuperiores.reduce(
						(sum, amb) => sum + amb.ancho,
						0
					);
				const startXAmbientes =
					(rectWidth - totalAmbientesWidth - ENTRADA_WIDTH) / 2;

				// Entrada primero
				let currentXAmbiente = startXAmbientes;
				const ambienteY = rectHeight - CLASSROOM_HEIGHT;
				const xEnt =
					origin.east +
					dirX.east * currentXAmbiente +
					dirY.east * ambienteY;
				const yEnt =
					origin.north +
					dirX.north * currentXAmbiente +
					dirY.north * ambienteY;
				elementos.entrada = {
					corners: createRoomCorners(
						xEnt,
						yEnt,
						ENTRADA_WIDTH,
						CLASSROOM_HEIGHT
					),
				};
				currentXAmbiente += ENTRADA_WIDTH;

				// Luego ambientes superiores
				floorData.ambientesSuperiores.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * currentXAmbiente +
						dirY.east * (rectHeight - ambiente.alto);
					const y =
						origin.north +
						dirX.north * currentXAmbiente +
						dirY.north * (rectHeight - ambiente.alto);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						corners: createRoomCorners(
							x,
							y,
							ambiente.ancho,
							ambiente.alto
						),
					});
					currentXAmbiente += ambiente.ancho;
				});
			} else if (
				currentFloor === 2 &&
				floorData.ambientesSuperiores &&
				floorData.ambientesSuperiores.length > 0
			) {
				// En piso 2, solo ambientes (sin entrada)
				const totalAmbientesWidth =
					floorData.ambientesSuperiores.reduce(
						(sum, amb) => sum + amb.ancho,
						0
					);
				const startXAmbientes = (rectWidth - totalAmbientesWidth) / 2;
				let currentXAmbiente = startXAmbientes;

				floorData.ambientesSuperiores.forEach((ambiente) => {
					const x =
						origin.east +
						dirX.east * currentXAmbiente +
						dirY.east * (rectHeight - ambiente.alto);
					const y =
						origin.north +
						dirX.north * currentXAmbiente +
						dirY.north * (rectHeight - ambiente.alto);
					elementos.ambientes.push({
						nombre: ambiente.nombre,
						tipo: "superior",
						corners: createRoomCorners(
							x,
							y,
							ambiente.ancho,
							ambiente.alto
						),
					});
					currentXAmbiente += ambiente.ancho;
				});
			}

			// INICIAL (o pabellón que ocupa ese lugar)
			const pabellonInferiorColor =
				distribution.pabellonInferiorEs === "primaria"
					? "primaria"
					: distribution.pabellonInferiorEs === "secundaria"
					? "secundaria"
					: "inicial";

			let currentXInicial = CIRCULACION_LATERAL;

			for (let i = 0; i < floorData.inicial; i++) {
				// Insertar entrada en el medio
				if (
					i === Math.floor(floorData.inicial / 2) &&
					currentFloor === 1 &&
					floorData.inicial > 1
				) {
					// Ya no insertamos entrada aquí
				}

				if (i === floorData.inicialBanoPos && floorData.inicial > 0) {
					const xBano = origin.east + dirX.east * currentXInicial;
					const yBano = origin.north + dirX.north * currentXInicial;
					elementos.banos.push({
						nivel: "Inicial",
						corners: createRoomCorners(
							xBano,
							yBano,
							BANO_WIDTH,
							BANO_HEIGHT
						),
					});
					currentXInicial += BANO_WIDTH;

					const xEsc = origin.east + dirX.east * currentXInicial;
					const yEsc = origin.north + dirX.north * currentXInicial;
					elementos.escaleras.push({
						nivel: "Inicial",
						corners: createRoomCorners(
							xEsc,
							yEsc,
							ESCALERA_WIDTH,
							ESCALERA_HEIGHT
						),
					});
					currentXInicial += ESCALERA_WIDTH;
				}

				const x = origin.east + dirX.east * currentXInicial;
				const y = origin.north + dirX.north * currentXInicial;

				// Agregar al array correcto según qué nivel ocupa el pabellón inferior
				if (pabellonInferiorColor === "inicial") {
					elementos.inicial.push({
						corners: createRoomCorners(
							x,
							y,
							CLASSROOM_WIDTH,
							CLASSROOM_HEIGHT
						),
					});
				} else if (pabellonInferiorColor === "primaria") {
					elementos.primaria.push({
						corners: createRoomCorners(
							x,
							y,
							CLASSROOM_WIDTH,
							CLASSROOM_HEIGHT
						),
					});
				} else if (pabellonInferiorColor === "secundaria") {
					elementos.secundaria.push({
						corners: createRoomCorners(
							x,
							y,
							CLASSROOM_WIDTH,
							CLASSROOM_HEIGHT
						),
					});
				}

				currentXInicial += CLASSROOM_WIDTH;
			}

			// PRIMARIA
			const startYPrimaria =
				CLASSROOM_HEIGHT + CIRCULACION_ENTRE_PABELLONES;
			let currentYPrimaria = startYPrimaria;
			const bibliotecaEnPrimaria =
				distribution.ambientesEnPabellones.find(
					(a) => a.pabellon === "primaria"
				);

			for (let i = 0; i < floorData.primaria; i++) {
				if (i === floorData.primariaBanoPos && floorData.primaria > 0) {
					const xBano = origin.east + dirY.east * currentYPrimaria;
					const yBano = origin.north + dirY.north * currentYPrimaria;
					elementos.banos.push({
						nivel: "Primaria",
						corners: createRoomCorners(
							xBano,
							yBano,
							CLASSROOM_WIDTH,
							BANO_HEIGHT
						),
					});
					currentYPrimaria += BANO_HEIGHT;

					const xEsc = origin.east + dirY.east * currentYPrimaria;
					const yEsc = origin.north + dirY.north * currentYPrimaria;
					elementos.escaleras.push({
						nivel: "Primaria",
						corners: createRoomCorners(
							xEsc,
							yEsc,
							CLASSROOM_WIDTH,
							ESCALERA_HEIGHT
						),
					});
					currentYPrimaria += ESCALERA_HEIGHT;
				}

				const x = origin.east + dirY.east * currentYPrimaria;
				const y = origin.north + dirY.north * currentYPrimaria;
				elementos.primaria.push({
					corners: createRoomCorners(
						x,
						y,
						CLASSROOM_WIDTH,
						CLASSROOM_HEIGHT
					),
				});
				currentYPrimaria += CLASSROOM_HEIGHT;
			}

			if (
				bibliotecaEnPrimaria &&
				currentFloor === 1 &&
				floorData.primaria > 0
			) {
				const x = origin.east + dirY.east * currentYPrimaria;
				const y = origin.north + dirY.north * currentYPrimaria;
				elementos.ambientes.push({
					nombre: bibliotecaEnPrimaria.nombre,
					tipo: "pabellon",
					corners: createRoomCorners(
						x,
						y,
						bibliotecaEnPrimaria.ancho,
						bibliotecaEnPrimaria.alto
					),
				});
			}

			// SECUNDARIA
			let currentYSecundaria = startYPrimaria;
			const laboratorioEnSecundaria =
				distribution.ambientesEnPabellones.find(
					(a) => a.pabellon === "secundaria"
				);

			for (let i = 0; i < floorData.secundaria; i++) {
				if (
					i === floorData.secundariaBanoPos &&
					floorData.secundaria > 0
				) {
					const xBano =
						origin.east +
						dirX.east * (rectWidth - CLASSROOM_WIDTH) +
						dirY.east * currentYSecundaria;
					const yBano =
						origin.north +
						dirX.north * (rectWidth - CLASSROOM_WIDTH) +
						dirY.north * currentYSecundaria;
					elementos.banos.push({
						nivel: "Secundaria",
						corners: createRoomCorners(
							xBano,
							yBano,
							CLASSROOM_WIDTH,
							BANO_HEIGHT
						),
					});
					currentYSecundaria += BANO_HEIGHT;

					const xEsc =
						origin.east +
						dirX.east * (rectWidth - CLASSROOM_WIDTH) +
						dirY.east * currentYSecundaria;
					const yEsc =
						origin.north +
						dirX.north * (rectWidth - CLASSROOM_WIDTH) +
						dirY.north * currentYSecundaria;
					elementos.escaleras.push({
						nivel: "Secundaria",
						corners: createRoomCorners(
							xEsc,
							yEsc,
							CLASSROOM_WIDTH,
							ESCALERA_HEIGHT
						),
					});
					currentYSecundaria += ESCALERA_HEIGHT;
				}

				const x =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const y =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;
				elementos.secundaria.push({
					corners: createRoomCorners(
						x,
						y,
						CLASSROOM_WIDTH,
						CLASSROOM_HEIGHT
					),
				});
				currentYSecundaria += CLASSROOM_HEIGHT;
			}

			if (
				laboratorioEnSecundaria &&
				currentFloor === 1 &&
				floorData.secundaria > 0
			) {
				const x =
					origin.east +
					dirX.east * (rectWidth - CLASSROOM_WIDTH) +
					dirY.east * currentYSecundaria;
				const y =
					origin.north +
					dirX.north * (rectWidth - CLASSROOM_WIDTH) +
					dirY.north * currentYSecundaria;
				elementos.ambientes.push({
					nombre: laboratorioEnSecundaria.nombre,
					tipo: "pabellon",
					corners: createRoomCorners(
						x,
						y,
						laboratorioEnSecundaria.ancho,
						laboratorioEnSecundaria.alto
					),
				});
			}

			// AMBIENTES SUPERIORES ya fueron dibujados arriba con la entrada

			// BLOQUE CENTRAL: Cancha arriba, Cocina/Comedor abajo (vertical) - solo piso 1
			if (currentFloor === 1) {
				const lateralesCancha =
					distribution.ambientesLateralesCancha || [];

				// Calcular dimensiones del bloque cocina/comedor
				const totalWidthLaterales = lateralesCancha.reduce(
					(sum, amb) => sum + amb.ancho,
					0
				);
				const maxHeightLaterales =
					lateralesCancha.length > 0
						? Math.max(...lateralesCancha.map((amb) => amb.alto))
						: 0;

				// Altura total del bloque: cancha + separación + cocina/comedor
				const totalBloqueHeight =
					CANCHA_HEIGHT +
					(lateralesCancha.length > 0
						? SEPARACION_CANCHA + maxHeightLaterales
						: 0);

				// Centrar verticalmente
				const startY = (rectHeight - totalBloqueHeight) / 2;

				// CANCHA primero (arriba)
				const canchaX = (rectWidth - CANCHA_WIDTH) / 2;
				const canchaOrigin = {
					east:
						origin.east + dirX.east * canchaX + dirY.east * startY,
					north:
						origin.north +
						dirX.north * canchaX +
						dirY.north * startY,
				};
				canchaSVG = createRoomCorners(
					canchaOrigin.east,
					canchaOrigin.north,
					CANCHA_WIDTH,
					CANCHA_HEIGHT
				);

				// COCINA/COMEDOR abajo (pegados sin separación entre ellos)
				if (lateralesCancha.length > 0) {
					const lateralesX = (rectWidth - totalWidthLaterales) / 2;
					const lateralesY =
						startY + CANCHA_HEIGHT + SEPARACION_CANCHA;

					let currentXLateral = lateralesX;
					lateralesCancha.forEach((ambiente) => {
						const x =
							origin.east +
							dirX.east * currentXLateral +
							dirY.east * lateralesY;
						const y =
							origin.north +
							dirX.north * currentXLateral +
							dirY.north * lateralesY;
						elementos.laterales.push({
							nombre: ambiente.nombre,
							corners: createRoomCorners(
								x,
								y,
								ambiente.ancho,
								ambiente.alto
							),
						});
						currentXLateral += ambiente.ancho; // SIN separación entre cocina y comedor
					});
				}
			}
		}

		return {
			points,
			rectangleSVG,
			elementos,
			canchaSVG,
			bounds: { minEast, maxEast, minNorth, maxNorth, scale },
		};
	};

	const { points, rectangleSVG, elementos, canchaSVG, bounds } =
		convertToSVG();

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
					<h1 className="text-3xl font-bold text-slate-800 mb-2">
						Sistema de Planificación Educativa Completo
					</h1>
					<p className="text-slate-600">
						Con entrada, cancha, cocina/comedor y ambientes
						inteligentes
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-white rounded-xl shadow-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-slate-800">
									Coordenadas
								</h2>
								{coordinates.length > 0 && (
									<button
										onClick={clearAllCoordinates}
										className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
									>
										<X size={20} />
									</button>
								)}
							</div>

							<button
								onClick={() => setShowBulkInput(!showBulkInput)}
								className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
							>
								<Upload size={20} />
								{showBulkInput ? "Ocultar" : "Cargar"} Vertices
							</button>

							{showBulkInput && (
								<div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
									<textarea
										value={bulkInput}
										onChange={(e) =>
											setBulkInput(e.target.value)
										}
										className="w-full px-3 py-2 border rounded-lg font-mono text-xs h-32"
										placeholder="[[399489.52, 8945625.17], ...]"
									/>
									<button
										onClick={handleBulkLoad}
										className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg"
									>
										Cargar
									</button>
								</div>
							)}

							{coordinates.length >= 3 && (
								<button
									onClick={calculateMaxRectangle}
									disabled={isCalculating}
									className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
								>
									{isCalculating ? (
										<>
											<RotateCw
												size={20}
												className="animate-spin"
											/>
											Calculando...
										</>
									) : (
										<>
											<Calculator size={20} />
											Calcular
										</>
									)}
								</button>
							)}

							{maxRectangle && (
								<div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
									<p className="text-sm font-medium text-emerald-800 mb-2">
										✅ Opción Seleccionada
									</p>
									<div className="space-y-1 text-sm text-emerald-900">
										<p>
											<strong>Área:</strong>{" "}
											{maxRectangle.area.toFixed(2)} m²
										</p>
										<p>
											<strong>Ancho:</strong>{" "}
											{maxRectangle.width.toFixed(2)} m
										</p>
										<p>
											<strong>Largo:</strong>{" "}
											{maxRectangle.height.toFixed(2)} m
										</p>
										<p>
											<strong>Rotación:</strong>{" "}
											{maxRectangle.angle.toFixed(1)}°
										</p>
									</div>
								</div>
							)}

							{rectangleOptions.length > 0 && !maxRectangle && (
								<div className="mt-4">
									<p className="text-sm font-medium text-slate-700 mb-3">
										📐 Selecciona una opción de rectángulo:
									</p>
									<div className="space-y-3">
										{rectangleOptions.map(
											(option, index) => (
												<button
													key={index}
													onClick={() =>
														selectRectangle(index)
													}
													className="w-full p-4 border-2 border-slate-300 hover:border-emerald-500 rounded-lg text-left transition-all hover:shadow-md"
												>
													<div className="flex justify-between items-start mb-2">
														<span className="font-bold text-slate-800">
															Opción {index + 1}
														</span>
														<span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
															{option.reason}
														</span>
													</div>
													<div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
														<div>
															<strong>
																Área:
															</strong>{" "}
															{option.area.toFixed(
																0
															)}{" "}
															m²
														</div>
														<div>
															<strong>
																Rotación:
															</strong>{" "}
															{option.angle.toFixed(
																0
															)}
															°
														</div>
														<div>
															<strong>
																Ancho:
															</strong>{" "}
															{option.width.toFixed(
																1
															)}{" "}
															m
														</div>
														<div>
															<strong>
																Alto:
															</strong>{" "}
															{option.height.toFixed(
																1
															)}{" "}
															m
														</div>
													</div>
													<div className="mt-2 text-xs text-slate-500">
														Proporción:{" "}
														{(
															option.width /
															option.height
														).toFixed(2)}
														:1
													</div>
												</button>
											)
										)}
									</div>
								</div>
							)}
						</div>

						{capacityInfo && (
							<div className="bg-white rounded-xl shadow-lg p-6">
								<div className="flex items-center gap-2 mb-4">
									<Info size={20} className="text-blue-600" />
									<h2 className="text-lg font-semibold text-slate-800">
										Capacidad por Piso
									</h2>
								</div>
								<div className="space-y-2 text-sm">
									<div className="p-2 bg-yellow-50 rounded">
										🟡 Inicial:{" "}
										<strong>
											{capacityInfo.inicial.max}{" "}
											aulas/piso
										</strong>
										<span className="text-xs block text-yellow-700">
											(Si no hay inicial, usa este espacio
											el nivel con más aulas)
										</span>
									</div>
									<div className="p-2 bg-blue-50 rounded">
										🔵 Primaria:{" "}
										<strong>
											{capacityInfo.primaria.max}{" "}
											aulas/piso
										</strong>
										{capacityInfo.primaria
											.hasBiblioteca && (
											<span className="text-xs block">
												{" "}
												(+ Biblioteca)
											</span>
										)}
									</div>
									<div className="p-2 bg-red-50 rounded">
										🔴 Secundaria:{" "}
										<strong>
											{capacityInfo.secundaria.max}{" "}
											aulas/piso
										</strong>
										{capacityInfo.secundaria
											.hasLaboratorio && (
											<span className="text-xs block">
												{" "}
												(+ Laboratorio)
											</span>
										)}
									</div>
								</div>
							</div>
						)}

						{maxRectangle && capacityInfo && (
							<>
								<div className="bg-white rounded-xl shadow-lg p-6">
									<h2 className="text-xl font-semibold text-slate-800 mb-4">
										Aulas Totales
									</h2>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												🟡 Inicial
											</label>
											<input
												type="number"
												min="0"
												value={classroomsInicial}
												onChange={(e) =>
													setClassroomsInicial(
														e.target.value
													)
												}
												className="w-full px-4 py-2 border border-yellow-300 rounded-lg"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												🔵 Primaria
											</label>
											<input
												type="number"
												min="0"
												value={classroomsPrimaria}
												onChange={(e) =>
													setClassroomsPrimaria(
														e.target.value
													)
												}
												className="w-full px-4 py-2 border border-blue-300 rounded-lg"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">
												🔴 Secundaria
											</label>
											<input
												type="number"
												min="0"
												value={classroomsSecundaria}
												onChange={(e) =>
													setClassroomsSecundaria(
														e.target.value
													)
												}
												className="w-full px-4 py-2 border border-red-300 rounded-lg"
											/>
										</div>
									</div>
								</div>

								<div className="bg-white rounded-xl shadow-lg p-6">
									<h2 className="text-xl font-semibold text-slate-800 mb-2">
										Ambientes
									</h2>
									<p className="text-xs text-slate-500 mb-4">
										💡 Biblioteca→Primaria | Lab→Secundaria
										| Cocina/Comedor→Lateral cancha
									</p>
									<button
										onClick={() =>
											setShowAmbientesInput(
												!showAmbientesInput
											)
										}
										className="w-full mb-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
									>
										<Upload size={20} />
										{showAmbientesInput
											? "Ocultar"
											: "Cargar"}
									</button>
									{showAmbientesInput && (
										<div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
											<textarea
												value={ambientesInput}
												onChange={(e) =>
													setAmbientesInput(
														e.target.value
													)
												}
												className="w-full px-3 py-2 border rounded-lg font-mono text-xs h-32"
												placeholder='[{"nombre": "Biblioteca", "ancho": 7.8, "alto": 7.2}]'
											/>
											<button
												onClick={handleLoadAmbientes}
												className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg"
											>
												Cargar
											</button>
										</div>
									)}
									{ambientesComplementarios.length > 0 && (
										<div className="space-y-2 mb-4">
											{ambientesComplementarios.map(
												(amb, idx) => (
													<div
														key={idx}
														className="p-2 bg-teal-50 rounded text-sm"
													>
														<strong>
															{amb.nombre}
														</strong>
														: {amb.ancho}m ×{" "}
														{amb.alto}m
													</div>
												)
											)}
										</div>
									)}
									<button
										onClick={calculateDistribution}
										className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2"
									>
										<Building2 size={20} />
										Generar Distribución
									</button>
								</div>
							</>
						)}
					</div>

					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-slate-800">
									Vista del Proyecto
								</h2>
								{totalFloors > 1 && (
									<div className="flex items-center gap-2">
										<button
											onClick={() =>
												setCurrentFloor(
													Math.max(
														1,
														currentFloor - 1
													)
												)
											}
											disabled={currentFloor === 1}
											className="p-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg"
										>
											<ChevronDown size={20} />
										</button>
										<span className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-800">
											Piso {currentFloor} / {totalFloors}
										</span>
										<button
											onClick={() =>
												setCurrentFloor(
													Math.min(
														totalFloors,
														currentFloor + 1
													)
												)
											}
											disabled={
												currentFloor === totalFloors
											}
											className="p-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg"
										>
											<ChevronUp size={20} />
										</button>
									</div>
								)}
							</div>

							<div className="border-2 border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
								<svg
									width="100%"
									height="600"
									viewBox="0 0 600 600"
									className="bg-white"
								>
									<defs>
										<pattern
											id="grid"
											width="50"
											height="50"
											patternUnits="userSpaceOnUse"
										>
											<path
												d="M 50 0 L 0 0 0 50"
												fill="none"
												stroke="#e2e8f0"
												strokeWidth="1"
											/>
										</pattern>
									</defs>
									<rect
										width="600"
										height="600"
										fill="url(#grid)"
									/>

									{points.length >= 3 && (
										<>
											<polygon
												points={points
													.map((p) => `${p.x},${p.y}`)
													.join(" ")}
												fill="rgba(59, 130, 246, 0.1)"
												stroke="#3b82f6"
												strokeWidth="2"
											/>
											{points.map((point, index) => (
												<circle
													key={index}
													cx={point.x}
													cy={point.y}
													r="4"
													fill="#1e40af"
													stroke="white"
													strokeWidth="2"
												/>
											))}
										</>
									)}

									{rectangleSVG && (
										<>
											<polygon
												points={rectangleSVG
													.map((p) => `${p.x},${p.y}`)
													.join(" ")}
												fill="rgba(255, 255, 255, 0.95)"
												stroke="#10b981"
												strokeWidth="3"
											/>

											{!distribution && (
												<text
													x={
														(rectangleSVG[0].x +
															rectangleSVG[2].x) /
														2
													}
													y={
														(rectangleSVG[0].y +
															rectangleSVG[2].y) /
														2
													}
													textAnchor="middle"
													className="text-base font-semibold fill-emerald-700"
												>
													Rectángulo calculado
												</text>
											)}

											{/* Entrada */}
											{elementos.entrada && (
												<g>
													<polygon
														points={elementos.entrada.corners
															.map(
																(p) =>
																	`${p.x},${p.y}`
															)
															.join(" ")}
														fill="none"
														stroke="#64748b"
														strokeWidth="2"
														strokeDasharray="4,4"
													/>
													<text
														x={
															(elementos.entrada
																.corners[0].x +
																elementos
																	.entrada
																	.corners[2]
																	.x) /
															2
														}
														y={
															(elementos.entrada
																.corners[0].y +
																elementos
																	.entrada
																	.corners[2]
																	.y) /
															2
														}
														textAnchor="middle"
														className="text-sm font-bold fill-slate-700"
													>
														⬇️ ENTRADA
													</text>
												</g>
											)}

											{elementos.inicial.map(
												(aula, idx) => (
													<polygon
														key={`ini-${idx}`}
														points={aula.corners
															.map(
																(p) =>
																	`${p.x},${p.y}`
															)
															.join(" ")}
														fill="rgba(234, 179, 8, 0.6)"
														stroke="#ca8a04"
														strokeWidth="1.5"
													/>
												)
											)}
											{elementos.primaria.map(
												(aula, idx) => (
													<polygon
														key={`pri-${idx}`}
														points={aula.corners
															.map(
																(p) =>
																	`${p.x},${p.y}`
															)
															.join(" ")}
														fill="rgba(59, 130, 246, 0.6)"
														stroke="#2563eb"
														strokeWidth="1.5"
													/>
												)
											)}
											{elementos.secundaria.map(
												(aula, idx) => (
													<polygon
														key={`sec-${idx}`}
														points={aula.corners
															.map(
																(p) =>
																	`${p.x},${p.y}`
															)
															.join(" ")}
														fill="rgba(239, 68, 68, 0.6)"
														stroke="#dc2626"
														strokeWidth="1.5"
													/>
												)
											)}
											{elementos.banos.map(
												(bano, idx) => (
													<g key={`bano-${idx}`}>
														<polygon
															points={bano.corners
																.map(
																	(p) =>
																		`${p.x},${p.y}`
																)
																.join(" ")}
															fill="rgba(168, 85, 247, 0.7)"
															stroke="#7c3aed"
															strokeWidth="2"
														/>
														<text
															x={
																(bano.corners[0]
																	.x +
																	bano
																		.corners[2]
																		.x) /
																2
															}
															y={
																(bano.corners[0]
																	.y +
																	bano
																		.corners[2]
																		.y) /
																2
															}
															textAnchor="middle"
															className="text-xs font-bold fill-purple-900"
														>
															🚻
														</text>
													</g>
												)
											)}
											{elementos.escaleras.map(
												(esc, idx) => (
													<g key={`esc-${idx}`}>
														<polygon
															points={esc.corners
																.map(
																	(p) =>
																		`${p.x},${p.y}`
																)
																.join(" ")}
															fill="rgba(107, 114, 128, 0.7)"
															stroke="#4b5563"
															strokeWidth="2"
														/>
														<text
															x={
																(esc.corners[0]
																	.x +
																	esc
																		.corners[2]
																		.x) /
																2
															}
															y={
																(esc.corners[0]
																	.y +
																	esc
																		.corners[2]
																		.y) /
																2
															}
															textAnchor="middle"
															className="text-xs font-bold fill-gray-900"
														>
															🪜
														</text>
													</g>
												)
											)}
											{elementos.ambientes.map(
												(ambiente, idx) => (
													<g key={`amb-${idx}`}>
														<polygon
															points={ambiente.corners
																.map(
																	(p) =>
																		`${p.x},${p.y}`
																)
																.join(" ")}
															fill={
																ambiente.tipo ===
																"pabellon"
																	? "rgba(236, 72, 153, 0.6)"
																	: "rgba(20, 184, 166, 0.6)"
															}
															stroke={
																ambiente.tipo ===
																"pabellon"
																	? "#be185d"
																	: "#0d9488"
															}
															strokeWidth="2"
														/>
														<text
															x={
																(ambiente
																	.corners[0]
																	.x +
																	ambiente
																		.corners[2]
																		.x) /
																2
															}
															y={
																(ambiente
																	.corners[0]
																	.y +
																	ambiente
																		.corners[2]
																		.y) /
																2
															}
															textAnchor="middle"
															className="text-xs font-bold fill-slate-900"
														>
															{ambiente.nombre}
														</text>
													</g>
												)
											)}
											{elementos.laterales.map(
												(lateral, idx) => (
													<g key={`lat-${idx}`}>
														<polygon
															points={lateral.corners
																.map(
																	(p) =>
																		`${p.x},${p.y}`
																)
																.join(" ")}
															fill="rgba(251, 146, 60, 0.7)"
															stroke="#ea580c"
															strokeWidth="2"
														/>
														<text
															x={
																(lateral
																	.corners[0]
																	.x +
																	lateral
																		.corners[2]
																		.x) /
																2
															}
															y={
																(lateral
																	.corners[0]
																	.y +
																	lateral
																		.corners[2]
																		.y) /
																2
															}
															textAnchor="middle"
															className="text-sm font-bold fill-orange-900"
														>
															{lateral.nombre}
														</text>
													</g>
												)
											)}
											{canchaSVG && (
												<>
													<polygon
														points={canchaSVG
															.map(
																(p) =>
																	`${p.x},${p.y}`
															)
															.join(" ")}
														fill="rgba(34, 197, 94, 0.4)"
														stroke="#16a34a"
														strokeWidth="2"
														strokeDasharray="5,3"
													/>
													<text
														x={
															(canchaSVG[0].x +
																canchaSVG[2]
																	.x) /
															2
														}
														y={
															(canchaSVG[0].y +
																canchaSVG[2]
																	.y) /
															2
														}
														textAnchor="middle"
														className="text-sm font-bold fill-green-700"
													>
														⚽ CANCHA
													</text>
												</>
											)}
										</>
									)}

									{points.length < 3 && (
										<text
											x="300"
											y="300"
											textAnchor="middle"
											className="text-sm fill-slate-400"
										>
											Carga vertices para comenzar
										</text>
									)}
									{points.length >= 3 && !rectangleSVG && (
										<text
											x="300"
											y="300"
											textAnchor="middle"
											className="text-sm fill-slate-400"
										>
											Presiona "Calcular"
										</text>
									)}
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

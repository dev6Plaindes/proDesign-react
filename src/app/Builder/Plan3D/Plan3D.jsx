import {
	useEffect,
	Suspense,
	useMemo,
	useState,
	useCallback,
	useRef,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { Canvas, invalidate } from "@react-three/fiber";
//import { Html } from "@react-three/drei";
import Pabellones from "./components/Pabellones/Pabellones";
import InitConfig from "./components/InitConfig/InitConfig";
import Pasillo from "./components/Pasillo/Pasillo";
import Terrain from "./components/Terrain/Terrain";
import SoccerField2D from "../PlanFloor/components/SoccerField2D/SoccerField2D";
import SoccerField from "./components/SoccerField/SoccerField";
import PerimeterWalls from "./components/ClassroomGroup/components/PerimeterWalls";
import TerrainPlanner from "./TerrainPlanner";
import { setView3DFloor } from "../../../redux/building/buildingSlice";
import {
	setDistributionConfig,
	setDistributionConfirmed,
	setDistributionOption,
} from "../../../redux/distribution/distributionSlice";
import Terrain2D from "../PlanFloor/components/Terrain2D/Terrain2D";
import {
	CameraControls,
	OrbitControls,
	OrthographicCamera,
	Text,
	Html,
	PerspectiveCamera,
} from "@react-three/drei";
import DXFWriter, { Colors } from "dxf-writer";
import * as THREE from "three";
import { TestExport3D } from "../Test/TestExport3D";
import ViewControls from "./components/InitConfig/ViewControls";
import CompassHUD from "./components/Terrain/CompassHUD";
import View3D from "./View3D";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
const UTM_SCALE_FACTOR = 1000;

export default function Plan3D({ state, view, school, aspect }) {
	const dispatch = useDispatch();
	const { space, spaceEntrance } = useSelector((state) => state.distribution);

	console.log(school);
	console.log("number of classrooms", school.numberOfClassrooms.getTotal()); // amount_classrooms

	useEffect(() => {
		return () => dispatch(setView3DFloor({ floor: 3 }));
	}, []);

	return view.view === "3D" ? (
		// <SceneX
		// 	school={school}
		// 	view={view}
		// 	space={space}
		// 	spaceEntrance={spaceEntrance}
		// />
		<View3D school={school} />
	) : (
		//<FloorPlanX school={school} view={view} />
		//<AppTest />
		<TerrainPlanner school={school} state={state} />
	);
}
function Aula({ position, name }) {
	return (
		<mesh position={position} name={name}>
			<boxGeometry args={[10, 5, 8]} />
			<meshStandardMaterial color="lightblue" />
		</mesh>
	);
}

function Colegio() {
	return (
		<>
			{/* Pabellón 1 */}
			<Aula position={[0, 2.5, 0]} name="Aula_P1_1" />
			<Aula position={[12, 2.5, 0]} name="Aula_P1_2" />

			{/* Pabellón 2 */}
			<Aula position={[0, 2.5, -15]} name="Aula_P2_1" />
			<Aula position={[12, 2.5, -15]} name="Aula_P2_2" />
		</>
	);
}
function exportToDXF(scene) {
	const dxf = new DXFWriter();

	scene.traverse((child) => {
		if (child.isMesh) {
			const { x, y, z } = child.position;
			const geo = child.geometry;
			geo.computeBoundingBox();
			const box = geo.boundingBox;

			// Coordenadas del aula como rectángulo en 2D
			const minX = x + box.min.x;
			const maxX = x + box.max.x;
			const minY = z + box.min.z;
			const maxY = z + box.max.z;

			// Crear bloque por cada aula
			const blockName = child.name || "Aula";
			dxf.startBlock(blockName);
			dxf.setCurrentLayer("AULAS");
			dxf.setColor(Colors.Green);
			dxf.addPolyline([
				[minX, minY],
				[maxX, minY],
				[maxX, maxY],
				[minX, maxY],
				[minX, minY],
			]);
			dxf.endBlock();

			// Insertar bloque en posición
			dxf.addBlock(blockName, [x, y, z]);
		}
	});

	// Descargar archivo DXF
	const blob = new Blob([dxf.stringify()], { type: "application/dxf" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = "colegio.dxf";
	link.click();
}
function App() {
	const sceneRef = useRef();
	console.log("ref", sceneRef.current.scene);
	return (
		<div style={{ height: "100vh" }}>
			<Canvas ref={sceneRef}>
				<ambientLight />
				<directionalLight position={[10, 10, 5]} />
				<Colegio />
				<OrbitControls />
			</Canvas>

			<button
				onClick={() => exportToDXF(sceneRef.current.scene)}
				style={{ position: "absolute", top: 20, left: 20 }}
			>
				Exportar a DXF
			</button>
		</div>
	);
}

// escena principal
function SceneX({ view, school, space, spaceEntrance }) {
	const {
		terrain,
		soccerField,
		corridor,
		length,
		verticesRectangle,
		vertices,
	} = school;
	const rotationRef = useRef(0);
	const cameraRef = useRef();
	const selectedOption = useSelector(
		(state) => state.distribution.selectedDistributionOption
	);
	const rotation = useSelector((state) => state.distribution.rotation);

	// Estado para manejar la selección
	const [selectedAula, setSelectedAula] = useState(null);
	const [hoveredAula, setHoveredAula] = useState(null);

	// Función personalizada para setSelectedAula que registra todos los cambios
	const setSelectedAulaWithLog = useCallback((newValue) => {
		setSelectedAula(newValue);
	}, []);

	// Función para manejar la selección de aulas
	const handleAulaSelect = useCallback(
		(aulaData) => {
			console.log("SceneX - Aula seleccionada:", aulaData);
			setSelectedAulaWithLog(aulaData);
		},
		[setSelectedAulaWithLog]
	);

	// Función para manejar el hover
	const handleAulaHover = useCallback((aulaData) => {
		setHoveredAula(aulaData);
	}, []);

	// Función para limpiar el hover
	const handleAulaHoverEnd = useCallback(() => {
		setHoveredAula(null);
	}, []);

	// Función para deseleccionar (click en área vacía)
	const handleCanvasClick = useCallback(
		(event) => {
			console.log("Canvas click:", event.target, event.target.tagName);
			if (event.target.tagName === "CANVAS" && !event.object) {
				console.log("Deseleccionando aula desde Canvas");
				setSelectedAulaWithLog(null);
			}
		},
		[setSelectedAulaWithLog]
	);

	const posicionesPorOpcion = {
		A: {
			78.38354264944792: [-500, -200, -200], // ejemplo
			97.28360545635223: [400, -200, -200],
			60.66778710857034: [300, -200, 200],
			65.6228068433702: [1000, 0, -500],
		},
		B: {
			78.38354264944792: [-400, -200, 0],
			97.28360545635223: [-300, -200, 500],
			60.66778710857034: [300, -200, 100],
		},
		C: {
			78.38354264944792: [0, -200, -200],
			97.28360545635223: [-200, -200, -200],
			60.66778710857034: [0, -200, -200],
		},
	};

	const posicionesPorOpcion2 = {
		A: {
			78.38354264944792: [350, -200, -200], // ejemplo
			97.28360545635223: [1300, -200, -200],
			60.66778710857034: [-500, -200, 200],
			65.6228068433702: [1000, 0, -500],
		},
		B: {
			78.38354264944792: [450, -200, 0],
			97.28360545635223: [600, -200, 500],
			60.66778710857034: [-600, -200, 100],
		},
		C: {
			78.38354264944792: [0, 850, -200],
			97.28360545635223: [-200, 850, -200],
			60.66778710857034: [-100, 850, -200],
		},
	};

	const positionSoccerField1 = posicionesPorOpcion[selectedOption]?.[
		length
	] ?? [-600, 0, -200];

	const positionSoccerField2 = posicionesPorOpcion2[selectedOption]?.[
		length
	] ?? [-600, 0, -200];

	function ExportDXFOverlay() {
		const { scene } = useThree();

		return (
			<Html
				position={[0, 0, 0]}
				transform={false}
				style={{ pointerEvents: "none" }}
			>
				<div
					style={{
						position: "fixed",
						top: 16,
						left: 16,
						pointerEvents: "auto",
					}}
				>
					<button
						onClick={() => TestExport3D(scene, "prueba_export.dxf")}
						style={{
							padding: "10px 14px",
							borderRadius: 12,
							border: "1px solid #ddd",
							background: "white",
							boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
							cursor: "pointer",
							fontWeight: 600,
						}}
					>
						Exportar a DXF (bloques 3D)
					</button>
				</div>
			</Html>
		);
	}

	function CameraController({ cameraRef }) {
		const { camera } = useThree();

		// Sincroniza la ref externa con la interna de R3F
		useEffect(() => {
			if (cameraRef) {
				cameraRef.current = camera;
			}
		}, [cameraRef, camera]);

		return null;
	}

	function ViewButtons({ cameraRef, terrain }) {
		const setView = (view) => {
			if (!cameraRef.current) return;

			const distance = Math.max(terrain.length * 1.5, 1000); // distancia para vistas
			switch (view) {
				case "frontal":
					cameraRef.current.position.set(
						0,
						terrain.length / 2,
						distance
					);
					break;
				case "back":
					cameraRef.current.position.set(
						0,
						terrain.length / 2,
						-distance
					);
					break;
				case "left":
					cameraRef.current.position.set(
						-distance,
						terrain.length / 2,
						0
					);
					break;
				case "right":
					cameraRef.current.position.set(
						distance,
						terrain.length / 2,
						0
					);
					break;
				case "top":
					cameraRef.current.position.set(0, distance, 0.1); // 0.1 para evitar mirar directo al eje Y
					break;
				case "bottom":
					cameraRef.current.position.set(0, -distance, 0.1);
					break;
				case "isometric":
					cameraRef.current.position.set(
						distance,
						distance,
						distance
					);
					break;
				default:
					break;
			}

			// Mirar siempre al centro del terreno
			cameraRef.current.lookAt(0, 0, 0);
		};

		return (
			<Paper
				elevation={6}
				sx={{
					position: "absolute",
					top: 20,
					left: "50%",
					transform: "translateX(-50%)",
					padding: "6px 10px",
					borderRadius: "12px",
					zIndex: 1000,
					backgroundColor: "rgba(255,255,255,0.9)",
				}}
			>
				<ButtonGroup
					variant="contained"
					color="primary"
					aria-label="view controls"
					size="small"
					sx={{
						"& .MuiButton-root": { mx: 0.5 }, // agrega margen horizontal
					}}
				>
					<Button onClick={() => setView("frontal")}>Frontal</Button>
					<Button onClick={() => setView("back")}>Posterior</Button>
					<Button onClick={() => setView("left")}>Izquierda</Button>
					<Button onClick={() => setView("right")}>Derecha</Button>
					<Button onClick={() => setView("top")}>Top</Button>
					<Button onClick={() => setView("bottom")}>Bottom</Button>
					<Button onClick={() => setView("isometric")}>
						Isométrico
					</Button>
				</ButtonGroup>
			</Paper>
		);
	}

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<Canvas
				camera={{
					fov: 60,
					aspect: window.innerWidth / window.innerHeight,
					position: [terrain.length, terrain.length / 2 - 500, 0],
					rotation: [
						"-1.6205812315008037",
						"1.3084828063007592",
						"1.6223414925263104",
						"XYZ",
					],
					far: 15000,
					near: 5,
				}}
				gl={{
					toneMappingExposure: 0.6,
				}}
				frameloop="demand"
			>
				{/* <gridHelper
					args={[Math.max(5000, 10000), 20, "blue", "blue"]}
					position={[
						terrain.position[0],
						terrain.position[1] + 0.01,
						terrain.position[2],
					]}
				/> */}
				<UpdateCompassRotation rotationRef={rotationRef} />{" "}
				<InitConfig view={view} sky={school.sky} />
				<CameraController cameraRef={cameraRef} />
				<OrbitControls ref={cameraRef} />
				<PerimeterWalls
					vertices={vertices}
					rectangleVertices={verticesRectangle}
					//onTerrainClick={handleTerrainClick} // Agregar esta prop
				>
					<group scale={[1.1, 1.1, 1.1]} rotation={[0, rotation, 0]}>
						<Pabellones
							school={school}
							view={view}
							space={space}
							spaceEntrance={spaceEntrance}
							option={selectedOption}
							// Props para el sistema de selección
							onAulaSelect={handleAulaSelect}
							onAulaHover={handleAulaHover}
							onAulaHoverEnd={handleAulaHoverEnd}
							selectedAula={selectedAula}
							hoveredAula={hoveredAula}
						/>
						<SoccerField
							//position={[-500, 0.5, 200]}
							position={positionSoccerField1}
							rotation={[0, Math.PI / 2, 0]}
							length={soccerField.length}
							width={soccerField.width}
							color={soccerField.color}
						/>
						<SoccerField
							//position={[400, 0.5, 200]}
							position={positionSoccerField2}
							rotation={[0, Math.PI / 2, 0]}
							length={soccerField.length}
							width={soccerField.width}
							color={soccerField.color}
						/>
					</group>
				</PerimeterWalls>
				{/* <PerimeterWalls
					coords={coords}
					placeAt={[0, 0, 0]} // importante: primero prueba en el origen
					height={120}
					thickness={40}
					color="#9b9b9b"
					debug={true}
				/> */}
				{/* <PerimeterWallsFromCoords
					coords={coords}
					terrainOrigin={terrain.position} // importante: pass terrain.position aquí
					height={12}
					thickness={1}
					color="#bd5454ff"
					debug={true} // activa para verificar ! luego quitar
				/> */}
				{/* <ExportDXFOverlay /> */}
			</Canvas>
			<ViewButtons cameraRef={cameraRef} terrain={terrain} />
			<CompassHUD rotationRef={rotationRef} />

			{/* Panel de información del aula seleccionada */}
			{selectedAula && (
				<div
					style={{
						position: "absolute",
						top: "20px",
						right: "20px",
						background: "rgba(255, 255, 255, 0.95)",
						padding: "15px",
						borderRadius: "8px",
						boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
						maxWidth: "300px",
						zIndex: 1000,
					}}
				>
					<h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
						Información del Aula
					</h3>
					<p>
						<strong>Nivel:</strong> {selectedAula.level}
					</p>
					<p>
						<strong>Número:</strong> {selectedAula.index}
					</p>
					<p>
						<strong>Ancho:</strong> {selectedAula.classroom.width}m
					</p>
					<p>
						<strong>Largo:</strong> {selectedAula.classroom.length}m
					</p>
					<p>
						<strong>Alto:</strong> {selectedAula.classroom.height}m
					</p>
					<p>
						<strong>Área:</strong> {selectedAula.area} m²
					</p>
					<p>
						<strong>Costo:</strong> S/{" "}
						{selectedAula.cost?.toLocaleString()}
					</p>
					<p>
						<strong>Posición:</strong> Piso{" "}
						{selectedAula.floor || 1}
					</p>

					<button
						onClick={() => {
							console.log("Cerrando desde botón del panel");
							setSelectedAulaWithLog(null);
						}}
						style={{
							marginTop: "10px",
							padding: "5px 10px",
							background: "#007bff",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Cerrar
					</button>
				</div>
			)}

			{/* Información de hover (tooltip) */}
			{hoveredAula && !selectedAula && (
				<div
					style={{
						position: "absolute",
						top: "20px",
						left: "250px", // Ajustado para no solapar con controles de cotas
						background: "rgba(0, 0, 0, 0.8)",
						color: "white",
						padding: "8px 12px",
						borderRadius: "4px",
						fontSize: "14px",
						pointerEvents: "none",
						zIndex: 1000,
					}}
				>
					{hoveredAula.level} - Aula {hoveredAula.index}
				</div>
			)}
		</div>
	);
}
function FloorPlanX({ view, school, spaceConfig, setSpaceConfig }) {
	const {
		soccerField,
		angle,
		vertices,
		verticesRectangle,
		width,
		length,
		partialArea,
	} = school;

	console.log("angulo vista 2d ", angle);

	// let scaleFactors;
	// if (length === 78.38354264944792) {
	// 	scaleFactor = 1.3;
	// } else {
	// 	scaleFactor = 1.05; //
	// }

	const lengthSoccer = length - 3 - 2;
	const dispatch = useDispatch();

	const confirmed = useSelector((state) => state.distribution.confirmed);
	const selectedOption = useSelector(
		(state) => state.distribution.selectedDistributionOption
	);
	const space = useSelector((state) => state.distribution.space);
	const spaceEntrance = useSelector(
		(state) => state.distribution.spaceEntrance
	);
	const rotation = useSelector((state) => state.distribution.rotation);

	const [isDistributionModalOpen, setIsDistributionModalOpen] =
		useState(false);
	//const [rotation, setRotation] = useState(0);
	// const [selectedOption, setSelectedOption] = useState(null);
	// const [confirmed, setConfirmed] = useState(false);

	const [selectedTerrainPoint, setSelectedTerrainPoint] = useState(null);

	const scaleFactor =
		length === 78.38354264944792
			? 1.3
			: length === 97.28360545635223 && selectedOption === "A"
			? 1.05
			: length === 60.66778710857034
			? 1.5
			: length === 65.6228068433702 // comentar
			? 1.2
			: 1.3;

	const handleSelectOption = (option) => {
		let space, spaceEntrance, rot;

		const angleMatch = {
			A: {
				78.38354264944792: Number(angle),
				97.28360545635223: -0.444,
				60.66778710857034: 0,
				65.6228068433702: -0.6,
				38.50779786333442: -0.25,
				150.80931116640568: 0.18,
			},
			B: {
				78.38354264944792: -1.308, // ejemplo
				97.28360545635223: 1.1352,
				60.66778710857034: -Math.PI / 2,
				65.6228068433702: Number(angle),
				150.80931116640568: Number(angle),
			},
		};

		if (option === "A") {
			space = school.length;
			spaceEntrance = school.width;
			//rot = angle < 1 ? Number(angle) : Number(angle - 3.15); //Number(angle - 3.15)
			rot = angleMatch[option]?.[length] ?? 0;
		} else {
			space = school.width;
			spaceEntrance = school.length;
			//rot = Number(angle - 1.57); //Number(angle - 1.57)
			rot = angleMatch[option]?.[length] ?? 0;
		}
		dispatch(setDistributionOption(option));
		dispatch(
			setDistributionConfig({
				space,
				spaceEntrance,
				rotation: rot,
			})
		);
		dispatch(setDistributionConfirmed(false));
	};

	const handleConfirmation = () => {
		dispatch(setDistributionConfirmed(true));
		// setConfirmed(false);
	};

	// Manejar click en el terreno
	const handleTerrainClick = (event) => {
		//event.stopPropagation();
		setSelectedTerrainPoint(event.point);
		setIsDistributionModalOpen(true);
	};
	console.log("selectedOption", selectedOption);

	const posicionesPorOpcion = {
		A: {
			78.38354264944792: [-500, 0, -200], // ejemplo
			97.28360545635223: [300, 0, -200],
			60.66778710857034: [300, 0, 200],
			65.6228068433702: [800, 0, -400],
			38.50779786333442: [250, 0, -100],
			150.80931116640568: [-1500, 0, -100],
		},
		B: {
			78.38354264944792: [-400, 0, 0],
			97.28360545635223: [-300, 0, 500],
			60.66778710857034: [300, 0, 100],
			65.6228068433702: [800, 0, 300],
			150.80931116640568: [400, 0, -1500],
		},
		C: {
			78.38354264944792: [0, 0, -200],
			97.28360545635223: [-200, 0, -200],
			60.66778710857034: [0, 0, -200],
		},
	};

	const posicionesPorOpcion2 = {
		A: {
			78.38354264944792: [350, 0, -200], // ejemplo
			97.28360545635223: [1200, 0, -200],
			60.66778710857034: [-500, 0, 200],
			65.6228068433702: [800, 0, -400],
			38.50779786333442: [250, 0, -100],
			150.80931116640568: [0, 0, -100],
		},
		B: {
			78.38354264944792: [450, 0, 0],
			97.28360545635223: [600, 0, 500],
			60.66778710857034: [-600, 0, 100],
			65.6228068433702: [800, 0, 300],
			150.80931116640568: [400, 0, 500],
		},
		C: {
			78.38354264944792: [0, 0, -200],
			97.28360545635223: [-200, 0, -200],
			60.66778710857034: [-100, 0, -200],
		},
	};

	const positionSoccerField1 = posicionesPorOpcion[selectedOption]?.[
		length
	] ?? [-600, 0, -200];

	const positionSoccerField2 = posicionesPorOpcion2[selectedOption]?.[
		length
	] ?? [-600, 0, -200];

	const rotationSoccerField =
		selectedOption === "A"
			? [Math.PI / 2, 0, Math.PI / 2]
			: [Math.PI / 2, 0, Math.PI / 2];

	return (
		<div style={{ position: "relative", width: "100%", height: "100vh" }}>
			<div
				style={{
					position: "absolute",
					top: "70px",
					right: "20px",
					zIndex: 100,
					display: "flex",
					flexDirection: "column",
					gap: "10px",
				}}
			>
				{!confirmed && (
					<>
						<button
							style={{
								padding: "8px 12px",
								backgroundColor: "#2ecc71",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
							onClick={() => handleSelectOption("A")}
						>
							Ver Opción A
						</button>
						<button
							style={{
								padding: "8px 12px",
								backgroundColor: "#e67e22",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
							onClick={() => handleSelectOption("B")}
						>
							Ver Opción B
						</button>

						<button
							style={{
								padding: "8px 12px",
								backgroundColor: "#2980b9",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
							}}
							onClick={handleConfirmation}
						>
							✔ Confirmar distribución
						</button>
					</>
				)}

				{confirmed && (
					<button
						style={{
							padding: "8px 12px",
							backgroundColor: "#f39c12",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
						onClick={() =>
							dispatch(setDistributionConfirmed(false))
						}
					>
						✏️ Modificar distribución
					</button>
				)}
			</div>

			{/* Modal de comparación existente */}

			{/* Leyenda de colores */}
			<div
				style={{
					position: "absolute",
					width: "180px",
					padding: "20px",
					top: "5px",
					left: "20px",
					zIndex: 100,
				}}
			>
				<div
					style={{
						marginBottom: "10px",
						backgroundColor: "#FB8C00",
						padding: "10px",
						color: "#000",
						textAlign: "center",
						fontSize: 20,
					}}
				>
					Inicial
				</div>
				<div
					style={{
						marginBottom: "10px",
						backgroundColor: "#00ACC1",
						padding: "10px",
						color: "#000",
						textAlign: "center",
						fontSize: 20,
					}}
				>
					Primaria
				</div>
				<div
					style={{
						marginBottom: "10px",
						backgroundColor: "#43A047",
						padding: "10px",
						color: "#000",
						textAlign: "center",
						fontSize: 20,
					}}
				>
					Secundaria
				</div>
				<div
					style={{
						marginBottom: "10px",
						backgroundColor: "yellow",
						padding: "5px",
						color: "#000",
						textAlign: "center",
						fontSize: 10,
					}}
				>
					Lactario
				</div>
				<div
					style={{
						backgroundColor: "red",
						padding: "5px",
						color: "#000",
						textAlign: "center",
						fontSize: 10,
					}}
				>
					Topico
				</div>
			</div>

			{/* Canvas principal - solo vista general */}

			<div style={{ display: "flex", width: "100%", height: "100vh" }}>
				{/* Vista Izquierda - Solo Terreno */}

				<Canvas orthographic frameloop="demand">
					<OrthographicCamera
						makeDefault
						position={[1, 90, 0]}
						zoom={0.117}
						near={-200}
						far={5000}
					/>
					<OrbitControls
						makeDefault
						enableRotate={false}
						enableDamping={false}
						enablePan={false}
						minZoom={0.117}
						maxZoom={1}
					/>
					<CameraControls dollySpeed={0.4} />
					<InitConfig view={view} />

					{/* SOLO EL TERRENO */}
					<Terrain2D
						vertices={vertices}
						rectangleVertices={verticesRectangle}
						onTerrainClick={handleTerrainClick}
					>
						{space && spaceEntrance && (
							<group
								scale={[scaleFactor, scaleFactor, scaleFactor]}
								rotation={[0, rotation, 0]}
							>
								{/* Pabellones */}
								<Pabellones
									school={school}
									view={view}
									space={space}
									spaceEntrance={spaceEntrance}
									option={selectedOption}
								/>

								{/* Campos de Fútbol */}
								<SoccerField2D
									position={positionSoccerField1}
									rotation={[Math.PI / 2, 0, Math.PI / 2]}
									length={soccerField.length}
									width={soccerField.width}
									color={soccerField.color}
									partialArea={partialArea}
								/>

								<SoccerField2D
									position={positionSoccerField2}
									rotation={rotationSoccerField}
									length={soccerField.length}
									width={soccerField.width}
									color={SoccerField.color}
									partialArea={partialArea}
								/>
							</group>
						)}
					</Terrain2D>
				</Canvas>

				{/* Vista Derecha - Pabellones y Campos */}
			</div>
		</div>
	);
}

import { useThree, useFrame } from "@react-three/fiber";
import { Button, ButtonGroup, Paper } from "@mui/material";
import PabellonesSelect from "./components/Pabellones/PabellonesSelect";
import { number } from "yup";

function UpdateCompassRotation({ rotationRef }) {
	const { camera } = useThree();
	const dir = new THREE.Vector3();
	const sph = new THREE.Spherical();

	useFrame(() => {
		camera.getWorldDirection(dir);
		sph.setFromVector3(dir);
		const deg = THREE.MathUtils.radToDeg(sph.theta) - 180;
		rotationRef.current = deg;
	});

	return null;
}

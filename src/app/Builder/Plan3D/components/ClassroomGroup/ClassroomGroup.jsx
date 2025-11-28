import { useMemo, useRef, useState } from "react";
import Columns from "./components/Columns";
import { SelectionOutline } from "../Pabellones/components/BIM/SelectionOutline";
import Roof from "./components/Roof";
import Walls from "./components/Walls";
import Bigas from "./Bigas";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useSelector } from "react-redux";
import { Base, Subtraction, Geometry } from "@react-three/csg";
import * as THREE from "three";

// Funciones auxiliares para cálculos
const calculateArea = (classroom) => {
	return classroom.width * classroom.length; // Área en m²
};

const calculateCost = (classroom) => {
	const area = calculateArea(classroom);
	const costPerM2 = 2500; // Costo por m² en soles (puedes ajustar este valor)
	return area * costPerM2;
};

export default function ClassroomGroup({
	position,
	rotation,
	level,
	classroom,
	index,
	view,
	floor,
	onSelect,
	onHover,
	onHoverEnd,
	isSelected,
	isHovered,
	name,
}) {
	const [localHovered, setLocalHovered] = useState(false);

	const handleClick = (e) => {
		e.stopPropagation();

		console.log("Aula clickeada:", { level, index, floor, isSelected });
		console.log("Llamando onSelect con datos:", {
			type: "classroom",
			id: `${level}-${index}-${floor}`,
			position,
			level,
			classroom,
			index,
			floor,
			area: calculateArea(classroom),
			cost: calculateCost(classroom),
		});
		onSelect?.({
			type: "classroom",
			id: `${level}-${index}-${floor}`,
			position,
			level,
			classroom,
			index,
			floor,
			area: calculateArea(classroom),
			cost: calculateCost(classroom),
		});
	};

	const handlePointerEnter = (e) => {
		e.stopPropagation();
		setLocalHovered(true);
		document.body.style.cursor = "pointer";

		// Llamar al handler de hover del padre
		onHover?.({
			type: "classroom",
			id: `${level}-${index}-${floor}`,
			level,
			index,
			floor,
		});
	};

	const handlePointerLeave = (e) => {
		e.stopPropagation();
		setLocalHovered(false);
		document.body.style.cursor = "default";

		// Llamar al handler de hover end del padre
		onHoverEnd?.();
	};

	//console.log("classroom detalles", classroom);

	return (
		<group
			position={position}
			rotation={rotation}
			userData={{ type: "classroom", id: `${level}-${index}-${floor}` }}
			onClick={handleClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		>
			{/* Outline de selección */}
			{isSelected && (
				<group
					position={classroom.walls.position || [0, 0, 0]}
					rotation={classroom.walls.rotation || [0, 0, 0]}
				>
					<SelectionOutline
						geometry={classroom.walls.geometry}
						color="#00ff00"
						animated={true}
					/>
				</group>
			)}

			{/* Outline de hover */}
			{(isHovered || localHovered) && !isSelected && (
				// <SelectionOutline
				// 	geometry={classroom.walls.geometry}
				// 	color="#ffff00"
				// 	animated={false}
				// />
				<group
					position={classroom.walls.position || [0, 0, 0]}
					rotation={classroom.walls.rotation || [0, 0, 0]}
				>
					<SelectionOutline
						geometry={classroom.walls.geometry}
						color="#ffff00"
						animated={false}
					/>
				</group>
			)}

			{/* Componentes existentes */}
			{/* <Walls walls={classroom.walls} level={level} index={index} /> */}
			<Columns columns={classroom.columns} />
			{/* <Bigas bigas={classroom.bigas} /> */}

			{/* <Roof
					position={classroom.roof.position}
					rotation={classroom.roof.rotation}
					geometry={classroom.roof.geometry}
					material={classroom.roof.material}
				/> */}

			<Door />
			<WindowSliding x={106.3} z={329.5} />
			<WindowSliding x={306.1} z={329.5} />
			{/* <FloorImproved dimensions={classroom.dimensions} /> */}
			<WallsImproved
				walls={classroom.walls}
				level={level}
				index={index}
			/>

			<RoofImproved
				position={classroom.roof.position}
				rotation={classroom.roof.rotation}
				geometry={classroom.roof.geometry}
				material={classroom.roof.material}
				dimensions={classroom.dimensions}
			/>

			{/* Elementos adicionales mejorados */}
			{/* <WindowsImproved dimensions={classroom.dimensions} /> */}
			{/* <DoorsImproved dimensions={classroom.dimensions} /> */}
		</group>
	);
}

function Door() {
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/wood_door/scene.gltf"
	);
	const group = useRef();

	return (
		<group
			ref={group}
			position={[18.5, 0, 326.7]}
			rotation={[0, Math.PI, 0]}
			scale={[58, 52, 52]}
			dispose={null}
		>
			<mesh
				geometry={nodes["Object_8"].geometry}
				material={materials["DOR0001_Wood"]}
			/>
			<mesh
				geometry={nodes["Object_9"].geometry}
				material={materials["DOR0001_Metal_Handle_Plate"]}
			/>
			<mesh
				geometry={nodes["Object_10"].geometry}
				material={materials["DOR0001_Metal_Screw"]}
			/>
			<mesh
				geometry={nodes["Object_12"].geometry}
				material={materials["DOR0001_Plastic_Fram"]}
			/>
			<mesh
				geometry={nodes["Object_13"].geometry}
				material={materials["DOR0001_Rubber_Kit"]}
			/>

			<mesh
				geometry={nodes["Object_15"].geometry}
				material={materials["DOR0001_Metal_Face_Plate"]}
			/>
		</group>
	);
}

function WindowSliding({ x, z }) {
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/sliding_window/scene.gltf"
	);
	const group = useRef();

	return (
		<group
			ref={group}
			position={[x, 69.1, z]}
			rotation={[Math.PI / -2, 0, 0]}
			scale={[0.48, 0.48, 0.48]}
		>
			<mesh
				geometry={nodes["Object_4"].geometry}
				material={materials["Material_35"]}
			/>
			<mesh
				geometry={nodes["Object_8"].geometry}
				material={materials["2_-_Default"]}
			/>
			<mesh
				geometry={nodes["Object_9"].geometry}
				material={materials["3_-_Default"]}
			/>
			<mesh
				geometry={nodes["Object_11"].geometry}
				material={materials["5_-_Default"]}
			/>
			<mesh
				geometry={nodes["Object_12"].geometry}
				material={materials["standard_alumini"]}
			/>
			<mesh
				geometry={nodes["Object_13"].geometry}
				material={materials["Material_46"]}
			/>
			<mesh
				geometry={nodes["Object_16"].geometry}
				material={materials["5_-_Default"]}
			/>
			<mesh
				geometry={nodes["Object_17"].geometry}
				material={materials["Material_57"]}
			/>
			<mesh
				geometry={nodes["Object_18"].geometry}
				material={materials["standard_alumini"]}
			/>
		</group>
	);
}
function LightingSystem() {
	return (
		<group>
			{/* Luz ambiente suave */}
			<ambientLight intensity={0.4} color="#ffffff" />

			{/* Luz direccional principal */}
			<directionalLight
				position={[10, 10, 5]}
				intensity={1.2}
				color="#ffffff"
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={50}
				shadow-camera-left={-20}
				shadow-camera-right={20}
				shadow-camera-top={20}
				shadow-camera-bottom={-20}
			/>

			{/* Luces puntuales para ambiente */}
			<pointLight
				position={[-8, 6, -8]}
				intensity={0.5}
				color="#fff8dc"
				distance={100}
			/>
			<pointLight
				position={[8, 6, 8]}
				intensity={0.3}
				color="#fff8dc"
				distance={100}
			/>
		</group>
	);
}

// ===== PISO MEJORADO =====
function FloorImproved({ dimensions = { width: 12, depth: 8 } }) {
	return (
		<mesh position={[0, -0.05, 0]} receiveShadow>
			<boxGeometry
				args={[dimensions.width + 1, 0.1, dimensions.depth + 1]}
			/>
			<meshLambertMaterial color="#e8e8e8" transparent opacity={0.9} />
		</mesh>
	);
}

// ===== PAREDES MEJORADAS =====

function WallsImproved({ walls, level, index }) {
	const color = useSelector(selectColor);
	const showWalls = useSelector((state) => state.building.showWalls ?? true);

	// Material mejorado con mejor iluminación
	const baseMaterial = color
		? walls.material[level]
		: walls.material["noColor"];

	const enhancedMaterial = useMemo(
		() => ({
			...baseMaterial,
			transparent: true,
			opacity: showWalls ? 0.95 : 0.3,
			side: 2, // DoubleSide
		}),
		[baseMaterial, showWalls]
	);

	if (!showWalls) return null;

	return (
		<group>
			{/* Pared principal con sustracciones mejoradas */}
			<mesh castShadow receiveShadow>
				<Geometry>
					<Base
						position={walls.position}
						rotation={walls.rotation}
						geometry={walls.geometry}
					/>
					{/* Puerta con marco */}
					<Subtraction
						position={walls.door.position}
						geometry={walls.door.geometry}
					/>
					{/* Ventanas con marcos */}
					<Subtraction
						position={walls.window.position.frontLeft}
						geometry={walls.window.geometry}
					/>
					<Subtraction
						position={walls.window.position.frontRight}
						geometry={walls.window.geometry}
					/>
					<Subtraction
						position={walls.window.position.backLeft}
						geometry={walls.window.geometry}
					/>
					<Subtraction
						position={walls.window.position.backRight}
						geometry={walls.window.geometry}
					/>
				</Geometry>
			</mesh>

			{/* Paredes completas mejoradas */}
			{walls.completeWalls.position.map((pos, idx) => (
				<mesh
					key={idx}
					position={pos}
					geometry={walls.completeWalls.geometry}
					//material={enhancedMaterial}
					castShadow
					receiveShadow
				/>
			))}

			{/* Marcos de ventanas */}
			<WindowFrames walls={walls} />

			{/* Marco de puerta */}
			<DoorFrame walls={walls} />
		</group>
	);
}

// Marcos de ventanas
function WindowFrames({ walls }) {
	const frameGeometry = useMemo(() => new THREE.BoxGeometry(0.1, 2, 0.1), []);
	const frameMaterial = useMemo(
		() => new THREE.MeshPhongMaterial({ color: "#8B4513", shininess: 50 }),
		[]
	);

	return (
		<group>
			{Object.values(walls.window.position).map((pos, idx) => (
				<group key={idx} position={pos}>
					{/* Marco superior */}
					<mesh
						position={[0, 0.75, 0]}
						geometry={frameGeometry}
						material={frameMaterial}
					/>
					{/* Marco inferior */}
					<mesh
						position={[0, -0.75, 0]}
						geometry={frameGeometry}
						material={frameMaterial}
					/>
					{/* Marcos laterales */}
					<mesh
						position={[-0.9, 0, 0]}
						geometry={frameGeometry}
						material={frameMaterial}
					/>
					<mesh
						position={[0.9, 0, 0]}
						geometry={frameGeometry}
						material={frameMaterial}
					/>
				</group>
			))}
		</group>
	);
}

// Marco de puerta
function DoorFrame({ walls }) {
	const frameGeometry = useMemo(
		() => new THREE.BoxGeometry(0.1, 2.5, 0.1),
		[]
	);
	const frameMaterial = useMemo(
		() => new THREE.MeshPhongMaterial({ color: "#654321", shininess: 30 }),
		[]
	);

	return (
		<group position={walls.door.position}>
			{/* Marco superior */}
			<mesh
				position={[0, 1.25, 0]}
				geometry={frameGeometry}
				material={frameMaterial}
			/>
			{/* Marcos laterales */}
			<mesh
				position={[-0.6, 0, 0]}
				geometry={frameGeometry}
				material={frameMaterial}
			/>
			<mesh
				position={[0.6, 0, 0]}
				geometry={frameGeometry}
				material={frameMaterial}
			/>
		</group>
	);
}

const selectColor = (state) => state.building.colorForLevel;

// ===== COLUMNAS MEJORADAS =====
function ColumnsImproved({
	columns,
	dimensions = { width: 12, depth: 8, height: 4 },
}) {
	const showColumns = useSelector(
		(state) => state.building.showColumns ?? true
	);

	const enhancedMaterial = useMemo(
		() =>
			new THREE.MeshPhongMaterial({
				color: "#888888",
				shininess: 30,
				transparent: true,
				opacity: showColumns ? 1 : 0.3,
			}),
		[showColumns]
	);

	if (!showColumns) return null;

	// Posiciones automáticas basadas en dimensiones
	const columnPositions = useMemo(
		() => [
			[
				-dimensions.width / 2 + 1,
				dimensions.height / 2,
				-dimensions.depth / 2 + 1,
			],
			[
				dimensions.width / 2 - 1,
				dimensions.height / 2,
				-dimensions.depth / 2 + 1,
			],
			[
				-dimensions.width / 2 + 1,
				dimensions.height / 2,
				dimensions.depth / 2 - 1,
			],
			[
				dimensions.width / 2 - 1,
				dimensions.height / 2,
				dimensions.depth / 2 - 1,
			],
		],
		[dimensions]
	);

	return (
		<group>
			{columnPositions.map((position, idx) => (
				<ColumnImproved
					key={idx}
					position={position}
					rotation={[0, 0, 0]}
					geometry={
						columns.geometry ||
						new THREE.BoxGeometry(0.4, dimensions.height, 0.4)
					}
					material={enhancedMaterial}
				/>
			))}
		</group>
	);
}

function ColumnImproved({ position, rotation, geometry, material }) {
	return (
		<mesh
			position={position}
			rotation={rotation}
			geometry={geometry}
			material={material}
			castShadow
			receiveShadow
		>
			{/* Capitel decorativo */}
			<mesh position={[0, 0.4, 0]}>
				<boxGeometry args={[0.5, 0.1, 0.5]} />
				<meshPhongMaterial color="#aaaaaa" shininess={50} />
			</mesh>

			{/* Base */}
			<mesh position={[0, -0.4, 0]}>
				<boxGeometry args={[0.5, 0.1, 0.5]} />
				<meshPhongMaterial color="#aaaaaa" shininess={50} />
			</mesh>
		</mesh>
	);
}

// ===== VIGAS MEJORADAS =====
function BigasImproved({
	bigas,
	dimensions = { width: 12, depth: 8, height: 4 },
}) {
	const showBeams = useSelector((state) => state.building.showBeams ?? true);

	const enhancedMaterial = useMemo(
		() =>
			new THREE.MeshPhongMaterial({
				color: "#8B4513",
				shininess: 50,
				transparent: true,
				opacity: showBeams ? 1 : 0.3,
			}),
		[showBeams]
	);

	if (!showBeams) return null;

	// Generar vigas automáticamente
	const beamsData = useMemo(
		() => [
			// Viga frontal
			{
				id: "front",
				position: [
					0,
					dimensions.height - 0.15,
					-dimensions.depth / 2 + 1,
				],
				rotation: [0, 0, 0],
				geometry: new THREE.BoxGeometry(dimensions.width - 2, 0.3, 0.4),
			},
			// Viga trasera
			{
				id: "back",
				position: [
					0,
					dimensions.height - 0.15,
					dimensions.depth / 2 - 1,
				],
				rotation: [0, 0, 0],
				geometry: new THREE.BoxGeometry(dimensions.width - 2, 0.3, 0.4),
			},
			// Viga izquierda
			{
				id: "left",
				position: [
					-dimensions.width / 2 + 1,
					dimensions.height - 0.15,
					0,
				],
				rotation: [0, 0, 0],
				geometry: new THREE.BoxGeometry(0.4, 0.3, dimensions.depth - 2),
			},
			// Viga derecha
			{
				id: "right",
				position: [
					dimensions.width / 2 - 1,
					dimensions.height - 0.15,
					0,
				],
				rotation: [0, 0, 0],
				geometry: new THREE.BoxGeometry(0.4, 0.3, dimensions.depth - 2),
			},
		],
		[dimensions]
	);

	return (
		<group>
			{beamsData.map((beam) => (
				<BigaImproved
					key={beam.id}
					position={beam.position}
					rotation={beam.rotation}
					geometry={beam.geometry}
					material={enhancedMaterial}
				/>
			))}
		</group>
	);
}

function BigaImproved({ position, rotation, geometry, material }) {
	return (
		<mesh
			position={position}
			rotation={rotation}
			geometry={geometry}
			material={material}
			castShadow
			receiveShadow
		/>
	);
}

// ===== TECHO MEJORADO =====

function RoofImproved({
	position,
	rotation,
	geometry,
	material,
	dimensions = { width: 12, depth: 8 },
}) {
	const show = useSelector(selectRoof);

	const enhancedMaterial = useMemo(
		() =>
			new THREE.MeshLambertMaterial({
				color: "#654321",
				transparent: true,
				opacity: show ? 0.9 : 0.1,
			}),
		[show]
	);

	return (
		<group visible={show}>
			{/* Techo principal */}
			<mesh
				position={position || [0, 4.1, 0]}
				rotation={rotation || [0, 0, 0]}
				geometry={
					geometry ||
					new THREE.BoxGeometry(
						dimensions.width + 0.5,
						0.2,
						dimensions.depth + 0.5
					)
				}
				material={enhancedMaterial}
				castShadow
				receiveShadow
			/>

			{/* Detalles del techo */}
			<mesh position={[0, 4.25, 0]}>
				<boxGeometry
					args={[
						dimensions.width + 0.3,
						0.05,
						dimensions.depth + 0.3,
					]}
				/>
				<meshLambertMaterial color="#543311" />
			</mesh>
		</group>
	);
}

const selectRoof = (state) => state.building.roof;

// ===== VENTANAS MEJORADAS =====
function WindowsImproved({ dimensions = { width: 12, depth: 8, height: 4 } }) {
	const windowMaterial = useMemo(
		() =>
			new THREE.MeshPhysicalMaterial({
				color: "#87CEEB",
				transparent: true,
				opacity: 0.7,
				metalness: 0.1,
				roughness: 0.1,
				transmission: 0.8,
			}),
		[]
	);

	const windowPositions = [
		[-3, dimensions.height / 2, -dimensions.depth / 2 - 0.05],
		[3, dimensions.height / 2, -dimensions.depth / 2 - 0.05],
		[-3, dimensions.height / 2, dimensions.depth / 2 + 0.05],
		[3, dimensions.height / 2, dimensions.depth / 2 + 0.05],
	];

	return (
		<group>
			{windowPositions.map((pos, idx) => (
				<mesh key={idx} position={pos}>
					<boxGeometry args={[2, 1.5, 0.1]} />
					{windowMaterial}
				</mesh>
			))}
		</group>
	);
}

// ===== PUERTAS MEJORADAS =====
function DoorsImproved({ dimensions = { height: 4 } }) {
	const doorMaterial = useMemo(
		() =>
			new THREE.MeshPhongMaterial({
				color: "#654321",
				shininess: 30,
			}),
		[]
	);

	return (
		<mesh position={[-6, dimensions.height / 2 - 0.75, 0]}>
			<boxGeometry args={[0.1, 2.5, 1.2]} />
			{doorMaterial}

			{/* Manija */}
			<mesh position={[0.05, 0, 0.4]}>
				<sphereGeometry args={[0.05]} />
				<meshPhongMaterial color="#ffd700" metalness={0.8} />
			</mesh>
		</mesh>
	);
}

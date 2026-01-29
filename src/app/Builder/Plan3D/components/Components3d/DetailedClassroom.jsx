import { useState, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

// ✅ Componente de Ventana Deslizante
const WindowSliding = ({ position, rotation }) => {
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/sliding_window/scene.gltf"
	);

	return (
		<group
			position={position}
			rotation={rotation}
			scale={[0.02, 0.02, 0.02]}
		>
			<mesh
				geometry={nodes["Object_4"].geometry}
				material={materials["Material_35"]}
				castShadow
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
};

// ✅ Componente de Puerta de Madera
const DoorWood = ({ position, rotation }) => {
	const { nodes, materials } = useLoader(
		GLTFLoader,
		"/models/wood_door/scene.gltf"
	);

	return (
		<group
			position={position}
			rotation={rotation}
			scale={[1.4, 1.2, 1.4]} // Ajusta según el tamaño de tu modelo
		>
			<mesh
				geometry={nodes["Object_8"].geometry}
				material={materials["DOR0001_Wood"]}
				castShadow
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
};

const AulaDetallada = ({
	corners,
	height,
	color,
	nombre,
	level,
	collegeCenter,
	onClick,
	isTopFloor = false,
	corridorSide = null,
	customRoofPosition = null, // [x, y, z] relativo al centro del aula
	customRoofRotation = null, // [x, y, z] en radianes
	customRoofOrientation = null,
	customRoofWidth = null, // Ancho custom del techo
	customRoofDepth = null,
	hasFlatRoof = false,
}) => {
	const [hovered, setHovered] = useState(false);

	if (!corners || corners.length < 4) return null;

	const aulaData = useMemo(() => {
		const centerX =
			corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
		const centerY =
			corners.reduce((sum, c) => sum + c.north, 0) / corners.length;

		const width = Math.sqrt(
			Math.pow(corners[1].east - corners[0].east, 2) +
				Math.pow(corners[1].north - corners[0].north, 2)
		);

		const depth = Math.sqrt(
			Math.pow(corners[2].east - corners[1].east, 2) +
				Math.pow(corners[2].north - corners[1].north, 2)
		);

		const angle = Math.atan2(
			corners[1].north - corners[0].north,
			corners[1].east - corners[0].east
		);

		let doorSide = "front";

		if (collegeCenter) {
			const toCenter = {
				x: collegeCenter.x - centerX,
				y: collegeCenter.y - centerY,
			};

			const walls = {
				front: { x: 0, y: -1 },
				back: { x: 0, y: 1 },
				left: { x: -1, y: 0 },
				right: { x: 1, y: 0 },
			};

			const cos = Math.cos(-angle);
			const sin = Math.sin(-angle);
			const localX = toCenter.x * cos - toCenter.y * sin;
			const localY = toCenter.x * sin + toCenter.y * cos;

			const length = Math.sqrt(localX * localX + localY * localY);
			const normX = localX / length;
			const normY = localY / length;

			let maxDot = -Infinity;
			let bestSide = "front";

			for (const [side, wallVec] of Object.entries(walls)) {
				const dot = normX * wallVec.x + normY * wallVec.y;
				if (dot > maxDot) {
					maxDot = dot;
					bestSide = side;
				}
			}

			doorSide = bestSide;
		}

		return { centerX, centerY, width, depth, angle, doorSide };
	}, [corners, collegeCenter]);

	const techoADosAguas = useMemo(() => {
		const c = corners;
		const v1 = { x: c[1].east - c[0].east, y: c[1].north - c[0].north };
		const v2 = { x: c[3].east - c[0].east, y: c[3].north - c[0].north };

		const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
		const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

		// ✅ PERMITIR OVERRIDE DE ORIENTACIÓN
		const esVertical = customRoofOrientation
			? customRoofOrientation === "vertical"
			: len2 > len1;

		const VOLADIZO_NORMAL = 0.6;
		const VOLADIZO_CORREDOR = 1.2;

		const dir1 = { x: v1.x / len1, y: v1.y / len1 };
		const dir2 = { x: v2.x / len2, y: v2.y / len2 };

		let voladizo0 = VOLADIZO_NORMAL;
		let voladizo1 = VOLADIZO_NORMAL;
		let voladizo2 = VOLADIZO_NORMAL;
		let voladizo3 = VOLADIZO_NORMAL;

		if (corridorSide === "right") {
			voladizo1 = VOLADIZO_CORREDOR;
			voladizo2 = VOLADIZO_CORREDOR;
		} else if (corridorSide === "left") {
			voladizo0 = VOLADIZO_CORREDOR;
			voladizo3 = VOLADIZO_CORREDOR;
		} else if (corridorSide === "top") {
			voladizo2 = VOLADIZO_CORREDOR;
			voladizo3 = VOLADIZO_CORREDOR;
		} else if (corridorSide === "bottom") {
			voladizo0 = VOLADIZO_CORREDOR;
			voladizo1 = VOLADIZO_CORREDOR;
		}

		const p0_ext = {
			east: c[0].east - dir2.x * voladizo0 - dir1.x * voladizo0,
			north: c[0].north - dir2.y * voladizo0 - dir1.y * voladizo0,
		};
		const p1_ext = {
			east: c[1].east + dir1.x * voladizo1 - dir2.x * voladizo1,
			north: c[1].north + dir1.y * voladizo1 - dir2.y * voladizo1,
		};
		const p2_ext = {
			east: c[2].east + dir1.x * voladizo2 + dir2.x * voladizo2,
			north: c[2].north + dir1.y * voladizo2 + dir2.y * voladizo2,
		};
		const p3_ext = {
			east: c[3].east - dir1.x * voladizo3 + dir2.x * voladizo3,
			north: c[3].north - dir1.y * voladizo3 + dir2.y * voladizo3,
		};

		const ALTURA_CUMBRERA = 1.5;

		let cumbreraStart, cumbreraEnd;

		if (esVertical) {
			const mid1 = {
				east: (p0_ext.east + p3_ext.east) / 2,
				north: (p0_ext.north + p3_ext.north) / 2,
			};
			const mid2 = {
				east: (p1_ext.east + p2_ext.east) / 2,
				north: (p1_ext.north + p2_ext.north) / 2,
			};
			cumbreraStart = mid1;
			cumbreraEnd = mid2;
		} else {
			const mid1 = {
				east: (p0_ext.east + p1_ext.east) / 2,
				north: (p0_ext.north + p1_ext.north) / 2,
			};
			const mid2 = {
				east: (p3_ext.east + p2_ext.east) / 2,
				north: (p3_ext.north + p2_ext.north) / 2,
			};
			cumbreraStart = mid1;
			cumbreraEnd = mid2;
		}

		return {
			basePoints: [p0_ext, p1_ext, p2_ext, p3_ext],
			cumbreraStart,
			cumbreraEnd,
			alturaCumbrera: ALTURA_CUMBRERA,
			esVertical,
		};
	}, [corners, corridorSide, customRoofOrientation]);

	const wallThickness = 0.15;
	const doorWidth = 1.0;
	const doorHeight = 2.1;

	// ✅ Calcular posiciones de ventanas
	// ✅ Calcular posición de UNA ventana (pared opuesta a la puerta)
	const windowPosition = useMemo(() => {
		const windowHeight = 1.5; // Altura del centro de la ventana desde el piso

		// Colocar ventana en la pared OPUESTA a la puerta
		switch (aulaData.doorSide) {
			case "front":
				// Puerta al frente → ventana atrás
				return {
					position: [0, aulaData.depth / 2 - 0.08, windowHeight],
					rotation: [-Math.PI / 2, 0, Math.PI], // Mirando hacia adentro
				};

			case "back":
				// Puerta atrás → ventana al frente
				return {
					position: [0, -aulaData.depth / 2 + 0.08, windowHeight],
					rotation: [-Math.PI / 2, 0, 0], // Mirando hacia adentro
				};

			case "left":
				// Puerta izquierda → ventana derecha
				return {
					position: [aulaData.width / 2 - 0.08, 0, windowHeight],
					rotation: [-Math.PI / 2, 0, -Math.PI / 2], // Mirando hacia adentro
				};

			case "right":
				// Puerta derecha → ventana izquierda
				return {
					position: [-aulaData.width / 2 + 0.08, 0, windowHeight],
					rotation: [-Math.PI / 2, 0, Math.PI / 2], // Mirando hacia adentro
				};

			default:
				return {
					position: [0, aulaData.depth / 2 - 0.08, windowHeight],
					rotation: [-Math.PI / 2, 0, Math.PI],
				};
		}
	}, [aulaData]);

	return (
		<group
			position={[aulaData.centerX, aulaData.centerY, 0]}
			rotation={[0, 0, aulaData.angle]}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
			onClick={onClick}
		>
			{/* PISO */}
			<mesh position={[0, 0, 0.01]} receiveShadow>
				<boxGeometry args={[aulaData.width, aulaData.depth, 0.02]} />
				<meshStandardMaterial
					color="#e8e8e8"
					roughness={0.9}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* ✅ PAREDES CON PUERTA Y VENTANAS */}
			{/* Pared FRONTAL */}
			{aulaData.doorSide !== "front" ? (
				<mesh
					castShadow
					receiveShadow
					position={[0, -aulaData.depth / 2, height / 2]}
				>
					<boxGeometry
						args={[aulaData.width, wallThickness, height]}
					/>
					<meshStandardMaterial color={color} roughness={0.8} />
				</mesh>
			) : (
				<>
					{/* Pared con puerta */}
					<group position={[0, -aulaData.depth / 2, height / 2]}>
						<mesh
							castShadow
							receiveShadow
							position={[-aulaData.width / 4 - 0.3, 0, 0]}
						>
							<boxGeometry
								args={[
									aulaData.width / 2 - 0.6,
									wallThickness,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[aulaData.width / 4 + 0.3, 0, 0]}
						>
							<boxGeometry
								args={[
									aulaData.width / 2 - 0.6,
									wallThickness,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[0, 0, height / 2 - 0.45]}
						>
							<boxGeometry
								args={[doorWidth, wallThickness, 0.9]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
					</group>
					{/* ✅ PUERTA GLTF */}
					<DoorWood
						position={[0.6, -aulaData.depth + 3.5, 0]}
						rotation={[Math.PI / 2, 0, 0]}
					/>
				</>
			)}

			{/* Pared TRASERA */}
			{aulaData.doorSide !== "back" ? (
				<mesh
					castShadow
					receiveShadow
					position={[0, aulaData.depth / 2, height / 2]}
				>
					<boxGeometry
						args={[aulaData.width, wallThickness, height]}
					/>
					<meshStandardMaterial color={color} roughness={0.8} />
				</mesh>
			) : (
				<>
					<group position={[0, aulaData.depth / 2, height / 2]}>
						<mesh
							castShadow
							receiveShadow
							position={[-aulaData.width / 4 - 0.3, 0, 0]}
						>
							<boxGeometry
								args={[
									aulaData.width / 2 - 0.6,
									wallThickness,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[aulaData.width / 4 + 0.3, 0, 0]}
						>
							<boxGeometry
								args={[
									aulaData.width / 2 - 0.6,
									wallThickness,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[0, 0, height / 2 - 0.45]}
						>
							<boxGeometry
								args={[doorWidth, wallThickness, 0.9]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
					</group>
					{/* ✅ PUERTA GLTF */}
					<DoorWood
						position={[0.6, aulaData.depth - 3.5, 0]}
						rotation={[Math.PI / 2, 0, 0]}
					/>
				</>
			)}

			{/* Pared IZQUIERDA */}
			{aulaData.doorSide !== "left" ? (
				<mesh
					castShadow
					receiveShadow
					position={[-aulaData.width / 2, 0, height / 2]}
				>
					<boxGeometry
						args={[wallThickness, aulaData.depth, height]}
					/>
					<meshStandardMaterial color={color} roughness={0.8} />
				</mesh>
			) : (
				<>
					<group position={[-aulaData.width / 2, 0, height / 2]}>
						<mesh
							castShadow
							receiveShadow
							position={[0, -aulaData.depth / 4 - 0.3, 0]}
						>
							<boxGeometry
								args={[
									wallThickness,
									aulaData.depth / 2 - 0.6,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[0, aulaData.depth / 4 + 0.3, 0]}
						>
							<boxGeometry
								args={[
									wallThickness,
									aulaData.depth / 2 - 0.6,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[0, 0, height / 2 - 0.45]}
						>
							<boxGeometry
								args={[wallThickness, doorWidth, 0.9]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
					</group>
					{/* ✅ PUERTA GLTF */}
					<DoorWood
						position={[-aulaData.width / 2 - 0.1, 0.6, 0]}
						rotation={[Math.PI / 2, Math.PI / 2, 0]}
					/>
				</>
			)}

			{/* Pared DERECHA */}
			{aulaData.doorSide !== "right" ? (
				<mesh
					castShadow
					receiveShadow
					position={[aulaData.width / 2, 0, height / 2]}
				>
					<boxGeometry
						args={[wallThickness, aulaData.depth, height]}
					/>
					<meshStandardMaterial color={color} roughness={0.8} />
				</mesh>
			) : (
				<>
					<group position={[aulaData.width / 2, 0, height / 2]}>
						<mesh
							castShadow
							receiveShadow
							position={[0, -aulaData.depth / 4 - 0.3, 0]}
						>
							<boxGeometry
								args={[
									wallThickness,
									aulaData.depth / 2 - 0.6,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[0, aulaData.depth / 4 + 0.3, 0]}
						>
							<boxGeometry
								args={[
									wallThickness,
									aulaData.depth / 2 - 0.6,
									height,
								]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
						<mesh
							castShadow
							receiveShadow
							position={[0, 0, height / 2 - 0.45]}
						>
							<boxGeometry
								args={[wallThickness, doorWidth, 0.9]}
							/>
							<meshStandardMaterial
								color={color}
								roughness={0.8}
							/>
						</mesh>
					</group>
					{/* ✅ PUERTA GLTF */}
					<DoorWood
						position={[aulaData.width / 2 + 0.1, 0.6, 0]}
						rotation={[Math.PI / 2, Math.PI / 2, 0]}
					/>
				</>
			)}

			{/* ✅ VENTANAS */}
			{/* {windowPosition.map((window, idx) => (
				<WindowSliding
					key={`window-${idx}`}
					position={window.position}
					//rotation={window.rotation}
					//position={[0.2, 0, 0]}
					rotation={[0, Math.PI / 2, 0]}
				/>
			))} */}
			<WindowSliding
				position={windowPosition.position}
				rotation={[3.9, Math.PI / 2, 0]}
				//rotation={windowPosition.rotation}
			/>
			{/* COLUMNAS en las esquinas */}
			{[
				[-aulaData.width / 2, -aulaData.depth / 2],
				[aulaData.width / 2, -aulaData.depth / 2],
				[aulaData.width / 2, aulaData.depth / 2],
				[-aulaData.width / 2, aulaData.depth / 2],
			].map((pos, idx) => (
				<group key={`column-${idx}`} position={[pos[0], pos[1], 0]}>
					<mesh
						castShadow
						receiveShadow
						position={[0, 0, height / 2]}
					>
						<boxGeometry args={[0.25, 0.25, height]} />
						<meshStandardMaterial
							color="#666666"
							roughness={0.7}
							metalness={0.3}
						/>
					</mesh>
					<mesh position={[0, 0, height + 0.05]}>
						<boxGeometry args={[0.32, 0.32, 0.1]} />
						<meshStandardMaterial color="#888888" roughness={0.5} />
					</mesh>
				</group>
			))}

			{/* VIGAS */}
			<mesh
				position={[0, -aulaData.depth / 2, height - 0.125]}
				castShadow
			>
				<boxGeometry args={[aulaData.width, 0.2, 0.25]} />
				<meshStandardMaterial color="#8B4513" roughness={0.8} />
			</mesh>
			<mesh position={[0, aulaData.depth / 2, height - 0.125]} castShadow>
				<boxGeometry args={[aulaData.width, 0.2, 0.25]} />
				<meshStandardMaterial color="#8B4513" roughness={0.8} />
			</mesh>
			<mesh
				position={[-aulaData.width / 2, 0, height - 0.125]}
				castShadow
			>
				<boxGeometry args={[0.2, aulaData.depth, 0.25]} />
				<meshStandardMaterial color="#8B4513" roughness={0.8} />
			</mesh>
			<mesh position={[aulaData.width / 2, 0, height - 0.125]} castShadow>
				<boxGeometry args={[0.2, aulaData.depth, 0.25]} />
				<meshStandardMaterial color="#8B4513" roughness={0.8} />
			</mesh>

			{/* ✅ TECHO PLANO (solo si NO es último piso) */}
			{/* {!isTopFloor && (
				<mesh position={[0, 0, height + 0.1]} castShadow receiveShadow>
					<boxGeometry
						args={[
							aulaData.width + 0.3,
							aulaData.depth + 0.3,
							0.15,
						]}
					/>
					<meshStandardMaterial color="#654321" roughness={0.9} />
				</mesh>
			)} */}
			{hasFlatRoof && (
				<mesh position={[0, 0, height + 0.1]} castShadow receiveShadow>
					<boxGeometry
						args={[
							aulaData.width + 0.3,
							aulaData.depth + 0.3,
							0.15,
						]}
					/>
					<meshStandardMaterial color="#654321" roughness={0.9} />
				</mesh>
			)}

			{/* ✅ TECHO A DOS AGUAS (solo último piso) */}
			{/* {isTopFloor && techoADosAguas && ( */}
			{!hasFlatRoof && techoADosAguas && (
				<group
					position={
						customRoofPosition
							? customRoofPosition
							: [0, 4.5, height]
					}
				>
					<mesh
						castShadow
						receiveShadow
						rotation={
							customRoofRotation
								? customRoofRotation
								: techoADosAguas.esVertical
								? [0, 0, Math.PI / 2]
								: [Math.PI / 2, 0, 0]
						}
					>
						<extrudeGeometry
							args={[
								(() => {
									const shape = new THREE.Shape();

									const baseWidth = customRoofWidth
										? customRoofWidth
										: techoADosAguas.esVertical
										? aulaData.width + 1.2
										: aulaData.depth + 1.2;

									const altura =
										techoADosAguas.alturaCumbrera;

									shape.moveTo(-baseWidth / 2, 0);
									shape.lineTo(0, altura);
									shape.lineTo(baseWidth / 2, 0);
									shape.lineTo(-baseWidth / 2, 0);

									return shape;
								})(),
								{
									depth: customRoofDepth
										? customRoofDepth
										: techoADosAguas.esVertical
										? aulaData.depth + 1.2
										: aulaData.width + 1.2,
									bevelEnabled: false,
								},
							]}
						/>
						<meshStandardMaterial
							color="#8B4513"
							roughness={0.85}
							metalness={0.15}
						/>
					</mesh>
				</group>
			)}

			{/* )} */}
			{/* {techoADosAguas && (
				<group
					position={
						customRoofPosition
							? customRoofPosition
							: [0, 4.5, height]
					}
				>
					<mesh
						castShadow
						receiveShadow
						rotation={
							customRoofRotation
								? customRoofRotation
								: techoADosAguas.esVertical
								? [0, 0, Math.PI / 2]
								: [Math.PI / 2, 0, 0]
						}
					>
						<extrudeGeometry
							args={[
								(() => {
									const shape = new THREE.Shape();

									// ✅ USAR DIMENSIONES CUSTOM SI ESTÁN DISPONIBLES
									const baseWidth = customRoofWidth
										? customRoofWidth
										: techoADosAguas.esVertical
										? aulaData.width + 1.2
										: aulaData.depth + 1.2;

									const altura =
										techoADosAguas.alturaCumbrera;

									shape.moveTo(-baseWidth / 2, 0);
									shape.lineTo(0, altura);
									shape.lineTo(baseWidth / 2, 0);
									shape.lineTo(-baseWidth / 2, 0);

									return shape;
								})(),
								{
									// ✅ USAR PROFUNDIDAD CUSTOM SI ESTÁ DISPONIBLE
									depth: customRoofDepth
										? customRoofDepth
										: techoADosAguas.esVertical
										? aulaData.depth + 1.2
										: aulaData.width + 1.2,
									bevelEnabled: false,
								},
							]}
						/>
						<meshStandardMaterial
							color="#8B4513"
							roughness={0.85}
							metalness={0.15}
						/>
					</mesh>
				</group>
			)} */}
			{/* TEXTO */}
			<Text
				position={[0, 0, height + (isTopFloor ? 2.2 : 0.6)]}
				fontSize={0.4}
				color={hovered ? "black" : "white"}
				anchorX="center"
				anchorY="middle"
				outlineWidth={0.03}
				outlineColor={hovered ? "white" : "black"}
			>
				{nombre}
				{"\n"}
				{`${aulaData.width.toFixed(1)}m x ${aulaData.depth.toFixed(
					1
				)}m`}
			</Text>
		</group>
	);
};

export default AulaDetallada;

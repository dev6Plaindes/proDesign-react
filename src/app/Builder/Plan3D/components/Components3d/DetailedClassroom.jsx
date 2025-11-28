import { useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const AulaDetallada = ({
	corners,
	height,
	color,
	nombre,
	level,
	collegeCenter,
	onClick,
	isTopFloor = false, // ✅ NUEVO
	corridorSide = null, // ✅ NUEVO: 'left', 'right', 'top', 'bottom'
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

		// ✅ CALCULAR ORIENTACIÓN DE LA PUERTA
		let doorSide = "front"; // Por defecto: pared frontal

		if (collegeCenter) {
			// Vector del aula hacia el centro del colegio
			const toCenter = {
				x: collegeCenter.x - centerX,
				y: collegeCenter.y - centerY,
			};

			// Vectores de las paredes en coordenadas locales (antes de rotar)
			const walls = {
				front: { x: 0, y: -1 }, // Pared frontal (hacia -Y)
				back: { x: 0, y: 1 }, // Pared trasera (hacia +Y)
				left: { x: -1, y: 0 }, // Pared izquierda (hacia -X)
				right: { x: 1, y: 0 }, // Pared derecha (hacia +X)
			};

			// Rotar el vector toCenter al espacio local del aula
			const cos = Math.cos(-angle);
			const sin = Math.sin(-angle);
			const localX = toCenter.x * cos - toCenter.y * sin;
			const localY = toCenter.x * sin + toCenter.y * cos;

			// Normalizar
			const length = Math.sqrt(localX * localX + localY * localY);
			const normX = localX / length;
			const normY = localY / length;

			// Encontrar qué pared está más alineada con el centro
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

	// ✅ CALCULAR TECHO A DOS AGUAS (solo último piso)
	const techoADosAguas = useMemo(() => {
		if (!isTopFloor) return null;

		const c = corners;

		// Calcular vectores de los lados del aula
		const v1 = { x: c[1].east - c[0].east, y: c[1].north - c[0].north };
		const v2 = { x: c[3].east - c[0].east, y: c[3].north - c[0].north };

		const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
		const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

		// Determinar cuál es el lado largo (cumbrera va ahí)
		const esVertical = len2 > len1;

		// ✅ VOLADIZO: el techo sobresale
		const VOLADIZO_NORMAL = 0.6; // 60cm en lados normales
		const VOLADIZO_CORREDOR = 1.2; // 120cm en lado del corredor

		// Normalizar direcciones
		const dir1 = { x: v1.x / len1, y: v1.y / len1 };
		const dir2 = { x: v2.x / len2, y: v2.y / len2 };

		// ✅ DETERMINAR VOLADIZOS SEGÚN LADO DEL CORREDOR
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

		// Puntos extendidos de la base del techo
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

		// ✅ CALCULAR CUMBRERA (línea central del techo)
		const ALTURA_CUMBRERA = 1.5; // 1.5m de altura adicional

		let cumbreraStart, cumbreraEnd;

		if (esVertical) {
			// Cumbrera va de lado 0-3 a lado 1-2 (vertical)
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
			// Cumbrera va de lado 0-1 a lado 3-2 (horizontal)
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
	}, [corners, isTopFloor, corridorSide]);

	const wallThickness = 0.15;
	const doorWidth = 1.0;
	const doorHeight = 2.1;

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

			{/* ✅ PAREDES CON PUERTA DINÁMICA */}
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
						<meshStandardMaterial color={color} roughness={0.8} />
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
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						receiveShadow
						position={[0, 0, height / 2 - 0.45]}
					>
						<boxGeometry args={[doorWidth, wallThickness, 0.9]} />
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						position={[
							0,
							-wallThickness,
							-height / 2 + doorHeight / 2,
						]}
					>
						<boxGeometry args={[doorWidth, 0.05, doorHeight]} />
						<meshStandardMaterial color="#8B6914" roughness={0.6} />
					</mesh>
				</group>
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
						<meshStandardMaterial color={color} roughness={0.8} />
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
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						receiveShadow
						position={[0, 0, height / 2 - 0.45]}
					>
						<boxGeometry args={[doorWidth, wallThickness, 0.9]} />
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						position={[
							0,
							wallThickness,
							-height / 2 + doorHeight / 2,
						]}
					>
						<boxGeometry args={[doorWidth, 0.05, doorHeight]} />
						<meshStandardMaterial color="#8B6914" roughness={0.6} />
					</mesh>
				</group>
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
						<meshStandardMaterial color={color} roughness={0.8} />
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
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						receiveShadow
						position={[0, 0, height / 2 - 0.45]}
					>
						<boxGeometry args={[wallThickness, doorWidth, 0.9]} />
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						position={[
							-wallThickness,
							0,
							-height / 2 + doorHeight / 2,
						]}
					>
						<boxGeometry args={[0.05, doorWidth, doorHeight]} />
						<meshStandardMaterial color="#8B6914" roughness={0.6} />
					</mesh>
				</group>
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
						<meshStandardMaterial color={color} roughness={0.8} />
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
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						receiveShadow
						position={[0, 0, height / 2 - 0.45]}
					>
						<boxGeometry args={[wallThickness, doorWidth, 0.9]} />
						<meshStandardMaterial color={color} roughness={0.8} />
					</mesh>
					<mesh
						castShadow
						position={[
							wallThickness,
							0,
							-height / 2 + doorHeight / 2,
						]}
					>
						<boxGeometry args={[0.05, doorWidth, doorHeight]} />
						<meshStandardMaterial color="#8B6914" roughness={0.6} />
					</mesh>
				</group>
			)}

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
			{!isTopFloor && (
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

			{/* ✅ TECHO A DOS AGUAS REALISTA (solo último piso) */}

			{isTopFloor && techoADosAguas && (
				<group position={[0, 4.5, height]}>
					{/* ✅ TECHO SÓLIDO - PRISMA TRIANGULAR CON ROTACIÓN CORREGIDA */}
					<mesh
						castShadow
						receiveShadow
						rotation={
							techoADosAguas.esVertical
								? [0, 0, Math.PI / 2] // ✅ CAMBIO: invertir
								: [Math.PI / 2, 0, 0] // se hizo el cambio aqui
						}
					>
						<extrudeGeometry
							args={[
								(() => {
									// ✅ Crear perfil triangular del techo
									const shape = new THREE.Shape();

									// ✅ CAMBIO: usar el lado CORTO para el ancho del triángulo
									const baseWidth = techoADosAguas.esVertical
										? aulaData.width + 1.2 // ✅ CAMBIO: invertir
										: aulaData.depth + 1.2;

									const altura =
										techoADosAguas.alturaCumbrera;

									// Triángulo: base -> pico -> base
									shape.moveTo(-baseWidth / 2, 0);
									shape.lineTo(0, altura);
									shape.lineTo(baseWidth / 2, 0);
									shape.lineTo(-baseWidth / 2, 0);

									return shape;
								})(),
								{
									// ✅ CAMBIO: extruir a lo largo del lado LARGO
									depth: techoADosAguas.esVertical
										? aulaData.depth + 1.2 // ✅ CAMBIO: invertir
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

					{/* ✅ TEXTURA DE TEJAS - Líneas horizontales CORREGIDAS */}
					{/* {Array.from({ length: 10 }, (_, i) => {
						const alturaLinea =
							(i + 1) * (techoADosAguas.alturaCumbrera / 10);

						return (
							<mesh
								key={`teja-${i}`}
								rotation={
									techoADosAguas.esVertical
										? [0, 0, Math.PI / 2] // ✅ CAMBIO: invertir
										: [0, 0, 0]
								}
								position={[0, 0, alturaLinea]}
								castShadow
							>
								<boxGeometry
									args={[
										0.03,
										techoADosAguas.esVertical
											? aulaData.depth + 1.3 // ✅ CAMBIO: invertir
											: aulaData.width + 1.3,
										0.02,
									]}
								/>
								<meshStandardMaterial
									color="#A0522D"
									roughness={0.9}
								/>
							</mesh>
						);
					})} */}

					{/* ✅ CUMBRERA (remate superior) CORREGIDA */}
					{/* <mesh
						position={[0, 0, techoADosAguas.alturaCumbrera]}
						rotation={
							techoADosAguas.esVertical
								? [0, 0, Math.PI / 2] // ✅ CAMBIO: invertir
								: [0, 0, 0]
						}
						castShadow
					>
						<boxGeometry
							args={[
								0.2,
								techoADosAguas.esVertical
									? aulaData.depth + 1.4 // ✅ CAMBIO: invertir
									: aulaData.width + 1.4,
								0.15,
							]}
						/>
						<meshStandardMaterial color="#654321" roughness={0.8} />
					</mesh> */}

					{/* ✅ ALEROS (bordes inferiores del techo) CORREGIDOS */}
					{/* Alero derecho */}
					{/* <mesh
						position={
							techoADosAguas.esVertical
								? [
										(aulaData.width + 1.2) / 2, // ✅ CAMBIO: invertir
										0,
										0.05,
								  ]
								: [0, (aulaData.depth + 1.2) / 2, 0.05]
						}
						rotation={
							techoADosAguas.esVertical
								? [0, 0, Math.PI / 2] // ✅ CAMBIO: invertir
								: [0, 0, 0]
						}
					>
						<boxGeometry
							args={[
								0.15,
								techoADosAguas.esVertical
									? aulaData.depth + 1.4 // ✅ CAMBIO: invertir
									: aulaData.width + 1.4,
								0.1,
							]}
						/>
						<meshStandardMaterial
							color="#654321"
							roughness={0.85}
						/>
					</mesh> */}

					{/* Alero izquierdo */}
					{/* <mesh
						position={
							techoADosAguas.esVertical
								? [
										-(aulaData.width + 1.2) / 2, // ✅ CAMBIO: invertir
										0,
										0.05,
								  ]
								: [0, -(aulaData.depth + 1.2) / 2, 0.05]
						}
						rotation={
							techoADosAguas.esVertical
								? [0, 0, Math.PI / 2] // ✅ CAMBIO: invertir
								: [0, 0, 0]
						}
					>
						<boxGeometry
							args={[
								0.15,
								techoADosAguas.esVertical
									? aulaData.depth + 1.4 // ✅ CAMBIO: invertir
									: aulaData.width + 1.4,
								0.1,
							]}
						/>
						<meshStandardMaterial
							color="#654321"
							roughness={0.85}
						/>
					</mesh> */}
				</group>
			)}

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

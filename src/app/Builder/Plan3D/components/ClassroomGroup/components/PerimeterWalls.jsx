import { Vector3 } from "three";
import { useMemo } from "react";
import { Line } from "@react-three/drei";
import GreenArea from "./GreenArea";

export default function PerimeterWalls({
	vertices = [],
	rectangleVertices = [],
	children,
	onTerrainClick,
	height = 80,
	thickness = 1,
	color = "#8b8b8b",
	SCALE_FACTOR = 80,
	debug = false,
}) {
	if (!vertices || vertices.length < 2) return null;

	// cerrar la polilínea
	const closedVertices = [...vertices, vertices[0]];

	// centro (promedio) — igual que usabas
	const centerEasting =
		closedVertices.reduce((sum, [e]) => sum + e, 0) / closedVertices.length;
	const centerNorthing =
		closedVertices.reduce((sum, [, n]) => sum + n, 0) /
		closedVertices.length;

	// coordenadas normalizadas (misma convención que antes: [x,y])
	const shapeCoords = closedVertices.map(([e, n]) => [
		(e - centerEasting) * SCALE_FACTOR,
		(n - centerNorthing) * SCALE_FACTOR,
	]);

	// rect coords normalizadas (para bounding box / centro del rectángulo)
	const rectCoords = rectangleVertices.map(([e, n]) => [
		(e - centerEasting) * SCALE_FACTOR,
		(n - centerNorthing) * SCALE_FACTOR,
	]);
	const minX = Math.min(...rectCoords.map(([x]) => x));
	const maxX = Math.max(...rectCoords.map(([x]) => x));
	const minY = Math.min(...rectCoords.map(([, y]) => y));
	const maxY = Math.max(...rectCoords.map(([, y]) => y));
	const centerX = (minX + maxX) / 2;
	const centerY = (minY + maxY) / 2;

	// linePoints (mismos que usabas para Line)
	const linePoints = useMemo(
		() => shapeCoords.map(([x, y]) => new Vector3(x, y, 0)),
		[shapeCoords]
	);

	// calcular segmentos y sus transforms en el marco LOCAL (XY, z=0)
	const walls = useMemo(() => {
		const segs = [];
		// recorremos hasta length-1 porque la última es igual a la primera (cerrado)
		for (let i = 0; i < shapeCoords.length - 1; i++) {
			const [x1, y1] = shapeCoords[i];
			const [x2, y2] = shapeCoords[i + 1];

			const dx = x2 - x1;
			const dy = y2 - y1;
			const length = Math.hypot(dx, dy);

			// Ángulo en el plano XY (rotación alrededor de Z en el marco local)
			const angleZ = Math.atan2(dy, dx);

			// posición del centro del segmento en coords LOCALES: (mx, my, z)
			// colocamos z = height/2 para centrar la caja verticalmente en local z
			const mx = (x1 + x2) / 2;
			const my = (y1 + y2) / 2;
			const mz = height / 2;

			segs.push({
				position: [mx, my, mz], // local XYZ (antes de rotar el group)
				rotation: [0, 0, angleZ], // rotación local (Z)
				length,
			});
		}
		return segs;
	}, [shapeCoords, height]);

	return (
		// mantenemos EXACTAMENTE la misma rotación del group que tenías originalmente,
		// así las líneas y los children siguen interpretándose igual.
		<group rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
			{/* DEBUG: dibujar la línea encima (para chequear alineamiento) */}
			{debug && (
				<Line points={linePoints} color="#000000" lineWidth={1} loop />
			)}

			{/* Muros (cada segmento = un box) */}
			{walls.map((w, i) => (
				<mesh
					key={i}
					position={w.position}
					rotation={w.rotation}
					castShadow
					receiveShadow
				>
					{/* BoxGeometry args: [width(x), height(y), depth(z)] EN EL MARCO LOCAL */}
					{/* width = longitud del segmento (x local), height = espesor (y local), depth = altura del muro (z local) */}
					<boxGeometry args={[w.length, thickness, height]} />
					<meshStandardMaterial color={color} />
				</mesh>
			))}

			{/* Área clickeable (igual a antes) */}
			{/* <mesh
				position={[centerX + 10, 0, centerY]}
				onClick={onTerrainClick}
				onPointerOver={() => (document.body.style.cursor = "pointer")}
				onPointerOut={() => (document.body.style.cursor = "default")}
			>
				<planeGeometry
					args={[Math.abs(maxX - minX), Math.abs(maxY - minY)]}
				/>
				<meshBasicMaterial transparent opacity={0} />
			</mesh> */}

			{/* puntos del rectángulo (debug, opcional) */}
			{/* {debug &&
				rectCoords.map((pos2, ind) => (
					<mesh key={ind} position={[pos2[0], pos2[1], 0.1]}>
						<circleGeometry args={[1, 16]} />
						<meshBasicMaterial color="#00ff00" />
					</mesh>
				))} */}
			<GreenArea
				vertices={vertices}
				rectangleVertices={rectangleVertices}
				centerEasting={centerEasting}
				centerNorthing={centerNorthing}
				SCALE_FACTOR={SCALE_FACTOR}
			/>
			{/* Renderizar elementos dentro del rectángulo — mantuve la lógica que usabas */}
			<group
				position={[centerX, 0, 0]}
				rotation={[Math.PI / 2, -Math.PI / 2, 0]}
			>
				{children}
			</group>
		</group>
	);
}

// import React, { useMemo } from "react";
// import * as THREE from "three";
// import { getRectFromCoords } from "../../../../../../hooks/getFromCoords";

// export default function PerimeterWalls({
// 	coords,
// 	placeAt = [0, 0, 0], // colocaremos el centro del rectángulo aquí (en coordenadas locales)
// 	height = 6,
// 	thickness = 0.5,
// 	color = "#8b8b8b",
// 	debug = false,
// }) {
// 	const rect = useMemo(() => getRectFromCoords(coords), [coords]);

// 	console.log("rect de muros", rect);

// 	const SCALE = 70;

// 	const halfW = (rect.width * SCALE) / 2;
// 	const halfL = (rect.length * SCALE) / 2;

// 	// objeto wireframe (line loop) para debug
// 	const wire = useMemo(() => {
// 		const points = [
// 			new THREE.Vector3(-halfW, 0.01, -halfL),
// 			new THREE.Vector3(halfW, 0.01, -halfL),
// 			new THREE.Vector3(halfW, 0.01, halfL),
// 			new THREE.Vector3(-halfW, 0.01, halfL),
// 			new THREE.Vector3(-halfW, 0.01, -halfL),
// 		];
// 		const geom = new THREE.BufferGeometry().setFromPoints(points);
// 		const mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
// 		return new THREE.LineLoop(geom, mat);
// 	}, [halfW, halfL]);

// 	return (
// 		<group position={placeAt} rotation={[0, 1.5992, 0]}>
// 			{/* pared frente (lado -Z local) */}
// 			<mesh position={[0, height / 2, -halfL]}>
// 				<boxGeometry args={[rect.width * SCALE, height, thickness]} />
// 				<meshStandardMaterial color={color} />
// 			</mesh>

// 			{/* pared posterior (lado +Z local) */}
// 			<mesh position={[0, height / 2, halfL]}>
// 				<boxGeometry args={[rect.width * SCALE, height, thickness]} />
// 				<meshStandardMaterial color={color} />
// 			</mesh>

// 			{/* pared izquierda (lado -X local) */}
// 			<mesh
// 				position={[-halfW, height / 2, 0]}
// 				rotation={[0, Math.PI / 2, 0]}
// 			>
// 				<boxGeometry args={[rect.length * SCALE, height, thickness]} />
// 				<meshStandardMaterial color={color} />
// 			</mesh>

// 			{/* pared derecha (lado +X local) */}
// 			<mesh
// 				position={[halfW, height / 2, 0]}
// 				rotation={[0, Math.PI / 2, 0]}
// 			>
// 				<boxGeometry args={[rect.length * SCALE, height, thickness]} />
// 				<meshStandardMaterial color={color} />
// 			</mesh>

// 			{/* piso semitransparente para referencia */}
// 			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
// 				<planeGeometry args={[rect.width + 4, rect.length + 4]} />
// 				<meshStandardMaterial
// 					color={color}
// 					opacity={0.12}
// 					transparent
// 				/>
// 			</mesh>

// 			{/* debug: wireframe y esfera en centro */}
// 			{debug && <primitive object={wire} />}
// 			{debug && (
// 				<mesh position={[0, 0.2, 0]}>
// 					<sphereGeometry
// 						args={[Math.max(rect.width, rect.length) * 0.02, 8, 8]}
// 					/>
// 					<meshStandardMaterial color="red" />
// 				</mesh>
// 			)}
// 		</group>
// 	);
// }

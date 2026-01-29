import { Vector3 } from "three";
import { useEffect, useMemo } from "react";
import { Line } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export default function Terrain2D({
	vertices,
	rectangleVertices,
	children,
	onTerrainClick,
}) {
	// Debug: Verificar que llegan los vertices
	console.log("Terrain2D received vertices:", vertices);
	console.log("Terrain2D vertices type:", typeof vertices);
	console.log("Terrain2D vertices is array:", Array.isArray(vertices));

	// Asegurar que vertices es un array
	const safeVertices = Array.isArray(vertices) ? vertices : [];

	// Si es necesario comprobar si los vértices están vacíos
	if (safeVertices.length === 0) {
		console.warn("Terrain2D: No vertices provided");
		// Retornar algo en lugar de null para debugging
		return <group>{children}</group>;
	}

	const closedVertices = [...safeVertices, safeVertices[0]];
	const SCALE_FACTOR = 80;
	const centerEasting =
		closedVertices.reduce((sum, [e]) => sum + e, 0) / closedVertices.length;
	const centerNorthing =
		closedVertices.reduce((sum, [, n]) => sum + n, 0) /
		closedVertices.length;

	const shapeCoords = closedVertices.map(([e, n]) => [
		(e - centerEasting) * SCALE_FACTOR,
		(n - centerNorthing) * SCALE_FACTOR,
	]);

	const rectCoords = rectangleVertices.map(([e, n]) => [
		(e - centerEasting) * SCALE_FACTOR,
		(n - centerNorthing) * SCALE_FACTOR,
	]);

	console.log("puntos transformados del cuadrante maximo", rectCoords);

	const minX = Math.min(...rectCoords.map(([x]) => x));
	const maxX = Math.max(...rectCoords.map(([x]) => x));
	const minY = Math.min(...rectCoords.map(([, y]) => y));
	const maxY = Math.max(...rectCoords.map(([, y]) => y));

	const centerX = (minX + maxX) / 2;
	const centerY = (minY + maxY) / 2;

	const linePoints = useMemo(() => {
		return shapeCoords.map(([x, y]) => new Vector3(x, y, 0));
	}, [shapeCoords]);

	const rectPoints = useMemo(() => {
		const closedRectCoords = [...rectCoords, rectCoords[0]];
		return closedRectCoords.map(([x, y]) => new Vector3(x, y, 0));
	}, [rectCoords]);

	console.log("rectPointss", rectPoints);

	const SCALE = 60;

	return (
		<group rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
			{/* Outline */}
			<Line points={linePoints} color="#000000" lineWidth={1} loop />
			{/* Vertex points */}
			{linePoints.map((pos, index) => (
				<mesh key={index} position={[pos.x, pos.y, 0.1]}>
					<circleGeometry args={[1, 16]} />
					<meshBasicMaterial color={"#000000"} />
					{/* <boxGeometry args={[120, 120, 30]} />
					<meshStandardMaterial color="#8b8b8b" /> */}
				</mesh>
			))}
			{/* Rectángulo dentro del polígono */}
			<Line points={rectPoints} color="red" lineWidth={1} loop />
			{/* Área clickeable invisible sobre el rectángulo */}
			<mesh
				position={[centerX + 10, 0, centerY]}
				onClick={onTerrainClick}
				onPointerOver={(e) => {
					document.body.style.cursor = "pointer";
				}}
				onPointerOut={(e) => {
					document.body.style.cursor = "default";
				}}
			>
				<planeGeometry
					args={[Math.abs(maxX - minX), Math.abs(maxY - minY)]}
				/>
				<meshBasicMaterial transparent opacity={0} />
			</mesh>
			/////
			{rectPoints.map((pos2, ind) => (
				<mesh key={ind} position={[pos2.x, pos2.y, 0.1]}>
					<circleGeometry args={[1, 16]} />
					<meshBasicMaterial color="#00ff00" />
				</mesh>
			))}
			{/* Renderizar elementos dentro del rectángulo */}
			<group
				position={[centerX, 0, 0]}
				rotation={[Math.PI / 2, -Math.PI / 2, 0]}
			>
				{children}
			</group>
		</group>
	);
}

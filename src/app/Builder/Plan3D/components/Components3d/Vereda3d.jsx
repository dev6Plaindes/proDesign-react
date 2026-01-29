import { useMemo } from "react";
import * as THREE from "three";

const Vereda3D = ({
	startPoint, // { east, north }
	endPoint, // { east, north }
	width = 1.5, // Ancho de la vereda en metros
	lado = "derecha", // "derecha", "izquierda", "superior", "inferior"
	color = "#cccccc",
	offset = 0,
}) => {
	const veredaData = useMemo(() => {
		if (!startPoint || !endPoint) return null;

		// Calcular vector del pabellón
		const dx = endPoint.east - startPoint.east;
		const dy = endPoint.north - startPoint.north;
		const length = Math.sqrt(dx * dx + dy * dy);

		if (length === 0) return null;

		// Vector unitario del pabellón
		const ux = dx / length;
		const uy = dy / length;

		// Vector perpendicular (para el ancho)
		const perpX = -uy;
		const perpY = ux;

		// ✅ APLICAR OFFSET: Mover los puntos base según el lado
		let baseStartEast = startPoint.east;
		let baseStartNorth = startPoint.north;
		let baseEndEast = endPoint.east;
		let baseEndNorth = endPoint.north;

		// Aplicar offset según el lado
		switch (lado) {
			case "derecha":
				baseStartEast += perpX * offset;
				baseStartNorth += perpY * offset;
				baseEndEast += perpX * offset;
				baseEndNorth += perpY * offset;
				break;
			case "izquierda":
				baseStartEast -= perpX * offset;
				baseStartNorth -= perpY * offset;
				baseEndEast -= perpX * offset;
				baseEndNorth -= perpY * offset;
				break;
			case "superior":
				baseStartEast -= perpX * offset;
				baseStartNorth -= perpY * offset;
				baseEndEast -= perpX * offset;
				baseEndNorth -= perpY * offset;
				break;
			case "inferior":
				baseStartEast += perpX * offset;
				baseStartNorth += perpY * offset;
				baseEndEast += perpX * offset;
				baseEndNorth += perpY * offset;
				break;
		}

		// Calcular las 4 esquinas de la vereda según el lado
		let corners;

		switch (lado) {
			case "derecha":
				corners = [
					{
						east: baseStartEast,
						north: baseStartNorth,
					},
					{
						east: baseEndEast,
						north: baseEndNorth,
					},
					{
						east: baseEndEast + perpX * width,
						north: baseEndNorth + perpY * width,
					},
					{
						east: baseStartEast + perpX * width,
						north: baseStartNorth + perpY * width,
					},
				];
				break;

			case "izquierda":
				corners = [
					{
						east: baseStartEast - perpX * width,
						north: baseStartNorth - perpY * width,
					},
					{
						east: baseEndEast - perpX * width,
						north: baseEndNorth - perpY * width,
					},
					{
						east: baseEndEast,
						north: baseEndNorth,
					},
					{
						east: baseStartEast,
						north: baseStartNorth,
					},
				];
				break;

			case "superior":
				corners = [
					{
						east: baseStartEast,
						north: baseStartNorth,
					},
					{
						east: baseStartEast - perpX * width,
						north: baseStartNorth - perpY * width,
					},
					{
						east: baseEndEast - perpX * width,
						north: baseEndNorth - perpY * width,
					},
					{
						east: baseEndEast,
						north: baseEndNorth,
					},
				];
				break;

			case "inferior":
				corners = [
					{
						east: baseStartEast + perpX * width,
						north: baseStartNorth + perpY * width,
					},
					{
						east: baseStartEast,
						north: baseStartNorth,
					},
					{
						east: baseEndEast,
						north: baseEndNorth,
					},
					{
						east: baseEndEast + perpX * width,
						north: baseEndNorth + perpY * width,
					},
				];
				break;

			default:
				return null;
		}

		// Calcular centro
		const centerEast =
			corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
		const centerNorth =
			corners.reduce((sum, c) => sum + c.north, 0) / corners.length;
		return {
			corners,
			centerEast,
			centerNorth,
			length,
			width,
		};
	}, [startPoint, endPoint, width, lado, offset]);

	if (!veredaData) return null;

	// Crear shape de la vereda
	const shape = useMemo(() => {
		const veredaShape = new THREE.Shape();
		veredaShape.moveTo(
			veredaData.corners[0].east,
			veredaData.corners[0].north
		);
		for (let i = 1; i < veredaData.corners.length; i++) {
			veredaShape.lineTo(
				veredaData.corners[i].east,
				veredaData.corners[i].north
			);
		}
		veredaShape.closePath();
		return veredaShape;
	}, [veredaData]);

	return (
		<group>
			{/* Base de la vereda */}
			<mesh position={[0, 0, 0.02]} receiveShadow>
				<extrudeGeometry
					args={[
						shape,
						{
							depth: 0.1,
							bevelEnabled: false,
						},
					]}
				/>
				<meshStandardMaterial
					color={color}
					roughness={0.8}
					metalness={0.1}
					side={THREE.DoubleSide}
				/>
			</mesh>

			{/* Líneas decorativas cada 2 metros */}
			{Array.from(
				{ length: Math.floor(veredaData.length / 2) },
				(_, i) => {
					const t = ((i + 1) * 2) / veredaData.length;
					const lineStart = {
						east:
							veredaData.corners[0].east +
							(veredaData.corners[1].east -
								veredaData.corners[0].east) *
								t,
						north:
							veredaData.corners[0].north +
							(veredaData.corners[1].north -
								veredaData.corners[0].north) *
								t,
					};
					const lineEnd = {
						east:
							veredaData.corners[3].east +
							(veredaData.corners[2].east -
								veredaData.corners[3].east) *
								t,
						north:
							veredaData.corners[3].north +
							(veredaData.corners[2].north -
								veredaData.corners[3].north) *
								t,
					};

					const lineLength = Math.sqrt(
						Math.pow(lineEnd.east - lineStart.east, 2) +
							Math.pow(lineEnd.north - lineStart.north, 2)
					);

					const lineCenter = {
						east: (lineStart.east + lineEnd.east) / 2,
						north: (lineStart.north + lineEnd.north) / 2,
					};

					const lineAngle = Math.atan2(
						lineEnd.north - lineStart.north,
						lineEnd.east - lineStart.east
					);

					return (
						<mesh
							key={`line-${i}`}
							position={[lineCenter.east, lineCenter.north, 0.13]}
							rotation={[0, 0, lineAngle]}
						>
							<boxGeometry args={[lineLength, 0.02, 0.01]} />
							<meshStandardMaterial
								color="#999999"
								roughness={0.9}
							/>
						</mesh>
					);
				}
			)}

			{/* Borde de la vereda */}
			<lineSegments position={[0, 0, 0.13]}>
				<edgesGeometry
					attach="geometry"
					args={[
						new THREE.ExtrudeGeometry(shape, {
							depth: 0.1,
							bevelEnabled: false,
						}),
					]}
				/>
				<lineBasicMaterial
					attach="material"
					color="#888888"
					linewidth={2}
				/>
			</lineSegments>
		</group>
	);
};

export default Vereda3D;

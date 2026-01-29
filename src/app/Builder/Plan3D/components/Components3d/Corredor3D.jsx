import { useMemo } from "react";
import * as THREE from "three";

const Corredor3D = ({
	startPoint,
	endPoint,
	width = 1.5,
	height = 3,
	lado = "derecha",
}) => {
	// ✅ CALCULAR GEOMETRÍA DEL CORREDOR
	const corridorGeometry = useMemo(() => {
		const dx = endPoint.east - startPoint.east;
		const dy = endPoint.north - startPoint.north;
		const length = Math.sqrt(dx * dx + dy * dy);
		const angle = Math.atan2(dy, dx);

		// Calcular offset perpendicular según el lado
		let offsetX = 0;
		let offsetY = 0;

		if (lado === "derecha") {
			offsetX = Math.sin(angle) * width;
			offsetY = -Math.cos(angle) * width;
		} else if (lado === "izquierda") {
			offsetX = -Math.sin(angle) * width;
			offsetY = Math.cos(angle) * width;
		} else if (lado === "superior") {
			offsetX = -Math.sin(angle) * width;
			offsetY = Math.cos(angle) * width;
		} else if (lado === "inferior") {
			offsetX = Math.sin(angle) * width;
			offsetY = -Math.cos(angle) * width;
		}

		// Puntos del corredor
		const p1 = { east: startPoint.east, north: startPoint.north };
		const p2 = { east: endPoint.east, north: endPoint.north };
		const p3 = {
			east: endPoint.east + offsetX,
			north: endPoint.north + offsetY,
		};
		const p4 = {
			east: startPoint.east + offsetX,
			north: startPoint.north + offsetY,
		};

		return {
			corners: [p1, p2, p3, p4],
			length,
			angle,
			offsetX,
			offsetY,
		};
	}, [startPoint, endPoint, width, lado]);

	// ✅ SHAPE DEL PISO
	const pisoShape = useMemo(() => {
		const shape = new THREE.Shape();
		const corners = corridorGeometry.corners;

		shape.moveTo(corners[0].east, corners[0].north);
		shape.lineTo(corners[1].east, corners[1].north);
		shape.lineTo(corners[2].east, corners[2].north);
		shape.lineTo(corners[3].east, corners[3].north);
		shape.closePath();

		return shape;
	}, [corridorGeometry]);

	return (
		<group position={[0, 0, 0.02]}>
			{/* ✅ PISO DEL CORREDOR (cemento) */}
			<mesh rotation={[0, 0, 0]} receiveShadow>
				<extrudeGeometry
					args={[
						pisoShape,
						{
							depth: 0.15,
							bevelEnabled: false,
						},
					]}
				/>
				<meshStandardMaterial
					color="#9CA3AF"
					roughness={0.8}
					metalness={0.1}
				/>
			</mesh>

			{/* ✅ LÍNEA GUÍA AMARILLA EN EL PISO */}
			<mesh rotation={[0, 0, 0]} position={[0, 0, 0.16]}>
				<extrudeGeometry
					args={[
						(() => {
							const lineShape = new THREE.Shape();
							const c = corridorGeometry.corners;

							const midX1 = (c[0].east + c[3].east) / 2;
							const midY1 = (c[0].north + c[3].north) / 2;
							const midX2 = (c[1].east + c[2].east) / 2;
							const midY2 = (c[1].north + c[2].north) / 2;

							lineShape.moveTo(midX1, midY1);
							lineShape.lineTo(midX2, midY2);

							return lineShape;
						})(),
						{
							depth: 0.01,
							bevelEnabled: false,
						},
					]}
				/>
				<meshStandardMaterial color="#FCD34D" roughness={0.9} />
			</mesh>

			{/* ✅ BARANDA PRINCIPAL (murete longitudinal) */}
			<group position={[0, 0, 0.15]}>
				{/* Base de la baranda */}
				<mesh castShadow receiveShadow>
					<extrudeGeometry
						args={[
							(() => {
								const barandaBase = new THREE.Shape();
								const c = corridorGeometry.corners;
								const grosor = 0.15;

								const dx = c[2].east - c[3].east;
								const dy = c[2].north - c[3].north;
								const len = Math.sqrt(dx * dx + dy * dy);
								const perpX = (-dy / len) * grosor;
								const perpY = (dx / len) * grosor;

								barandaBase.moveTo(c[3].east, c[3].north);
								barandaBase.lineTo(c[2].east, c[2].north);
								barandaBase.lineTo(
									c[2].east + perpX,
									c[2].north + perpY
								);
								barandaBase.lineTo(
									c[3].east + perpX,
									c[3].north + perpY
								);
								barandaBase.closePath();

								return barandaBase;
							})(),
							{
								depth: 1.0,
								bevelEnabled: false,
							},
						]}
					/>
					<meshStandardMaterial
						color="#D1D5DB"
						roughness={0.85}
						metalness={0.05}
					/>
				</mesh>

				{/* Pasamanos superior */}
				<mesh castShadow position={[0, 0, 1.0]}>
					<extrudeGeometry
						args={[
							(() => {
								const pasamanos = new THREE.Shape();
								const c = corridorGeometry.corners;
								const grosor = 0.18;

								const dx = c[2].east - c[3].east;
								const dy = c[2].north - c[3].north;
								const len = Math.sqrt(dx * dx + dy * dy);
								const perpX = (-dy / len) * grosor;
								const perpY = (dx / len) * grosor;

								pasamanos.moveTo(c[3].east, c[3].north);
								pasamanos.lineTo(c[2].east, c[2].north);
								pasamanos.lineTo(
									c[2].east + perpX,
									c[2].north + perpY
								);
								pasamanos.lineTo(
									c[3].east + perpX,
									c[3].north + perpY
								);
								pasamanos.closePath();

								return pasamanos;
							})(),
							{
								depth: 0.08,
								bevelEnabled: true,
								bevelThickness: 0.02,
								bevelSize: 0.02,
								bevelSegments: 2,
							},
						]}
					/>
					<meshStandardMaterial
						color="#B8BEC8"
						roughness={0.7}
						metalness={0.1}
					/>
				</mesh>

				{/* ✅ LATERAL INICIO (cierra el extremo inicial) */}
				<mesh castShadow receiveShadow>
					<extrudeGeometry
						args={[
							(() => {
								const lateral = new THREE.Shape();
								const c = corridorGeometry.corners;
								const grosor = 0.15;

								// Calcular perpendicular hacia afuera
								const dx = c[2].east - c[3].east;
								const dy = c[2].north - c[3].north;
								const len = Math.sqrt(dx * dx + dy * dy);
								const perpX = (-dy / len) * grosor;
								const perpY = (dx / len) * grosor;

								// Rectángulo del lateral de inicio
								lateral.moveTo(c[3].east, c[3].north);
								lateral.lineTo(
									c[3].east + perpX,
									c[3].north + perpY
								);
								lateral.lineTo(
									c[0].east + perpX * 0.5,
									c[0].north + perpY * 0.5
								);
								lateral.lineTo(c[0].east, c[0].north);
								lateral.closePath();

								return lateral;
							})(),
							{
								depth: 1.0,
								bevelEnabled: false,
							},
						]}
					/>
					<meshStandardMaterial
						color="#D1D5DB"
						roughness={0.85}
						metalness={0.05}
					/>
				</mesh>

				{/* ✅ PASAMANOS LATERAL INICIO */}
				<mesh castShadow position={[0, 0, 1.0]}>
					<extrudeGeometry
						args={[
							(() => {
								const lateral = new THREE.Shape();
								const c = corridorGeometry.corners;
								const grosor = 0.18;

								const dx = c[2].east - c[3].east;
								const dy = c[2].north - c[3].north;
								const len = Math.sqrt(dx * dx + dy * dy);
								const perpX = (-dy / len) * grosor;
								const perpY = (dx / len) * grosor;

								lateral.moveTo(c[3].east, c[3].north);
								lateral.lineTo(
									c[3].east + perpX,
									c[3].north + perpY
								);
								lateral.lineTo(
									c[0].east + perpX * 0.5,
									c[0].north + perpY * 0.5
								);
								lateral.lineTo(c[0].east, c[0].north);
								lateral.closePath();

								return lateral;
							})(),
							{
								depth: 0.08,
								bevelEnabled: true,
								bevelThickness: 0.02,
								bevelSize: 0.02,
								bevelSegments: 2,
							},
						]}
					/>
					<meshStandardMaterial
						color="#B8BEC8"
						roughness={0.7}
						metalness={0.1}
					/>
				</mesh>

				{/* ✅ LATERAL FIN (cierra el extremo final) */}
				<mesh castShadow receiveShadow>
					<extrudeGeometry
						args={[
							(() => {
								const lateral = new THREE.Shape();
								const c = corridorGeometry.corners;
								const grosor = 0.15;

								const dx = c[2].east - c[3].east;
								const dy = c[2].north - c[3].north;
								const len = Math.sqrt(dx * dx + dy * dy);
								const perpX = (-dy / len) * grosor;
								const perpY = (dx / len) * grosor;

								// Rectángulo del lateral de fin
								lateral.moveTo(c[2].east, c[2].north);
								lateral.lineTo(
									c[2].east + perpX,
									c[2].north + perpY
								);
								lateral.lineTo(
									c[1].east + perpX * 0.5,
									c[1].north + perpY * 0.5
								);
								lateral.lineTo(c[1].east, c[1].north);
								lateral.closePath();

								return lateral;
							})(),
							{
								depth: 1.0,
								bevelEnabled: false,
							},
						]}
					/>
					<meshStandardMaterial
						color="#D1D5DB"
						roughness={0.85}
						metalness={0.05}
					/>
				</mesh>

				{/* ✅ PASAMANOS LATERAL FIN */}
				<mesh castShadow position={[0, 0, 1.0]}>
					<extrudeGeometry
						args={[
							(() => {
								const lateral = new THREE.Shape();
								const c = corridorGeometry.corners;
								const grosor = 0.18;

								const dx = c[2].east - c[3].east;
								const dy = c[2].north - c[3].north;
								const len = Math.sqrt(dx * dx + dy * dy);
								const perpX = (-dy / len) * grosor;
								const perpY = (dx / len) * grosor;

								lateral.moveTo(c[2].east, c[2].north);
								lateral.lineTo(
									c[2].east + perpX,
									c[2].north + perpY
								);
								lateral.lineTo(
									c[1].east + perpX * 0.5,
									c[1].north + perpY * 0.5
								);
								lateral.lineTo(c[1].east, c[1].north);
								lateral.closePath();

								return lateral;
							})(),
							{
								depth: 0.08,
								bevelEnabled: true,
								bevelThickness: 0.02,
								bevelSize: 0.02,
								bevelSegments: 2,
							},
						]}
					/>
					<meshStandardMaterial
						color="#B8BEC8"
						roughness={0.7}
						metalness={0.1}
					/>
				</mesh>

				{/* Líneas decorativas */}
				{Array.from(
					{ length: Math.floor(corridorGeometry.length / 3) },
					(_, i) => {
						const t =
							(i + 1) /
							(Math.floor(corridorGeometry.length / 3) + 1);
						const c = corridorGeometry.corners;
						const x = c[3].east * (1 - t) + c[2].east * t;
						const y = c[3].north * (1 - t) + c[2].north * t;

						return (
							<mesh key={`line-${i}`} position={[x, y, 0.5]}>
								<boxGeometry args={[0.03, 0.15, 0.8]} />
								<meshStandardMaterial
									color="#A8ADB7"
									roughness={0.9}
								/>
							</mesh>
						);
					}
				)}
			</group>
		</group>
	);
};

export default Corredor3D;

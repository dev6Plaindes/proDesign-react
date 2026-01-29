import { useMemo } from "react";
import * as THREE from "three";

const CercoPerimetrico = ({
	corners, // maxRectangle.corners
	offset = 1.0, // Separación de las aulas (metros)
	height = 2.5, // Altura del cerco
	hasEntrance = true, // Si tiene puerta de entrada
}) => {
	if (!corners || corners.length < 4) return null;

	// ✅ CALCULAR CORNERS CON OFFSET (alejados del edificio)
	const expandedCorners = useMemo(() => {
		// Calcular el centro del rectángulo
		const centerX =
			corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
		const centerY =
			corners.reduce((sum, c) => sum + c.north, 0) / corners.length;

		// Expandir cada punto alejándolo del centro
		return corners.map((corner) => {
			const dx = corner.east - centerX;
			const dy = corner.north - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance === 0) return corner;

			// Normalizar y expandir
			const nx = dx / distance;
			const ny = dy / distance;

			return {
				east: corner.east + nx * offset,
				north: corner.north + ny * offset,
			};
		});
	}, [corners, offset]);

	// ✅ CALCULAR SEGMENTOS DEL CERCO
	const segments = useMemo(() => {
		const segs = [];

		for (let i = 0; i < expandedCorners.length; i++) {
			const start = expandedCorners[i];
			const end = expandedCorners[(i + 1) % expandedCorners.length];

			const dx = end.east - start.east;
			const dy = end.north - start.north;
			const length = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);

			const centerX = (start.east + end.east) / 2;
			const centerY = (start.north + end.north) / 2;

			segs.push({
				start,
				end,
				length,
				angle,
				centerX,
				centerY,
				index: i,
			});
		}

		return segs;
	}, [expandedCorners]);

	// ✅ DETERMINAR QUÉ SEGMENTO TIENE LA PUERTA (el más cercano a la entrada)
	const entranceSegmentIndex = hasEntrance ? 2 : -1; // Puerta en el primer segmento

	return (
		<group position={[0, 0, 0]}>
			{/* ✅ COLUMNAS EN LAS ESQUINAS */}
			{expandedCorners.map((corner, idx) => (
				<group
					key={`column-${idx}`}
					position={[corner.east, corner.north, 0]}
				>
					{/* Columna principal */}
					<mesh
						castShadow
						receiveShadow
						position={[0, 0, height / 2]}
					>
						<boxGeometry args={[0.3, 0.3, height]} />
						<meshStandardMaterial
							color="#B8B8B8"
							roughness={0.8}
							metalness={0.2}
						/>
					</mesh>

					{/* Capitel (remate superior) */}
					<mesh castShadow position={[0, 0, height]}>
						<boxGeometry args={[0.4, 0.4, 0.15]} />
						<meshStandardMaterial color="#A0A0A0" roughness={0.7} />
					</mesh>
				</group>
			))}

			{/* ✅ MUROS ENTRE COLUMNAS */}
			{segments.map((segment) => {
				const hasGate =
					hasEntrance && segment.index === entranceSegmentIndex;

				if (hasGate) {
					// ✅ SEGMENTO CON PUERTA (dividido en 2 partes)
					const gateWidth = 4.0; // 4 metros de ancho para la puerta
					const wallWidth = (segment.length - gateWidth) / 2;

					if (wallWidth <= 0) return null; // Segmento muy corto

					return (
						<group key={`segment-${segment.index}`}>
							{/* Muro izquierdo */}
							<mesh
								castShadow
								receiveShadow
								position={[
									segment.start.east +
										(Math.cos(segment.angle) * wallWidth) /
											2,
									segment.start.north +
										(Math.sin(segment.angle) * wallWidth) /
											2,
									height / 2,
								]}
								rotation={[0, 0, segment.angle]}
							>
								<boxGeometry args={[wallWidth, 0.2, height]} />
								<meshStandardMaterial
									color="#C8C8C8"
									roughness={0.85}
								/>
							</mesh>

							{/* Muro derecho */}
							<mesh
								castShadow
								receiveShadow
								position={[
									segment.end.east -
										(Math.cos(segment.angle) * wallWidth) /
											2,
									segment.end.north -
										(Math.sin(segment.angle) * wallWidth) /
											2,
									height / 2,
								]}
								rotation={[0, 0, segment.angle]}
							>
								<boxGeometry args={[wallWidth, 0.2, height]} />
								<meshStandardMaterial
									color="#C8C8C8"
									roughness={0.85}
								/>
							</mesh>

							{/* ✅ PUERTA DE ENTRADA */}
							<group
								position={[segment.centerX, segment.centerY, 0]}
								rotation={[0, 0, segment.angle]}
							>
								{/* Columnas de la puerta */}
								{[-gateWidth / 2, gateWidth / 2].map(
									(x, idx) => (
										<mesh
											key={`gate-column-${idx}`}
											castShadow
											position={[x, 0, height / 2]}
										>
											<boxGeometry
												args={[0.4, 0.3, height]}
											/>
											<meshStandardMaterial
												color="#8B8B8B"
												roughness={0.7}
											/>
										</mesh>
									)
								)}

								{/* Dintel superior */}
								<mesh
									castShadow
									position={[0, 0, height - 0.2]}
								>
									<boxGeometry args={[gateWidth, 0.3, 0.4]} />
									<meshStandardMaterial
										color="#8B8B8B"
										roughness={0.7}
									/>
								</mesh>

								{/* Rejas/Puertas */}
								{[-gateWidth / 4, gateWidth / 4].map(
									(x, idx) => (
										<mesh
											key={`gate-door-${idx}`}
											castShadow
											position={[
												x,
												-0.15,
												height / 2 - 0.2,
											]}
										>
											<boxGeometry
												args={[
													gateWidth / 2 - 0.2,
													0.05,
													height - 0.4,
												]}
											/>
											<meshStandardMaterial
												color="#2C3E50"
												roughness={0.4}
												metalness={0.8}
											/>
										</mesh>
									)
								)}

								{/* Barras verticales de las rejas */}
								{Array.from({ length: 8 }, (_, i) => {
									const spacing = gateWidth / 9;
									const xPos =
										-gateWidth / 2 + (i + 1) * spacing;

									return (
										<mesh
											key={`bar-${i}`}
											castShadow
											position={[
												xPos,
												-0.12,
												height / 2 - 0.2,
											]}
										>
											<cylinderGeometry
												args={[
													0.02,
													0.02,
													height - 0.5,
													8,
												]}
											/>
											<meshStandardMaterial
												color="#2C3E50"
												roughness={0.3}
												metalness={0.9}
											/>
										</mesh>
									);
								})}
							</group>
						</group>
					);
				}

				// ✅ MURO NORMAL (sin puerta)
				return (
					<mesh
						key={`segment-${segment.index}`}
						castShadow
						receiveShadow
						position={[
							segment.centerX,
							segment.centerY,
							height / 2,
						]}
						rotation={[0, 0, segment.angle]}
					>
						<boxGeometry args={[segment.length, 0.2, height]} />
						<meshStandardMaterial
							color="#C8C8C8"
							roughness={0.85}
						/>
					</mesh>
				);
			})}

			{/* ✅ TEXTURA DE MURO (líneas horizontales) */}
			{segments.map((segment) => (
				<group key={`texture-${segment.index}`}>
					{Array.from({ length: 5 }, (_, i) => {
						const hasGate =
							hasEntrance &&
							segment.index === entranceSegmentIndex;
						if (hasGate) return null; // No textura en segmento con puerta

						return (
							<mesh
								key={`line-${i}`}
								position={[
									segment.centerX,
									segment.centerY,
									(i + 1) * (height / 6),
								]}
								rotation={[0, 0, segment.angle]}
							>
								<boxGeometry
									args={[segment.length, 0.22, 0.02]}
								/>
								<meshStandardMaterial
									color="#A8A8A8"
									roughness={0.9}
								/>
							</mesh>
						);
					})}
				</group>
			))}
		</group>
	);
};

export default CercoPerimetrico;

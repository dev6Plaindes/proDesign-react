// components3D/EscaleraDetallada.jsx - Con detección de orientación
import { useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const EscaleraDetallada = ({
	corners,
	height,
	nombre = "Escalera",
	totalFloors = 2,
	collegeCenter,
}) => {
	const [hovered, setHovered] = useState(false);

	if (!corners || corners.length < 4) return null;

	const escaleraData = useMemo(() => {
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

		// ✅ DETECTAR DESDE DÓNDE DEBE INICIAR LA ESCALERA
		let startSide = "front"; // Por defecto: inicia desde el frente (-Y)

		if (collegeCenter) {
			const toCenter = {
				x: collegeCenter.x - centerX,
				y: collegeCenter.y - centerY,
			};

			const walls = {
				front: { x: 0, y: -1 }, // Frente
				back: { x: 0, y: 1 }, // Atrás
				left: { x: -1, y: 0 }, // Izquierda
				right: { x: 1, y: 0 }, // Derecha
			};

			// Rotar al espacio local
			const cos = Math.cos(-angle);
			const sin = Math.sin(-angle);
			const localX = toCenter.x * cos - toCenter.y * sin;
			const localY = toCenter.x * sin + toCenter.y * cos;

			const length = Math.sqrt(localX * localX + localY * localY);
			const normX = localX / length;
			const normY = localY / length;

			// Encontrar lado más cercano al centro
			let maxDot = -Infinity;
			let bestSide = "front";

			for (const [side, wallVec] of Object.entries(walls)) {
				const dot = normX * wallVec.x + normY * wallVec.y;
				if (dot > maxDot) {
					maxDot = dot;
					bestSide = side;
				}
			}

			startSide = bestSide;
		}

		return { centerX, centerY, width, depth, angle, startSide };
	}, [corners, collegeCenter]);

	const escaleraHeight = height;
	const numSteps = 16;
	const stepHeight = escaleraHeight / numSteps;
	const stepDepth = 0.28;
	const stepsWidth = escaleraData.width * 0.7;
	const escaleraColor = "#999999";
	const barandaColor = "#333333";

	// ✅ Calcular máxima profundidad disponible
	const maxDepthAvailable = escaleraData.depth - 0.4; // Dejar margen
	const totalStepDepth = numSteps * stepDepth;
	const actualSteps =
		totalStepDepth > maxDepthAvailable
			? Math.floor(maxDepthAvailable / stepDepth)
			: numSteps;

	return (
		<group
			position={[escaleraData.centerX, escaleraData.centerY, 0]}
			rotation={[0, 0, escaleraData.angle]}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
		>
			{/* PISO BASE */}
			<mesh position={[0, 0, 0.01]} receiveShadow>
				<boxGeometry
					args={[escaleraData.width, escaleraData.depth, 0.02]}
				/>
				<meshStandardMaterial color="#cccccc" roughness={0.8} />
			</mesh>

			{/* ✅ PAREDES LATERALES */}
			{/* <mesh castShadow receiveShadow position={[-escaleraData.width / 2, 0, escaleraHeight / 2]}>
                <boxGeometry args={[0.15, escaleraData.depth, escaleraHeight]} />
                <meshStandardMaterial color="#888888" roughness={0.8} />
            </mesh>
            
            <mesh castShadow receiveShadow position={[escaleraData.width / 2, 0, escaleraHeight / 2]}>
                <boxGeometry args={[0.15, escaleraData.depth, escaleraHeight]} />
                <meshStandardMaterial color="#888888" roughness={0.8} />
            </mesh> */}

			{/* ✅ ESCALONES SEGÚN ORIENTACIÓN */}

			{/* CASO 1: Inicio desde el FRENTE (hacia centro en -Y) */}
			{escaleraData.startSide === "front" && (
				<>
					{Array.from({ length: actualSteps }).map((_, idx) => {
						const stepZ = idx * stepHeight;
						const stepY =
							-escaleraData.depth / 2 + 0.2 + idx * stepDepth;

						return (
							<group key={`step-${idx}`}>
								<mesh
									position={[0, stepY, stepZ]}
									castShadow
									receiveShadow
								>
									<boxGeometry
										args={[stepsWidth, stepDepth, 0.03]}
									/>
									<meshStandardMaterial
										color={escaleraColor}
										roughness={0.7}
									/>
								</mesh>
								{idx > 0 && (
									<mesh
										position={[
											0,
											stepY - stepDepth / 2,
											stepZ - stepHeight / 2,
										]}
										castShadow
									>
										<boxGeometry
											args={[
												stepsWidth,
												0.02,
												stepHeight,
											]}
										/>
										<meshStandardMaterial
											color="#777777"
											roughness={0.8}
										/>
									</mesh>
								)}
							</group>
						);
					})}

					{/* Barandas */}
					<BarandasVerticales
						side="left"
						offset={-stepsWidth / 2 - 0.05}
						startY={-escaleraData.depth / 2 + 0.2}
						steps={actualSteps}
						stepDepth={stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
					<BarandasVerticales
						side="right"
						offset={stepsWidth / 2 + 0.05}
						startY={-escaleraData.depth / 2 + 0.2}
						steps={actualSteps}
						stepDepth={stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
				</>
			)}

			{/* CASO 2: Inicio desde ATRÁS (hacia centro en +Y) */}
			{escaleraData.startSide === "back" && (
				<>
					{Array.from({ length: actualSteps }).map((_, idx) => {
						const stepZ = idx * stepHeight;
						const stepY =
							escaleraData.depth / 2 - 0.2 - idx * stepDepth;

						return (
							<group key={`step-${idx}`}>
								<mesh
									position={[0, stepY, stepZ]}
									castShadow
									receiveShadow
								>
									<boxGeometry
										args={[stepsWidth, stepDepth, 0.03]}
									/>
									<meshStandardMaterial
										color={escaleraColor}
										roughness={0.7}
									/>
								</mesh>
								{idx > 0 && (
									<mesh
										position={[
											0,
											stepY + stepDepth / 2,
											stepZ - stepHeight / 2,
										]}
										castShadow
									>
										<boxGeometry
											args={[
												stepsWidth,
												0.02,
												stepHeight,
											]}
										/>
										<meshStandardMaterial
											color="#777777"
											roughness={0.8}
										/>
									</mesh>
								)}
							</group>
						);
					})}

					<BarandasVerticales
						side="left"
						offset={-stepsWidth / 2 - 0.05}
						startY={escaleraData.depth / 2 - 0.2}
						steps={actualSteps}
						stepDepth={-stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
					<BarandasVerticales
						side="right"
						offset={stepsWidth / 2 + 0.05}
						startY={escaleraData.depth / 2 - 0.2}
						steps={actualSteps}
						stepDepth={-stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
				</>
			)}

			{/* CASO 3: Inicio desde IZQUIERDA (hacia centro en -X) */}
			{escaleraData.startSide === "left" && (
				<>
					{Array.from({ length: actualSteps }).map((_, idx) => {
						const stepZ = idx * stepHeight;
						const stepX =
							-escaleraData.width / 2 + 0.2 + idx * stepDepth;

						return (
							<group key={`step-${idx}`}>
								<mesh
									position={[stepX, 0, stepZ]}
									castShadow
									receiveShadow
								>
									<boxGeometry
										args={[stepDepth, stepsWidth, 0.03]}
									/>
									<meshStandardMaterial
										color={escaleraColor}
										roughness={0.7}
									/>
								</mesh>
								{idx > 0 && (
									<mesh
										position={[
											stepX - stepDepth / 2,
											0,
											stepZ - stepHeight / 2,
										]}
										castShadow
									>
										<boxGeometry
											args={[
												0.02,
												stepsWidth,
												stepHeight,
											]}
										/>
										<meshStandardMaterial
											color="#777777"
											roughness={0.8}
										/>
									</mesh>
								)}
							</group>
						);
					})}

					<BarandasHorizontales
						side="front"
						offset={-stepsWidth / 2 - 0.05}
						startX={-escaleraData.width / 2 + 0.2}
						steps={actualSteps}
						stepDepth={stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
					<BarandasHorizontales
						side="back"
						offset={stepsWidth / 2 + 0.05}
						startX={-escaleraData.width / 2 + 0.2}
						steps={actualSteps}
						stepDepth={stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
				</>
			)}

			{/* CASO 4: Inicio desde DERECHA (hacia centro en +X) */}
			{escaleraData.startSide === "right" && (
				<>
					{Array.from({ length: actualSteps }).map((_, idx) => {
						const stepZ = idx * stepHeight;
						const stepX =
							escaleraData.width / 2 - 0.2 - idx * stepDepth;

						return (
							<group key={`step-${idx}`}>
								<mesh
									position={[stepX, 0, stepZ]}
									castShadow
									receiveShadow
								>
									<boxGeometry
										args={[stepDepth, stepsWidth, 0.03]}
									/>
									<meshStandardMaterial
										color={escaleraColor}
										roughness={0.7}
									/>
								</mesh>
								{idx > 0 && (
									<mesh
										position={[
											stepX + stepDepth / 2,
											0,
											stepZ - stepHeight / 2,
										]}
										castShadow
									>
										<boxGeometry
											args={[
												0.02,
												stepsWidth,
												stepHeight,
											]}
										/>
										<meshStandardMaterial
											color="#777777"
											roughness={0.8}
										/>
									</mesh>
								)}
							</group>
						);
					})}

					<BarandasHorizontales
						side="front"
						offset={-stepsWidth / 2 - 0.05}
						startX={escaleraData.width / 2 - 0.2}
						steps={actualSteps}
						stepDepth={-stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
					<BarandasHorizontales
						side="back"
						offset={stepsWidth / 2 + 0.05}
						startX={escaleraData.width / 2 - 0.2}
						steps={actualSteps}
						stepDepth={-stepDepth}
						height={escaleraHeight}
						color={barandaColor}
					/>
				</>
			)}

			{/* TEXTO */}
			<Text
				position={[0, 0, escaleraHeight + 0.3]}
				fontSize={0.35}
				color={hovered ? "black" : "white"}
				anchorX="center"
				anchorY="middle"
				outlineWidth={0.04}
				outlineColor={hovered ? "white" : "black"}
			>
				🪜 {nombre}
			</Text>
		</group>
	);
};

// ✅ Componente auxiliar: Barandas para escaleras verticales (front/back)
const BarandasVerticales = ({
	side,
	offset,
	startY,
	steps,
	stepDepth,
	height,
	color,
}) => {
	return (
		<group position={[offset, 0, 0]}>
			{[0, 0.25, 0.5, 0.75, 1].map((factor, idx) => (
				<mesh
					key={`post-${idx}`}
					position={[
						0,
						startY + factor * (steps * stepDepth),
						factor * height,
					]}
					castShadow
				>
					<boxGeometry args={[0.04, 0.04, 1]} />
					<meshStandardMaterial
						color={color}
						metalness={0.7}
						roughness={0.3}
					/>
				</mesh>
			))}

			<mesh
				position={[
					0,
					startY + (steps * stepDepth) / 2,
					height / 2 + 0.5,
				]}
				rotation={[Math.atan2(height, steps * stepDepth), 0, 0]}
				castShadow
			>
				<cylinderGeometry
					args={[
						0.02,
						0.02,
						Math.sqrt(
							Math.pow(height, 2) + Math.pow(steps * stepDepth, 2)
						),
						8,
					]}
				/>
				<meshStandardMaterial
					color={color}
					metalness={0.8}
					roughness={0.2}
				/>
			</mesh>
		</group>
	);
};

// ✅ Componente auxiliar: Barandas para escaleras horizontales (left/right)
const BarandasHorizontales = ({
	side,
	offset,
	startX,
	steps,
	stepDepth,
	height,
	color,
}) => {
	return (
		<group position={[0, offset, 0]}>
			{[0, 0.25, 0.5, 0.75, 1].map((factor, idx) => (
				<mesh
					key={`post-${idx}`}
					position={[
						startX + factor * (steps * stepDepth),
						0,
						factor * height,
					]}
					castShadow
				>
					<boxGeometry args={[0.04, 0.04, 1]} />
					<meshStandardMaterial
						color={color}
						metalness={0.7}
						roughness={0.3}
					/>
				</mesh>
			))}

			<mesh
				position={[
					startX + (steps * stepDepth) / 2,
					0,
					height / 2 + 0.5,
				]}
				rotation={[0, 0, Math.atan2(height, steps * stepDepth)]}
				castShadow
			>
				<cylinderGeometry
					args={[
						0.02,
						0.02,
						Math.sqrt(
							Math.pow(height, 2) + Math.pow(steps * stepDepth, 2)
						),
						8,
					]}
				/>
				<meshStandardMaterial
					color={color}
					metalness={0.8}
					roughness={0.2}
				/>
			</mesh>
		</group>
	);
};

export default EscaleraDetallada;

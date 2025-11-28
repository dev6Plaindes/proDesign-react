// components3D/BañoDetallado.jsx - Con muros parciales de entrada
import { useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const BañoDetallado = ({ corners, height, nombre = "Baño", collegeCenter }) => {
	const [hovered, setHovered] = useState(false);

	if (!corners || corners.length < 4) return null;

	const bañoData = useMemo(() => {
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

		let entranceSide = "front";

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

			entranceSide = bestSide;
		}

		return { centerX, centerY, width, depth, angle, entranceSide };
	}, [corners, collegeCenter]);

	const wallThickness = 0.15;
	const bañoColor = "#a855f7";
	const entryGap = 1.8; // Ancho de cada entrada

	return (
		<group
			position={[bañoData.centerX, bañoData.centerY, 0]}
			rotation={[0, 0, bañoData.angle]}
			onPointerOver={() => setHovered(true)}
			onPointerOut={() => setHovered(false)}
		>
			{/* PISO */}
			<mesh position={[0, 0, 0.01]} receiveShadow>
				<boxGeometry args={[bañoData.width, bañoData.depth, 0.02]} />
				<meshStandardMaterial
					color="#f0f0f0"
					roughness={0.2}
					metalness={0.1}
				/>
			</mesh>

			{/* Baldosas */}
			<group position={[0, 0, 0.02]}>
				{Array.from({ length: 10 }).map((_, i) => (
					<mesh
						key={`line-x-${i}`}
						position={[
							-bañoData.width / 2 + (i * bañoData.width) / 10,
							0,
							0,
						]}
					>
						<boxGeometry args={[0.01, bañoData.depth, 0.01]} />
						<meshBasicMaterial color="#cccccc" />
					</mesh>
				))}
				{Array.from({ length: 10 }).map((_, i) => (
					<mesh
						key={`line-y-${i}`}
						position={[
							0,
							-bañoData.depth / 2 + (i * bañoData.depth) / 10,
							0,
						]}
					>
						<boxGeometry args={[bañoData.width, 0.01, 0.01]} />
						<meshBasicMaterial color="#cccccc" />
					</mesh>
				))}
			</group>

			{/* ✅ PAREDES COMPLETAS (las 3 sin entrada) */}
			{bañoData.entranceSide !== "front" && (
				<mesh
					castShadow
					receiveShadow
					position={[0, -bañoData.depth / 2, height / 2]}
				>
					<boxGeometry
						args={[bañoData.width, wallThickness, height]}
					/>
					<meshStandardMaterial color={bañoColor} roughness={0.8} />
				</mesh>
			)}

			{bañoData.entranceSide !== "back" && (
				<mesh
					castShadow
					receiveShadow
					position={[0, bañoData.depth / 2, height / 2]}
				>
					<boxGeometry
						args={[bañoData.width, wallThickness, height]}
					/>
					<meshStandardMaterial color={bañoColor} roughness={0.8} />
				</mesh>
			)}

			{bañoData.entranceSide !== "left" && (
				<mesh
					castShadow
					receiveShadow
					position={[-bañoData.width / 2, 0, height / 2]}
				>
					<boxGeometry
						args={[wallThickness, bañoData.depth, height]}
					/>
					<meshStandardMaterial color={bañoColor} roughness={0.8} />
				</mesh>
			)}

			{bañoData.entranceSide !== "right" && (
				<mesh
					castShadow
					receiveShadow
					position={[bañoData.width / 2, 0, height / 2]}
				>
					<boxGeometry
						args={[wallThickness, bañoData.depth, height]}
					/>
					<meshStandardMaterial color={bañoColor} roughness={0.8} />
				</mesh>
			)}

			{/* ✅ MUROS PARCIALES DE ENTRADA (Privacidad) */}
			{/* Si entrada es FRONTAL (Y negativo) */}
			{bañoData.entranceSide === "front" && (
				<>
					{/* Muro izquierdo - Lado hombres */}
					<mesh
						castShadow
						receiveShadow
						position={[
							-bañoData.width / 4,
							-bañoData.depth / 2,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								bañoData.width / 2 - entryGap / 2,
								wallThickness,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					{/* Muro derecho - Lado mujeres */}
					<mesh
						castShadow
						receiveShadow
						position={[
							bañoData.width / 4,
							-bañoData.depth / 2,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								bañoData.width / 2 - entryGap / 2,
								wallThickness,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					{/* Señal "HOMBRES" sobre entrada izquierda */}
					<Text
						position={[
							-bañoData.width / 4,
							-bañoData.depth / 2 - 0.1,
							height * 0.8,
						]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#0066cc"
					>
						♂ HOMBRES
					</Text>

					{/* Señal "MUJERES" sobre entrada derecha */}
					<Text
						position={[
							bañoData.width / 4,
							-bañoData.depth / 2 - 0.1,
							height * 0.8,
						]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#cc0066"
					>
						♀ MUJERES
					</Text>
				</>
			)}

			{/* Si entrada es TRASERA (Y positivo) */}
			{bañoData.entranceSide === "back" && (
				<>
					<mesh
						castShadow
						receiveShadow
						position={[
							-bañoData.width / 4,
							bañoData.depth / 2,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								bañoData.width / 2 - entryGap / 2,
								wallThickness,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					<mesh
						castShadow
						receiveShadow
						position={[
							bañoData.width / 4,
							bañoData.depth / 2,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								bañoData.width / 2 - entryGap / 2,
								wallThickness,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					<Text
						position={[
							-bañoData.width / 4,
							bañoData.depth / 2 + 0.1,
							height * 0.8,
						]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#0066cc"
					>
						♂ HOMBRES
					</Text>

					<Text
						position={[
							bañoData.width / 4,
							bañoData.depth / 2 + 0.1,
							height * 0.8,
						]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#cc0066"
					>
						♀ MUJERES
					</Text>
				</>
			)}

			{/* Si entrada es IZQUIERDA (X negativo) */}
			{bañoData.entranceSide === "left" && (
				<>
					<mesh
						castShadow
						receiveShadow
						position={[
							-bañoData.width / 2,
							-bañoData.depth / 4,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								wallThickness,
								bañoData.depth / 2 - entryGap / 2,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					<mesh
						castShadow
						receiveShadow
						position={[
							-bañoData.width / 2,
							bañoData.depth / 4,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								wallThickness,
								bañoData.depth / 2 - entryGap / 2,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					<Text
						position={[
							-bañoData.width / 2 - 0.1,
							-bañoData.depth / 4,
							height * 0.8,
						]}
						rotation={[0, 0, Math.PI / 2]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#0066cc"
					>
						♂ HOMBRES
					</Text>

					<Text
						position={[
							-bañoData.width / 2 - 0.1,
							bañoData.depth / 4,
							height * 0.8,
						]}
						rotation={[0, 0, Math.PI / 2]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#cc0066"
					>
						♀ MUJERES
					</Text>
				</>
			)}

			{/* Si entrada es DERECHA (X positivo) */}
			{bañoData.entranceSide === "right" && (
				<>
					<mesh
						castShadow
						receiveShadow
						position={[
							bañoData.width / 2,
							-bañoData.depth / 4,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								wallThickness,
								bañoData.depth / 2 - entryGap / 2,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					<mesh
						castShadow
						receiveShadow
						position={[
							bañoData.width / 2,
							bañoData.depth / 4,
							height / 2,
						]}
					>
						<boxGeometry
							args={[
								wallThickness,
								bañoData.depth / 2 - entryGap / 2,
								height,
							]}
						/>
						<meshStandardMaterial
							color={bañoColor}
							roughness={0.8}
						/>
					</mesh>

					<Text
						position={[
							bañoData.width / 2 + 0.1,
							-bañoData.depth / 4,
							height * 0.8,
						]}
						rotation={[0, 0, -Math.PI / 2]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#0066cc"
					>
						♂ HOMBRES
					</Text>

					<Text
						position={[
							bañoData.width / 2 + 0.1,
							bañoData.depth / 4,
							height * 0.8,
						]}
						rotation={[0, 0, -Math.PI / 2]}
						fontSize={0.3}
						color="white"
						anchorX="center"
						anchorY="middle"
						outlineWidth={0.02}
						outlineColor="#cc0066"
					>
						♀ MUJERES
					</Text>
				</>
			)}

			{/* ✅ MURO DIVISOR CENTRAL */}
			<mesh castShadow receiveShadow position={[0, 0, height / 2]}>
				<boxGeometry
					args={[
						bañoData.width - wallThickness * 2,
						wallThickness,
						height,
					]}
				/>
				<meshStandardMaterial color="#d8d8d8" roughness={0.7} />
			</mesh>

			{/* Señalización interna en el muro divisor */}
			<Text
				position={[0, -wallThickness / 2, height * 0.7]}
				rotation={[0, 0, Math.PI / 2]}
				fontSize={0.5}
				color="#0066cc"
				anchorX="center"
				anchorY="middle"
			>
				♂
			</Text>

			<Text
				position={[0, wallThickness / 2, height * 0.7]}
				rotation={[0, 0, -Math.PI / 2]}
				fontSize={0.5}
				color="#cc0066"
				anchorX="center"
				anchorY="middle"
			>
				♀
			</Text>

			{/* LADO HOMBRES (Y negativo) */}
			<group position={[0, -bañoData.depth / 4, 0]}>
				{/* Inodoros */}
				{[-bañoData.width / 4, 0, bañoData.width / 4].map((x, idx) => (
					<group key={`toilet-m-${idx}`} position={[x, 0, 0.2]}>
						<mesh castShadow>
							<boxGeometry args={[0.35, 0.45, 0.3]} />
							<meshStandardMaterial
								color="#ffffff"
								roughness={0.2}
							/>
						</mesh>
						<mesh castShadow position={[0, 0.05, 0.2]}>
							<boxGeometry args={[0.35, 0.35, 0.05]} />
							<meshStandardMaterial
								color="#e8e8e8"
								roughness={0.3}
							/>
						</mesh>
						<mesh castShadow position={[0, -0.15, 0.35]}>
							<boxGeometry args={[0.3, 0.15, 0.4]} />
							<meshStandardMaterial
								color="#ffffff"
								roughness={0.2}
							/>
						</mesh>
					</group>
				))}

				{/* Urinarios */}
				{[-bañoData.width / 3, bañoData.width / 3].map((x, idx) => (
					<mesh
						key={`urinal-${idx}`}
						position={[x, -bañoData.depth / 4 + 0.15, 0.5]}
						castShadow
					>
						<boxGeometry args={[0.35, 0.1, 0.5]} />
						<meshStandardMaterial color="#ffffff" roughness={0.2} />
					</mesh>
				))}
			</group>

			{/* LADO MUJERES (Y positivo) */}
			<group position={[0, bañoData.depth / 4, 0]}>
				{[-bañoData.width / 4, 0, bañoData.width / 4].map((x, idx) => (
					<group key={`toilet-f-${idx}`} position={[x, 0, 0.2]}>
						<mesh castShadow>
							<boxGeometry args={[0.35, 0.45, 0.3]} />
							<meshStandardMaterial
								color="#ffffff"
								roughness={0.2}
							/>
						</mesh>
						<mesh castShadow position={[0, 0.05, 0.2]}>
							<boxGeometry args={[0.35, 0.35, 0.05]} />
							<meshStandardMaterial
								color="#ffe0f0"
								roughness={0.3}
							/>
						</mesh>
						<mesh castShadow position={[0, 0.15, 0.35]}>
							<boxGeometry args={[0.3, 0.15, 0.4]} />
							<meshStandardMaterial
								color="#ffffff"
								roughness={0.2}
							/>
						</mesh>
					</group>
				))}
			</group>

			{/* LAVABOS cerca de las entradas */}
			{[-bañoData.width / 4 - 0.2, -bañoData.width / 4 + 0.2].map(
				(x, idx) => {
					const yPos =
						bañoData.entranceSide === "front"
							? -bañoData.depth / 3
							: bañoData.entranceSide === "back"
							? bañoData.depth / 3
							: -bañoData.depth / 4;

					return (
						<group key={`sink-m-${idx}`} position={[x, yPos, 0.4]}>
							<mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
								<cylinderGeometry args={[0.2, 0.15, 0.1, 16]} />
								<meshStandardMaterial
									color="#ffffff"
									roughness={0.2}
								/>
							</mesh>
							<mesh
								position={[0, -0.05, 0.15]}
								castShadow
								rotation={[-Math.PI / 2, 0, 0]}
							>
								<cylinderGeometry
									args={[0.015, 0.015, 0.2, 8]}
								/>
								<meshStandardMaterial
									color="#c0c0c0"
									metalness={0.9}
									roughness={0.1}
								/>
							</mesh>
							<mesh position={[0, -0.05, 0.5]}>
								<boxGeometry args={[0.4, 0.01, 0.6]} />
								<meshStandardMaterial
									color="#a0c8d8"
									metalness={0.9}
									roughness={0.1}
								/>
							</mesh>
						</group>
					);
				}
			)}

			{[bañoData.width / 4 - 0.2, bañoData.width / 4 + 0.2].map(
				(x, idx) => {
					const yPos =
						bañoData.entranceSide === "front"
							? -bañoData.depth / 3
							: bañoData.entranceSide === "back"
							? bañoData.depth / 3
							: bañoData.depth / 4;

					return (
						<group key={`sink-f-${idx}`} position={[x, yPos, 0.4]}>
							<mesh castShadow rotation={[-Math.PI / 2, 0, 0]}>
								<cylinderGeometry args={[0.2, 0.15, 0.1, 16]} />
								<meshStandardMaterial
									color="#ffffff"
									roughness={0.2}
								/>
							</mesh>
							<mesh
								position={[0, -0.05, 0.15]}
								castShadow
								rotation={[-Math.PI / 2, 0, 0]}
							>
								<cylinderGeometry
									args={[0.015, 0.015, 0.2, 8]}
								/>
								<meshStandardMaterial
									color="#c0c0c0"
									metalness={0.9}
									roughness={0.1}
								/>
							</mesh>
							<mesh position={[0, -0.05, 0.5]}>
								<boxGeometry args={[0.4, 0.01, 0.6]} />
								<meshStandardMaterial
									color="#ffc8d8"
									metalness={0.9}
									roughness={0.1}
								/>
							</mesh>
						</group>
					);
				}
			)}

			{/* TEXTO */}
			<Text
				position={[0, 0, height + 0.5]}
				fontSize={0.5}
				color={hovered ? "black" : "white"}
				anchorX="center"
				anchorY="middle"
				outlineWidth={0.05}
				outlineColor={hovered ? "white" : "black"}
			>
				🚻 {nombre}
			</Text>
		</group>
	);
};

export default BañoDetallado;

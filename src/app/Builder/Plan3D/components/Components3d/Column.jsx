import * as THREE from "three";

const Column = ({ position, height, color = "#888888" }) => {
	const columnSize = 0.3;

	return (
		<group position={position}>
			{/* Columna principal */}
			<mesh castShadow receiveShadow position={[0, 0, height / 2]}>
				<boxGeometry args={[columnSize, columnSize, height]} />
				<meshStandardMaterial
					color={color}
					roughness={0.7}
					metalness={0.3}
				/>
			</mesh>

			{/* Capitel (parte superior decorativa) */}
			<mesh position={[0, 0, height]}>
				<boxGeometry
					args={[columnSize * 1.3, columnSize * 1.3, 0.15]}
				/>
				<meshStandardMaterial
					color="#aaaaaa"
					roughness={0.5}
					metalness={0.4}
				/>
			</mesh>

			{/* Base */}
			<mesh position={[0, 0, 0.1]}>
				<boxGeometry
					args={[columnSize * 1.2, columnSize * 1.2, 0.15]}
				/>
				<meshStandardMaterial
					color="#aaaaaa"
					roughness={0.5}
					metalness={0.4}
				/>
			</mesh>
		</group>
	);
};

export default Column;

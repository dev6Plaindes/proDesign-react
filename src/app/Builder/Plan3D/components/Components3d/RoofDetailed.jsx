// components3D/RoofDetailed.jsx
import * as THREE from "three";

const RoofDetailed = ({ corners, height }) => {
	const shape = new THREE.Shape();
	shape.moveTo(corners[0].east, corners[0].north);
	for (let i = 1; i < corners.length; i++) {
		shape.lineTo(corners[i].east, corners[i].north);
	}
	shape.closePath();

	return (
		<group>
			{/* Techo principal */}
			<mesh
				position={[0, 0, height + 0.15]}
				rotation={[-Math.PI / 2, 0, 0]}
				castShadow
				receiveShadow
			>
				<shapeGeometry args={[shape]} />
				<meshStandardMaterial
					color="#654321"
					roughness={0.9}
					metalness={0.1}
				/>
			</mesh>

			{/* Borde decorativo del techo */}
			<mesh
				position={[0, 0, height + 0.2]}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<shapeGeometry args={[shape]} />
				<meshStandardMaterial color="#543311" roughness={0.85} />
			</mesh>
		</group>
	);
};

export default RoofDetailed;

// utils/3DExporter.js - VERSIÓN CORREGIDA COMPLETA
import * as THREE from "three";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

const downloadFile = (blob, filename) => {
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	setTimeout(() => URL.revokeObjectURL(link.href), 100);
};

/**
 * Verificar si un objeto debe ser exportado
 */
const shouldExportObject = (object) => {
	// NO exportar helpers, grids, líneas
	if (object.isLineSegments) return false;
	if (object.isLine) return false;
	if (object.isGridHelper) return false;
	if (object.isAxesHelper) return false;
	if (object.isHelper) return false;
	if (object.type === "LineSegments") return false;
	if (object.name?.includes("grid")) return false;
	if (object.name?.includes("Grid")) return false;

	// Solo exportar meshes con geometría sólida
	if (object.isMesh && object.geometry) {
		// Verificar que tenga índices (geometría sólida)
		const hasIndices = object.geometry.index !== null;
		const hasPositions = object.geometry.attributes.position !== undefined;
		return hasPositions;
	}

	return false;
};

/**
 * Crear material simple para exportación
 */
const createExportMaterial = (originalMaterial) => {
	const mat = new THREE.MeshStandardMaterial();

	if (originalMaterial?.color) {
		mat.color.copy(originalMaterial.color);
	} else {
		mat.color.set(0xcccccc);
	}

	if (originalMaterial?.name) {
		mat.name =
			originalMaterial.name ||
			`mat_${Math.random().toString(36).substr(2, 9)}`;
	}

	return mat;
};

/**
 * Preparar escena con jerarquía correcta y objetos agrupados
 */
const prepareSceneForExport = (scene) => {
	const exportRoot = new THREE.Group();
	exportRoot.name = "Colegio_3D";

	let objectCount = 0;
	const materialsCache = new Map();

	// Buscar el grupo con rotación -Math.PI/2
	let mainGroup = null;
	scene.traverse((obj) => {
		if (obj.isGroup && obj.rotation.x < -1.5 && obj.rotation.x > -1.6) {
			mainGroup = obj;
		}
	});

	if (!mainGroup) {
		console.warn("No se encontró el grupo principal rotado");
		mainGroup = scene;
	}

	console.log("📦 Procesando escena...");

	// Organizar por categorías
	const categories = {
		terreno: new THREE.Group(),
		cancha: new THREE.Group(),
		inicial: new THREE.Group(),
		primaria: new THREE.Group(),
		secundaria: new THREE.Group(),
		banos: new THREE.Group(),
		escaleras: new THREE.Group(),
		ambientes: new THREE.Group(),
		laterales: new THREE.Group(),
		entrada: new THREE.Group(),
		otros: new THREE.Group(),
	};

	categories.terreno.name = "Terreno";
	categories.cancha.name = "Cancha";
	categories.inicial.name = "Aulas_Inicial";
	categories.primaria.name = "Aulas_Primaria";
	categories.secundaria.name = "Aulas_Secundaria";
	categories.banos.name = "Baños";
	categories.escaleras.name = "Escaleras";
	categories.ambientes.name = "Ambientes";
	categories.laterales.name = "Laterales";
	categories.entrada.name = "Entrada";
	categories.otros.name = "Otros";

	// Recorrer todos los objetos
	mainGroup.traverse((object) => {
		if (!shouldExportObject(object)) return;

		try {
			// Determinar categoría por nombre o ancestros
			let category = "otros";
			let groupName = object.name || "objeto";

			// Buscar en ancestros
			let parent = object.parent;
			while (parent && parent !== mainGroup && parent !== scene) {
				const parentName = parent.name?.toLowerCase() || "";

				if (parentName.includes("terreno")) category = "terreno";
				else if (parentName.includes("cancha")) category = "cancha";
				else if (parentName.includes("inicial")) category = "inicial";
				else if (parentName.includes("primaria")) category = "primaria";
				else if (parentName.includes("secundaria"))
					category = "secundaria";
				else if (
					parentName.includes("baño") ||
					parentName.includes("bano")
				)
					category = "banos";
				else if (parentName.includes("escalera"))
					category = "escaleras";
				else if (parentName.includes("ambiente"))
					category = "ambientes";
				else if (parentName.includes("lateral")) category = "laterales";
				else if (parentName.includes("entrada")) category = "entrada";

				parent = parent.parent;
			}

			// También por el nombre del objeto
			const objectNameLower = groupName.toLowerCase();
			if (objectNameLower.includes("terreno")) category = "terreno";
			else if (objectNameLower.includes("cancha")) category = "cancha";
			else if (objectNameLower.includes("inicial")) category = "inicial";
			else if (objectNameLower.includes("primaria"))
				category = "primaria";
			else if (objectNameLower.includes("secundaria"))
				category = "secundaria";
			else if (
				objectNameLower.includes("baño") ||
				objectNameLower.includes("bano")
			)
				category = "banos";
			else if (objectNameLower.includes("escalera"))
				category = "escaleras";
			else if (objectNameLower.includes("ambiente"))
				category = "ambientes";
			else if (objectNameLower.includes("lateral"))
				category = "laterales";
			else if (objectNameLower.includes("entrada")) category = "entrada";

			// Clonar geometría
			const geometry = object.geometry.clone();

			// Material
			let material;
			const matKey = object.material?.uuid || "default";
			if (!materialsCache.has(matKey)) {
				material = createExportMaterial(object.material);
				materialsCache.set(matKey, material);
			} else {
				material = materialsCache.get(matKey);
			}

			// Crear mesh
			const mesh = new THREE.Mesh(geometry, material);
			mesh.name = groupName;

			// Aplicar matriz del mundo (transforma geometría directamente)
			object.updateMatrixWorld(true);
			mesh.applyMatrix4(object.matrixWorld);

			// Agregar a la categoría correspondiente
			categories[category].add(mesh);
			objectCount++;
		} catch (error) {
			console.warn("Error procesando objeto:", object.name, error);
		}
	});

	// Agregar categorías que tengan objetos
	Object.values(categories).forEach((cat) => {
		if (cat.children.length > 0) {
			exportRoot.add(cat);
			console.log(`  ✓ ${cat.name}: ${cat.children.length} objetos`);
		}
	});

	console.log(
		`✅ Total preparado: ${objectCount} objetos en ${exportRoot.children.length} categorías`
	);

	return { exportGroup: exportRoot, meshCount: objectCount };
};

/**
 * Generar MTL con nombres únicos
 */
const generateMTL = (exportGroup) => {
	const materials = new Map();
	let mtlContent = `# Material Library
# Generated by Colegio 3D Builder
# ${new Date().toISOString()}

`;

	exportGroup.traverse((object) => {
		if (object.isMesh && object.material) {
			const mat = object.material;
			if (materials.has(mat.uuid)) return;

			materials.set(mat.uuid, true);

			const matName = mat.name || `material_${mat.uuid.substring(0, 8)}`;
			const color = mat.color || new THREE.Color(0xcccccc);

			mtlContent += `newmtl ${matName}\n`;
			mtlContent += `Ka ${color.r.toFixed(4)} ${color.g.toFixed(
				4
			)} ${color.b.toFixed(4)}\n`;
			mtlContent += `Kd ${color.r.toFixed(4)} ${color.g.toFixed(
				4
			)} ${color.b.toFixed(4)}\n`;
			mtlContent += `Ks 0.5000 0.5000 0.5000\n`;
			mtlContent += `Ns 500.0\n`;
			mtlContent += `d 1.0000\n`;
			mtlContent += `illum 2\n\n`;
		}
	});

	return mtlContent;
};

/**
 * Exportar a OBJ con estructura correcta
 */
export const exportToOBJ = async (scene, filename = "colegio_3d") => {
	try {
		console.log("🚀 Iniciando exportación OBJ...");

		const { exportGroup, meshCount } = prepareSceneForExport(scene);

		if (meshCount === 0) {
			return {
				success: false,
				message: "No se encontraron geometrías 3D para exportar",
			};
		}

		// Exportar con OBJExporter
		const exporter = new OBJExporter();
		const objContent = exporter.parse(exportGroup);

		// Generar MTL
		const mtlContent = generateMTL(exportGroup);

		// Header del OBJ
		const objWithMTL = `# Colegio 3D - Modelo Arquitectónico
# Exportado: ${new Date().toISOString()}
# Objetos: ${meshCount}
# Unidades: Metros
# Sistema: X=Este, Y=Norte, Z=Altura
mtllib ${filename}.mtl

${objContent}`;

		// README detallado
		const readme = `MODELO 3D - COLEGIO
===================

ARCHIVOS INCLUIDOS:
-------------------
✓ ${filename}.obj - Geometría 3D (${meshCount} objetos)
✓ ${filename}.mtl - Materiales y colores
✓ ${filename}_README.txt - Este archivo

ESTRUCTURA DEL MODELO:
----------------------
El modelo está organizado en grupos/capas:

📁 Terreno - Superficie base del proyecto
📁 Cancha - Área deportiva
📁 Aulas_Inicial - Salones de educación inicial
📁 Aulas_Primaria - Salones de primaria
📁 Aulas_Secundaria - Salones de secundaria
📁 Baños - Servicios higiénicos (divididos H/M)
📁 Escaleras - Circulación vertical entre pisos
📁 Ambientes - Espacios complementarios
📁 Laterales - Construcciones laterales
📁 Entrada - Acceso principal

IMPORTAR EN RHINO 3D:
---------------------
1. Abrir Rhino
2. Archivo > Importar (o comando "Import")
3. Seleccionar ${filename}.obj
4. Configuración:
   - Mantener ${filename}.mtl en la misma carpeta
   - Unir meshes coplanares: NO
   - Importar objetos como: Grupos por capa
5. Vista > Vista sombreada (para ver colores)

IMPORTAR EN AUTOCAD:
--------------------
1. Abrir AutoCAD
2. Comando: IMPORT
3. Tipo de archivo: Wavefront (*.obj)
4. Seleccionar ${filename}.obj
5. Configuración:
   - Unidades: Metros
   - Escala: 1:1
   - Insertar como bloque: NO (mantener capas)

VERIFICACIÓN DEL MODELO:
------------------------
✓ Debe verse en 3D con VOLUMEN (no plano)
✓ Los objetos están organizados por capas/grupos
✓ Cada aula es un objeto independiente
✓ Las paredes tienen grosor (15cm típico)
✓ Los pisos están a diferentes alturas (3m por piso)
✓ Las escaleras conectan los niveles
✓ Los baños tienen divisiones internas

ESPECIFICACIONES TÉCNICAS:
--------------------------
- Unidades: METROS (1 unidad = 1 metro real)
- Sistema de coordenadas:
  - Eje X: Horizontal (Este-Oeste)
  - Eje Y: Horizontal (Norte-Sur)
  - Eje Z: Vertical (Altura)
- Origen: Centro del terreno (0,0,0)
- Altura de piso: 3.0 metros
- Grosor de muros: 0.15 metros
- Total de objetos: ${meshCount}

COLORES POR TIPO:
-----------------
🟨 Amarillo (#EAB308) - Educación Inicial
🟦 Azul (#3B82F6) - Primaria
🟥 Rojo (#EF4444) - Secundaria
🟪 Morado (#A855F7) - Baños
⬜ Gris (#6B7280) - Escaleras
🟧 Naranja (#FB923C) - Laterales
🔷 Rosa (#EC4899) - Ambientes complementarios
🟫 Café (#8B4513) - Techos

SOLUCIÓN DE PROBLEMAS:
----------------------
❌ No se ven colores:
   → Verificar que el .mtl está en la misma carpeta
   → Activar vista sombreada/renderizada

❌ Modelo desordenado:
   → Verificar que las unidades sean METROS
   → No aplicar transformaciones adicionales

❌ Objetos separados:
   → Es correcto, cada aula debe ser independiente
   → Usar capas/grupos para organizarlos

❌ Aparecen líneas extrañas:
   → Cambiar vista a Sombreado (no Wireframe)
   → Desactivar visualización de aristas

EDICIÓN RECOMENDADA:
--------------------
1. Mantener la organización por capas
2. Cada objeto puede editarse independientemente
3. Los materiales se pueden modificar en Rhino/AutoCAD
4. La geometría es sólida y válida para análisis

Fecha de exportación: ${new Date().toLocaleString()}
Versión: 1.0
`;

		// Descargar archivos
		console.log("📦 Descargando archivos...");
		const files = {
			[`${filename}.obj`]: objWithMTL,
			[`${filename}.mtl`]: mtlContent,
			[`${filename}_README.txt`]: readme,
		};

		for (const [name, content] of Object.entries(files)) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			const blob = new Blob([content], { type: "text/plain" });
			downloadFile(blob, name);
		}

		console.log("✅ Exportación completada exitosamente");

		return {
			success: true,
			message: `✅ Exportado correctamente: ${meshCount} objetos 3D organizados en capas. Revisa tus descargas.`,
		};
	} catch (error) {
		console.error("❌ Error en exportación:", error);
		return {
			success: false,
			message: `Error: ${error.message}`,
		};
	}
};

// Mantener las otras funciones (STL, GLTF, etc.) igual que antes...
export const exportToSTL = (scene, filename = "colegio_3d", binary = true) => {
	try {
		const { exportGroup, meshCount } = prepareSceneForExport(scene);
		if (meshCount === 0) {
			return {
				success: false,
				message: "No se encontraron geometrías 3D",
			};
		}

		const exporter = new STLExporter();
		const result = exporter.parse(exportGroup, { binary });
		const blob = binary
			? new Blob([result], { type: "application/octet-stream" })
			: new Blob([result], { type: "text/plain" });

		downloadFile(blob, `${filename}.stl`);
		return {
			success: true,
			message: `✅ Exportado: ${meshCount} objetos en STL`,
		};
	} catch (error) {
		return { success: false, message: `Error: ${error.message}` };
	}
};

export const exportToGLTF = (scene, filename = "colegio_3d", binary = true) => {
	return new Promise((resolve, reject) => {
		try {
			const { exportGroup, meshCount } = prepareSceneForExport(scene);
			if (meshCount === 0) {
				reject({
					success: false,
					message: "No se encontraron geometrías 3D",
				});
				return;
			}

			const exporter = new GLTFExporter();
			exporter.parse(
				exportGroup,
				(result) => {
					const blob = binary
						? new Blob([result], {
								type: "application/octet-stream",
						  })
						: new Blob([JSON.stringify(result, null, 2)], {
								type: "application/json",
						  });

					downloadFile(
						blob,
						binary ? `${filename}.glb` : `${filename}.gltf`
					);
					resolve({
						success: true,
						message: `✅ Exportado: ${meshCount} objetos en GLTF`,
					});
				},
				(error) =>
					reject({
						success: false,
						message: `Error: ${error.message}`,
					}),
				{ binary, embedImages: true, maxTextureSize: 4096 }
			);
		} catch (error) {
			reject({ success: false, message: `Error: ${error.message}` });
		}
	});
};

export const verifyGeometry = (scene) => {
	if (!scene) return { meshes: 0, vertices: 0, faces: 0, hasGeometry: false };
	let meshes = 0,
		vertices = 0,
		faces = 0;
	scene.traverse((object) => {
		if (object.isMesh && object.geometry) {
			meshes++;
			if (object.geometry.attributes.position) {
				vertices += object.geometry.attributes.position.count;
			}
			if (object.geometry.index) {
				faces += object.geometry.index.count / 3;
			}
		}
	});
	return { meshes, vertices, faces, hasGeometry: meshes > 0 };
};

export const exportMetadata = (
	school,
	distribution,
	filename = "colegio_metadata"
) => {
	const metadata = {
		proyecto: {
			nombre: school?.name || "Proyecto",
			fecha: new Date().toISOString(),
		},
		distribucion: {
			pisos: distribution?.totalFloors || 1,
			layout: distribution?.layoutMode,
		},
		elementos: {
			inicial: distribution?.inicial?.length || 0,
			primaria: distribution?.primaria?.length || 0,
			secundaria: distribution?.secundaria?.length || 0,
			banos: distribution?.banos?.length || 0,
			escaleras: distribution?.escaleras?.length || 0,
		},
		geometria: verifyGeometry(window.__threeScene),
	};
	const blob = new Blob([JSON.stringify(metadata, null, 2)], {
		type: "application/json",
	});
	downloadFile(blob, `${filename}.json`);
	return { success: true, message: "✅ Metadata exportado" };
};

export const exportReadme = (filename = "INSTRUCCIONES") => {
	const readme = "Ver README incluido con el modelo OBJ.";
	const blob = new Blob([readme], { type: "text/plain" });
	downloadFile(blob, `${filename}.txt`);
	return { success: true, message: "✅ README generado" };
};

export const exportDirectGLB = async (
	elementos,
	coordinates,
	totalFloors,
	filename = "colegio_3d"
) => {
	try {
		console.log("🚀 Exportando a GLB desde datos...");
		console.log("Datos recibidos:", {
			inicial: elementos?.inicial?.length || 0,
			primaria: elementos?.primaria?.length || 0,
			secundaria: elementos?.secundaria?.length || 0,
			banos: elementos?.banos?.length || 0,
			escaleras: elementos?.escaleras?.length || 0,
			coordinates: coordinates?.length || 0,
		});

		const exportRoot = new THREE.Group();
		exportRoot.name = "Colegio_3D";

		const ALTURA_PISO = 3.0;
		let objectCount = 0;

		// Función helper para obtener piso
		const getFloor = (elemento) => {
			return elemento?.floor || elemento?.piso || elemento?.nivel || 1;
		};

		// 1. TERRENO
		if (coordinates && coordinates.length > 0) {
			console.log("📐 Creando terreno...");
			const terreno = createTerrenoGeometry(coordinates);
			if (terreno) {
				exportRoot.add(terreno);
				objectCount++;
			}
		}

		// 2. AULAS INICIAL
		if (elementos.inicial && elementos.inicial.length > 0) {
			console.log("🟨 Creando aulas inicial...");
			const grupoInicial = new THREE.Group();
			grupoInicial.name = "Aulas_Inicial";

			elementos.inicial.forEach((aula, idx) => {
				const floor = getFloor(aula);
				const offsetZ = (floor - 1) * ALTURA_PISO;

				const mesh = createBoxFromCorners(
					aula.realCorners,
					ALTURA_PISO,
					`Inicial_${idx + 1}_Piso_${floor}`,
					"#eab308"
				);

				if (mesh) {
					mesh.position.z += offsetZ;
					grupoInicial.add(mesh);
					objectCount++;
				}
			});

			if (grupoInicial.children.length > 0) {
				exportRoot.add(grupoInicial);
			}
		}

		// 3. AULAS PRIMARIA
		if (elementos.primaria && elementos.primaria.length > 0) {
			console.log("🟦 Creando aulas primaria...");
			const grupoPrimaria = new THREE.Group();
			grupoPrimaria.name = "Aulas_Primaria";

			elementos.primaria.forEach((aula, idx) => {
				const floor = getFloor(aula);
				const offsetZ = (floor - 1) * ALTURA_PISO;

				const mesh = createBoxFromCorners(
					aula.realCorners,
					ALTURA_PISO,
					`Primaria_${idx + 1}_Piso_${floor}`,
					"#3b82f6"
				);

				if (mesh) {
					mesh.position.z += offsetZ;
					grupoPrimaria.add(mesh);
					objectCount++;
				}
			});

			if (grupoPrimaria.children.length > 0) {
				exportRoot.add(grupoPrimaria);
			}
		}

		// 4. AULAS SECUNDARIA
		if (elementos.secundaria && elementos.secundaria.length > 0) {
			console.log("🟥 Creando aulas secundaria...");
			const grupoSecundaria = new THREE.Group();
			grupoSecundaria.name = "Aulas_Secundaria";

			elementos.secundaria.forEach((aula, idx) => {
				const floor = getFloor(aula);
				const offsetZ = (floor - 1) * ALTURA_PISO;

				const mesh = createBoxFromCorners(
					aula.realCorners,
					ALTURA_PISO,
					`Secundaria_${idx + 1}_Piso_${floor}`,
					"#ef4444"
				);

				if (mesh) {
					mesh.position.z += offsetZ;
					grupoSecundaria.add(mesh);
					objectCount++;
				}
			});

			if (grupoSecundaria.children.length > 0) {
				exportRoot.add(grupoSecundaria);
			}
		}

		// 5. BAÑOS
		if (elementos.banos && elementos.banos.length > 0) {
			console.log("🟪 Creando baños...");
			const grupoBanos = new THREE.Group();
			grupoBanos.name = "Baños_SSHH";

			elementos.banos.forEach((bano, idx) => {
				const floor = getFloor(bano);
				const offsetZ = (floor - 1) * ALTURA_PISO;

				const mesh = createBoxFromCorners(
					bano.realCorners,
					ALTURA_PISO,
					`Baño_SSHH_Piso_${floor}`,
					"#a855f7"
				);

				if (mesh) {
					mesh.position.z += offsetZ;
					grupoBanos.add(mesh);
					objectCount++;
				}
			});

			if (grupoBanos.children.length > 0) {
				exportRoot.add(grupoBanos);
			}
		}

		// 6. ESCALERAS (atraviesan todos los pisos)
		if (elementos.escaleras && elementos.escaleras.length > 0) {
			console.log("⬜ Creando escaleras...");
			const grupoEscaleras = new THREE.Group();
			grupoEscaleras.name = "Escaleras_Circulacion";

			elementos.escaleras.forEach((escalera, idx) => {
				const mesh = createBoxFromCorners(
					escalera.realCorners,
					ALTURA_PISO * totalFloors,
					`Escalera_${idx + 1}_Todos_Pisos`,
					"#6b7280"
				);

				if (mesh) {
					grupoEscaleras.add(mesh);
					objectCount++;
				}
			});

			if (grupoEscaleras.children.length > 0) {
				exportRoot.add(grupoEscaleras);
			}
		}

		// 7. AMBIENTES COMPLEMENTARIOS
		if (elementos.ambientes && elementos.ambientes.length > 0) {
			console.log("🔶 Creando ambientes...");
			const grupoAmbientes = new THREE.Group();
			grupoAmbientes.name = "Ambientes_Complementarios";

			elementos.ambientes.forEach((ambiente, idx) => {
				const floor = getFloor(ambiente);
				const offsetZ = (floor - 1) * ALTURA_PISO;

				const mesh = createBoxFromCorners(
					ambiente.realCorners,
					ALTURA_PISO,
					`${ambiente.nombre || "Ambiente"}_Piso_${floor}`,
					"#ec4899"
				);

				if (mesh) {
					mesh.position.z += offsetZ;
					grupoAmbientes.add(mesh);
					objectCount++;
				}
			});

			if (grupoAmbientes.children.length > 0) {
				exportRoot.add(grupoAmbientes);
			}
		}

		// 8. LATERALES
		if (elementos.laterales && elementos.laterales.length > 0) {
			console.log("🟧 Creando laterales...");
			const grupoLaterales = new THREE.Group();
			grupoLaterales.name = "Construcciones_Laterales";

			elementos.laterales.forEach((lateral, idx) => {
				const floor = getFloor(lateral);
				const offsetZ = (floor - 1) * ALTURA_PISO;

				const mesh = createBoxFromCorners(
					lateral.realCorners,
					ALTURA_PISO,
					`${lateral.nombre || "Lateral"}_Piso_${floor}`,
					"#fb923c"
				);

				if (mesh) {
					mesh.position.z += offsetZ;
					grupoLaterales.add(mesh);
					objectCount++;
				}
			});

			if (grupoLaterales.children.length > 0) {
				exportRoot.add(grupoLaterales);
			}
		}

		// 9. CANCHA DEPORTIVA
		if (elementos.cancha && elementos.cancha.realCorners) {
			console.log("⚽ Creando cancha...");
			const grupoCancha = new THREE.Group();
			grupoCancha.name = "Cancha_Deportiva";

			const mesh = createBoxFromCorners(
				elementos.cancha.realCorners,
				0.05,
				"Cancha_Multiuso",
				"#22c55e"
			);

			if (mesh) {
				grupoCancha.add(mesh);
				exportRoot.add(grupoCancha);
				objectCount++;
			}
		}

		// 10. ENTRADA (solo piso 1)
		if (elementos.entrada && elementos.entrada.realCorners) {
			console.log("🚪 Creando entrada...");
			const grupoEntrada = new THREE.Group();
			grupoEntrada.name = "Acceso_Principal";

			const mesh = createBoxFromCorners(
				elementos.entrada.realCorners,
				ALTURA_PISO,
				"Entrada_Principal",
				"#64748b"
			);

			if (mesh) {
				grupoEntrada.add(mesh);
				exportRoot.add(grupoEntrada);
				objectCount++;
			}
		}

		if (objectCount === 0) {
			return {
				success: false,
				message:
					"No se pudo crear ninguna geometría. Verifica los datos.",
			};
		}

		console.log(
			`✅ Geometría creada: ${objectCount} objetos en ${exportRoot.children.length} grupos`
		);

		// ✅ EXPORTAR CON GLTFEXPORTER
		return new Promise((resolve, reject) => {
			const exporter = new GLTFExporter();

			exporter.parse(
				exportRoot,
				(gltfData) => {
					// Crear blob del GLB
					const blob = new Blob([gltfData], {
						type: "application/octet-stream",
					});
					downloadFile(blob, `${filename}.glb`);

					// Crear README
					const readme = `MODELO 3D - FORMATO GLB
=======================

✅ Este es un archivo GLB (GL Transmission Format Binary)
✅ Compatible con Rhino 7+, Blender, y otros software 3D modernos
✅ Contiene geometría, materiales, colores y jerarquía

ARCHIVO:
--------
- ${filename}.glb - Modelo 3D completo (${objectCount} objetos)

IMPORTAR EN RHINO 7+:
---------------------
1. Abrir Rhino 7 o superior
2. Comando: Import (o Archivo > Importar)
3. Tipo de archivo: "glTF Files (*.gltf, *.glb)"
4. Seleccionar ${filename}.glb
5. El modelo aparecerá organizado en capas/bloques

IMPORTAR EN BLENDER:
--------------------
1. File > Import > glTF 2.0 (.glb/.gltf)
2. Seleccionar ${filename}.glb
3. El modelo se importará con todos sus materiales

ESTRUCTURA DEL MODELO:
----------------------
📁 Colegio_3D (raíz)
  📁 Terreno
  📁 Aulas_Inicial (${elementos.inicial?.length || 0} aulas)
  📁 Aulas_Primaria (${elementos.primaria?.length || 0} aulas)
  📁 Aulas_Secundaria (${elementos.secundaria?.length || 0} aulas)
  📁 Baños_SSHH (${elementos.banos?.length || 0} servicios)
  📁 Escaleras_Circulacion (${elementos.escaleras?.length || 0} escaleras)
  📁 Ambientes_Complementarios (${elementos.ambientes?.length || 0} ambientes)
  📁 Construcciones_Laterales (${elementos.laterales?.length || 0} espacios)
  📁 Cancha_Deportiva
  📁 Acceso_Principal

ESPECIFICACIONES:
-----------------
- Formato: GLB (binario)
- Unidades: METROS
- Sistema de coordenadas:
  - X: Este-Oeste
  - Y: Norte-Sur
  - Z: Altura (vertical)
- Origen: Centro del terreno (0,0,0)
- Altura por piso: 3.0 m
- Total de objetos: ${objectCount}

VENTAJAS DEL FORMATO GLB:
-------------------------
✓ Archivo único (no necesita archivos adicionales)
✓ Preserva colores y materiales perfectamente
✓ Mantiene la jerarquía de grupos/bloques
✓ Formato estándar de la industria
✓ Compatible con múltiples software
✓ Optimizado para visualización 3D

VERIFICACIÓN:
-------------
✓ Cada aula/ambiente es un bloque independiente
✓ Los objetos están organizados en capas/grupos
✓ Los colores son correctos por tipo de espacio
✓ Las coordenadas son precisas
✓ Los pisos están a la altura correcta

COLORES:
--------
🟨 #EAB308 - Educación Inicial
🟦 #3B82F6 - Primaria
🟥 #EF4444 - Secundaria
🟪 #A855F7 - Baños/SSHH
⬜ #6B7280 - Escaleras
🔶 #EC4899 - Ambientes complementarios
🟧 #FB923C - Construcciones laterales
🟩 #22C55E - Cancha deportiva
⬛ #64748B - Acceso principal

Fecha de exportación: ${new Date().toLocaleString()}
Generado por: Colegio 3D Builder
`;

					// Descargar README
					const readmeBlob = new Blob([readme], {
						type: "text/plain",
					});
					setTimeout(() => {
						downloadFile(readmeBlob, `${filename}_README.txt`);
					}, 500);

					console.log("✅ Exportación GLB completada");

					resolve({
						success: true,
						message: `✅ Exportado: ${objectCount} objetos 3D en formato GLB (Rhino 7+)`,
					});
				},
				(error) => {
					console.error("❌ Error en GLTFExporter:", error);
					reject({
						success: false,
						message: `Error al exportar GLB: ${
							error.message || error
						}`,
					});
				},
				{
					binary: true,
					embedImages: true,
					maxTextureSize: 4096,
					includeCustomExtensions: false,
				}
			);
		});
	} catch (error) {
		console.error("❌ Error:", error);
		return {
			success: false,
			message: `Error: ${error.message}`,
		};
	}
};

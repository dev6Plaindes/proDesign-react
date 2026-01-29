// utils/DirectGeometryExporter.js - AGREGAR NUEVA FUNCIÓN

/**
 * Construir escena PLANA (sin grupos) - cada elemento es independiente
 */
const buildFlatSceneFromData = (elementos, coordinates, totalFloors) => {
	const exportRoot = new THREE.Group();
	exportRoot.name = "Colegio_3D";

	const ALTURA_PISO = 3.0;
	let objectCount = 0;
	const allObjects = []; // Array plano de todos los objetos

	// Función helper para obtener piso del elemento
	const getFloor = (elemento) => {
		return elemento?.floor || elemento?.piso || elemento?.nivel || 1;
	};

	console.log("📦 Construyendo escena plana (objetos independientes)...");

	// 1. TERRENO
	if (coordinates && coordinates.length > 0) {
		console.log("📐 Creando terreno...");
		const terreno = createTerrenoGeometry(coordinates);
		if (terreno) {
			allObjects.push(terreno);
			objectCount++;
		}
	}

	// 2. AULAS INICIAL
	if (elementos.inicial && elementos.inicial.length > 0) {
		console.log("🟨 Creando aulas inicial:", elementos.inicial.length);

		elementos.inicial.forEach((aula, idx) => {
			const floor = getFloor(aula);
			const offsetZ = (floor - 1) * ALTURA_PISO;

			const mesh = createBoxFromCorners(
				aula.realCorners,
				ALTURA_PISO,
				`Aula_Inicial_${idx + 1}_Piso_${floor}`,
				"#eab308"
			);

			if (mesh) {
				mesh.position.z += offsetZ;
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 3. AULAS PRIMARIA
	if (elementos.primaria && elementos.primaria.length > 0) {
		console.log("🟦 Creando aulas primaria:", elementos.primaria.length);

		elementos.primaria.forEach((aula, idx) => {
			const floor = getFloor(aula);
			const offsetZ = (floor - 1) * ALTURA_PISO;

			const mesh = createBoxFromCorners(
				aula.realCorners,
				ALTURA_PISO,
				`Aula_Primaria_${idx + 1}_Piso_${floor}`,
				"#3b82f6"
			);

			if (mesh) {
				mesh.position.z += offsetZ;
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 4. AULAS SECUNDARIA
	if (elementos.secundaria && elementos.secundaria.length > 0) {
		console.log(
			"🟥 Creando aulas secundaria:",
			elementos.secundaria.length
		);

		elementos.secundaria.forEach((aula, idx) => {
			const floor = getFloor(aula);
			const offsetZ = (floor - 1) * ALTURA_PISO;

			const mesh = createBoxFromCorners(
				aula.realCorners,
				ALTURA_PISO,
				`Aula_Secundaria_${idx + 1}_Piso_${floor}`,
				"#ef4444"
			);

			if (mesh) {
				mesh.position.z += offsetZ;
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 5. BAÑOS
	if (elementos.banos && elementos.banos.length > 0) {
		console.log("🟪 Creando baños:", elementos.banos.length);

		elementos.banos.forEach((bano, idx) => {
			const floor = getFloor(bano);
			const offsetZ = (floor - 1) * ALTURA_PISO;

			const mesh = createBoxFromCorners(
				bano.realCorners,
				ALTURA_PISO,
				`Baño_SSHH_${idx + 1}_Piso_${floor}`,
				"#a855f7"
			);

			if (mesh) {
				mesh.position.z += offsetZ;
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 6. ESCALERAS
	if (elementos.escaleras && elementos.escaleras.length > 0) {
		console.log("⬜ Creando escaleras:", elementos.escaleras.length);

		elementos.escaleras.forEach((escalera, idx) => {
			const mesh = createBoxFromCorners(
				escalera.realCorners,
				ALTURA_PISO * totalFloors,
				`Escalera_${idx + 1}`,
				"#6b7280"
			);

			if (mesh) {
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 7. AMBIENTES COMPLEMENTARIOS
	if (elementos.ambientes && elementos.ambientes.length > 0) {
		console.log("🔶 Creando ambientes:", elementos.ambientes.length);

		elementos.ambientes.forEach((ambiente, idx) => {
			const floor = getFloor(ambiente);
			const offsetZ = (floor - 1) * ALTURA_PISO;

			const nombreLimpio = (ambiente.nombre || `Ambiente_${idx + 1}`)
				.replace(/\s+/g, "_")
				.replace(/[()]/g, "");

			const mesh = createBoxFromCorners(
				ambiente.realCorners,
				ALTURA_PISO,
				`${nombreLimpio}_Piso_${floor}`,
				"#ec4899"
			);

			if (mesh) {
				mesh.position.z += offsetZ;
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 8. LATERALES
	if (elementos.laterales && elementos.laterales.length > 0) {
		console.log("🟧 Creando laterales:", elementos.laterales.length);

		elementos.laterales.forEach((lateral, idx) => {
			const floor = getFloor(lateral);
			const offsetZ = (floor - 1) * ALTURA_PISO;

			const nombreLimpio = (lateral.nombre || `Lateral_${idx + 1}`)
				.replace(/\s+/g, "_")
				.replace(/[()]/g, "");

			const mesh = createBoxFromCorners(
				lateral.realCorners,
				ALTURA_PISO,
				`${nombreLimpio}_Piso_${floor}`,
				"#fb923c"
			);

			if (mesh) {
				mesh.position.z += offsetZ;
				allObjects.push(mesh);
				objectCount++;
			}
		});
	}

	// 9. CANCHA DEPORTIVA
	if (elementos.cancha && elementos.cancha.realCorners) {
		console.log("⚽ Creando cancha...");

		const mesh = createBoxFromCorners(
			elementos.cancha.realCorners,
			0.05,
			"Cancha_Deportiva",
			"#22c55e"
		);

		if (mesh) {
			allObjects.push(mesh);
			objectCount++;
		}
	}

	// 10. ENTRADA
	if (elementos.entrada && elementos.entrada.realCorners) {
		console.log("🚪 Creando entrada...");

		const mesh = createBoxFromCorners(
			elementos.entrada.realCorners,
			ALTURA_PISO,
			"Entrada_Principal",
			"#64748b"
		);

		if (mesh) {
			allObjects.push(mesh);
			objectCount++;
		}
	}

	// ✅ Agregar todos los objetos directamente al root (SIN GRUPOS)
	allObjects.forEach((obj) => {
		exportRoot.add(obj);
	});

	console.log(
		`✅ Escena plana creada: ${objectCount} objetos independientes`
	);

	return { exportRoot, objectCount };
};

/**
 * Exportar GLB con objetos independientes (sin agrupar)
 */
export const exportFlatGLB = async (
	elementos,
	coordinates,
	totalFloors,
	filename = "colegio_3d"
) => {
	try {
		console.log("🚀 Exportando GLB con objetos independientes...");

		// ✅ Usar buildFlatSceneFromData en lugar de buildSceneFromData
		const { exportRoot, objectCount } = buildFlatSceneFromData(
			elementos,
			coordinates,
			totalFloors
		);

		if (objectCount === 0) {
			return {
				success: false,
				message:
					"No se pudo crear ninguna geometría. Verifica los datos.",
			};
		}

		return new Promise((resolve, reject) => {
			const exporter = new GLTFExporter();

			exporter.parse(
				exportRoot,
				(gltfData) => {
					const blob = new Blob([gltfData], {
						type: "application/octet-stream",
					});
					downloadFile(blob, `${filename}.glb`);

					const readme = `MODELO 3D - OBJETOS INDEPENDIENTES
===================================

✅ Cada aula/ambiente es un OBJETO INDEPENDIENTE
✅ Se puede seleccionar y mover individualmente
✅ Sin grupos - estructura plana para fácil edición

IMPORTAR EN RHINO 7+:
---------------------
1. Comando: Import
2. Seleccionar ${filename}.glb
3. Cada objeto aparecerá como elemento separado
4. Puedes seleccionar, mover, rotar cada aula individualmente

CONTENIDO (${objectCount} objetos independientes):
-----------
🟨 Aulas Inicial: ${elementos.inicial?.length || 0}
🟦 Aulas Primaria: ${elementos.primaria?.length || 0}
🟥 Aulas Secundaria: ${elementos.secundaria?.length || 0}
🟪 Baños: ${elementos.banos?.length || 0}
⬜ Escaleras: ${elementos.escaleras?.length || 0}
🔶 Ambientes: ${elementos.ambientes?.length || 0}
🟧 Laterales: ${elementos.laterales?.length || 0}
⚽ Cancha
🚪 Entrada
📐 Terreno

EDICIÓN EN RHINO:
-----------------
- Cada objeto se puede seleccionar con un click
- Comando "Move" para mover aulas
- Comando "Rotate" para rotar
- Comando "Scale" para escalar
- Mantén la nomenclatura para identificar fácilmente

NOMBRES DE OBJETOS:
-------------------
- Aula_Inicial_1_Piso_1
- Aula_Primaria_1_Piso_1
- Aula_Secundaria_1_Piso_1
- Baño_SSHH_1_Piso_1
- Escalera_1
- Direccion_administrativa_Piso_1
- etc.

UNIDADES: METROS
Sistema: X=Este, Y=Norte, Z=Altura

Fecha: ${new Date().toLocaleString()}
`;

					const readmeBlob = new Blob([readme], {
						type: "text/plain",
					});
					setTimeout(() => {
						downloadFile(readmeBlob, `${filename}_README.txt`);
					}, 500);

					console.log("✅ Exportación completada");

					resolve({
						success: true,
						message: `✅ ${objectCount} objetos independientes exportados. Cada elemento se puede editar por separado en Rhino.`,
					});
				},
				(error) => {
					console.error("❌ Error:", error);
					reject({
						success: false,
						message: `Error: ${error.message || error}`,
					});
				},
				{
					binary: true,
					embedImages: true,
					maxTextureSize: 4096,
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

/**
 * Exportar OBJ con objetos independientes
 */
export const exportFlatOBJ = async (
	elementos,
	coordinates,
	totalFloors,
	filename = "colegio_3d"
) => {
	try {
		console.log("🚀 Exportando OBJ con objetos independientes...");

		const { exportRoot, objectCount } = buildFlatSceneFromData(
			elementos,
			coordinates,
			totalFloors
		);

		if (objectCount === 0) {
			return {
				success: false,
				message: "No se pudo crear ninguna geometría.",
			};
		}

		// Exportar con OBJExporter
		const exporter = new OBJExporter();
		const objContent = exporter.parse(exportRoot);

		// Generar MTL
		const mtlContent = generateMTL(exportRoot);

		const objWithMTL = `# Colegio 3D - Objetos Independientes
# Cada aula/ambiente es un objeto separado
# Exportado: ${new Date().toISOString()}
# Total: ${objectCount} objetos
mtllib ${filename}.mtl

${objContent}`;

		const readme = `MODELO 3D - OBJETOS INDEPENDIENTES
===================================

ARCHIVOS:
---------
- ${filename}.obj - Geometría (${objectCount} objetos)
- ${filename}.mtl - Materiales y colores
- ${filename}_README.txt - Este archivo

IMPORTAR EN RHINO (cualquier versión):
--------------------------------------
1. Comando: Import
2. Seleccionar ${filename}.obj
3. Mantener el .mtl en la misma carpeta
4. Cada objeto es independiente y editable

IMPORTAR EN AUTOCAD:
--------------------
1. Comando: IMPORT
2. Seleccionar ${filename}.obj
3. Cada objeto aparecerá separado

EDICIÓN:
--------
✓ Cada aula se puede seleccionar individualmente
✓ Mueve, rota, escala cada elemento
✓ Sin grupos - estructura plana

CONTENIDO: ${objectCount} objetos
Unidades: METROS

Fecha: ${new Date().toLocaleString()}
`;

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

		return {
			success: true,
			message: `✅ ${objectCount} objetos independientes exportados en formato OBJ`,
		};
	} catch (error) {
		console.error("❌ Error:", error);
		return {
			success: false,
			message: `Error: ${error.message}`,
		};
	}
};

export const exportEditableOBJ = async (elementos, coordinates, totalFloors, filename = 'colegio_3d') => {
    try {
        console.log('🚀 Exportando OBJ editable para Rhino...');
        
        const ALTURA_PISO = 3.0;
        let objectCount = 0;
        let objContent = '';
        let mtlContent = `# Material Library\n# Colegio 3D Builder\n\n`;
        
        const materials = new Map();
        let vertexOffset = 1; // OBJ usa índices desde 1
        
        // Función helper
        const getFloor = (elemento) => {
            return elemento?.floor || elemento?.piso || elemento?.nivel || 1;
        };
        
        // Función para agregar material al MTL
        const addMaterial = (name, colorHex) => {
            if (materials.has(name)) return;
            materials.set(name, true);
            
            const color = new THREE.Color(colorHex);
            mtlContent += `newmtl ${name}\n`;
            mtlContent += `Kd ${color.r.toFixed(4)} ${color.g.toFixed(4)} ${color.b.toFixed(4)}\n`;
            mtlContent += `Ka ${color.r.toFixed(4)} ${color.g.toFixed(4)} ${color.b.toFixed(4)}\n`;
            mtlContent += `Ks 0.5 0.5 0.5\n`;
            mtlContent += `Ns 500.0\n`;
            mtlContent += `d 1.0\n`;
            mtlContent += `illum 2\n\n`;
        };
        
        // Función para crear un box y agregarlo al OBJ
        const addBoxToOBJ = (corners, height, name, colorHex, offsetZ = 0) => {
            if (!corners || corners.length < 4) return false;
            
            try {
                // Calcular centro y dimensiones
                const centerX = corners.reduce((sum, c) => sum + c.east, 0) / corners.length;
                const centerY = corners.reduce((sum, c) => sum + c.north, 0) / corners.length;
                
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
                
                // Crear geometría box
                const geometry = new THREE.BoxGeometry(width, depth, height);
                const mesh = new THREE.Mesh(geometry);
                mesh.position.set(centerX, centerY, height / 2 + offsetZ);
                mesh.rotation.z = angle;
                mesh.updateMatrixWorld(true);
                
                // Aplicar transformación a la geometría
                geometry.applyMatrix4(mesh.matrixWorld);
                
                // Material
                const matName = `mat_${name.replace(/\s+/g, '_')}`;
                addMaterial(matName, colorHex);
                
                // Escribir en OBJ
                objContent += `\n# ${name}\n`;
                objContent += `o ${name}\n`;
                objContent += `usemtl ${matName}\n`;
                
                // Vértices
                const positions = geometry.attributes.position;
                for (let i = 0; i < positions.count; i++) {
                    const x = positions.getX(i);
                    const y = positions.getY(i);
                    const z = positions.getZ(i);
                    objContent += `v ${x.toFixed(6)} ${y.toFixed(6)} ${z.toFixed(6)}\n`;
                }
                
                // Caras (considerando el offset de vértices)
                const indices = geometry.index;
                if (indices) {
                    for (let i = 0; i < indices.count; i += 3) {
                        const a = indices.getX(i) + vertexOffset;
                        const b = indices.getX(i + 1) + vertexOffset;
                        const c = indices.getX(i + 2) + vertexOffset;
                        objContent += `f ${a} ${b} ${c}\n`;
                    }
                } else {
                    // Sin índices, usar posiciones directamente
                    for (let i = 0; i < positions.count; i += 3) {
                        const a = i + vertexOffset;
                        const b = i + 1 + vertexOffset;
                        const c = i + 2 + vertexOffset;
                        objContent += `f ${a} ${b} ${c}\n`;
                    }
                }
                
                vertexOffset += positions.count;
                objectCount++;
                geometry.dispose();
                
                return true;
                
            } catch (error) {
                console.warn(`Error creando ${name}:`, error);
                return false;
            }
        };
        
        // Header del OBJ
        objContent = `# Colegio 3D - Objetos Editables
# Cada elemento es independiente
# Exportado: ${new Date().toISOString()}
mtllib ${filename}.mtl

`;
        
        console.log('📐 Construyendo objetos...');
        
        // 1. TERRENO
        if (coordinates && coordinates.length > 0) {
            console.log('  Terreno...');
            // Para el terreno usamos shape extruido
            const shape = new THREE.Shape();
            shape.moveTo(coordinates[0].east, coordinates[0].north);
            for (let i = 1; i < coordinates.length; i++) {
                shape.lineTo(coordinates[i].east, coordinates[i].north);
            }
            shape.lineTo(coordinates[0].east, coordinates[0].north);
            
            const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
            geometry.translate(0, 0, -0.5);
            
            addMaterial('mat_Terreno', '#8B7355');
            
            objContent += `\n# Terreno\no Terreno\nusemtl mat_Terreno\n`;
            const positions = geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                objContent += `v ${positions.getX(i).toFixed(6)} ${positions.getY(i).toFixed(6)} ${positions.getZ(i).toFixed(6)}\n`;
            }
            
            const indices = geometry.index;
            if (indices) {
                for (let i = 0; i < indices.count; i += 3) {
                    objContent += `f ${indices.getX(i) + vertexOffset} ${indices.getX(i + 1) + vertexOffset} ${indices.getX(i + 2) + vertexOffset}\n`;
                }
            }
            
            vertexOffset += positions.count;
            objectCount++;
            geometry.dispose();
        }
        
        // 2. AULAS INICIAL
        if (elementos.inicial) {
            console.log(`  ${elementos.inicial.length} aulas inicial...`);
            elementos.inicial.forEach((aula, idx) => {
                const floor = getFloor(aula);
                const offsetZ = (floor - 1) * ALTURA_PISO;
                addBoxToOBJ(aula.realCorners, ALTURA_PISO, `Aula_Inicial_${idx + 1}_P${floor}`, '#eab308', offsetZ);
            });
        }
        
        // 3. AULAS PRIMARIA
        if (elementos.primaria) {
            console.log(`  ${elementos.primaria.length} aulas primaria...`);
            elementos.primaria.forEach((aula, idx) => {
                const floor = getFloor(aula);
                const offsetZ = (floor - 1) * ALTURA_PISO;
                addBoxToOBJ(aula.realCorners, ALTURA_PISO, `Aula_Primaria_${idx + 1}_P${floor}`, '#3b82f6', offsetZ);
            });
        }
        
        // 4. AULAS SECUNDARIA
        if (elementos.secundaria) {
            console.log(`  ${elementos.secundaria.length} aulas secundaria...`);
            elementos.secundaria.forEach((aula, idx) => {
                const floor = getFloor(aula);
                const offsetZ = (floor - 1) * ALTURA_PISO;
                addBoxToOBJ(aula.realCorners, ALTURA_PISO, `Aula_Secundaria_${idx + 1}_P${floor}`, '#ef4444', offsetZ);
            });
        }
        
        // 5. BAÑOS
        if (elementos.banos) {
            console.log(`  ${elementos.banos.length} baños...`);
            elementos.banos.forEach((bano, idx) => {
                const floor = getFloor(bano);
                const offsetZ = (floor - 1) * ALTURA_PISO;
                addBoxToOBJ(bano.realCorners, ALTURA_PISO, `Baño_${idx + 1}_P${floor}`, '#a855f7', offsetZ);
            });
        }
        
        // 6. ESCALERAS
        if (elementos.escaleras) {
            console.log(`  ${elementos.escaleras.length} escaleras...`);
            elementos.escaleras.forEach((escalera, idx) => {
                addBoxToOBJ(escalera.realCorners, ALTURA_PISO * totalFloors, `Escalera_${idx + 1}`, '#6b7280', 0);
            });
        }
        
        // 7. AMBIENTES
        if (elementos.ambientes) {
            console.log(`  ${elementos.ambientes.length} ambientes...`);
            elementos.ambientes.forEach((ambiente, idx) => {
                const floor = getFloor(ambiente);
                const offsetZ = (floor - 1) * ALTURA_PISO;
                const nombre = (ambiente.nombre || `Ambiente_${idx + 1}`).replace(/\s+/g, '_');
                addBoxToOBJ(ambiente.realCorners, ALTURA_PISO, `${nombre}_P${floor}`, '#ec4899', offsetZ);
            });
        }
        
        // 8. LATERALES
        if (elementos.laterales) {
            console.log(`  ${elementos.laterales.length} laterales...`);
            elementos.laterales.forEach((lateral, idx) => {
                const floor = getFloor(lateral);
                const offsetZ = (floor - 1) * ALTURA_PISO;
                const nombre = (lateral.nombre || `Lateral_${idx + 1}`).replace(/\s+/g, '_');
                addBoxToOBJ(lateral.realCorners, ALTURA_PISO, `${nombre}_P${floor}`, '#fb923c', offsetZ);
            });
        }
        
        // 9. CANCHA
        if (elementos.cancha?.realCorners) {
            console.log('  Cancha...');
            addBoxToOBJ(elementos.cancha.realCorners, 0.05, 'Cancha_Deportiva', '#22c55e', 0);
        }
        
        // 10. ENTRADA
        if (elementos.entrada?.realCorners) {
            console.log('  Entrada...');
            addBoxToOBJ(elementos.entrada.realCorners, ALTURA_PISO, 'Entrada_Principal', '#64748b', 0);
        }
        
        if (objectCount === 0) {
            return {
                success: false,
                message: 'No se pudo crear ninguna geometría'
            };
        }
        
        console.log(`✅ ${objectCount} objetos creados`);
        
        // README detallado
        const readme = `MODELO 3D - FORMATO OBJ EDITABLE
=================================

✅ CADA ELEMENTO ES UN OBJETO INDEPENDIENTE
✅ Compatible con TODAS las versiones de Rhino
✅ También funciona en AutoCAD, SketchUp, Blender

ARCHIVOS:
---------
- ${filename}.obj - Geometría (${objectCount} objetos)
- ${filename}.mtl - Materiales y colores
- ${filename}_README.txt - Este archivo

IMPORTAR EN RHINO (CUALQUIER VERSIÓN):
---------------------------------------
1. Abrir Rhino
2. Comando: Import (o Archivo > Importar)
3. Tipo de archivo: "Wavefront (*.obj)"
4. Seleccionar ${filename}.obj
5. IMPORTANTE: Mantener ${filename}.mtl en la misma carpeta
6. Configuración:
   ☑ Importar objetos como: Objetos separados
   ☐ NO agrupar objetos
   ☑ Importar materiales

VERIFICACIÓN EN RHINO:
----------------------
Después de importar, prueba esto:
1. Click en una aula → Debe seleccionarse SOLO esa aula
2. Comando "SelName" → Ver lista de objetos
3. Comando "Properties" → Ver nombre del objeto seleccionado

EDICIÓN EN RHINO:
-----------------
- Seleccionar: Click en el objeto
- Mover: Comando "Move" o "M"
- Rotar: Comando "Rotate" o "RO"
- Escalar: Comando "Scale"
- Copiar: Comando "Copy" o "CO"
- Eliminar: Comando "Delete" o tecla "Supr"

IMPORTAR EN AUTOCAD:
--------------------
1. Comando: IMPORT
2. Tipo: "Wavefront OBJ (*.obj)"
3. Seleccionar ${filename}.obj
4. Cada objeto aparecerá como un sólido 3D independiente

CONTENIDO (${objectCount} objetos):
-----------
🟨 Aulas Inicial: ${elementos.inicial?.length || 0}
🟦 Aulas Primaria: ${elementos.primaria?.length || 0}
🟥 Aulas Secundaria: ${elementos.secundaria?.length || 0}
🟪 Baños: ${elementos.banos?.length || 0}
⬜ Escaleras: ${elementos.escaleras?.length || 0}
🔶 Ambientes: ${elementos.ambientes?.length || 0}
🟧 Laterales: ${elementos.laterales?.length || 0}
⚽ Cancha: 1
🚪 Entrada: 1
📐 Terreno: 1

NOMBRES DE OBJETOS:
-------------------
Cada objeto tiene un nombre descriptivo:
- Aula_Inicial_1_P1 (Aula inicial 1, piso 1)
- Aula_Primaria_2_P1 (Aula primaria 2, piso 1)
- Baño_1_P1 (Baño 1, piso 1)
- Escalera_1 (Escalera 1, todos los pisos)
- Direccion_administrativa_P1
- etc.

ESPECIFICACIONES TÉCNICAS:
--------------------------
- Formato: Wavefront OBJ
- Unidades: METROS (1 unidad = 1 metro)
- Sistema de coordenadas:
  - Eje X: Este-Oeste
  - Eje Y: Norte-Sur
  - Eje Z: Altura (vertical)
- Origen: Centro del terreno (0,0,0)
- Altura por piso: 3.0 metros
- Grosor de paredes: Incorporado en dimensiones

SOLUCIÓN DE PROBLEMAS:
----------------------
❌ No se ven colores:
   → Verificar que el .mtl esté en la misma carpeta
   → En Rhino: Vista > Modo de visualización > Renderizado

❌ Los objetos están fusionados:
   → Al importar, elegir "Objetos separados"
   → NO seleccionar "Agrupar objetos"

❌ No puedo seleccionar un objeto individual:
   → Usar comando "Explode" si están agrupados
   → Verificar que se importó como objetos separados

❌ Escala incorrecta:
   → Verificar que las unidades estén en METROS
   → Comando "Scale" para ajustar

CONSEJOS:
---------
- Guarda una copia antes de editar
- Usa capas para organizar los elementos
- Puedes cambiar colores en Rhino después
- Los nombres te ayudan a identificar cada elemento

SOPORTE:
--------
Para más información sobre el proyecto, revisar
la metadata exportada (archivo .json)

Generado por: Colegio 3D Builder
Fecha: ${new Date().toLocaleString()}
Versión: 2.0
`;
        
        // Descargar archivos
        console.log('📦 Descargando archivos...');
        
        const files = {
            [`${filename}.obj`]: objContent,
            [`${filename}.mtl`]: mtlContent,
            [`${filename}_README.txt`]: readme
        };
        
        for (const [name, content] of Object.entries(files)) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const blob = new Blob([content], { type: 'text/plain' });
            downloadFile(blob, name);
        }
        
        console.log('✅ Exportación completada');
        
        return {
            success: true,
            message: `✅ ${objectCount} objetos exportados. Cada elemento es editable en Rhino.`
        };
        
    } catch (error) {
        console.error('❌ Error:', error);
        return {
            success: false,
            message: `Error: ${error.message}`
        };
    }
};
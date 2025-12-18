export const savePerimetersToAPI = async (
	projectId: number,
	perimetros: any,
	distribution: any,

	elementos: any
) => {
	try {
		console.log("📤 Frontend - Preparando datos para enviar:");
		console.log("  - Project ID:", projectId); // ✅ Debe mostrar 552
		console.log("  - Tipo de projectId:", typeof projectId); // ✅ Debe ser "number"

		const resumenGeneral = {
			perimetroTotalColegio: (
				parseFloat(perimetros.inicial?.perimetroTotal || "0") +
				parseFloat(perimetros.primaria?.perimetroTotal || "0") +
				parseFloat(perimetros.secundaria?.perimetroTotal || "0") +
				parseFloat(perimetros.superior?.perimetroTotal || "0") +
				parseFloat(
					perimetros.lateralesCancha?.totales?.perimetroTotal || "0"
				)
			).toFixed(2),
			areaTotalConstruida: (
				parseFloat(perimetros.inicial?.areaPabellon || "0") +
				parseFloat(perimetros.primaria?.areaPabellon || "0") +
				parseFloat(perimetros.secundaria?.areaPabellon || "0") +
				parseFloat(perimetros.superior?.areaPabellon || "0")
			).toFixed(2),
			totalAulas:
				(elementos.inicial?.length || 0) +
				(elementos.primaria?.length || 0) +
				(elementos.secundaria?.length || 0),
			totalAmbientes:
				(elementos.ambientes?.length || 0) +
				(elementos.laterales?.length || 0),
			totalBanos: elementos.banos?.length || 0,
			totalEscaleras: elementos.escaleras?.length || 0,

			areaCancha: elementos.cancha ? 28 * 15 : 0, // Aproximado
		};

		const payload = {
			distribution: {
				layoutMode: distribution.layoutMode || "horizontal",
				totalFloors: distribution.totalFloors || 1,
				capacityInfo: distribution.capacityInfo || {},
			},
			pabellones: {
				inicial: perimetros.inicial || null,
				primaria: perimetros.primaria || null,
				secundaria: perimetros.secundaria || null,
				superior: perimetros.superior || null,
			},
			ambientesCancha: perimetros.lateralesCancha || null,
			resumenGeneral,
		};

		const response = await fetch(
			`http://localhost:8000/api/v1/projects/${projectId}/perimeters`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// "Authorization": `Bearer ${token}` // Si usas auth
				},
				body: JSON.stringify(payload),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Error al guardar perímetros");
		}

		return data;
	} catch (error) {
		console.error("Error al enviar perímetros:", error);
		throw error;
	}
};

// Obtener resumen para costos
export const getCostSummary = async (projectId: number) => {
	try {
		const response = await fetch(
			`/api/projects/${projectId}/perimeters/cost-summary`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Error al obtener resumen");
		}

		return data;
	} catch (error) {
		console.error("Error al obtener resumen de costos:", error);
		throw error;
	}
};

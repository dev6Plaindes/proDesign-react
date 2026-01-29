import axios from "axios";

// ENVIO DE ARCHIVOS Y DATOS ADICIONALES A UN SERVIDOR
export const readMatrizExcel = (file, data) => {
	let form = new FormData();
	form.append("file", file);
	form.append("data", data);

	return axios.post(
		import.meta.env.VITE_API_BASE_URL + "/api/v1/admin/readMatriz",
		// import.meta.env.VITE_READ_EXCEL + "/admin/readMatriz",
		form,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const updateProjectExcelService = async (projectExcelData) => {
	try {
		const response = await axios.post(
			//`${API_BASE_URL}/excel/update-project-excel`,
			import.meta.env.VITE_API_BASE_URL + "/api/v1/excel/costos/calcular",
			projectExcelData,
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error("Error al actualizar Excel:", error);
		throw error;
	}
};

/**
 * Obtiene los datos actuales del Excel (opcional)
 */
export const getProjectExcelDataService = async () => {
	try {
		const response = await axios.get(
			//`${API_BASE_URL}/excel/get-project-excel`
			import.meta.env.VITE_API_BASE_URL +
				"/api/v1/excel/get-project-excel"
		);

		return response.data;
	} catch (error) {
		console.error("Error al obtener datos del Excel:", error);
		throw error;
	}
};

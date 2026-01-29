import { createSlice } from "@reduxjs/toolkit";

// Los valores iniciales por defecto
const initialAmbienceData = {
	aula_psicomotricidad: null,
	aulas_inicial_ciclo1: null,
	aulas_inicial_ciclo2: null,
	aulas_primaria: null,
	aulas_secundaria: null,
	biblioteca: null,
	canchas_deportivas: null,
	cocina: null,
	depositos: null,
	direccion_admin: null,
	innovacion_primaria: null,
	innovacion_secundaria: null,
	laboratorio: null,
	lactario: null,
	quiosco: null,
	sala_profesores: null,
	sala_reuniones: null,
	sshh_admin: null,
	sshh_cocina: null,
	sum_inicial: null,
	sum_prim_sec: null,
	taller_creativo_primaria: null,
	taller_creativo_secundaria: null,
	taller_ept: null,
	topico: null,
};

const initialState = {
	projects: {}, // Aquí guardamos todos los proyectos por ID
	currentProjectId: null, // El proyecto activo
};

export const ambienceSlice = createSlice({
	name: "ambience",
	initialState,
	reducers: {
		// NUEVA: Guardar datos de un proyecto específico
		setProjectAmbienceData: (state, action) => {
			const { projectId, data } = action.payload;
			state.projects[projectId] = {
				...initialAmbienceData,
				...data,
			};
			console.log(`✅ Ambience guardado para proyecto: ${projectId}`);
		},

		// NUEVA: Establecer proyecto activo
		setCurrentProject: (state, action) => {
			state.currentProjectId = action.payload;
		},

		// MANTENER LA ANTIGUA (para no romper nada todavía)
		setAmbienceData: (state, action) => {
			// Por ahora, guardar en un proyecto temporal
			// Luego la quitaremos
			state.projects["temp"] = {
				...initialAmbienceData,
				...action.payload,
			};
			console.warn("⚠️ Usando setAmbienceData antiguo (deprecado)");
		},
	},
});

export const { setProjectAmbienceData, setCurrentProject, setAmbienceData } =
	ambienceSlice.actions;

export default ambienceSlice.reducer;

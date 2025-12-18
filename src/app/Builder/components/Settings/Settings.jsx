import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import MuiButton from "@mui/material/Button";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import LinearProgress from "@mui/material/LinearProgress";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import WindowOutlinedIcon from "@mui/icons-material/WindowOutlined";
import ThreeDRotationOutlinedIcon from "@mui/icons-material/ThreeDRotationOutlined";
import SensorDoorOutlinedIcon from "@mui/icons-material/SensorDoorOutlined";

import {
	toggleDoor,
	toggleRailing,
	toggleWindow,
} from "../../../../redux/projects/projectSlice";
import { addProject } from "../../../../redux/projects/projectSlice";
import { createProjectService } from "../../../../services/projectsService";
import {
	readMatrizExcel,
	updateProjectExcelService,
} from "../../../../services/spreadsheetService";
import { mapFormDataToExcel } from "../../../../utils/excelMapping";
import { setAmbienceData } from "../../../../redux/distribution/ambienceSlice";

import "./styles.css";
import { RowFormAC } from "../../../components/NewProject/RowFormAC";
import { createThumbnail } from "../../../components/NewProject/createThumbnail";
import { UpperLowerCase } from "../../../../utils/utils";

const styleModal = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "white",
	borderRadius: "10px",
	boxShadow: 24,
	width: "400px",
	p: 4,
	"@media (max-width: 768px)": {
		width: "auto",
	},
};

// Ambientes complementarios disponibles
const ambientesComplementarios = [
	{ capacidad: 0, ambienteComplementario: "Sala de Usos Múltiples (SUM)" },
	{ capacidad: 0, ambienteComplementario: "Cocina escolar" },
	{ capacidad: 0, ambienteComplementario: "Comedor" },
	{ capacidad: 0, ambienteComplementario: "Sala de Psicomotricidad" },
	{ capacidad: 0, ambienteComplementario: "Dirección administrativa" },
	{ capacidad: 0, ambienteComplementario: "Sala de maestros" },
	{ capacidad: 0, ambienteComplementario: "Patio Inicial" },
	{ capacidad: 0, ambienteComplementario: "Auditorio multiusos" },
	{ capacidad: 0, ambienteComplementario: "Sala de reuniones" },
	{ capacidad: 0, ambienteComplementario: "Laboratorio" },
	{ capacidad: 0, ambienteComplementario: "Lactario" },
	{ capacidad: 0, ambienteComplementario: "Topico" },
];

const ambientesDefault = [
	{ capacidad: 0, ambienteComplementario: "Biblioteca escolar" },
	{ capacidad: 0, ambienteComplementario: "Taller creativo" },
	{ capacidad: 0, ambienteComplementario: "Taller EPT" },
];

export default function Settings({ projectData, school, handleSetClassrooms }) {
	const [open, setOpen] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Helper function para parsear datos si es necesario
	const parseIfNeeded = (data) => {
		if (!data) return null;
		if (typeof data === "string") {
			try {
				// Primer parse
				let parsed = JSON.parse(data);

				// Si después del parse sigue siendo string, parsear de nuevo (doble escape)
				if (typeof parsed === "string") {
					console.log(
						"⚠️ Detectado doble escape en parseIfNeeded, parseando nuevamente"
					);
					parsed = JSON.parse(parsed);
				}

				return parsed;
			} catch (e) {
				console.error("Error parsing data:", e);
				return null;
			}
		}
		return data;
	};

	// Helper function para convertir a string JSON si es necesario
	const ensureString = (value) => {
		if (value === null || value === undefined) return null;
		if (typeof value === "string") return value;
		return JSON.stringify(value);
	};

	// Función para preparar datos del proyecto antes de enviar al backend
	const prepareProjectData = (baseProject, updates) => {
		console.log("🔧 Preparando datos del proyecto...");
		console.log("Base project:", baseProject);
		console.log("Updates:", updates);

		const prepared = {
			// Copiar campos básicos (strings, numbers)
			name: updates.name || baseProject.name,
			tipologia: baseProject.tipologia,
			ubication: baseProject.ubication,
			departamento: baseProject.departamento,
			provincia: baseProject.provincia,
			distrito: baseProject.distrito,
			client: baseProject.client,
			manager: baseProject.manager,
			zone: baseProject.zone,
			parent_id: updates.parent_id || baseProject.parent_id,
			capacity: baseProject.capacity || 0,
			student: baseProject.student || 0,
			room: baseProject.room || 0,
			height: baseProject.height,
			width: baseProject.width,
			type_id: baseProject.type_id,
			coordenadas: baseProject.coordenadas || "",
			user_id: baseProject.user_id,
			number_floors: baseProject.number_floors,
			sublevel: baseProject.sublevel,
			angle: baseProject.angle,

			// Campos que SIEMPRE deben ser strings JSON
			build_data: ensureString(
				updates.build_data || baseProject.build_data
			),
			level: ensureString(updates.level || baseProject.level),
			stairs: ensureString(updates.stairs || baseProject.stairs),
			toilets_per_student: ensureString(
				updates.toilets_per_student || baseProject.toilets_per_student
			),
			aforo: ensureString(updates.aforo || baseProject.aforo),
			ambientes: ensureString(updates.ambientes || baseProject.ambientes),
			puntos: baseProject.puntos,
			vertices: baseProject.vertices,
			vertices_rectangle: baseProject.vertices_rectangle,
		};

		console.log("✅ Datos preparados:", prepared);
		return prepared;
	};

	// Obtener datos de aforo (puede venir como objeto o string JSON)
	const aforoData = parseIfNeeded(projectData?.aforo);

	// Estados para aforo
	const [inicial, setInicial] = useState(
		aforoData ? !!aforoData.aforoInicial : false
	);
	const [primaria, setPrimaria] = useState(
		aforoData ? !!aforoData.aforoPrimaria : false
	);
	const [secundaria, setSecundaria] = useState(
		aforoData ? !!aforoData.aforoSecundaria : false
	);

	const [aforoInicial, setAforoInicial] = useState(
		aforoData?.aforoInicial || 0
	);
	const [aforoPrimaria, setAforoPrimaria] = useState(
		aforoData?.aforoPrimaria || 0
	);
	const [aforoSecundaria, setAforoSecundaria] = useState(
		aforoData?.aforoSecundaria || 0
	);

	const [aulaInicial, setAulaInicial] = useState(aforoData?.aulaInicial || 0);
	const [aulaPrimaria, setAulaPrimaria] = useState(
		aforoData?.aulaPrimaria || 0
	);
	const [aulaSecundaria, setAulaSecundaria] = useState(
		aforoData?.aulaSecundaria || 0
	);

	// Estados para ambientes complementarios (viene como string JSON)
	const ambientesData = parseIfNeeded(projectData?.ambientes);
	const [rowsAC, setRowsAC] = useState(ambientesData || ambientesDefault);

	// Estado para datos del Excel
	const [dataExcel, setDataExcel] = useState(null);
	const [tableAforo, setTableAforo] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tipo, setTipo] = useState(projectData?.sublevel || "unidocente");
	const [zone, setZone] = useState(projectData?.zone);

	const handleDrawerToggle = () => setOpen(!open);

	// Cargar datos iniciales del Excel si existen
	useEffect(() => {
		if (projectData) {
			const buildData = parseIfNeeded(projectData.build_data);
			if (buildData) {
				const excelData = {
					...buildData,
					levels: parseIfNeeded(projectData.level),
					stairs: parseIfNeeded(projectData.stairs),
					toilets_per_student: parseIfNeeded(
						projectData.toilets_per_student
					),
				};
				setDataExcel(excelData);
				setTableAforo(true);
			}
		}
	}, [projectData]);

	// Función para importar Excel
	const onImportExcel = async (file) => {
		if (!zone) {
			return {
				error: true,
				message: "Se debe tener una zona definida",
			};
		}

		if (!inicial && !primaria && !secundaria) {
			return {
				error: true,
				message: "Se debe seleccionar al menos un nivel",
			};
		}

		var levels = [];
		if (inicial) levels.push("inicial");
		if (primaria) levels.push("primaria");
		if (secundaria) levels.push("secundaria");

		const data = JSON.stringify({
			zone,
			levels,
			type: tipo,
		});

		setLoading(true);

		try {
			const res = await readMatrizExcel(file, data);
			setDataExcel(res.data);
			console.log("datos del excel :: ", res.data);
			setTableAforo(true);
			setLoading(false);
			return { error: false, message: "" };
		} catch (error) {
			setLoading(false);
			return {
				error: true,
				message: "Error al procesar el archivo",
			};
		}
	};

	// Actualizar valores de aforo desde el Excel
	useEffect(() => {
		if (dataExcel && dataExcel.levels) {
			for (var key of Object.keys(dataExcel.levels)) {
				if (key === "inicial") {
					setAforoInicial(dataExcel.levels[key].aforo);
					setAulaInicial(dataExcel.levels[key].aulas);
				} else if (key === "primaria") {
					setAforoPrimaria(dataExcel.levels[key].aforo);
					setAulaPrimaria(dataExcel.levels[key].aulas);
				} else if (key === "secundaria") {
					setAforoSecundaria(dataExcel.levels[key].aforo);
					setAulaSecundaria(dataExcel.levels[key].aulas);
				}
			}
		}
	}, [dataExcel]);

	// Manejadores para ambientes complementarios
	const handleOnChangeAC = (index, name, value) => {
		const copyRowsAC = [...rowsAC];
		copyRowsAC[index] = {
			...copyRowsAC[index],
			[name]: value,
		};
		setRowsAC(copyRowsAC);
	};

	const handleOnAddAC = (ambiente) => {
		const verificador = rowsAC.find(
			(item) => item.ambienteComplementario === ambiente
		);
		if (!verificador && ambiente !== "") {
			setRowsAC([
				...rowsAC,
				{ capacidad: 0, ambienteComplementario: ambiente },
			]);
		}
	};

	const handleOnRemoveAC = (index) => {
		const copyRowsAC = [...rowsAC];
		copyRowsAC.splice(index, 1);
		setRowsAC(copyRowsAC);
	};

	// Función principal para crear nueva versión
	const handleCreateNewVersion = async () => {
		if (!dataExcel) {
			alert(
				"Debe cargar primero un archivo Excel con los datos de aforo"
			);
			return;
		}

		try {
			setLoading(true);

			// 1. Determinar el parent_id y calcular número de versión
			const parentId =
				projectData.parent_id === 0
					? projectData.id
					: projectData.parent_id;

			// Calcular número de versión simple
			// Extraer el número actual de la versión del nombre
			const currentVersionMatch = projectData.name.match(/VERSION (\d+)/);
			const currentVersionNumber = currentVersionMatch
				? parseInt(currentVersionMatch[1])
				: 1;
			const nextVersionNumber = currentVersionNumber + 1;

			console.log(
				`🔢 Versión actual: ${currentVersionNumber}, Creando VERSION ${nextVersionNumber}`
			);

			// 2. Preparar datos de aforo
			const allDataAforo = {
				aforoInicial: aforoInicial,
				aulaInicial: aulaInicial,
				aforoPrimaria: aforoPrimaria,
				aulaPrimaria: aulaPrimaria,
				aforoSecundaria: aforoSecundaria,
				aulaSecundaria: aulaSecundaria,
			};

			// 3. Preparar datos del Excel para el backend
			const projectExcelData = mapFormDataToExcel({
				dataExcel,
				rowsAC,
				aulaInicial,
				aulaPrimaria,
				aulaSecundaria,
			});

			console.log("📊 Datos a enviar al Excel:", projectExcelData);

			// 4. Extraer datos para Redux
			const {
				aula_psicomotricidad,
				aulas_inicial_ciclo1,
				aulas_inicial_ciclo2,
				aulas_primaria,
				aulas_secundaria,
				biblioteca,
				canchas_deportivas,
				cocina,
				depositos,
				direccion_admin,
				laboratorio,
				lactario,
				quiosco,
				innovacion_primaria,
				innovacion_secundaria,
				sala_profesores,
				sala_reuniones,
				sshh_admin,
				sshh_cocina,
				sum_inicial,
				sum_prim_sec,
				taller_creativo_primaria,
				taller_creativo_secundaria,
				taller_ept,
				topico,
			} = projectExcelData;

			// 5. Actualizar Redux con los datos de ambientes
			dispatch(
				setAmbienceData({
					aula_psicomotricidad,
					aulas_inicial_ciclo1,
					aulas_inicial_ciclo2,
					aulas_primaria,
					aulas_secundaria,
					biblioteca,
					canchas_deportivas,
					cocina,
					depositos,
					direccion_admin,
					laboratorio,
					lactario,
					quiosco,
					innovacion_primaria,
					innovacion_secundaria,
					sala_profesores,
					sala_reuniones,
					sshh_admin,
					sshh_cocina,
					sum_inicial,
					sum_prim_sec,
					taller_creativo_primaria,
					taller_creativo_secundaria,
					taller_ept,
					topico,
				})
			);

			// 6. Actualizar el Excel en el backend
			try {
				const excelUpdateResult = await updateProjectExcelService(
					projectExcelData
				);
				console.log(
					"✅ Excel actualizado correctamente:",
					excelUpdateResult
				);
			} catch (excelError) {
				console.error("❌ Error al actualizar Excel:", excelError);
				alert("Advertencia: No se pudo actualizar el Excel");
			}

			// 7. Preparar datos completos para la nueva versión usando prepareProjectData
			const dataComplete = prepareProjectData(projectData, {
				name: `VERSION ${nextVersionNumber}`,
				parent_id: parentId,
				build_data: {
					classroom_measurements: dataExcel.classroom_measurements,
					result_data: dataExcel.result_data || {},
					construction_info: dataExcel.construction_info,
				},
				aforo: allDataAforo,
				ambientes: rowsAC,
				toilets_per_student: dataExcel.toilets_per_student,
				stairs: dataExcel.stairs,
				level: projectData.level,
			});

			console.log("📦 Datos a enviar al backend:", dataComplete);

			// 8. Crear nueva versión usando createProjectService
			const response = await createProjectService(dataComplete);
			const createdVersion = response.data.project;

			if (createdVersion) {
				console.log(
					`✅ VERSION ${nextVersionNumber} creada exitosamente`
				);

				// 9. Crear thumbnail
				createThumbnail(createdVersion.id);

				// 10. Actualizar Redux
				dispatch(addProject({ child: createdVersion }));

				setLoading(false);

				// 11. Mostrar mensaje de éxito
				alert(`✅ VERSION ${nextVersionNumber} creada exitosamente`);
				handleDrawerToggle();

				// 12. Navegar a la nueva versión
				navigate(`/project/${createdVersion.id}`);
			}
		} catch (error) {
			console.error("❌ Error al crear nueva versión:", error);
			setLoading(false);
			alert(
				`Error al crear nueva versión: ${
					error.message || "Error desconocido"
				}`
			);
		}
	};

	console.log("rowSAC::", typeof rowsAC);

	return (
		<>
			<StyledButton onClick={handleDrawerToggle}>
				<SettingsIcon htmlColor="#3699FF" />
				&nbsp; Ajustes
			</StyledButton>

			<Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
				<DrawerHeader>
					<h3>Configuración del Proyecto</h3>
					<IconButton onClick={() => setOpen(false)}>
						<CloseOutlinedIcon />
					</IconButton>
				</DrawerHeader>
				<Divider />

				{loading && <LinearProgress color="secondary" />}

				<Box
					sx={{
						minWidth: 450,
						maxWidth: 500,
						padding: "20px 24px",
						overflowY: "auto",
						maxHeight: "calc(100vh - 100px)",
					}}
				>
					{/* Información Actual del Proyecto */}
					<Box
						sx={{
							mb: 3,
							p: 2,
							bgcolor: "grey.50",
							borderRadius: 2,
						}}
					>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							gutterBottom
						>
							PROYECTO ACTUAL
						</Typography>
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							{projectData?.name}
						</Typography>
						<Grid container spacing={1}>
							<Grid item xs={6}>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									Zona:
								</Typography>
								<Typography variant="body2" fontWeight="500">
									{UpperLowerCase(projectData?.zone || "N/A")}
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									Tipo:
								</Typography>
								<Typography variant="body2" fontWeight="500">
									{UpperLowerCase(
										projectData?.sublevel || "N/A"
									)}
								</Typography>
							</Grid>
						</Grid>
					</Box>

					<Divider sx={{ mb: 3 }} />

					{/* Sección de Aforo */}
					<Typography
						variant="h6"
						gutterBottom
						sx={{ fontWeight: "bold", mb: 2 }}
					>
						AFORO ACTUAL
					</Typography>

					{/* Mostrar valores actuales */}
					{!tableAforo && aforoData && (
						<Box
							sx={{
								mb: 2,
								p: 2,
								bgcolor: "#e3f2fd",
								borderRadius: 1,
							}}
						>
							<Typography
								variant="body2"
								color="text.secondary"
								gutterBottom
							>
								Valores actuales del proyecto:
							</Typography>
							<Grid container spacing={1}>
								{aforoData.aforoInicial > 0 && (
									<Grid item xs={12}>
										<Typography variant="body2">
											<strong>Inicial:</strong>{" "}
											{aforoData.aforoInicial} alumnos -{" "}
											{aforoData.aulaInicial} aulas
										</Typography>
									</Grid>
								)}
								{aforoData.aforoPrimaria > 0 && (
									<Grid item xs={12}>
										<Typography variant="body2">
											<strong>Primaria:</strong>{" "}
											{aforoData.aforoPrimaria} alumnos -{" "}
											{aforoData.aulaPrimaria} aulas
										</Typography>
									</Grid>
								)}
								{aforoData.aforoSecundaria > 0 && (
									<Grid item xs={12}>
										<Typography variant="body2">
											<strong>Secundaria:</strong>{" "}
											{aforoData.aforoSecundaria} alumnos
											- {aforoData.aulaSecundaria} aulas
										</Typography>
									</Grid>
								)}
							</Grid>
						</Box>
					)}

					<FileButtonModal onImportExcel={onImportExcel} />

					{tableAforo && (inicial || primaria || secundaria) && (
						<Box sx={{ mt: 3 }}>
							<Grid container mb=".5rem" alignItems="center">
								<Grid item xs={4} textAlign="center">
									<Typography
										variant="body2"
										fontWeight="bold"
									>
										GRADO
									</Typography>
								</Grid>
								<Grid item xs={4} textAlign="center">
									<Typography
										variant="body2"
										fontWeight="bold"
									>
										AFORO POR GRADO
									</Typography>
								</Grid>
								<Grid item xs={4} textAlign="center">
									<Typography
										variant="body2"
										fontWeight="bold"
									>
										CANTIDAD DE AULAS
									</Typography>
								</Grid>
							</Grid>

							{inicial &&
								nivelGrid("INICIAL", aforoInicial, aulaInicial)}
							{primaria &&
								nivelGrid(
									"PRIMARIA",
									aforoPrimaria,
									aulaPrimaria
								)}
							{secundaria &&
								nivelGrid(
									"SECUNDARIA",
									aforoSecundaria,
									aulaSecundaria
								)}
						</Box>
					)}

					<Divider sx={{ my: 3 }} />

					{/* Sección de Ambientes Complementarios */}
					<Typography
						variant="h6"
						gutterBottom
						sx={{ fontWeight: "bold", mb: 2 }}
					>
						AMBIENTES COMPLEMENTARIOS
					</Typography>

					{/* Mostrar ambientes actuales */}

					<Box sx={{ mb: 2 }}>
						<select
							style={{
								width: "100%",
								padding: "8px",
								borderRadius: "4px",
								border: "1px solid #ccc",
							}}
							onChange={(e) => handleOnAddAC(e.target.value)}
							value=""
						>
							<option value="">Seleccione un ambiente</option>
							{ambientesComplementarios.map((ambiente) => (
								<option
									key={ambiente.ambienteComplementario}
									value={ambiente.ambienteComplementario}
								>
									{UpperLowerCase(
										ambiente.ambienteComplementario
									)}
								</option>
							))}
						</select>
					</Box>

					{rowsAC.length > 0 && (
						<Box>
							<Grid container spacing={1} sx={{ mb: 1 }}>
								<Box
									sx={{
										mb: 2,
										p: 2,
										bgcolor: "#e8f5e9",
										borderRadius: 1,
									}}
								>
									<Typography
										variant="body2"
										fontWeight="bold"
									>
										AMBIENTES ACTUALES
									</Typography>
								</Box>
							</Grid>

							{rowsAC.map((row, index) => (
								<RowFormAC
									key={index}
									{...row}
									onChange={(name, value) =>
										handleOnChangeAC(index, name, value)
									}
									onRemove={() => handleOnRemoveAC(index)}
									disabledDeleted={index}
								/>
							))}
						</Box>
					)}

					<Divider sx={{ my: 3 }} />

					{/* Sección de Visualización */}
					<Typography
						variant="h6"
						gutterBottom
						sx={{ fontWeight: "bold", mb: 2 }}
					>
						VISUALIZACIÓN
					</Typography>

					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							mb: 3,
						}}
					>
						<ToggleButtonsMultiple />
					</Box>

					{/* Botón para crear nueva versión */}
					<Box sx={{ mt: 4, display: "flex", gap: 2 }}>
						<Button
							variant="outlined"
							fullWidth
							onClick={handleDrawerToggle}
						>
							Cancelar
						</Button>
						<Button
							variant="contained"
							color="success"
							fullWidth
							onClick={handleCreateNewVersion}
							disabled={loading || !dataExcel}
						>
							Crear Nueva Versión
						</Button>
					</Box>
				</Box>
			</Drawer>
		</>
	);
}

// Componente para el botón de carga de Excel
function FileButtonModal({ onImportExcel }) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleToggleLoading = () => setLoading((prev) => !prev);

	const handleChange = async (evt) => {
		const file = evt.target.files[0];
		if (!file) return;

		handleToggleLoading();
		const { error, message } = await onImportExcel(file);
		handleToggleLoading();

		if (error) {
			handleClose();
			return alert(message);
		}

		handleClose();
	};

	return (
		<>
			{loading && <LinearProgress color="secondary" />}

			<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpen}
					size="small"
				>
					Actualizar Aforo
				</Button>
			</Box>

			<Modal
				aria-labelledby="transition-modal-title"
				aria-describedby="transition-modal-description"
				open={open}
				onClose={handleClose}
				closeAfterTransition
			>
				<Fade in={open}>
					<Box sx={styleModal}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<Typography variant="h6">
									Actualizar Aforo
								</Typography>
							</Grid>

							<Grid item xs={12}>
								<input
									type="file"
									accept=".xlsx, .xls"
									onChange={handleChange}
									style={{ display: "none" }}
									id="button_file_settings"
								/>
								<label htmlFor="button_file_settings">
									<Button
										variant="outlined"
										component="span"
										fullWidth
									>
										Subir Archivo
									</Button>
								</label>
							</Grid>

							<Grid item xs={12}>
								<a
									href="/descargas/template_project.xlsx"
									download="Plantilla del Proyecto.xlsx"
									style={{ textDecoration: "none" }}
								>
									<Button
										variant="contained"
										color="primary"
										fullWidth
									>
										Descargar Plantilla
									</Button>
								</a>
							</Grid>

							<Grid item xs={12}>
								<Button
									variant="outlined"
									color="secondary"
									fullWidth
									onClick={handleClose}
								>
									Cerrar
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Fade>
			</Modal>
		</>
	);
}

// Componente para mostrar niveles
const nivelGrid = (label, aforo, aula) => {
	return (
		<Grid container spacing={2} marginBottom="1rem">
			<Grid item xs={4}>
				<input
					style={{
						width: "100%",
						padding: "8px",
						textAlign: "center",
						fontSize: "14px",
						border: "1px solid #ccc",
						borderRadius: "4px",
					}}
					type="text"
					value={label}
					disabled
				/>
			</Grid>
			<Grid item xs={4}>
				<input
					style={{
						width: "100%",
						padding: "8px",
						textAlign: "center",
						fontSize: "14px",
						border: "1px solid #ccc",
						borderRadius: "4px",
					}}
					value={aforo}
					disabled
				/>
			</Grid>
			<Grid item xs={4}>
				<input
					style={{
						width: "100%",
						padding: "8px",
						textAlign: "center",
						fontSize: "14px",
						border: "1px solid #ccc",
						borderRadius: "4px",
					}}
					value={aula}
					disabled
				/>
			</Grid>
		</Grid>
	);
};

// Componente para botones de visualización
function ToggleButtonsMultiple() {
	const [formats, setFormats] = useState(
		() => JSON.parse(localStorage.getItem("load")) || []
	);
	const dispatch = useDispatch();

	const handleFormat = (event, newFormats) => {
		localStorage.setItem("load", JSON.stringify(newFormats));
		setFormats(newFormats);
	};

	return (
		<ToggleButtonGroup value={formats} onChange={handleFormat}>
			<ToggleButton value="door" onClick={() => dispatch(toggleDoor())}>
				<SensorDoorOutlinedIcon />
			</ToggleButton>
			<ToggleButton
				value="window"
				onClick={() => dispatch(toggleWindow())}
			>
				<WindowOutlinedIcon />
			</ToggleButton>
			<ToggleButton
				value="railing"
				onClick={() => dispatch(toggleRailing())}
			>
				<ThreeDRotationOutlinedIcon />
			</ToggleButton>
		</ToggleButtonGroup>
	);
}

// Styled Components
const StyledButton = styled(MuiButton)({
	borderRadius: ".42rem",
	color: "#3F4254",
	padding: ".60rem 1rem",
	fontFamily: "inherit",
	textTransform: "none",
	border: "1px solid #E4E6EF",
	margin: ".3rem .4rem",
	boxShadow: "none",
	backgroundColor: "#E4E6EF",
	"&:hover": {
		backgroundColor: "#d8dbe8",
	},
});

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: "0px 1.5rem",
	...theme.mixins.toolbar,
}));

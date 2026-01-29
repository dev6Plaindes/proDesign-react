import { useState, useEffect, forwardRef, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, useField } from "formik";

import {
	Chart,
	ScatterController,
	LineController,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from "chart.js";

import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/system/Box";
import Fade from "@mui/material/Fade";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { UpperLowerCase } from "../../../utils/utils";

import * as yup from "yup";
import { RowFormAC } from "./RowFormAC";
import { request } from "../../../utils/arqPlataformAxios";
import {
	readMatrizExcel,
	updateProjectExcelService,
} from "../../../services/spreadsheetService";

import {
	createProjectService,
	updateProjectService,
} from "../../../services/projectsService";
import { addProject, setProjects } from "../../../redux/projects/projectSlice";
import { createThumbnail } from "./createThumbnail";

import * as XLSX from "xlsx";
import TerrainDataTable from "./TerrainDataTable";

import MaxRectangle from "../GridData/MaxRectangle";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	Card,
	CardContent,
	Paper,
	Chip,
} from "@mui/material";

import { mapFormDataToExcel } from "../../../utils/excelMapping";
import { setAmbienceData } from "../../../redux/distribution/ambienceSlice";
import { height, width } from "@mui/system";
import axios from "axios";
Chart.register(
	ScatterController,
	LineController,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
);

const NewProjectForm = forwardRef(
	({ data, handleClose, handleShow, school }, ref) => {
		const id = useSelector((state) => state.auth.uid);
		const [rows, setRows] = useState(
			data?.puntos
				? JSON.parse(data?.puntos)
				: [{ ...defaultState, vertice: "P1" }]
						.concat({ ...defaultState, vertice: "P2" })
						.concat({ ...defaultState, vertice: "P3" })
		);
		const [rowsAC, setRowsAC] = useState(ambientesDefault);
		const [tipo, setTipo] = useState(data?.sublevel || "unidocente");
		const [zone, setZone] = useState(data?.zone);
		const [aulaInicial, setAulaInicial] = useState(
			data?.aforo ? JSON.parse(data?.aforo).aulaInicial : 0
		);
		const [aforoPrimaria, setAforoPrimaria] = useState(
			data?.aforo ? JSON.parse(data?.aforo).aforoPrimaria : 0
		);
		const [aforoSecundaria, setAforoSecundaria] = useState(
			data?.aforo ? JSON.parse(data?.aforo).aforoSecundaria : 0
		);
		const [aforoInicial, setAforoInicial] = useState(
			data?.aforo ? JSON.parse(data?.aforo).aforoInicial : 0
		);
		const [aulaPrimaria, setAulaPrimaria] = useState(
			data?.aforo ? JSON.parse(data?.aforo).aulaPrimaria : 0
		);
		const [aulaSecundaria, setAulaSecundaria] = useState(
			data?.aforo ? JSON.parse(data?.aforo).aulaSecundaria : 0
		);
		const x = {
			...(data && JSON.parse(data.build_data)),
			levels: data && JSON.parse(data.level),
			stairs: data && JSON.parse(data.stairs),
			toilets_per_student: data && JSON.parse(data.toilets_per_student),
		};
		const [dataExcel, setDataExcel] = useState(x);
		const [inicial, setInicial] = useState(
			data?.aforo ? !!JSON.parse(data?.aforo).aforoInicial : false
		);
		const [cicloI, setCicloI] = useState(false);
		const [cicloII, setCicloII] = useState(false);
		const [primaria, setPrimaria] = useState(
			data?.aforo ? !!JSON.parse(data?.aforo).aforoPrimaria : false
		);
		const [secundaria, setSecundaria] = useState(
			data?.aforo ? !!JSON.parse(data?.aforo).aforoSecundaria : false
		);
		const [numberFloors, setNumberFloors] = useState("");
		const [zonas, setZonas] = useState();
		const [step, setStep] = useState(1);
		const [plantillas, setPlantillas] = useState([]);
		const location = useLocation();
		const slug = location.pathname.split("/")[2];
		const [createdProject, setCreatedProject] = useState();

		const [tableAforo, setTableAforo] = useState(false);
		const [selectedTipologia, setSelectedTipologia] = useState("");
		const [vertices, setVertices] = useState([]);
		const [verticesGrafic, setVerticesGrafic] = useState([]);
		const [maximumRectangle, setMaximumRectangle] = useState([]);
		const [loading, setLoading] = useState(false);
		const [showButtonTerrain, setShowButtonTerrain] = useState(true);
		const [exclutedVertices, setExclutedVertices] = useState([]);
		const [priorityVertices, setPriorityVertices] = useState([]);
		const [openDialog, setOpenDialog] = useState(false);
		const [openDialogMax, setOpenDialogMax] = useState(false);
		const [openDialogPriority, setOpenDialogPriority] = useState(false);
		const [departamentos, setDepartamentos] = useState([]);
		const [provincias, setProvincias] = useState([]);
		const [distritos, setDistritos] = useState([]);
		const [allData, setAllData] = useState(null);
		const navigate = useNavigate();

		//console.log("esto es dataexcel", dataExcel);
		const handleClickOpenDialog = () => {
			setOpenDialog(true);
		};
		//CONTROLADOR PARA CERRAR EL MODAL DE AREA DEL TERRENO
		const handleCloseDialog = () => {
			setOpenDialog(false);
		};
		//CONTROLADOR PARA ABRIR EL MODAL DEL CUADRANTE MAXIMO
		const handleClickOpenDialogMax = () => {
			setOpenDialogMax(true);
		};
		//CONTROLADOR PARA CERRAR EL MODAL DEL CUADRANTE MAXIMO
		const handleCloseDialogMax = () => {
			setOpenDialogMax(false);
		};
		const handleClickOpenDialogPriority = () => {
			setOpenDialogPriority(true);
		};
		const handleCloseDialogPriority = () => {
			setOpenDialogPriority(false);
		};
		const dispatch = useDispatch();
		//CONTROLADOR PARA GUARDAR LAS VERTICES EXCLUYENTES
		const handleExcludedChange = (exclusions) => {
			setExclutedVertices(exclusions);
		};
		//CONTROLADOR PARA GUARDAR LAS VERTICES PRIORITARIAS
		const handlePriorityChange = (priority) => {
			setPriorityVertices(priority);
		};
		//CONTROLADOR PARA SETEAR TIPOLOGIA
		const handleChangeTipology = (event) => {
			setSelectedTipologia(event.target.value);
		};
		//PETICION PARA OBTENER LOS PROYECTOS
		const getTypeProject = async () => {
			const data = await request({
				url: `/api/v1/typeProject/${slug}`,
				method: "GET",
			});
			setPlantillas(data.data[0]);
		};

		useEffect(() => {
			getTypeProject();
			return () => handleShow({ show: true });
		}, []);

		useEffect(() => {
			const fetchData = async () => {
				try {
					const response = await axios.get(
						"https://free.e-api.net.pe/ubigeos.json"
					);
					setAllData(response.data);

					//Extraer departamentos únicos
					const depts = Object.keys(response.data).sort();
					setDepartamentos(depts);
				} catch (error) {
					console.error("Error fetching ubigeos:", error);
				}
			};

			fetchData();
		}, []);

		const initialValues = {
			name: "",
			tipologia: "Educacion",
			ubication: data?.ubication || "",
			departamento: data?.departamento || "",
			provincia: data?.provincia || "",
			distrito: data?.distrito || "",
			client: data?.client || "",
			manager: data?.manager || "",
			zone: data?.zone || "",
			parent_id: data?.parent_id == 0 ? data.id : data?.parent_id || 0,
			capacity: 0,
			student: 0,
			room: 0,
			height: 0,
			width: 0,
			type_id: data?.type_id || 1,
			coordenadas: "",
		};

		//Obtener las zonas desde el api
		const getZones = async () => {
			const data = await request({ url: "/api/v1/zones", method: "GET" });
			setZonas(data.data.zones);
		};

		useEffect(() => {
			getZones();
		}, []);

		// Obtener la tipologia,
		const typology = [
			{
				name: "Educacion",
			},
			{
				name: "Salud",
			},
			{
				name: "Vial",
			},
			{
				name: "Riego",
			},

			{
				name: "Otros",
			},
		];

		// Leer el excel y colocar en la columna de aulas
		useEffect(() => {
			if (dataExcel) {
				if (dataExcel.levels) {
					for (var key of Object.keys(dataExcel.levels)) {
						// cambiar
						if (key === "inicial") {
							setAforoInicial(dataExcel.levels[key].aforo);
							setAulaInicial(dataExcel.levels[key].aulas);
							setInicial(true);
						} else if (key === "primaria") {
							setAforoPrimaria(dataExcel.levels[key].aforo);
							setAulaPrimaria(dataExcel.levels[key].aulas);
							setPrimaria(true);
						} else if (key === "secundaria") {
							setAforoSecundaria(dataExcel.levels[key].aforo);
							setAulaSecundaria(dataExcel.levels[key].aulas);
							setSecundaria(true);
						}
					}
				}
			}
		}, [dataExcel]);

		// Se agrega automaticamente el lado y el vertice segun se agregue nuevo campo
		for (let index = 0; index < rows.length; index++) {
			rows[index].vertice = `P${index + 1}`;
			rows[index].lado = `P${index + 1} - P${index + 2}`;
		}
		const handleChange = (event) => {
			setTipo(event.target.value);
		};

		const handleChangeFloors = (e) => {
			setNumberFloors(e.target.value);
		};

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

		const Select = ({ label, ...props }) => {
			const [field, meta] = useField(props);

			return (
				<div>
					<label htmlFor={props.id || props.name}>{label}</label>
					<select
						{...field}
						onChangeCapture={(evt) => setZone(evt.target.value)}
						{...props}
					/>
					{meta.touched && meta.error ? (
						<div style={styleError}>{meta.error}</div>
					) : null}
				</div>
			);
		};

		const allDataAforo = {
			aforoInicial: aforoInicial,
			aulaInicial: aulaInicial,
			aforoPrimaria: aforoPrimaria,
			aulaPrimaria: aulaPrimaria,
			aforoSecundaria: aforoSecundaria,
			aulaSecundaria: aulaSecundaria,
		};
		const onImportExcel = async (
			file,
			handleToggleLoading,
			handleClose
		) => {
			if (!zone)
				return {
					error: true,
					message: "Se debe seleccionar una zona  -  test",
				};
			if (!inicial && !primaria && !secundaria)
				return {
					error: true,
					message: "Se debe seleccionar al menos un nivel  -  test",
				};

			var levels = [];

			if (inicial) levels.push("inicial");
			if (primaria) levels.push("primaria");
			if (secundaria) levels.push("secundaria");

			const data = JSON.stringify({
				zone,
				levels,
				type: tipo,
			});

			handleClose();
			handleToggleLoading();

			const res = await readMatrizExcel(file, data); // servicio de la hoja de calculo
			setDataExcel(res.data);
			console.log("datos del excel :: ", res.data);
			setTableAforo(true);
			handleToggleLoading();
			return { error: false, message: "" };
		};

		const onSubmit = async (values) => {
			let levels = [];

			aulaInicial && levels.push("Inicial");
			aulaPrimaria && levels.push("Primaria");
			aulaSecundaria && levels.push("Secundaria");

			const verticesArray = vertices.map(({ x, y }) => [x, y]);
			// const verticesMaximumRectangle = {
			// 	vertices: maximumRectangle.vertices,
			// 	ancho: maximumRectangle.ancho,
			// 	alto: maximumRectangle.alto,
			// 	area: maximumRectangle.area,
			// };
			const verticesMaximumRectangle = maximumRectangle.vertices;
			const angleMaximumRectangle = maximumRectangle.anguloGrados;
			const availableVertices = verticesArray.filter(
				([x, y]) =>
					!exclutedVertices.some(([vx, vy]) => vx === x && vy === y)
			);

			const dataComplete = {
				...values,
				build_data: JSON.stringify({
					classroom_measurements: dataExcel.classroom_measurements,
					result_data: dataExcel.result_data || {},
					construction_info: dataExcel.construction_info,
				}),
				toilets_per_student: JSON.stringify(
					dataExcel.toilets_per_student
				),
				width: maximumRectangle.ancho,
				height: maximumRectangle.alto,
				//area: maximumRectangle.area,
				number_floors: numberFloors,
				stairs: JSON.stringify(dataExcel.stairs),
				//ubication: values.ubication,
				// departamento: values.departamento,
				// distrito: values.distrito,
				// provincia: values.provincia,
				level: JSON.stringify(levels),
				puntos: JSON.stringify(rows),
				aforo: JSON.stringify(allDataAforo),
				ambientes: rowsAC,
				sublevel: tipo,
				vertices: verticesArray,
				vertices_rectangle: verticesMaximumRectangle,
				angle: angleMaximumRectangle,
				//coordenadas: document.getElementById("coordenadas").value,
				user_id: id,
				type_id: plantillas?.id,
			};

			console.log("dataComplete", dataComplete);

			const projectExcelData = mapFormDataToExcel({
				dataExcel,
				rowsAC,
				aulaInicial,
				aulaPrimaria,
				aulaSecundaria,
			});

			console.log("📊 Datos a enviar al Excel:", projectExcelData);
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

			// ========================================
			// PASO 3: Actualizar el Excel del backend
			// ========================================
			try {
				const excelUpdateResult = await updateProjectExcelService(
					projectExcelData
				);
				console.log(
					"✅ Excel actualizado correctamente:",
					excelUpdateResult
				);

				// Opcional: Puedes guardar los resultados calculados si los necesitas
				// setCalculatedMeters(excelUpdateResult.data.calculated_results);
			} catch (excelError) {
				console.error("❌ Error al actualizar Excel:", excelError);

				// Decide si continuar o abortar la creación del proyecto
				// Opción 1: Mostrar error pero continuar
				alert(
					"Advertencia: No se pudo actualizar el Excel, pero el proyecto se creará de todas formas."
				);
			}
			const data = await createProjectService(dataComplete);

			// cuando se crea un nuevo projecto y su version 1 (automaticamente)
			if (data.data.project.parent_id === 0) {
				const dataHijo = await createProjectService({
					...dataComplete,
					parent_id: data.data.project.id,
					name: "VERSION 1",
				});

				if (!!dataHijo.data.project) {
					createThumbnail(dataHijo.data.project.id);
					dispatch(
						addProject({
							parent: data.data.project,
							child: dataHijo.data.project,
						})
					);
					setCreatedProject(dataHijo.data.project);
					setStep(2);

					handleShow({ show: false, id: dataHijo.data.project.id });
				}
			}
			// cuando se crea una nueva version desde una projecto existente
			else {
				createThumbnail(data.data.project.id);
				dispatch(addProject({ child: data.data.project }));
				setCreatedProject(data.data.project);
				setStep(2);

				handleShow({ show: false, id: data.data.project.id });
			}
			navigate("/");
		};

		const onImportVerticesExcel = (
			file,
			handleToggleLoading,
			handleClose
		) => {
			return new Promise((resolve) => {
				if (!file) {
					resolve({
						error: true,
						message: "No se ha seleccionado ningún archivo.",
					});
					return;
				}

				handleToggleLoading(); // Activa el loading
				const reader = new FileReader();

				reader.onload = (e) => {
					try {
						const data = new Uint8Array(e.target.result);
						const workbook = XLSX.read(data, { type: "array" });
						const sheetName = workbook.SheetNames[0]; // Tomamos la primera hoja
						const sheet = workbook.Sheets[sheetName];
						const jsonData = XLSX.utils.sheet_to_json(sheet, {
							header: 1,
						}); // Convertir a JSON

						//? Ajustar índice de filas para saltar encabezados (verifica si es fila 4 o 3)

						const verticesFile = jsonData
							.slice(2) // Ignorar filas de encabezado
							.filter((row) => row.length >= 3) // Asegurar que tiene al menos 3 columnas
							.map((row, index) => {
								return {
									id: row[1],
									x: Number(row[2]),
									y: Number(row[3]),
								};
							});

						if (verticesFile.length > 1) {
							verticesFile.pop();
						}

						const verticesGrafic = jsonData
							.slice(2) // Ignorar filas de encabezado
							.filter((row) => row.length >= 3) // Asegurar que tiene al menos 3 columnas
							.map((row, index) => {
								return [Number(row[2]), Number(row[3])];
							});
						if (verticesGrafic.length > 0) {
							verticesGrafic.push([...verticesGrafic[0]]);
						}

						if (verticesGrafic.length > 2) {
							verticesGrafic.splice(verticesGrafic.length - 2, 1);
						}
						// console.log("vertices", verticesFile);
						// console.log("verticesgrafic", verticesGrafic);
						setVertices(verticesFile); // Guardar los vértices en el estado
						setVerticesGrafic(verticesGrafic);
						setLoading(true);
						handleToggleLoading(); // Desactiva el loading
						handleClose(); // Cierra el modal
						resolve({
							error: false,
							message: "Archivo cargado exitosamente.",
						});
					} catch (err) {
						handleToggleLoading();
						resolve({
							error: true,
							message: "Error al procesar el archivo.",
						});
					}
				};

				reader.readAsArrayBuffer(file); // Leer el archivo como buffer
			});
		};

		return (
			<>
				{step === 1 && (
					<Formik
						initialValues={initialValues}
						onSubmit={onSubmit}
						validationSchema={validationSchema}
						innerRef={ref}
					>
						{({ errors, touched, values, setFieldValue }) => {
							const handleDepartamentoChange = (e) => {
								const dept = e.target.value;
								setFieldValue("departamento", dept);
								setFieldValue("ubication", "");
								setFieldValue("distrito", "");
								setDistritos([]);

								if (allData && allData[dept]) {
									const provs = Object.keys(
										allData[dept]
									).sort();
									setProvincias(provs);
								} else {
									setProvincias([]);
								}
							};

							// Handler para provincia
							const handleProvinciaChange = (e) => {
								const prov = e.target.value;
								setFieldValue("ubication", prov);
								setFieldValue("distrito", "");

								if (
									allData &&
									allData[values.departamento] &&
									allData[values.departamento][prov]
								) {
									const dists = Object.keys(
										allData[values.departamento][prov]
									).sort();
									setDistritos(dists);
								} else {
									setDistritos([]);
								}
							};
							return (
								<Form>
									<Grid container spacing={{ xs: 2, sm: 3 }}>
										<Grid item xs={12}>
											<span>NOMBRE:</span>
											<Field
												type="text"
												name="name"
												placeholder={`${
													data?.name
														? data.name
														: "Ingrese nombre del proyecto"
												}`}
												autoComplete="off"
												style={{
													...styleInput,
													marginTop: ".5rem",
												}}
											/>
											{touched.name ? (
												<div style={styleError}>
													{errors.name}
												</div>
											) : null}
											{/* <ErrorMessage name="email" component="div" /> */}
										</Grid>
										<Grid item xs={12} sm={6}>
											<Select
												style={styleInput}
												name="tipologia"
												label="TIPOLOGIA"
											>
												<option value="">
													Seleccione una tipologia
												</option>
												{typology?.map((typo) => (
													<option
														key={typo.name}
														value={typo.name}
													>
														{UpperLowerCase(
															typo.name
														)}
													</option>
												))}
											</Select>
										</Grid>

										<Grid item xs={12} sm={6}>
											<Select
												style={styleInput}
												name="zone"
												label="ZONA"
											>
												<option value="">
													Seleccione una zona
												</option>
												{zonas?.map((zona) => (
													<option
														key={zona.id}
														value={zona.name}
													>
														{UpperLowerCase(
															zona.name
														)}
													</option>
												))}
											</Select>
										</Grid>

										<Grid
											item
											xs={inicial ? 4 : 6}
											sx={{ mt: 2 }}
										>
											<span
												style={{ fontWeight: "bold" }}
											>
												NIVEL:
											</span>
											<div
												role="group"
												style={{
													display: "flex",
													flexDirection: "column",
													gap: "8px",
												}}
											>
												<label
													style={{
														display: "flex",
														alignItems: "center",
														gap: "8px",
													}}
												>
													<Checkbox
														checked={inicial}
														onClick={() =>
															setInicial(!inicial)
														}
													/>
													Inicial
												</label>
												<label
													style={{
														display: "flex",
														alignItems: "center",
														gap: "8px",
													}}
												>
													<Checkbox
														checked={primaria}
														onClick={() =>
															setPrimaria(
																!primaria
															)
														}
													/>
													Primaria
												</label>
												<label
													style={{
														display: "flex",
														alignItems: "center",
														gap: "8px",
													}}
												>
													<Checkbox
														checked={secundaria}
														onClick={() =>
															setSecundaria(
																!secundaria
															)
														}
													/>
													Secundaria
												</label>
											</div>
										</Grid>
										{/* CHECKBOXS DE LOS CICLOS */}
										{inicial && (
											<Grid item xs={4} sx={{ mt: 2 }}>
												<span
													style={{
														fontWeight: "bold",
													}}
												>
													CICLOS:
												</span>
												<div
													role="group"
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "8px",
													}}
												>
													<label
														style={{
															display: "flex",
															alignItems:
																"center",
															gap: "8px",
														}}
													>
														<Checkbox
															checked={cicloI}
															onClick={() =>
																setCicloI(
																	!cicloI
																)
															}
														/>
														Ciclo I
													</label>
													<label
														style={{
															display: "flex",
															alignItems:
																"center",
															gap: "8px",
														}}
													>
														<Checkbox
															checked={cicloII}
															onClick={() =>
																setCicloII(
																	!cicloII
																)
															}
														/>
														Ciclo II
													</label>
												</div>
											</Grid>
										)}

										<Grid
											item
											xs={inicial ? 4 : 6}
											sx={{ mt: 2 }}
										>
											<span
												style={{ fontWeight: "bold" }}
											>
												TIPO:
											</span>
											<RadioGroup
												aria-labelledby="demo-radio-buttons-group-label"
												name="radio-buttons-group"
												onChange={handleChange}
												value={tipo}
											>
												<FormControlLabel
													value="unidocente"
													control={<Radio />}
													label="UNIDOCENTE"
													sx={{
														fontSize: "0.875rem",
													}}
												/>
												<FormControlLabel
													value="polidocente multigrado"
													control={<Radio />}
													label="POLIDOCENTE MULTIGRADO"
													sx={{
														fontSize: "0.875rem",
													}}
												/>
												<FormControlLabel
													value="polidocente completo"
													control={<Radio />}
													label="POLIDOCENTE COMPLETO"
													sx={{
														fontSize: "0.875rem",
													}}
												/>
											</RadioGroup>
										</Grid>

										<Grid item xs={6} sx={{ mt: 2 }}>
											<span
												style={{ fontWeight: "bold" }}
											>
												NUMERO DE PISOS:
											</span>
											<RadioGroup
												aria-label="pisos"
												name="pisos"
												onChange={handleChangeFloors}
												value={numberFloors}
											>
												<FormControlLabel
													value="1"
													control={<Radio />}
													label="1"
													sx={{
														fontSize: "0.875rem",
													}}
												/>
												<FormControlLabel
													value="2"
													control={<Radio />}
													label="2"
													sx={{
														fontSize: "0.875rem",
													}}
												/>
												<FormControlLabel
													value="3"
													control={<Radio />}
													label="3"
													sx={{
														fontSize: "0.875rem",
													}}
												/>
											</RadioGroup>
										</Grid>

										<Grid
											container
											sx={{ pt: 3, pl: 3 }}
											spacing={3}
										>
											{/* Label de Aforo */}
											<Grid item xs={12}>
												<Typography
													variant="subtitle1"
													style={{
														fontWeight: "bold",
													}}
												>
													AFORO :
												</Typography>
												<Typography
													variant="overline"
													sx={{
														color: "text.secondary",
													}}
												>
													Descargue e ingrese la
													informacion de su aforo
												</Typography>
												<FileButtonModal // BOTON EXCEL DE AFORO
													onImportExcel={
														onImportExcel
													}
												/>
											</Grid>
											{tableAforo &&
												(inicial ||
													primaria ||
													secundaria) && (
													<Grid
														item
														xs={12}
														sx={{ pt: 2 }}
													>
														<Grid
															container
															mb=".5rem"
															alignItems="center"
														>
															<Grid
																item
																xs={4}
																textAlign="center"
															>
																<span>
																	GRADO
																</span>
															</Grid>
															<Grid
																item
																xs={4}
																textAlign="center"
															>
																<span>
																	AFORO POR
																	GRADO
																</span>
															</Grid>
															<Grid
																item
																xs={4}
																textAlign="center"
															>
																<span>
																	CANTIDAD DE
																	AULAS
																</span>
															</Grid>
														</Grid>
														{inicial &&
															nivelGrid(
																"INICIAL",
																aforoInicial,
																aulaInicial
															)}
														{primaria > 0 &&
															nivelGrid(
																"PRIMARIA",
																aforoPrimaria,
																aulaPrimaria
															)}
														{secundaria > 0 &&
															nivelGrid(
																"SECUNDARIA",
																aforoSecundaria,
																aulaSecundaria
															)}
													</Grid>
												)}
											{/* LABEL TERRENO */}
											<Grid item xs={12}>
												<Typography
													variant="subtitle1"
													style={{
														fontWeight: "bold",
													}}
												>
													TERRENO :
												</Typography>
												<Typography
													variant="overline"
													sx={{
														color: "text.secondary",
													}}
												>
													Descargue e ingrese la
													informacion de su terreno
												</Typography>
												<TerrainFileButton //BOTON DATOS DEL TERRENO
													onImportVerticesExcel={
														onImportVerticesExcel
													}
												/>
											</Grid>
										</Grid>

										{loading && (
											<>
												<TerrainDataTable
													vertices={vertices}
													onExcludedChange={
														handleExcludedChange
													}
													onPriorityChange={
														handlePriorityChange
													}
												/>
												<Grid xs={12}>
													<Grid
														sx={{
															pl: 3,
															pt: 2,
														}}
													>
														{showButtonTerrain && (
															<Grid
																sx={{
																	display:
																		"flex",
																	justifyContent:
																		"space-around",
																	gap: 1,
																}}
															>
																{/* BOTON GENERACION DEL TERRENO */}
																<Button
																	color="primary"
																	variant="contained"
																	onClick={
																		handleClickOpenDialog
																	}
																	sx={{
																		p: 1,
																	}}
																>
																	Generacion
																	del terreno
																</Button>
																{/* BOTON GENERACION DEL CUADRANTE MAXIMO */}
																<Button
																	color="warning"
																	variant="contained"
																	onClick={
																		handleClickOpenDialogMax
																	}
																>
																	Generacion
																	del
																	cuadrante
																	maximo
																</Button>
															</Grid>
														)}
													</Grid>

													<Dialog
														open={openDialog}
														onClose={
															handleCloseDialog
														}
													>
														<DialogTitle>
															Area Total y area
															disponible
														</DialogTitle>
														<DialogContent>
															<Grid
																sx={{
																	width: 600,
																}}
															>
																<PoligonoChart
																	verticesTotal={
																		verticesGrafic
																	}
																	verticesExcluted={
																		exclutedVertices
																	}
																/>
															</Grid>
														</DialogContent>
													</Dialog>

													<Dialog
														open={openDialogMax}
														onClose={
															handleCloseDialogMax
														}
													>
														<DialogTitle>
															Area disponible y
															rectangulo máximo
														</DialogTitle>
														<DialogContent>
															<Grid
																sx={{
																	width: 600,
																}}
															>
																<RectangleChart
																	verDispo={
																		verticesGrafic
																	}
																	verticesExcluted={
																		exclutedVertices
																	}
																	setMaximumRectangle={
																		setMaximumRectangle
																	}
																	close={
																		handleCloseDialogMax
																	}
																/>
															</Grid>
														</DialogContent>
													</Dialog>
												</Grid>
											</>
										)}

										<Grid item xs={12} my="1rem">
											<Grid container rowSpacing={3}>
												<Grid item xs={12}>
													<Select
														style={{
															...styleInput,
															marginTop: ".5rem",
														}}
														onChange={(e) =>
															handleOnAddAC(
																e.target.value
															)
														}
														label="Ambientes Complementarios"
														name="ambientes complementarios"
													>
														<option value="">
															Seleccione
														</option>
														{ambientesComplementarios?.map(
															(ambiente) => (
																<option
																	key={
																		ambiente.ambienteComplementario
																	}
																	value={
																		ambiente.ambienteComplementario
																	}
																>
																	{UpperLowerCase(
																		ambiente.ambienteComplementario
																	)}
																</option>
															)
														)}
													</Select>
												</Grid>

												{/* Encabezado - ahora ocupa todo el ancho */}
												<Grid item xs={12}>
													<span>
														{!!rowsAC.length &&
															"AMBIENTES COMPLEMENTARIOS"}
													</span>
												</Grid>

												{/* Filas de ambientes */}
												{rowsAC.map((row, index) => (
													<RowFormAC
														{...row}
														onChange={(
															name,
															value
														) =>
															handleOnChangeAC(
																index,
																name,
																value
															)
														}
														onRemove={() =>
															handleOnRemoveAC(
																index
															)
														}
														key={index}
														disabledDeleted={index}
													/>
												))}
											</Grid>
										</Grid>

										<Grid item xs={12} sm={6}>
											<span>DEPARTAMENTO:</span>

											<Select
												//label="Departamento"
												name="departamento"
												style={styleInput}
												onChange={
													handleDepartamentoChange
												}
											>
												<option value="">
													Seleccione un departamento
												</option>
												{departamentos.map((dept) => (
													<option
														key={dept}
														value={dept}
													>
														{dept}
													</option>
												))}
											</Select>
										</Grid>

										<Grid item xs={12} sm={6}>
											<span>PROVINCIA:</span>

											<Select
												//label="Provincia"
												name="ubication"
												onChange={handleProvinciaChange}
												disabled={!values.departamento}
												style={styleInput}
											>
												<option value="">
													Seleccione una provincia
												</option>
												{provincias.map((prov) => (
													<option
														key={prov}
														value={prov}
													>
														{prov}
													</option>
												))}
											</Select>

											{/* <ErrorMessage name="email" component="div" /> */}
										</Grid>
										<Grid item xs={12} sm={6}>
											<span>DISTRITO:</span>
											<Select
												//label="Distrito"
												name="distrito"
												disabled={!values.ubication}
												style={styleInput}
											>
												<option value="">
													Seleccione un distrito
												</option>
												{distritos.map((dist) => (
													<option
														key={dist}
														value={dist}
													>
														{dist}
													</option>
												))}
											</Select>
										</Grid>

										<Grid item xs={12} sm={6}>
											<span>RESPONSABLE:</span>
											<Field
												style={styleInput}
												type="text"
												name="manager"
											/>
											{errors.manager &&
											touched.manager ? (
												<div style={styleError}>
													{errors.manager}
												</div>
											) : null}
											{/* <ErrorMessage name="email" component="div" /> */}
										</Grid>

										<Grid item xs={12} sm={6}>
											<span>CLIENTE:</span>
											<Field
												style={styleInput}
												type="text"
												name="client"
											/>
											{errors.client && touched.client ? (
												<div style={styleError}>
													{errors.client}
												</div>
											) : null}
											{/* <ErrorMessage name="email" component="div" /> */}
										</Grid>

										{/* <MapCoordinates data={data} /> */}
									</Grid>
								</Form>
							);
						}}
					</Formik>
				)}
			</>
		);
	}
);

// function MapCoordinates({ data }) {
// 	const [coordenadas, setCoordenadas] = useState(data?.coordenadas || "");

// 	return (
// 		<>
// 			<Grid item xs={12}>
// 				<iframe
// 					src={`https://maps.google.com/?ll=${coordenadas}&z=16&t=m&output=embed`}
// 					height="100%"
// 					width="100%"
// 					style={{ border: 0 }}
// 					allowFullScreen
// 				/>
// 			</Grid>

// 			<Grid item xs={12}>
// 				<span>Coordenadas:</span>
// 				<Field
// 					id="coordenadas"
// 					style={styleInput}
// 					type="text"
// 					value={coordenadas}
// 					onChange={(e) => setCoordenadas(e.target.value)}
// 					name="coordenadas"
// 					required
// 				/>
// 			</Grid>
// 		</>
// 	);
// }

const nivelGrid = (label, aforo, aula) => {
	return (
		<Grid container spacing={2} marginBottom="1rem">
			<Grid item xs={4}>
				<Field
					style={{
						...styleInput,
						textAlign: "center",
						fontSize: "14px",
					}}
					type="text"
					value={label}
					disabled
				/>
			</Grid>
			<Grid item xs={4}>
				<Field
					style={{
						...styleInput,
						textAlign: "center",
						fontSize: "14px",
					}}
					value={aforo}
					disabled
				/>
			</Grid>
			<Grid item xs={4}>
				<Field
					style={{
						...styleInput,
						textAlign: "center",
						fontSize: "14px",
					}}
					value={aula}
					disabled
				/>
			</Grid>
		</Grid>
	);
};

const defaultState = {
	vertice: "",
	lado: "",
	dist: 0,
	angulo: 0,
	retiros: 0,
};

export const styleInput = {
	width: "100%",
};
const styleError = {
	color: "red",
	marginTop: "0.25rem",
};

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

//ARRAY DE AMBIENTES COMPLEMENTARIOS
const ambientesComplementarios = [
	{
		capacidad: 0,
		ambienteComplementario: "Sala de Usos Múltiples (SUM)",
	},
	//{ capacidad: 0, ambienteComplementario: "Aula para EPT" },

	//{ capacidad: 0, ambienteComplementario: "Area de ingreso" },
	{ capacidad: 0, ambienteComplementario: "Cocina escolar" },
	{ capacidad: 0, ambienteComplementario: "Comedor" },
	// {
	// 	capacidad: 0,
	// 	ambienteComplementario:
	// 		"Servicios higiénicos para personal administrativo y docentes",
	// },

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
	//{ capacidad: 0, ambienteComplementario: "Laboratorio de Ciencias" },
	{ capacidad: 0, ambienteComplementario: "Taller creativo" },
	{ capacidad: 0, ambienteComplementario: "Taller EPT" },
];

const validationSchema = yup
	.object({
		name: yup.string().required("El nombre es requerido"),
		tipologia: yup.string().required("La tipologia es requerida"),
		ubication: yup.string().required("La ubicacion es requerida"),
		distrito: yup.string().required("El distrito es requerido"),
		client: yup.string().required("El cliente es requerido"),
		manager: yup.string().required("El responsable es requerido"),
		zone: yup.string().required("La zona es requerida"),
		parent_id: yup.number().required("El padre es requerido"),
		capacity: yup.number().required("La capacidad es requerida"),
		student: yup
			.number()
			.required("La capacidad de estudiantes es requerida"),
		room: yup.number().required("La capacidad de aulas es requerida"),
		height: yup.number().required("La altura es requerida"),
		width: yup.number().required("La anchura es requerida"),
		// coordenadas: yup.string().required('Las coordenadas son requeridas'),
		//array de objetos
		rows: yup.array().of(
			yup.object().shape({
				vertice: yup.string().required("El vertice es requerido"),
				lado: yup.string().required("El lado es requerido"),
				distancia: yup.string().required("La distancia es requerida"),
				angulo: yup.string().required("El angulo es requerido"),
				retiros: yup.string().required("Los retiros son requeridos"),
			})
		),
	})
	.defined();

const imageToAulas = (aforoInicial, aforoPrimaria, aforoSecundaria) => {
	if (aforoInicial > 0 && aforoPrimaria > 0 && aforoSecundaria > 0) {
		return "inicial_primaria_secundaria.png";
	}
	if (aforoInicial > 0 && aforoPrimaria > 0) {
		return "inicial_primaria.png";
	}
	if (aforoInicial > 0 && aforoSecundaria > 0) {
		return "primaria_secundaria.png";
	}
	if (aforoPrimaria > 0 && aforoSecundaria > 0) {
		return "primaria_secundaria.png";
	}
	if (aforoInicial > 0) {
		return "inicial.png";
	}
	if (aforoPrimaria > 0) {
		return "primaria.png";
	}
	if (aforoSecundaria > 0) {
		return "secundaria.png";
	}
	if (!aforoPrimaria && !aforoSecundaria && !aforoInicial) {
		return "secundaria.png";
	}
};

const FileButtonModal = ({ onImportExcel }) => {
	// MODAL DEL BOTON DE EXCEL DE AFORO
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleToggleLoading = () => setLoading((prev) => !prev);

	const handleChange = async (evt) => {
		const { error, message } = await onImportExcel(
			evt.target.files[0],
			handleToggleLoading,
			handleClose
		);
		// updateProjectService(12, evt.target.files[0])
		if (error) {
			handleClose();
			return alert(message);
		}

		handleClose();
	};

	return (
		<>
			{loading ? (
				<Grid item xs={12}>
					<LinearProgress color="secondary" />
				</Grid>
			) : null}
			<Grid item>
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpen}
				>
					Ingreso de Aforo
				</Button>
			</Grid>

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
							<Grid item xs={12} lg={4}>
								<h2>Adjuntar archivo:</h2>
							</Grid>
							<Grid item xs={12} lg={8}>
								<input
									type="file"
									accept=".xlsx, .xls"
									onChange={handleChange}
									style={{ display: "none" }}
									id="button_file"
								/>
								<label htmlFor="button_file">
									<Button
										variant="outlined"
										component="span"
										style={{ width: "200px" }}
									>
										Subir
									</Button>
								</label>
							</Grid>
							<Grid item xs={12} lg={8}>
								{" "}
								{/* DESCARGA DE PLANTILLA */}
								<a
									href="/descargas/template_project.xlsx"
									download="Plantilla del Proyecto.xlsx"
								>
									<Button
										variant="contained"
										color="primary"
										style={{ width: "200px" }}
									>
										Descargar Plantilla
									</Button>
								</a>
							</Grid>

							<Grid item xs={12} lg={4}>
								<Button
									variant="outlined"
									color="primary"
									style={{ width: "100px" }}
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
};

const TerrainFileButton = ({ onImportVerticesExcel }) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleToggleLoading = () => setLoading((prev) => !prev);

	const handleImportVertices = async (
		file,
		handleToggleLoading,
		handleClose
	) => {
		const result = await onImportVerticesExcel(
			file,
			handleToggleLoading,
			handleClose
		);
		if (result.error) alert(result.message);
	};

	return (
		<>
			{loading ? (
				<Grid item xs={12}>
					<LinearProgress color="secondary" />
				</Grid>
			) : null}
			<Grid item>
				<Button
					variant="contained"
					color="success"
					onClick={handleOpen}
				>
					Datos del terreno
				</Button>
			</Grid>

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
							<Grid item xs={12} lg={4}>
								<h2>Adjuntar archivo excel:</h2>
							</Grid>
							<Grid item xs={12} lg={8}>
								<input
									type="file"
									accept=".xlsx, .xls"
									onChange={(e) =>
										handleImportVertices(
											e.target.files[0],
											handleToggleLoading,
											handleClose
										)
									}
									style={{ display: "none" }}
									id="button_file_vertice"
								/>
								<label htmlFor="button_file_vertice">
									<Button
										variant="outlined"
										component="span"
										style={{ width: "200px" }}
									>
										Subir mas
									</Button>
								</label>
							</Grid>
							<Grid item xs={12} lg={8}>
								{" "}
								{/* DESCARGA DE PLANTILLA */}
								<a
									href="/descargas/VERTICES_PRODESIGN.xlsx"
									download="Plantilla de vertices.xlsx"
								>
									<Button
										variant="contained"
										color="primary"
										style={{ width: "200px" }}
									>
										Descargar Plantilla excel
									</Button>
								</a>
							</Grid>

							<Grid item xs={12} lg={4}>
								<Button
									variant="outlined"
									color="primary"
									style={{ width: "100px" }}
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
};

// COMPONENTE DE LA GRAFICA DE GENERACION DEL TERRENO
const PoligonoChart = ({ verticesTotal, verticesExcluted }) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);

	useEffect(() => {
		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const ctx = chartRef.current.getContext("2d");

		const availableVertices = verticesTotal.filter(
			([x, y]) =>
				!verticesExcluted.some(([vx, vy]) => vx === x && vy === y)
		);

		const fillRectanglePlugin = {
			id: "fillRectangle",
			beforeDraw(chart) {
				if (!availableVertices.length) return;

				const ctx = chart.ctx;
				ctx.save();
				ctx.fillStyle = "rgba(124, 252, 0, 0.5)";

				ctx.beginPath();

				// **📍 Convertimos coordenadas del rectángulo a píxeles**
				availableVertices.forEach(([x, y], index) => {
					const xPixel = chart.scales.x.getPixelForValue(x);
					const yPixel = chart.scales.y.getPixelForValue(y);
					if (index === 0) {
						ctx.moveTo(xPixel, yPixel);
					} else {
						ctx.lineTo(xPixel, yPixel);
					}
				});

				ctx.closePath();
				ctx.fill();
				ctx.restore();
			},
		};

		chartInstance.current = new Chart(ctx, {
			type: "line",
			data: {
				datasets: [
					{
						label: "Área Total",
						data: verticesTotal.map(([x, y]) => ({ x, y })),
						borderColor: "gray",
						backgroundColor: "rgba(105, 105, 105, 0.5)",
						borderWidth: 1,
						fill: true,
					},
					{
						label: "Área Disponible",
						data: availableVertices.map(([x, y]) => ({ x, y })),
						borderColor: "green",
						backgroundColor: "rgba(124, 252, 0, 0.5)",
						borderWidth: 1,
						fill: true,
					},
				],
			},
			options: {
				responsive: true,
				scales: {
					x: {
						type: "linear",
						position: "bottom",
						title: {
							display: true,
							text: "Coordenadas X",
						},
						ticks: {
							display: false, // 🔹 Oculta los números en el eje Y
						},
						grid: {
							drawTicks: false,
						},
					},
					y: {
						type: "linear",
						ticks: {
							display: false, // 🔹 Oculta los números en el eje Y
						},
						grid: {
							drawTicks: false,
						},
					},
				},
				plugins: {
					legend: {
						position: "top",
					},
					tooltip: {
						enabled: true,
					},
				},
			},
			plugins: [fillRectanglePlugin],
		});

		return () => chartInstance.current.destroy();
	}, [verticesTotal]);

	return <canvas ref={chartRef} />;
};
//COMPONENTE GENERACION DEL CUADRANTE MAXIMO
// const RectangleChart = ({
// 	verDispo,
// 	verticesExcluted,
// 	setMaximumRectangle,
// 	close,
// }) => {
// 	const chartRefs = [useRef(null), useRef(null), useRef(null)];
// 	const chartInstances = [useRef(null), useRef(null), useRef(null)];

// 	const [selectedOption, setSelectedOption] = useState(0);
// 	const [rectangulosData, setRectangulosData] = useState([]);

// 	// Filtrar vértices excluidos
// 	const availableVertices = verDispo.filter(
// 		([x, y]) => !verticesExcluted.some(([vx, vy]) => vx === x && vy === y)
// 	);

// 	useEffect(() => {
// 		const calcularRectangulos = async () => {
// 			// Convertir availableVertices de [x, y] a {east, north}

// 			const opciones = await MaxRectangle(availableVertices);
// 			console.log("Opciones recibidas:", opciones);
// 			setRectangulosData(opciones);
// 		};

// 		if (availableVertices.length > 0) {
// 			calcularRectangulos();
// 		}
// 	}, [availableVertices.length]); // Mejor dependencia

// 	// AQUÍ ESTÁ EL FIX: Convertir de {east, north} a [x, y]
// 	const rectangulos = rectangulosData.map((rectangulo) =>
// 		rectangulo.vertices.map((vertex) => [vertex.east, vertex.north])
// 	);

// 	//
// 	const handleConfirm = () => {
// 		const { vertices, anguloGrados, alto, ancho, area } =
// 			rectangulosData[selectedOption];
// 		setMaximumRectangle({ vertices, anguloGrados, alto, ancho, area });

// 		//setMaximumRectangle(rectangulos[selectedOption]);
// 		close();
// 	};

// 	useEffect(() => {
// 		// Solo ejecutar si hay rectángulos
// 		if (rectangulos.length === 0) return;

// 		// Destruir instancias de gráficos existentes
// 		chartInstances.forEach((instance) => {
// 			if (instance.current) {
// 				instance.current.destroy();
// 				instance.current = null;
// 			}
// 		});

// 		// Crear los tres gráficos
// 		rectangulos.forEach((rectanguloMax, index) => {
// 			if (!chartRefs[index].current) return;

// 			const ctx = chartRefs[index].current.getContext("2d");

// 			// Plugin para rellenar el rectángulo
// 			const fillRectanglePlugin = {
// 				id: `fillRectangle${index}`,
// 				beforeDraw(chart) {
// 					if (!rectanguloMax.length) return;

// 					const ctx = chart.ctx;
// 					ctx.save();
// 					ctx.fillStyle = "rgba(255, 165, 0, 0.7)";

// 					ctx.beginPath();

// 					// Convertir coordenadas del rectángulo a píxeles
// 					rectanguloMax.forEach(([x, y], i) => {
// 						const xPixel = chart.scales.x.getPixelForValue(x);
// 						const yPixel = chart.scales.y.getPixelForValue(y);
// 						if (i === 0) {
// 							ctx.moveTo(xPixel, yPixel);
// 						} else {
// 							ctx.lineTo(xPixel, yPixel);
// 						}
// 					});

// 					ctx.closePath();
// 					ctx.fill();
// 					ctx.restore();
// 				},
// 			};

// 			// Calcular el área del rectángulo
// 			const area =
// 				rectangulosData[index]?.area ||
// 				calcularAreaRectangulo(rectanguloMax);

// 			chartInstances[index].current = new Chart(ctx, {
// 				type: "line",
// 				data: {
// 					datasets: [
// 						{
// 							label: "Área Disponible",
// 							data: availableVertices.map(([x, y]) => ({ x, y })),
// 							borderColor: "lightblue",
// 							backgroundColor: "rgba(173, 216, 230, 0.5)",
// 							borderWidth: 2,
// 							fill: true,
// 						},
// 						{
// 							label: `Rectángulo Opción ${
// 								index + 1
// 							} (${area.toFixed(2)} m²)`,
// 							data: rectanguloMax.map(([x, y]) => ({ x, y })),
// 							borderColor: "orange",
// 							backgroundColor: "rgba(255, 165, 0, 0.7)",
// 							borderWidth: 2,
// 							fill: false,
// 							showLine: true,
// 						},
// 					],
// 				},
// 				options: {
// 					responsive: true,
// 					maintainAspectRatio: false,
// 					scales: {
// 						x: {
// 							type: "linear",
// 							position: "bottom",
// 							title: {
// 								display: true,
// 								text: "Coordenadas X (East)",
// 							},
// 							ticks: {
// 								display: false,
// 							},
// 							grid: {
// 								drawTicks: false,
// 							},
// 						},
// 						y: {
// 							type: "linear",
// 							title: {
// 								display: true,
// 								text: "Coordenadas Y (North)",
// 							},
// 							ticks: {
// 								display: false,
// 							},
// 							grid: {
// 								drawTicks: false,
// 							},
// 						},
// 					},
// 					plugins: {
// 						legend: {
// 							position: "top",
// 						},
// 						tooltip: {
// 							enabled: true,
// 						},
// 						title: {
// 							display: true,
// 							text: `Opción ${index + 1} - Área: ${area.toFixed(
// 								2
// 							)} m²`,
// 						},
// 					},
// 				},
// 				plugins: [fillRectanglePlugin],
// 			});
// 		});

// 		return () => {
// 			// Limpiar todas las instancias al desmontar
// 			chartInstances.forEach((instance) => {
// 				if (instance.current) {
// 					instance.current.destroy();
// 					instance.current = null;
// 				}
// 			});
// 		};
// 	}, [rectangulos.length, selectedOption]); // Mejor dependencia

// 	// Calcular el área aproximada del rectángulo
// 	function calcularAreaRectangulo(vertices) {
// 		if (!vertices || vertices.length < 3) return 0;

// 		const points =
// 			vertices[0] &&
// 			vertices[vertices.length - 1] &&
// 			vertices[0][0] === vertices[vertices.length - 1][0] &&
// 			vertices[0][1] === vertices[vertices.length - 1][1]
// 				? vertices.slice(0, -1)
// 				: [...vertices];

// 		let area = 0;
// 		for (let i = 0; i < points.length; i++) {
// 			const j = (i + 1) % points.length;
// 			area += points[i][0] * points[j][1];
// 			area -= points[j][0] * points[i][1];
// 		}

// 		return Math.abs(area) / 2;
// 	}

// 	const handleOptionSelect = (index) => {
// 		setSelectedOption(index);
// 	};

// 	// Si no hay datos aún, mostrar loading
// 	if (rectangulosData.length === 0) {
// 		return (
// 			<div className="text-center p-4">
// 				<p>Calculando rectángulos óptimos...</p>
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="rectangle-charts-container">
// 			<h3 className="text-center mb-3">
// 				Seleccione la mejor opción de rectángulo
// 			</h3>

// 			<div
// 				className="option-buttons mb-4"
// 				style={{
// 					display: "flex",
// 					justifyContent: "center",
// 					gap: "10px",
// 				}}
// 			>
// 				{rectangulos.map((_, index) => (
// 					<button
// 						key={index}
// 						onClick={() => handleOptionSelect(index)}
// 						className={`btn ${
// 							selectedOption === index
// 								? "btn-primary"
// 								: "btn-outline-primary"
// 						}`}
// 						style={{
// 							padding: "8px 16px",
// 							borderRadius: "4px",
// 							cursor: "pointer",
// 							backgroundColor:
// 								selectedOption === index ? "#007bff" : "white",
// 							color:
// 								selectedOption === index ? "white" : "#007bff",
// 							border: "1px solid #007bff",
// 						}}
// 					>
// 						Opción {index + 1}
// 					</button>
// 				))}
// 			</div>

// 			<div
// 				className="charts-container"
// 				style={{
// 					display: "grid",
// 					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
// 					gap: "20px",
// 				}}
// 			>
// 				{rectangulos.map((_, index) => (
// 					<div
// 						key={index}
// 						className={`chart-wrapper ${
// 							selectedOption === index ? "selected" : ""
// 						}`}
// 						style={{
// 							height: "300px",
// 							border:
// 								selectedOption === index
// 									? "2px solid #007bff"
// 									: "1px solid #ddd",
// 							borderRadius: "8px",
// 							padding: "10px",
// 							boxShadow:
// 								selectedOption === index
// 									? "0 0 10px rgba(0,123,255,0.3)"
// 									: "none",
// 							transition: "all 0.3s ease",
// 						}}
// 					>
// 						<canvas
// 							ref={chartRefs[index]}
// 							style={{ width: "100%", height: "100%" }}
// 						></canvas>
// 					</div>
// 				))}
// 			</div>

// 			<div className="text-center mt-4">
// 				<button
// 					className="btn btn-success"
// 					onClick={handleConfirm}
// 					style={{
// 						padding: "10px 20px",
// 						backgroundColor: "#28a745",
// 						color: "white",
// 						border: "none",
// 						borderRadius: "4px",
// 						cursor: "pointer",
// 					}}
// 				>
// 					Confirmar Selección
// 				</button>
// 			</div>
// 		</div>
// 	);
// };
const RectangleChart = ({
	verDispo,
	verticesExcluted,
	setMaximumRectangle,
	close,
}) => {
	const chartRefs = [useRef(null), useRef(null), useRef(null)];
	const chartInstances = [useRef(null), useRef(null), useRef(null)];

	const [selectedOption, setSelectedOption] = useState(0);
	const [rectangulosData, setRectangulosData] = useState([]);
	const [loading, setLoading] = useState(true);

	// Filtrar vértices excluidos
	const availableVertices = verDispo.filter(
		([x, y]) => !verticesExcluted.some(([vx, vy]) => vx === x && vy === y)
	);

	useEffect(() => {
		const calcularRectangulos = async () => {
			setLoading(true);
			try {
				const opciones = await MaxRectangle(availableVertices);
				console.log("Opciones recibidas:", opciones);
				setRectangulosData(opciones);
			} catch (error) {
				console.error("Error al calcular rectángulos:", error);
			} finally {
				setLoading(false);
			}
		};

		if (availableVertices.length > 0) {
			calcularRectangulos();
		}
	}, [availableVertices.length]);

	const rectangulos = rectangulosData.map((rectangulo) =>
		rectangulo.vertices.map((vertex) => [vertex.east, vertex.north])
	);

	const handleConfirm = () => {
		const { vertices, anguloGrados, alto, ancho, area, perimetro } =
			rectangulosData[selectedOption];
		setMaximumRectangle({
			vertices,
			anguloGrados,
			alto,
			ancho,
			area,
			perimetro,
		});
		close();
	};

	useEffect(() => {
		if (rectangulos.length === 0) return;

		chartInstances.forEach((instance) => {
			if (instance.current) {
				instance.current.destroy();
				instance.current = null;
			}
		});

		rectangulos.forEach((rectanguloMax, index) => {
			if (!chartRefs[index].current) return;

			const ctx = chartRefs[index].current.getContext("2d");

			const fillRectanglePlugin = {
				id: `fillRectangle${index}`,
				beforeDraw(chart) {
					if (!rectanguloMax.length) return;

					const ctx = chart.ctx;
					ctx.save();
					ctx.fillStyle = "rgba(25, 118, 210, 0.2)"; // Color MUI primary
					ctx.beginPath();

					rectanguloMax.forEach(([x, y], i) => {
						const xPixel = chart.scales.x.getPixelForValue(x);
						const yPixel = chart.scales.y.getPixelForValue(y);
						if (i === 0) {
							ctx.moveTo(xPixel, yPixel);
						} else {
							ctx.lineTo(xPixel, yPixel);
						}
					});

					ctx.closePath();
					ctx.fill();
					ctx.restore();
				},
			};

			const area =
				rectangulosData[index]?.area ||
				calcularAreaRectangulo(rectanguloMax);

			chartInstances[index].current = new Chart(ctx, {
				type: "line",
				data: {
					datasets: [
						{
							label: "Área Disponible",
							data: availableVertices.map(([x, y]) => ({ x, y })),
							borderColor: "rgba(158, 158, 158, 0.8)",
							backgroundColor: "rgba(238, 238, 238, 0.5)",
							borderWidth: 2,
							fill: true,
						},
						{
							label: `Rectángulo Opción ${index + 1}`,
							data: rectanguloMax.map(([x, y]) => ({ x, y })),
							borderColor: "rgb(25, 118, 210)",
							backgroundColor: "rgba(25, 118, 210, 0.2)",
							borderWidth: 3,
							fill: false,
							showLine: true,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						x: {
							type: "linear",
							position: "bottom",
							title: {
								display: true,
								text: "Coordenadas X (East)",
								font: { size: 12, weight: "bold" },
							},
							ticks: { display: false },
							grid: { drawTicks: false },
						},
						y: {
							type: "linear",
							title: {
								display: true,
								text: "Coordenadas Y (North)",
								font: { size: 12, weight: "bold" },
							},
							ticks: { display: false },
							grid: { drawTicks: false },
						},
					},
					plugins: {
						legend: {
							position: "top",
							labels: { boxWidth: 12, padding: 10 },
						},
						tooltip: { enabled: true },
					},
				},
				plugins: [fillRectanglePlugin],
			});
		});

		return () => {
			chartInstances.forEach((instance) => {
				if (instance.current) {
					instance.current.destroy();
					instance.current = null;
				}
			});
		};
	}, [rectangulos.length, selectedOption]);

	function calcularAreaRectangulo(vertices) {
		if (!vertices || vertices.length < 3) return 0;

		const points =
			vertices[0] &&
			vertices[vertices.length - 1] &&
			vertices[0][0] === vertices[vertices.length - 1][0] &&
			vertices[0][1] === vertices[vertices.length - 1][1]
				? vertices.slice(0, -1)
				: [...vertices];

		let area = 0;
		for (let i = 0; i < points.length; i++) {
			const j = (i + 1) % points.length;
			area += points[i][0] * points[j][1];
			area -= points[j][0] * points[i][1];
		}

		return Math.abs(area) / 2;
	}

	const handleOptionSelect = (index) => {
		setSelectedOption(index);
	};

	// Loading mejorado con Material-UI
	if (loading) {
		return (
			<Fade in={loading}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "400px",
						gap: 3,
					}}
				>
					<CircularProgress size={60} thickness={4} />
					<Typography variant="h6" color="text.secondary">
						Calculando rectángulos óptimos...
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Analizando {availableVertices.length} vértices
						disponibles
					</Typography>
				</Box>
			</Fade>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h5"
				gutterBottom
				align="center"
				sx={{ mb: 4, fontWeight: 600 }}
			>
				Seleccione la mejor opción de rectángulo
			</Typography>

			<Stack
				direction="row"
				spacing={2}
				justifyContent="center"
				sx={{ mb: 4 }}
			>
				{rectangulos.map((_, index) => {
					const area = rectangulosData[index]?.area || 0;
					return (
						<Button
							key={index}
							variant={
								selectedOption === index
									? "contained"
									: "outlined"
							}
							onClick={() => handleOptionSelect(index)}
							// startIcon={
							// 	selectedOption === index && <CheckCircleIcon />
							// }
							sx={{
								minWidth: 140,
								py: 1.5,
								transition: "all 0.3s ease",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: 2,
								},
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "flex-start",
								}}
							>
								<Typography variant="button">
									Opción {index + 1}
								</Typography>
								<Typography
									variant="caption"
									sx={{ opacity: 0.8 }}
								>
									{area.toFixed(2)} m²
								</Typography>
							</Box>
						</Button>
					);
				})}
			</Stack>

			<Grid container spacing={3}>
				{rectangulos.map((_, index) => {
					const area =
						rectangulosData[index]?.area ||
						calcularAreaRectangulo(rectangulos[index]);
					const { alto, ancho, anguloGrados } =
						rectangulosData[index] || {};

					return (
						<Grid item xs={12} key={index}>
							<Fade in={true} timeout={300 * (index + 1)}>
								<Card
									elevation={selectedOption === index ? 8 : 2}
									sx={{
										height: "100%",
										transition: "all 0.3s ease",
										border:
											selectedOption === index ? 2 : 0,
										borderColor: "primary.main",
										cursor: "pointer",
										"&:hover": {
											transform: "translateY(-4px)",
											boxShadow: 6,
										},
									}}
									onClick={() => handleOptionSelect(index)}
								>
									<CardContent>
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												mb: 2,
											}}
										>
											<Typography
												variant="h6"
												component="div"
											>
												Opción {index + 1}
											</Typography>
											{/* <Chip
												icon={<SquareFootIcon />}
												label={`${area.toFixed(2)} m²`}
												color={
													selectedOption === index
														? "primary"
														: "default"
												}
												size="small"
											/> */}
										</Box>

										{(alto ||
											ancho ||
											anguloGrados !== undefined) && (
											<Box
												sx={{
													mb: 2,
													display: "flex",
													gap: 1,
													flexWrap: "wrap",
												}}
											>
												{alto && (
													<Chip
														label={`Alto: ${alto.toFixed(
															2
														)}m`}
														size="small"
														variant="outlined"
													/>
												)}
												{ancho && (
													<Chip
														label={`Ancho: ${ancho.toFixed(
															2
														)}m`}
														size="small"
														variant="outlined"
													/>
												)}
												{anguloGrados !== undefined && (
													<Chip
														label={`${anguloGrados.toFixed(
															1
														)}°`}
														size="small"
														variant="outlined"
													/>
												)}
											</Box>
										)}

										<Paper
											elevation={0}
											sx={{
												height: 280,
												backgroundColor: "grey.50",
												p: 1,
												borderRadius: 2,
											}}
										>
											<canvas
												ref={chartRefs[index]}
												style={{
													width: "100%",
													height: "100%",
												}}
											/>
										</Paper>
									</CardContent>
								</Card>
							</Fade>
						</Grid>
					);
				})}
			</Grid>

			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					mt: 4,
					gap: 2,
				}}
			>
				<Button
					variant="outlined"
					onClick={close}
					size="large"
					sx={{ minWidth: 120 }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					size="large"
					//startIcon={<CheckCircleIcon />}
					sx={{ minWidth: 120 }}
				>
					Confirmar Selección
				</Button>
			</Box>
		</Box>
	);
};

export default NewProjectForm;

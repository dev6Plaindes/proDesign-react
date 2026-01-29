import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Plan3D from "./Plan3D/Plan3D";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import { OpenIconSpeedDial } from "./components/OpenIconSpeedDial";
import { getProjectByID } from "../../services/projectsService";

export default function PlanIndex({ school }) {
	const [state, setState] = useState();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [view, setViewState] = useState({ view: "2D", roof: true });
	const params = useParams();

	const handleViewState = (state) => {
		setViewState((prev) => ({ ...prev, ...state }));
	};

	const handleSetClassrooms = ({ inicial, primaria, secundaria }) => {
		setState({
			...state,
			aforo: {
				...state.aforo,
				aulaInicial: inicial,
				aulaPrimaria: primaria,
				aulaSecundaria: secundaria,
			},
		});
	};

	const handleDrawerToggle = () => {
		setMobileOpen((prevState) => !prevState);
	};

	console.log("state:", state);

	useEffect(() => {
		getProjectByID(params.id).then(
			(res) => {
				console.log("res (linea 25 PlanIndex.jsx file):", res);
				const data = res.data.project;

				const state = {
					...res.data.project,
					level: JSON.parse(data.level).map((level) =>
						level.toLowerCase()
					),
					// points: JSON.parse(state.puntos),
					build_data: JSON.parse(data.build_data),
					aforo: JSON.parse(data.aforo),
				};

				school.setProjectData(state);
				setState(state);
			},
			(err) => console.log("holalsl", err)
		);
	}, []);

	if (!state) return <div>error state</div>;

	return (
		<div style={{height: "100vh", border: "1px solid"}}>
			<Header
					state={state}
					school={school}
					view={view}
					handleViewState={handleViewState}
					handleDrawerToggle={handleDrawerToggle}
					handleSetClassrooms={handleSetClassrooms}
				/>
			<div style={{height: "91vh", display: "flex"}}>
					<div
						component="main"
						style={{ height: "91vh", width: "100%" }} // puede que esto deba cambiarse por la relacion de aspecto en perspective camera
						// sx={{ width: window.innerWidth - 18, height: window.innerHeight - 80 }}
					>
						<Plan3D school={school} state={state} view={view} height="90.7vh"/>
						<OpenIconSpeedDial />
					</div>
				<div item>
					<Sidebar school={school} state={state} style={{height: "91vh"}}/>
				</div>
			</div>

			

			{/* this */}
			{/* <Grid item xs={4} zIndex={99999999999999} backgroundColor="red">jj</Grid> */}

			{/* DRAWER FOR MOBILE */}
			{/* <Box component="nav">
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true // Better open performance on mobile.
					}}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
					}}
				>
					{drawer}
				</Drawer>
			</Box> */}

			{/* <Settings data={state} /> */}

			{/* <Grid item xs={12}> */}
			{/* <Box
					component="main"
					sx={{ width: window.innerWidth - 18, height: window.innerHeight - 80, padding: "5.6rem .7rem" }}
				>
					<Plan3D
						result_data={result_data}
						classroom_measurements={classroom_measurements}
						construction_info={construction_info}
						baths_amount={baths_amount}
						data={data}
					/>
				</Box> */}
			{/* </Grid> */}

			{/* <Sidebar
				result_data={result_data}
				classroom_measurements={classroom_measurements}
				construction_info={construction_info}
				state={state}
			/> */}
		</div>
	);
}

// // const drawerWidth = 240;
// const navItems = ["Home", "About", "Contact"];

//   return (
// 	<Box sx={{ display: "flex" }}>
// 		<CssBaseline />
// 		<AppBar component="nav">
// 			<Toolbar>
// 				<IconButton
// 					color="inherit"
// 					aria-label="open drawer"
// 					edge="start"
// 					onClick={handleDrawerToggle}
// 					sx={{ mr: 2, display: { sm: "none" } }}
// 				>
// 				<MenuIcon />
// 				</IconButton>
// 				<Typography
// 					variant="h6"
// 					component="div"
// 					sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
// 				>
// 				MUI
// 				</Typography>
// 				<Box sx={{ display: { xs: "none", sm: "block" } }}>
// 					{navItems.map((item) => (
// 						<Button key={item} sx={{ color: "#fff" }}>
// 							{item}
// 						</Button>
// 					))}
// 				</Box>
// 			</Toolbar>
// 		</AppBar>

// 		<Box component="nav">
// 			<Drawer
// 				container={container}
// 				variant="temporary"
// 				open={mobileOpen}
// 				onClose={handleDrawerToggle}
// 				ModalProps={{
// 				keepMounted: true, // Better open performance on mobile.
// 				}}
// 				sx={{
// 				display: { xs: "block", sm: "none" },
// 				"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
// 				}}
// 			>
// 				{drawer}
// 			</Drawer>
// 		</Box>
// 		<Box component="main" sx={{ p: 3 }}>
// 			<Toolbar />
// 			<Typography>
// 				Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique unde
// 				fugit veniam eius, perspiciatis sunt? Corporis qui ducimus quibusdam,
// 				aliquam dolore excepturi quae. Distinctio enim at eligendi perferendis in
// 				cum quibusdam sed quae, accusantium et aperiam? Quod itaque exercitationem,
// 				at ab sequi qui modi delectus quia corrupti alias distinctio nostrum.
// 				Minima ex dolor modi inventore sapiente necessitatibus aliquam fuga et. Sed
// 				numquam quibusdam at officia sapiente porro maxime corrupti perspiciatis
// 				asperiores, exercitationem eius nostrum consequuntur iure aliquam itaque,
// 				assumenda et! Quibusdam temporibus beatae doloremque voluptatum doloribus
// 				soluta accusamus porro reprehenderit eos inventore facere, fugit, molestiae
// 				ab officiis illo voluptates recusandae. Vel dolor nobis eius, ratione atque
// 				soluta, aliquam fugit qui iste architecto perspiciatis. Nobis, voluptatem!
// 				Cumque, eligendi unde aliquid minus quis sit debitis obcaecati error,
// 				delectus quo eius exercitationem tempore. Delectus sapiente, provident
// 				corporis dolorum quibusdam aut beatae repellendus est labore quisquam
// 				praesentium repudiandae non vel laboriosam quo ab perferendis velit ipsa
// 				deleniti modi! Ipsam, illo quod. Nesciunt commodi nihil corrupti cum non
// 				fugiat praesentium doloremque architecto laborum aliquid. Quae, maxime
// 				recusandae? Eveniet dolore molestiae dicta blanditiis est expedita eius
// 				debitis cupiditate porro sed aspernatur quidem, repellat nihil quasi
// 				praesentium quia eos, quibusdam provident. Incidunt tempore vel placeat
// 				voluptate iure labore, repellendus beatae quia unde est aliquid dolor
// 				molestias libero. Reiciendis similique exercitationem consequatur, nobis
// 				placeat illo laudantium! Enim perferendis nulla soluta magni error,
// 				provident repellat similique cupiditate ipsam, et tempore cumque quod! Qui,
// 				iure suscipit tempora unde rerum autem saepe nisi vel cupiditate iusto.
// 				Illum, corrupti? Fugiat quidem accusantium nulla. Aliquid inventore commodi
// 				reprehenderit rerum reiciendis! Quidem alias repudiandae eaque eveniet
// 				cumque nihil aliquam in expedita, impedit quas ipsum nesciunt ipsa ullam
// 				consequuntur dignissimos numquam at nisi porro a, quaerat rem repellendus.
// 				Voluptates perspiciatis, in pariatur impedit, nam facilis libero dolorem
// 				dolores sunt inventore perferendis, aut sapiente modi nesciunt.
// 			</Typography>
// 		</Box>
// 	</Box>
// );

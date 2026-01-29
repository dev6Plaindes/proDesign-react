import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { startLoginWithEmailPassword, setAuthView } from "../../redux/auth";
import { useSnackbar } from "notistack";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import FilledInput from "@mui/material/FilledInput";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";

export const LoginPage = () => {
	const dispatch = useDispatch();

	const { enqueueSnackbar } = useSnackbar();
	const { status, errorMessage } = useSelector((state) => state.auth);

	const isAutheticate = useMemo(() => status === "authenticated", [status]);

	const handleBackdrop = ({ message, variant }) => {
		enqueueSnackbar(message, { variant });
	};

	const onSubmit = (evt) => {
		console.log("login...");
		
		evt.preventDefault();
		var { email, password } = Object.fromEntries(new FormData(evt.target));
		dispatch(startLoginWithEmailPassword(email, password, handleBackdrop));
	};

	return (
		<Grid container spacing={5}>
			<Grid item xs={12}>
				<Typography
					variant="h4"
					textAlign={"center"}
					sx={{
						fontSize: "1.70rem",
						fontWeight: 600,
						color: "#181C32",
					}}
				>
					PLATAFORMA
					<br />
					DE ARQUITECTURA
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<form onSubmit={onSubmit}>
					<Grid container spacing={2} justifyContent="center">
						<Grid item xs={12}>
							<TextField
								label="Correo electrónico"
								type="email"
								placeholder="email@domain.com"
								variant="filled"
								fullWidth
								name="email"
							/>
						</Grid>
						<Grid item xs={12} textAlign="end">
							<a
								href="#"
								style={{
									color: "#3699FF",
									fontSize: "1.03rem",
									fontWeight: "600",
									outline: "0",
								}}
								onClick={() =>
									dispatch(
										setAuthView({ authView: "register" })
									)
								}
							>
								¿ Olvidaste tu contraseña ?
							</a>
							<PasswordInput />
						</Grid>

						<Grid item>
							<Button
								type="submit"
								variant="contained"
								fullWidth
								sx={{
									my: ".8rem",
									padding: ".75rem 1.5rem",
									backgroundColor: "#1BC5BD",
									borderRadius: "0.42rem",
									textTransform: "unset",
									fontSize: "1rem",
									color: "#ffffff",
									letterSpacing: ".7px",
									fontWeight: "600",
									"&:hover": {
										backgroundColor: "#19b4ac",
									},
								}}
								disabled={isAutheticate}
							>
								Ingresar
							</Button>
						</Grid>
						<Grid item xs={12} textAlign={"center"}>
							<Link
								to="/auth/register"
								style={{
									color: "#3699FF",
									fontSize: "1.03rem",
									fontWeight: "600",
									outline: 0,
								}}
							>
								¿ No tienes cuenta ? Registrate.
							</Link>
						</Grid>
					</Grid>
				</form>
			</Grid>
		</Grid>
	);
};

function PasswordInput() {
	const [show, setShow] = useState(false);

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};
	const handleClickShow = () => setShow((show) => !show);

	return (
		<FormControl fullWidth>
			<InputLabel htmlFor="outlined-adornment-password">
				Contraseña
			</InputLabel>
			<FilledInput
				id="outlined-adornment-password"
				name="password"
				autoComplete="off"
				type={show ? "text" : "password"}
				endAdornment={
					<InputAdornment position="end">
						<IconButton
							aria-label="toggle password visibility"
							onClick={handleClickShow}
							onMouseDown={handleMouseDownPassword}
							edge="end"
						>
							{show ? <VisibilityOff /> : <Visibility />}
						</IconButton>
					</InputAdornment>
				}
			/>
		</FormControl>
	);
}

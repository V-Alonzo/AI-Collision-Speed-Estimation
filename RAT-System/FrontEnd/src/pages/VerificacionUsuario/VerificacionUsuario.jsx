import React, { useState, useContext, useEffect } from "react";
import ThemeContext from "../../context/ThemContext";
import UserContext from "../../context/UserContext";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { message } from "antd";
import { apiVerificacionUsuario , apiHandleEnviarCodigo, apiHandleValidarCodigo} from "./Services";
import logoImage from "../../assets/images/lcesvimexico.svg";

function VerificacionUsuario() {
  const themeContext = useContext(ThemeContext);
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const { themeGral, msErrorApi, logoutOptions } = themeContext;
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [datosVerificacion, setDatosVerificacion] = useState(null);

  // useEffect para ejecutar la validación previa
  useEffect(() => {  
    VerificacionUsuario();
  }, [user?.id, keycloak?.tokenParsed?.sub]);

   const VerificacionUsuario = async () => {
  
          try {
              const response = await apiVerificacionUsuario(
                  setLoading,
                  msErrorApi,
                  keycloak,
                  logoutOptions,
                  user?.id || keycloak?.tokenParsed?.sub
  
              )
              switch (response.status) {
                  case 403:
                      setLoading(false);
                      break;
  
                  case undefined:
                      setLoading(false);
                      break;
  
                  case 200:
  
                
                      setLoading(false);
                      break;
  
                  default:
                      break;
              }
          } catch (error) {
              setLoading(false);
          }
  
      };


  // Manejador para enviar código de validación a correo
  const handleEnviarCodigo = async () => {
             try {
              const response = await apiHandleEnviarCodigo(
                  setLoading,
                  msErrorApi,
                  keycloak,
                  logoutOptions,
                  user?.id || keycloak?.tokenParsed?.sub
  
              )
              switch (response.status) {
                  case 403:
                      setLoading(false);
                      break;
  
                  case undefined:
                      setLoading(false);
                      break;
  
                  case 200:
                      message.success("El código de validación ha sido enviado a su correo electrónico.");   
                
                      setLoading(false);
                      break;
  
                  default:
                      break;
              }
          } catch (error) {
              setLoading(false);
          }
  
  };

  // Manejador para validar el código introducido
  const handleValidarCodigo = async () => {

     try {
          if (!codigoAcceso.trim()) {
        message.warning("Por favor ingrese un código de acceso");
        return;
      }

              const response = await apiHandleValidarCodigo(
                  setLoading,
                  msErrorApi,
                  keycloak,
                  logoutOptions,
                  user?.id || keycloak?.tokenParsed?.sub,
                 codigoAcceso
  
              )
              switch (response.status) {
                  case 403:
                      setLoading(false);
                      break;
  
                  case undefined:
                      setLoading(false);
                      break;
  
                  case 200:
                    if(response.Validacion === true){
                      message.success("Código válido. Usuario verificado.");    
                      // Refrescar la página completamente como F5
                      setTimeout(() => {
                        window.location.href = window.location.origin + '/#/Dashboard';
                        window.location.reload();
                      }, 1000);
                     
                    } else {
                      message.error("Código inválido. Por favor, inténtalo de nuevo.");
                    }
  
                
                      setLoading(false);
                      break;
  
                  default:
                      break;
              }
          } catch (error) {
              setLoading(false);
          }




  };

  const logoUrl = logoImage;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeGral?.palette?.background?.default,
        padding: "20px",
      }}
    >
      <Card
        sx={{
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent
          sx={{
            textAlign: "center",
            padding: "40px 30px",
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              marginBottom: "30px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={logoUrl}
              alt="Logo Cesvimexico"
              style={{
                maxHeight: "80px",
                maxWidth: "200px",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Formulario de Verificación */}
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: "10px" }}>
              Verificación de Usuario
            </Typography>

            {/* Input de Código de Acceso */}
            <TextField
              label="Código de Acceso"
              variant="outlined"
              fullWidth
              value={codigoAcceso}
              onChange={(e) => setCodigoAcceso(e.target.value)}
              placeholder="Ingrese su código de acceso"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />

            {/* Botón Enviar Código */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleEnviarCodigo}
              disabled={loading}
              sx={{
                padding: "12px",
                fontSize: "16px",
                textTransform: "none",
                borderRadius: "8px",
                backgroundColor: themeGral?.palette?.primary?.main,
                "&:hover": {
                  backgroundColor: themeGral?.palette?.primary?.dark,
                },
              }}
            >
              {loading ? "Enviando..." : "Enviar Código de Validación"}
            </Button>

            {/* Botón Validar Código */}
            <Button
              variant="outlined"
              fullWidth
              onClick={handleValidarCodigo}
              disabled={loading || !codigoAcceso.trim()}
              sx={{
                padding: "12px",
                fontSize: "16px",
                textTransform: "none",
                borderRadius: "8px",
                borderColor: themeGral?.palette?.primary?.main,
                color: themeGral?.palette?.primary?.main,
                "&:hover": {
                  backgroundColor: `${themeGral?.palette?.primary?.main}10`,
                },
              }}
            >
              {loading ? "Validando..." : "Validar Código"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default VerificacionUsuario;

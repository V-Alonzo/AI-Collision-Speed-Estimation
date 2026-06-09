import React, { useState, useContext, useEffect } from "react";

import ThemeContext from "../../../context/ThemContext";
import UserContext from "../../../context/UserContext";
import { useKeycloak } from "@react-keycloak/web";

//MUI
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import { notification, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { CryptoJSAesEncrypt, beforeUpload, resizeImage } from '../../../components/Global/funciones';
//import { api } from "../api/client";

import PreseferenciasUpdate, { apiUpdatePreferenciasModelos, apiConsultaDataConstantes } from "./Services";


const FILES_BASE_URL = process.env.REACT_APP_FILES_BASE_URL || "http://localhost/ProyAgusto/FotosVin/Templet-BackEnd-main/public/";

function Preferencias() {

    const { themeGral, msErrorApi, logoutOptions } = useContext(ThemeContext);
    const { user } = useContext(UserContext);
    const { keycloak } = useKeycloak();

    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [logoFileList, setLogoFileList] = useState([]);
    const [formData, setFormData] = useState({
        id_company: user?.id_company || "",
        company: "",
        primary_color: "#000000",
        secondary_color: "#000000",
        text_color_primario: "#FFFFFF",
        text_color_secundario: "#FFFFFF",
    });

    // Estados para configuración de modelos
    const [modelosConfig, setModelosConfig] = useState({
        reconocimiento_vin: false,
        anonimizar_vin: false,
        anonimizar_placas: false,
        anonimizar_rostros: false,
    });

    // Cargar datos del contexto al montar el componente
    useEffect(() => {
        if (user && themeGral) {
            setFormData({
                id_company: user?.id_company || "",
                company: user?.company || "",
                primary_color: themeGral.primary_color || "#000000",
                secondary_color: themeGral.secondary_color || "#000000",
                text_color_primario: themeGral.text_color_primario || "#FFFFFF",
                text_color_secundario: themeGral.text_color_secundario || "#FFFFFF",
            });
        }
        ConsultaDataConstantes()
    }, [user, themeGral]);


    const ConsultaDataConstantes = async () => {

        try {
            const response = await apiConsultaDataConstantes(
                setLoading,
                msErrorApi,
                keycloak,
                logoutOptions,

            )

            console.log("response ConsultaDataConstantes:", response);
            switch (response.status) {
                case 403:
                    setLoading(false);
                    break;

                case undefined:
                    setLoading(false);
                    break;

                case 200:

                    setModelosConfig({
                        reconocimiento_vin: response.reconocimiento_vin === 1,
                        anonimizar_vin: response.anonimizar_vin === 1,
                        anonimizar_placas: response.anonimizar_placas === 1,
                        anonimizar_rostros: response.anonimizar_rostros === 1,
                    });
                    setLoading(false);
                    break;

                default:
                    break;
            }
        } catch (error) {
            setLoading(false);
        }

    };




    // Manejador de cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Manejador de cambios para color picker
    const handleColorChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // Manejador para el upload de icono
    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleLogoUploadChange = ({ fileList: newFileList }) => {
        setLogoFileList(newFileList);
    };

    // Props para el Upload
    const uploadProps = {
        name: "icono",
        listType: "picture",
        fileList: fileList,
        beforeUpload: beforeUpload,
        onChange: handleUploadChange,
    };

    const uploadLogoProps = {
        name: "file",
        listType: "picture",
        fileList: logoFileList,
        beforeUpload: beforeUpload,
        onChange: handleLogoUploadChange,
    };

    // Manejador onFinish del formulario
    const handleFinish = async (values) => {
        try {
            setLoading(true);

            // ✅ 1) JSON con los datos del formulario
            const payloadObj = {
                id_company: user.id_company,
                company: formData.company,
                primary_color: formData.primary_color,
                secondary_color: formData.secondary_color,
                text_color_primario: formData.text_color_primario,
                text_color_secundario: formData.text_color_secundario,
            };
            console.log("payloadObj:", payloadObj);

            // ✅ 2) FormData final
            const formDataToSend = new FormData();
            formDataToSend.append("payload", CryptoJSAesEncrypt(payloadObj));

            // ✅ 3) Redimensionar y adjuntar archivo de icono si existe
            if (fileList.length > 0) {
                const realFile = fileList[0].originFileObj;
                if (realFile instanceof File) {
                    try {
                        const resizedBlob = await resizeImage(realFile);
                        formDataToSend.append("icono", resizedBlob, realFile.name);
                    } catch (error) {
                        notification.error({
                            message: "Error",
                            description: `Error al procesar la imagen: ${error}`,
                            placement: "topRight",
                        });
                        setLoading(false);
                        return;
                    }
                }
            }

            // ✅ 4) Redimensionar y adjuntar archivo de logo si existe
            if (logoFileList.length > 0) {
                const logoRealFile = logoFileList[0].originFileObj;
                if (logoRealFile instanceof File) {
                    try {
                        const resizedLogo = await resizeImage(logoRealFile);
                        formDataToSend.append("logo", resizedLogo, logoRealFile.name);
                    } catch (error) {
                        notification.error({
                            message: "Error",
                            description: `Error al procesar el logo: ${error}`,
                            placement: "topRight",
                        });
                        setLoading(false);
                        return;
                    }
                }
            }


            UpdatePreferencias(formDataToSend);

        } catch (error) {
            setLoading(false);
        }
    };


    const UpdatePreferencias = async (formdata) => {
        console.log("formdata InsertarRegistroSin:", formdata);
        for (let [key, value] of formdata.entries()) {
            console.log(key, value);
        }
        try {
            const response = await PreseferenciasUpdate(
                setLoading,
                msErrorApi,
                keycloak,
                logoutOptions,
                formdata
            )

            console.log("response UpdatePreferencias:", response);


            switch (response.status) {
                case 403:
                    setLoading(false);
                    break;

                case undefined:
                    setLoading(false);
                    break;

                case 200:
                    message.success(`Preferencias guardadas correctamente`);
                    setLoading(false);

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);

                    break;

                default:
                    break;
            }
        } catch (error) {
            setLoading(false);
        }

    };





    // Manejador para switches de modelos
    const handleModeloChange = (e) => {
        const { name, checked } = e.target;

        console.log("Modelo cambiado:", name, checked);

        setModelosConfig((prev) => ({
            ...prev,
            [name]: checked,
        }));

        UpdatePreferenciasModelos(name, checked);
    };


    const UpdatePreferenciasModelos = async (name, checked) => {

        let parametros = {
            name: name,
            checked: checked
        };
        console.log("parametros InsertarRegistroSin:", parametros);
        try {
            const response = await apiUpdatePreferenciasModelos(
                setLoading,
                msErrorApi,
                keycloak,
                logoutOptions,
                parametros
            )

            console.log("response UpdatePreferenciasModelos:", response);


            switch (response.status) {
                case 403:
                    setLoading(false);
                    break;

                case undefined:
                    setLoading(false);
                    break;

                case 200:
                    message.success(`Preferencias guardadas correctamente`);
                    setLoading(false);



                    break;

                default:
                    break;
            }
        } catch (error) {
            setLoading(false);
        }

    };


    return (
        <Box sx={{ p: 2, backgroundColor: themeGral?.palette?.background?.default, width: "100%" }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                        Configuración de Empresa
                    </Typography>

                    <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                        {/* Columna 1 */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Nombre de la Empresa"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                variant="outlined"
                                placeholder="Ingrese el nombre de la empresa"
                            />


                        </Box>

                        {/* Columna 2 */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                                    Logo de la Empresa
                                </Typography>
                                {themeGral?.logo && (
                                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                                        <img
                                            src={`${FILES_BASE_URL}${themeGral.logo}`}
                                            alt="Logo actual"
                                            style={{ maxWidth: '150px', maxHeight: '60px', objectFit: 'contain' }}
                                        />
                                    </Box>
                                )}
                                <Upload {...uploadLogoProps}>
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadOutlined />}
                                        fullWidth
                                    >
                                        Subir Logo
                                    </Button>
                                </Upload>
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                                    Icono de la Empresa
                                </Typography>
                                {themeGral?.icono && (
                                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                                        <img
                                            src={`${FILES_BASE_URL}${themeGral.icono}`}
                                            alt="Icono actual"
                                            style={{ maxWidth: '80px', maxHeight: '80px', objectFit: 'contain' }}
                                        />
                                    </Box>
                                )}
                                <Upload {...uploadProps}>
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadOutlined />}
                                        fullWidth
                                    >
                                        Subir Icono
                                    </Button>
                                </Upload>
                            </Box>

                        </Box>
                    </Box>

                    {/* Sección de Colores */}
                    <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                        Paleta de Colores
                    </Typography>

                    {/* Fila 1 de colores - Header */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>Color Primario</span>
                                    <Tooltip title="Aplica al encabezado y botones primarios">
                                        <InfoOutlined fontSize="small" />
                                    </Tooltip>
                                </Box>
                            }
                            name="primary_color"
                            type="color"
                            value={formData.primary_color}
                            onChange={handleColorChange}
                            variant="outlined"
                            inputProps={{ style: { height: "40px", cursor: "pointer" } }}
                        />

                        <TextField
                            fullWidth
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>Color Secundario</span>
                                    <Tooltip title="Aplica a color de encabezados de componentes, iconos de menu y botones secundarios">
                                        <InfoOutlined fontSize="small" />
                                    </Tooltip>
                                </Box>
                            }
                            name="secondary_color"
                            type="color"
                            value={formData.secondary_color}
                            onChange={handleColorChange}
                            variant="outlined"
                            inputProps={{ style: { height: "40px", cursor: "pointer" } }}
                        />



                        <TextField
                            fullWidth
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>Color Texto Primario</span>
                                    <Tooltip title="Texto principal (header, botones primarios)">
                                        <InfoOutlined fontSize="small" />
                                    </Tooltip>
                                </Box>
                            }
                            name="text_color_primario"
                            type="color"
                            value={formData.text_color_primario}
                            onChange={handleColorChange}
                            variant="outlined"
                            inputProps={{ style: { height: "40px", cursor: "pointer" } }}
                        />

                        <TextField
                            fullWidth
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <span>Color Texto Secundario</span>
                                    <Tooltip title="Texto secundario / iconos en header y titulos de componentes">
                                        <InfoOutlined fontSize="small" />
                                    </Tooltip>
                                </Box>
                            }
                            name="text_color_secundario"
                            type="color"
                            value={formData.text_color_secundario}
                            onChange={handleColorChange}
                            variant="outlined"
                            inputProps={{ style: { height: "40px", cursor: "pointer" } }}
                        />

                    </Box>


                    {/* Botones de Acción */}
                    <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            style={{ backgroundColor: themeGral.secondary_color, color: themeGral.text_color_secundario, width: '300px', height: '40px' }}
                            onClick={() => handleFinish(formData)}
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                            variant="outlined"
                            style={{ backgroundColor: '#FFFFFF', color: '#000000', width: '300px', height: '40px' }}
                            onClick={() => {
                                setFormData({
                                    id_company: user?.id_company || "",
                                    company: user?.company || "",
                                    primary_color: themeGral?.primary_color || "#000000",
                                    secondary_color: themeGral?.secondary_color || "#000000",
                                    text_color_primario: themeGral?.text_color_primario || "#FFFFFF",
                                    text_color_secundario: themeGral?.text_color_secundario || "#FFFFFF",
                                });
                                setFileList([]);
                                setLogoFileList([]);
                            }}
                        >
                            Limpiar
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Nueva Card para Configuración de Modelos */}

            {user.id_company === 1 &&
                <Spin spinning={loading} tip="Cargando...">
                    <Card sx={{ mt: 3 }}>
                        <CardContent>
                            <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                                Configuración de Modelos a Utilizar
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {/* Modelo de Reconocimiento de VIN */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1">
                                            Utilizar modelo para reconocimiento de VIN por foto
                                        </Typography>
                                        <Tooltip title="Habilita el reconocimiento automático del VIN mediante fotografías">
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={modelosConfig.reconocimiento_vin}
                                                onChange={handleModeloChange}
                                                name="reconocimiento_vin"
                                                color="primary"
                                            />
                                        }
                                        label={modelosConfig.reconocimiento_vin ? "Activado" : "Desactivado"}
                                    />
                                </Box>

                                {/* Modelo de Anonimizar VIN */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1">
                                            Utilizar modelo para anonimizar VIN
                                        </Typography>
                                        <Tooltip title="Oculta o anonimiza los números VIN en las imágenes">
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={modelosConfig.anonimizar_vin}
                                                onChange={handleModeloChange}
                                                name="anonimizar_vin"
                                                color="primary"
                                            />
                                        }
                                        label={modelosConfig.anonimizar_vin ? "Activado" : "Desactivado"}
                                    />
                                </Box>

                                {/* Modelo de Anonimizar Placas */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1">
                                            Utilizar modelo para anonimizar placas
                                        </Typography>
                                        <Tooltip title="Oculta o anonimiza las placas vehiculares en las imágenes">
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={modelosConfig.anonimizar_placas}
                                                onChange={handleModeloChange}
                                                name="anonimizar_placas"
                                                color="primary"
                                            />
                                        }
                                        label={modelosConfig.anonimizar_placas ? "Activado" : "Desactivado"}
                                    />
                                </Box>

                                {/* Modelo de Anonimizar Rostros */}
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="body1">
                                            Utilizar modelo para anonimizar rostros
                                        </Typography>
                                        <Tooltip title="Detecta y oculta rostros de personas en las imágenes">
                                            <InfoOutlined fontSize="small" color="action" />
                                        </Tooltip>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={modelosConfig.anonimizar_rostros}
                                                onChange={handleModeloChange}
                                                name="anonimizar_rostros"
                                                color="primary"
                                            />
                                        }
                                        label={modelosConfig.anonimizar_rostros ? "Activado" : "Desactivado"}
                                    />
                                </Box>
                            </Box>


                        </CardContent>
                    </Card>
                </Spin>
            }
        </Box>
    );
}

export default Preferencias;

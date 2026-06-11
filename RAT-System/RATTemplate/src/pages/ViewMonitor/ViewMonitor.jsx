import React, { useState, useContext, useEffect, useMemo } from "react";

import ThemeContext from "../../context/ThemContext";
import UserContext from "../../context/UserContext";
import { useKeycloak } from "@react-keycloak/web";
//MUI
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import SearchIcon from "@mui/icons-material/Search";

import { DatePicker, Divider, Modal, Button as AntButton } from "antd";
import dayjs from "dayjs";
import { apiConsultaDataForm, apiConsultaDataVisor, apiOnVerDetalle } from "./Services";
import TablaANTD from "../../components/Global/TablaComponent";

const { RangePicker } = DatePicker;

function ViewMonitor() {

    const themeContext = useContext(ThemeContext);
    const { keycloak } = useKeycloak();

    const { themeGral, msErrorApi, logoutOptions, } = themeContext;

    const { user } = useContext(UserContext);

    const [datasource, setDataSource] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setloading] = useState(false);
    const [tableProps, setTableProps] = useState({});
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
   
    const [dateRange, setDateRange] = useState([null, null]);

    // Tabla de detalle (modal)
    const [detailDatasource, setDetailDatasource] = useState([]);
    const [detailColumns, setDetailColumns] = useState([]);
    const [detailTableProps, setDetailTableProps] = useState({});

    // Datos de ejemplo - reemplazar con datos reales
    const [companies, setCompanies] = useState([]);

    const [users, setUsers] = useState([]);
     const [usersMostrar, setUsersMostrar] = useState([]);

    useEffect(() => {
        // Cargar datos al montar el componente
        ConsultaDataForm();
    }, []);



    const ConsultaDataForm = async () => {

        try {
            const response = await apiConsultaDataForm(
                setloading,
                msErrorApi,
                keycloak,
                logoutOptions,

            )
            switch (response.status) {
                case 403:
                    setloading(false);
                    break;

                case undefined:
                    setloading(false);
                    break;

                case 200:
                    
                    setColumns(response?.columns);
                    setDataSource(response?.data);
                    setTableProps(response?.props_table);
                    setCompanies(response?.CatEmpresas);
                    setUsers(response?.CatUsers);

                    setloading(false);
                    break;

                default:
                    break;
            }
        } catch (error) {
            setloading(false);
        }

    };

    const ConsultaDataVisor = async () => {

        const parametros = {
            id_company: selectedCompany,
            id_keycloak: selectedUser === "" ? null : selectedUser,
            fecha_inicio: dateRange[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : null,
            fecha_fin: dateRange[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : null,
        };

        try {
            const response = await apiConsultaDataVisor(
                setloading,
                msErrorApi,
                keycloak,
                logoutOptions,
                parametros

            )
            console.log("response ", response);
            switch (response.status) {
                case 403:
                    setloading(false);
                    break;

                case undefined:
                    setloading(false);
                    break;

                case 200:

                    setDataSource(response?.data);
                    setloading(false);
                    break;

                default:
                    break;
            }
        } catch (error) {
            setloading(false);
        }

    };


    //ACTION'S DE LAS TABLAS
    const OnClickAction = (row, key) => { swicthComponentAction[key](row) };

    const swicthComponentAction = {
        VerDetalle: (row) => onVerDetalle(row),

    };



    const onVerDetalle = async (row) => {
        const parametros = {
            id_keycloak: row.id_keycloak,
            consulta: row.consulta,
            fecha_inicio: dateRange[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : null,
            fecha_fin: dateRange[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : null,
        };



        try {
            const response = await apiOnVerDetalle(
                setloading,
                msErrorApi,
                keycloak,
                logoutOptions,
                parametros

            )
            switch (response.status) {
                case 403:
                    setloading(false);
                    break;

                case undefined:
                    setloading(false);
                    break;

                case 200:
                    setDetailDatasource(response?.data || response?.data || []);
                    setDetailColumns(response?.columns_detalle || response?.columns || []);
                    setDetailTableProps(response?.props_table_detalle || response?.props_table || {});
                    showModal();

                    setloading(false);
                    break;

                default:
                    break;
            }
        } catch (error) {
            setloading(false);
        }

    };


    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleChangeCompany = (event) => {
        setSelectedCompany(event.target.value);
        setUsersMostrar(users.filter(user => user.id_company === event.target.value));
        setSelectedUser(null)
    }


    return (

        <>

            <Modal
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={[

                    <AntButton
                        key="submit"
                        type="primary"
                        loading={loading}
                        style={{ backgroundColor: themeGral?.secondary_color, color: themeGral?.text_color_secundario, width: '100%', height: '40px' }}
                        onClick={handleOk}
                    >
                        Aceptar
                    </AntButton>
                ]}
            >
                <Box sx={{ width: "100%" }}>
                    <TablaANTD
                        loading={loading}
                        columnsTable={detailDatasource.length > 0 ? detailColumns : []}
                        datasource={detailDatasource}

                        setDataSource={setDetailDatasource}
                        pagination={detailTableProps?.pagination}
                        pageSize={detailTableProps?.pageSize}
                        simplepage={detailTableProps?.simplepage}
                        positionBottom={detailTableProps?.positionBottom}
                        positionTop={detailTableProps?.positionTop}
                        size={detailTableProps?.size}
                        bordered={detailTableProps?.bordered}
                        scrollX={detailTableProps?.scrollX}
                        scrollY={detailTableProps?.scrollY}
                        tableLayout={detailTableProps?.tableLayout}
                        dragSorting={detailTableProps?.dragSorting}
                        Title={detailTableProps?.Title}
                        IconAvatar={detailTableProps?.IconAvatar}
                    />
                </Box>

            </Modal>


            <Box sx={{ p: 2, backgroundColor: themeGral?.palette?.background?.default, width: "100%" }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                            Visor de consultas
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                            {user.id_company === 1 &&
                                <Box sx={{ flex: 1 }}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="company-select-label">Empresa</InputLabel>
                                        <Select
                                            labelId="company-select-label"
                                            id="company-select"
                                            value={selectedCompany}
                                            onChange={handleChangeCompany}
                                            label="Empresa"
                                        >
                                            <MenuItem value="">
                                                <em>Seleccionar empresa</em>
                                            </MenuItem>
                                            {companies.map((company) => (
                                                <MenuItem key={company.id_company} value={company.id_company}>
                                                    {company.company}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            }


                            {user.id_rol === 1 &&
                                <Box sx={{ flex: 1 }}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel id="user-select-label">Usuario</InputLabel>
                                        <Select
                                            labelId="user-select-label"
                                            id="user-select"
                                            value={selectedUser}
                                            onChange={(e) => setSelectedUser(e.target.value)}
                                            label="Usuario"
                                        >
                                            <MenuItem value="">
                                                <em>Seleccionar usuario</em>
                                            </MenuItem>
                                            {usersMostrar.map((user) => (
                                                <MenuItem key={user.id_keycloak} value={user.id_keycloak}>
                                                    {user.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            }

                            <Box sx={{ flex: 1 }}>
                                <RangePicker
                                    style={{ width: "100%", height: "56px" }}
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates)}
                                    format="DD/MM/YYYY"
                                    placeholder={["Fecha Inicio", "Fecha Fin"]}
                                />
                            </Box>
                        </Box>

                        {/* Botones de Acción */}
                        <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                style={{
                                    backgroundColor: themeGral?.secondary_color,
                                    color: themeGral?.text_color_secundario,
                                    width: '300px',
                                    height: '40px'
                                }}
                                disabled={loading}
                                onClick={ConsultaDataVisor}
                            >
                                {loading ? "Cargando..." : "Buscar"}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ width: "100%" }}>
                    <TablaANTD
                        loading={loading}
                        columnsTable={datasource.length > 0 ? columns : []}
                        datasource={datasource}

                        setDataSource={setDataSource}
                        pagination={tableProps?.pagination}
                        pageSize={tableProps?.pageSize}
                        simplepage={tableProps?.simplepage}
                        positionBottom={tableProps?.positionBottom}
                        positionTop={tableProps?.positionTop}
                        size={tableProps?.size}
                        bordered={tableProps?.bordered}
                        scrollX={tableProps?.scrollX}
                        scrollY={tableProps?.scrollY}
                        tableLayout={tableProps?.tableLayout}
                        dragSorting={tableProps?.dragSorting}
                        Title={tableProps?.Title}
                        IconAvatar={tableProps?.IconAvatar}

                        OnClickAction={OnClickAction}
                    //ActualizaTabla={() => ConsultaDataForm()}
                    />
                </Box>

            </Box>
        </>
    );
}

export default ViewMonitor;

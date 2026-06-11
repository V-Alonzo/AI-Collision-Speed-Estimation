import React, { useContext, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import ThemeContext from "../../../context/ThemContext";
import UserContext from "../../../context/UserContext";
import TablaANTD from "../../../components/Global/TablaComponent";
import FormularioCatalogo from "./Componentes/FormularioCatalogo";
import { Modal } from "antd";

import GetDataCatalogoGral from "./Services";

const CatalogosGrales = ({ TipoCatalogo = "" }) => {
	const { keycloak } = useKeycloak();
	const themeContext = useContext(ThemeContext);
	const { msErrorApi, logoutOptions, themeGral } = themeContext;

    const userContext = useContext(UserContext);
    const { user } = userContext;

	const [datasource, setDataSource] = useState([]);
	const [columns, setColumns] = useState([]);
	const [tableProps, setTableProps] = useState({});
	const [formItems, setFormItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [noColumnasForm, setNoColumnasForm] = useState(0);
    const [accion, setAccion] = useState("agregar");
    const [catalogosOpciones, setCatalogosOpciones] = useState({});
	const [campoPry, setCampoPry] = useState("");

	useEffect(() => {
		if (TipoCatalogo !== null && TipoCatalogo !== undefined) {
			loadCatalogo();
		}
	}, [TipoCatalogo]);

	const loadCatalogo = async () => {
		try {
			const response = await GetDataCatalogoGral(
				setLoading,
				msErrorApi,
				keycloak,
				logoutOptions,
				TipoCatalogo
			);


         	switch (response.status) {
				case 200:
                    setFormItems(response.data.formItems || []);			
                    setNoColumnasForm(response.data.no_columnas ? response.data.no_columnas : 0);
                    setColumns(response.data.tableColumns || []);
                    setDataSource(response.data.recordsTable || []);
                    setTableProps(response.data.tableProps || {});
					setCampoPry(response.data.primaryKey || "");
					setLoading(false);
					break;
				case 403:
				case undefined:
				default:
					setLoading(false);
					break;
			}
		} catch (error) {
			setLoading(false);
		}
	};

      //ACTION'S DE LAS TABLAS
  const OnClickAction = (row, key, event) => {
    swicthComponentAction[key](row, event);
   
  };

   const swicthComponentAction = {
     "Editar": (row) => EditElement(row),    
  };


  const AddRegistro = () => {
    setAccion("agregar");
    setCatalogosOpciones({});
    setIsModalOpen(true);

  }

  const EditElement = (row) => {
    setAccion("edit");
    setCatalogosOpciones(row);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }
	return (
		<Box sx={{ p: 2, backgroundColor: themeGral?.palette?.background?.default }}>
			<Card>
				<CardContent>
					<Typography variant="h5" component="div" sx={{ mb: 3 }}>
						Catalogos Generales
					</Typography>
                    
					<Modal
						title="Agregar Registro"
						open={isModalOpen}
						onCancel={handleCloseModal}
						footer={null}
						width={800}
						destroyOnHidden
					>
						{formItems.length > 0 && (
							<FormularioCatalogo 
                                TipoCatalogo={TipoCatalogo}
								formItems={formItems} 
								loading={loading} 
								setLoading={setLoading}
								onClose={handleCloseModal}
                                noColumnasForm={noColumnasForm}
                                accion={accion}
                                catalogosOpciones={catalogosOpciones}
                                loadCatalogo={loadCatalogo}
								campoPry={campoPry}
							/>
						)}
					</Modal>

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
                        ActualizaTabla={() => loadCatalogo()}
                         Agregar={() => AddRegistro()}

                        
					/>
				</CardContent>
			</Card>
		</Box>
	);
};

export default CatalogosGrales;

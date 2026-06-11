import React, { useContext, useEffect, useState } from "react";
import { useKeycloak } from "@react-keycloak/web";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import ThemeContext from "../../../../context/ThemContext";
import UserContext from "../../../../context/UserContext";
import { Form, Input, Select, Button, InputNumber, Divider } from "antd";
import { SaveOutlined } from "@ant-design/icons";

import {putCRUDCatalogo} from "../Services";

const { Option } = Select;

const FormularioCatalogo = ({ TipoCatalogo, loadCatalogo, formItems = [], loading = false, setLoading, catalogosOpciones = {}, onClose, noColumnasForm = 2, accion = "agregar", campoPry }) => {
    const { keycloak } = useKeycloak();
    const themeContext = useContext(ThemeContext);
    const { msErrorApi, logoutOptions, themeGral } = themeContext;

     const userContext = useContext(UserContext);
    const { user } = userContext;

    const [form] = Form.useForm();
    const [valorCampoPry, setValorCampoPry] = useState(null);

    useEffect(() => {
       const valor = catalogosOpciones[campoPry];
       setValorCampoPry(valor);
    }, [catalogosOpciones, campoPry]);

    useEffect(() => {
        if (accion === 'edit' && catalogosOpciones && Object.keys(catalogosOpciones).length > 0) {
            form.setFieldsValue(catalogosOpciones);
        }

        if (accion === 'agregar' && formItems.length > 0 && user?.id_company !== 1) {
            const hasIdempField = formItems.some(item => item.name === 'idemp');
            if (hasIdempField && user?.id_company) {
                form.setFieldsValue({ idemp: user.id_company });
            }
        }
    }, [accion, catalogosOpciones, formItems, user, form]);

    const ApiCRUDCatalogo = async (parametros) => {
        try {
            const response = await putCRUDCatalogo(
                setLoading,
                msErrorApi,
                keycloak,
                logoutOptions,
                parametros,
                accion,
                TipoCatalogo
            );

            switch (response.status) {
                case 200:
                    form.resetFields();
                    onClose && onClose();
                    loadCatalogo && loadCatalogo();
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

    const onFinish = async (values) => {
      
        try {
            setLoading(true);
            
            // Si la acción es editar, agregar campoPry con su valor
            if (accion === 'edit') {
                values[campoPry] = valorCampoPry;
            }
        

            await ApiCRUDCatalogo(values);
        } catch (error) {
            console.error("Error al guardar:", error);
            setLoading(false);
        }
    };


    const renderField = (item) => {
        const isReadOnly = user?.id_company !== 1 && item.solo_cesvi === 'si';
        const shouldDisableOnLoading = loading;
        const commonProps = {
            placeholder: item.preholder,
        };

        switch (item.tipo_columna) {
            case "text":
                return (
                    <Input
                        {...commonProps}
                        maxLength={item.max_length}
                        readOnly={isReadOnly}
                        disabled={shouldDisableOnLoading}
                    />
                );

            case "number":
                return (
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder={item.preholder}
                        disabled={shouldDisableOnLoading || isReadOnly}
                    />
                );

            case "select":
                const options = item.opciones || [];
                return (
                    <Select
                        {...commonProps}
                        showSearch
                        allowClear
                        options={options}
                        disabled={shouldDisableOnLoading || isReadOnly}
                    />
                );

            case "textarea":
                return (
                    <Input.TextArea
                        {...commonProps}
                        rows={4}
                        maxLength={item.max_length}
                        readOnly={isReadOnly}
                        disabled={shouldDisableOnLoading}
                    />
                );

            default:
                return (
                    <Input
                        {...commonProps}
                        maxLength={item.max_length}
                        readOnly={isReadOnly}
                        disabled={shouldDisableOnLoading}
                    />
                );
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${noColumnasForm}, 1fr)`,
                    gap: 2,
                    '@media (max-width: 600px)': {
                        gridTemplateColumns: '1fr'
                    }
                }}>
                    {formItems
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                            <Box key={item.id_cat_gral_columna}>
                                <Form.Item
                                    name={item.name}
                                    label={item.label}
                                    rules={[
                                        {
                                            required: item.requerido === "si",
                                            message: item.mensaje_reque,
                                        },
                                    ]}
                                    tooltip={item.descripcion}
                                >
                                    {renderField(item)}
                                </Form.Item>
                            </Box>
                        ))}
                </Box>

                <Divider />
                <Form.Item>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>

                        <Button
                            type="default"
                            onClick={() => {
                                form.resetFields();
                                onClose && onClose();
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SaveOutlined />}
                            style={{
                                backgroundColor: themeGral?.secondary_color,
                                borderColor: themeGral?.secondary_color,
                            }}
                          
                        >
                            Guardar
                        </Button>

                    </Box>
                </Form.Item>
            </Form>
        </Box>
    );
};

export default FormularioCatalogo;

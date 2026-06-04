import React, { useState, createContext } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState({
        // Configuración de UI
        area: "DEPARTAMENTO_EJEMPLO",
        primary_color: "#000000",
        secondary_color: "#FFFFFF",
        text_color_primario: "#000000",
        text_color_secundario: "#FFFFFF",
        icono: "default_icon",
        logo: "default_logo",
        size_icon: 25,

        // Información Laboral/Perfil
        correo: "usuario@ejemplo.com",
        curp: "XXXX000000XXXXXX00",
        cve_empleado: "ID-000",
        depto: "NOMBRE_DEPTO",
        email: "usuario@ejemplo.com",
        family_name: "Apellido",
        given_name: "Nombre",
        nombre: "NOMBRE COMPLETO USUARIO",
        fecha_ingreso: "YYYY-MM-DD",
        
        // Identificadores de Sistema
        id_area: 0,
        id_company: 0,
        id_depto: 0,
        id_keycloak: "00000000-0000-0000-0000-000000000000",
        id_modulo: "0",
        id_puesto: 0,
        jefe_inmediato: "BOSS-ID",
        
        // Atributos de Sesión
        preferred_username: "username",
        name_avatar: "UN",
        nivel_puesto: "NIVEL",
        no_seguro_social: "00000000000",
        path_foto: "path/to/photo",
        code_activacion: "",
        puesto: "PUESTO_DEL_USUARIO",
        rol: "ROL_USUARIO",
        sexo: "N/A",
        status: "ACTIVO",
        tipo_empleado: "TIPO",
    })

    const updateUser = (newUser) => {
        setUser(newUser)
    }

    return (
        <UserContext.Provider
            value={{
                user,
                updateUser
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export default UserContext;

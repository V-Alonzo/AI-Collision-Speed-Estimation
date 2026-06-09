import React, { useState, createContext } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(

        {
            area: "OPERACIONES",
            primary_color: "#009AD4",
            secondary_color: "#FFFFFF",
            text_color_primario: "#009AD4",
            text_color_secundario: "#FFFFFF",
            icono: "icono_cesvi",
            logo: "logo_cesvi",

            // background_color: "#009AD4",
            // color: "#FFFFFF",
            // color_badge: "#FF0000",
            // color_icon: "#009AD4",
            // color_table: "#009AD4",
            
            correo: "jrpavon@cesvimexico.com.mx",
            curp: "PACR850202HMCVMB00",
            cve_empleado: "CM258",
            depto: "OPERACIONES",
            email: "jrpavon@cesvimexico.com.mx",
            family_name: "Pavon",
            fecha_ingreso: "2009-04-13",
            given_name: "Roberto",
            id_area: 5,
            id_company: 1,
            id_depto: 32,
            id_keycloak: "15bebb07-5369-4373-b4d9-689bcbac9174",
            id_modulo: "6",
            id_puesto: 167,
            jefe_inmediato: "CM0217",
            name: "Roberto Pavon",
            name_avatar: "JR",
            nivel_puesto: "INGENIERO",
            no_seguro_social: "16068521547",
            nombre: "JOSE ROBERTO PAVON CAMPOS",
            path_foto: "path_foto",
            preferred_username: "jrpavon",
            code_activacion:"",
            
            puesto: "ASISTENTE DE INVESTIGADOR",
            rol: "Ajustador",
            sexo: "MASCULINO",
            size_icon: 25,
            status: "ALTA",
            tipo_empleado: "EMPLEADO",           
        }

    )

    const updateUser = newUser => {
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
import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import { useKeycloak } from '@react-keycloak/web'

const Login = () => {
    const navigate = useNavigate()
    const { keycloak } = useKeycloak()

    useEffect(() => {
        if (!keycloak.authenticated) {
            navigate('/')
            keycloak.login(process.env.REACT_APP_logoutOption)
        }     

    }, [keycloak])
}

export default Login;

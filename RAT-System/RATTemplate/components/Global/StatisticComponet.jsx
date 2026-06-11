import React, { useContext } from 'react';
import ThemeContext from '../../context/ThemContext'

import 'antd/dist/antd.css';
import { ConfigProvider, Statistic } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { Icon } from '@iconify/react';


const StatisticAntd = (props) => {
    // Hook y funciones o metodos Globales
    const themeContext = useContext(ThemeContext)
    const { idiomaGral } = themeContext

    const { iconPrefix , sizeIcon, loading,
        backgroundColor, title, value, precision, valueColor, suffix
    } = props

    return (
        <ConfigProvider locale={idiomaGral}>
            <Statistic
                loading={loading}
                title={title}
                value={value}
                precision={precision}
                valueStyle={{
                    color: valueColor,
                }}
                prefix={<Icon icon={iconPrefix} style={{ fontSize: sizeIcon, }} />}
                suffix={suffix}
            />

        </ConfigProvider>)
};

export default StatisticAntd;
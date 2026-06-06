import React, { useContext } from 'react';
import ThemeContext from '../../context/ThemContext'

import 'antd/dist/antd.css';
import { ConfigProvider, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const SwitchAntd = (props) => {

  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext

  const { size, disabled, loading, onChange, defaultChecked, checkedChildren, unCheckedChildren } = props

  return (
    <ConfigProvider locale={idiomaGral}>

      <Switch
        size={size}
        loading={loading}
        disabled={disabled && disabled}
        defaultChecked={defaultChecked}
        onChange={onChange && onChange}
        checkedChildren={checkedChildren ? checkedChildren : <CheckOutlined />}
        unCheckedChildren={unCheckedChildren ? unCheckedChildren : <CloseOutlined />}
      />

    </ConfigProvider>)
};

export default SwitchAntd;
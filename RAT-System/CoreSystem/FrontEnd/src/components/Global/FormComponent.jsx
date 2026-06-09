import React, { useState, useContext, useEffect } from 'react';
import ThemeContext from '../../context/ThemContext'
import Grid from "@mui/material/Grid";
//antd
import {
  ConfigProvider,
  Button, Form,
  Input, InputNumber,
  DatePicker, TimePicker,
  Select, Upload,
  Checkbox, Switch, Slider, Radio, Rate, Spin,  Popconfirm
} from 'antd';

import { Icon } from '@iconify/react';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { Uid } from './funciones.jsx'

const { RangePicker } = DatePicker;
const { Option } = Select;

const FormAntd = (props) => {
  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral, themeGral } = themeContext

  const {
    form,
    formItems,
    onFinish,
    titleSubmit = 'Submit',
    iconButton = 'line-md:search',
    iconButtonSec = 'mdi:microsoft-excel',
    titleSubmitSec = '',
    ButtonSec,
    ButtonSecConfirm,
    onClickSec,
    // onChangeSelect,
    loading,
    xs = 12,
    sm = 6,
    md = 4,
    layout = "horizontal",
    block = true,
    position = 'absolute',
    salto = true,

    xsBotton = 12,
    smBotton = 6,
    mdBotton = 4,

    titlePopconfirm="Delete the task",
    descriptionPopconfirm="",

  } = props

  const [formItem, setFormItem] = useState([])
  const [arrayOption, setArrayOption] = useState(0)


  ///Upload
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e.fileList;
  };
  const swicthTipo = {
    "Input": ({ placeholder }) => <Input placeholder={placeholder} />,
    "InputPassword": () => <Input.Password />,
    "InputNumber": ({ min = "1", max, step = "0.01", width = 200, stringMode = true }) =>
      <InputNumber
        defaultValue="1"
        min={min}
        max={max}
        step={step}
        stringMode={stringMode}
        style={{
          width: width,
        }}
      />,
    "InputTextArea": ({ maxLength, showCount }) => <Input.TextArea showCount={showCount} maxLength={maxLength} />,

    "DatePicker": ({ showTime, format }) => <DatePicker showTime={showTime} format={format} />,
    "RangePicker": ({ showTime, format }) => <RangePicker showTime={showTime} format={format} />,
    "TimePicker": ({ format }) => <TimePicker format={format} />,

    "Select": ({ placeholder, arrayOption, mode, key, parent, children }) =>
      <Select
        key={key}
        mode={mode}
        placeholder={placeholder}
        showSearch
        allowClear
        optionFilterProp="children"
        onChange={(value, event) => handleChange && handleChange(value, event, key, children, parent)}
        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        dropdownStyle={{ zIndex: 2000 }}
        options={options(arrayOption, parent, children)}
      />
    ,


    "Switch": () => <Switch />,
    "Slider": ({ marksSlider }) => <Slider marks={marksSlider} />,
    "RadioGroup": ({ arrayRadio, groupButton }) =>
      <Radio.Group>
        {arrayRadio.map((dato_row, index) =>
          !groupButton ?
            <Radio key={index} value={dato_row.value} >{dato_row.text}</Radio>
            :
            <Radio.Button key={index} value={dato_row.value} >{dato_row.text}</Radio.Button>
        )}
      </Radio.Group>,
    "CheckboxGroup": ({ arrayCheckbox }) =>
      <Checkbox.Group>
        {arrayCheckbox.map((dato_row, index) =>
          <Checkbox key={index} value={dato_row.value} >{dato_row.text}</Checkbox>
        )}
      </Checkbox.Group>,
    "Rate": ({ allowHalf }) => <Rate allowHalf={allowHalf} />,
    "Upload": ({ namefile, actionUrl, listType, tipoFile, multipleFile, textButton, dragger, antuploadtext, antuploadhint }) => (
      <>
        {
          !dragger ?
            < Upload name={namefile} action={actionUrl} listType={listType} >
              <Button icon={<UploadOutlined />}>{textButton}</Button>
            </Upload >
            :
            <Upload.Dragger name={namefile} action={actionUrl}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{antuploadtext}</p>
              <p className="ant-upload-hint">{antuploadhint}</p>
            </Upload.Dragger>
        }
      </>),

    "": () => { "Erro en tipo" },
  }
  const ItemsForm = () => {

    const formItemNew = []
    const arrayOptionNew = []
    let i = 0;
    let x = 0;
    let obj2 = {}

    formItems.length > 0 && formItems.forEach(Item => {

      let obj =
      {
        ...Item,
        rules: [
          {
            required: Item.rulesRequired == '1' && Item.rulesRequired,
            message: Item.rulesMessage && Item.rulesMessage,
          },

          // {
          //   type: Item.rulestype && Item.rulestype,
          //   message: Item.rulestypemessage && Item.rulestypemessage,
          // },

        ],
        name_element: swicthTipo[Item.name_element] && swicthTipo[Item.name_element]
          (
            {
              key: Item.name,
              placeholder: Item.placeholder && Item.placeholder,
              allowHalf: Item.allowHalf && Item.allowHalf,
              min: Item.min && Item.min,
              max: Item.max && Item.max,
              step: Item.step && Item.step,
              width: Item.width && Item.width,
              stringMode: Item.stringMode && Item.stringMode,
              maxLength: Item.maxLength && Item.maxLength,
              showCount: Item.showCount && Item.showCount,
              showTime: Item.showTime && Item.showTime,
              format: Item.format && Item.format,
              arrayOption: Item.options && Item.options,
              parent: Item.parent && Item.parent,
              children: Item.children && Item.children,
              mode: Item.mode && Item.mode,
              valuePropName: Item.valuePropName && Item.valuePropName,
              marksSlider: Item.marksSlider && Item.marksSlider,
              arrayRadio: Item.arrayRadio && Item.arrayRadio,
              groupButton: Item.groupButton && Item.groupButton,
              arrayCheckbox: Item.arrayCheckbox && Item.arrayCheckbox,

              dragger: Item.dragger && Item.dragger,
              namefile: Item.namefile && Item.namefile,
              actionUrl: Item.actionUrl && Item.actionUrl,
              listType: Item.listType && Item.listType,
              tipoFile: Item.tipoFile && Item.tipoFile,
              multipleFile: Item.multipleFile && Item.multipleFile,
              textButton: Item.textButton && Item.textButton,
              antuploadtext: Item.antuploadtext && Item.antuploadtext,
              antuploadhint: Item.antuploadhint && Item.antuploadhint,

            }
          )
      }
      i = i + 1;
      formItemNew.push(obj)
    })

    setFormItem(formItemNew)

  }

  const options = (arrayOption, parent, children) => {

    if (parent === null) {
      return arrayOption
    } else {
      return arrayOption.filter(dato_row => dato_row.value_parent === valuetmp[children])
    }
  }
  const [valuetmp, setValueTmp] = useState({})
  const [auxvaluetmp, setAuxValueTmp] = useState([])
  const [auxparent, setAuxParent] = useState("")

  let parents = []
  let obj = {};
  let hijos = []

  const handleChange = (value, key, event, children, parent) => {

    if (parent === null && children !== null) {
      hijos.push(children)
      // obj={
      //   [event]: hijos
      // }
      //parents.push(obj)

    } else if (parent !== null && children !== null) {

      hijos.push(children)
      // obj = {
      //   ...obj
      // }

    }

    if (value !== undefined) {
      setValueTmp({ ...valuetmp, [event]: value })
    }    
    

  }
  useEffect(() => {
    ItemsForm()
  }, [formItems, valuetmp])

  // sm={6} md={3}   horizontal vertical inline

  return (
    <ConfigProvider locale={idiomaGral}>
      <Form
        key={Uid()}
        name="basic"
        onFinish={onFinish}
        form={form}
        layout={layout} >
        <Grid container spacing={1}>
          {formItem.map((row, index) =>
            <Grid
              key={Uid(index)}
              item
              propsGrid
              xs={xs}
              sm={sm}
              md={md}
            >
              <Form.Item
                key={Uid(index)}
                label={row.label}
                name={row.name}
                rules={row.rules}
                hasFeedback={row.hasFeedback == 1 ? true : false}
                tooltip={row.tooltip}
                extra={row.extra}
                valuePropName={row.valuePropName}
              //initialValue={row.initialValue}
              //getValueFromEvent={(e) => normFile(e)}
              >
                {row.name_element}
              </Form.Item>
            </Grid>
          )}

          {salto && <Grid item xs={xs} sm={sm} md={md} key={Uid()} />}

          <Grid item xs={xsBotton} sm={smBotton} md={mdBotton} key={Uid()} >
            <Form.Item key={Uid()}>
              <Button
                key={Uid()}
                loading={loading}
                block={block}
                style={{
                  backgroundColor: themeGral.componente_color,
                  color: 'white',
                  position: position,
                  align: 'center'
                }}
                htmlType="submit"
                shape="round"
                icon={<Icon icon={iconButton} style={{ fontSize: 20, verticalAlign: '-0.125em' }} />}
                size={"large"}
              >
                <span style={{ marginLeft: '8px' }}  >{titleSubmit}</span>
              </Button>

              {
                ButtonSec &&
                <Button
                  block={block}
                  key={Uid()}
                  loading={loading}
                  style={{ backgroundColor: themeGral.componente_color, color: 'white', }}
                  icon={<Icon icon={iconButtonSec} style={{ fontSize: 20, verticalAlign: '-0.125em' }} />}
                  shape="round"
                  size={"large"}
                  onClick={() => onClickSec()}
                >
                  <span style={{ marginLeft: '8px' }}  >{titleSubmitSec}</span>
                </Button>
              }

              {
                ButtonSecConfirm &&

                <Popconfirm
                  key={Uid(1)}
                  title={titlePopconfirm}
                  description={descriptionPopconfirm}
                  onConfirm={() => onClickSec()}
                  // onCancel={cancel}
                  okText="Si"
                  cancelText="No"
                >

                  <Button
                    block={block}
                    key={Uid()}
                    loading={loading}
                    style={{ backgroundColor: themeGral.componente_color, color: 'white', }}
                    icon={<Icon icon={iconButtonSec} style={{ fontSize: 20, verticalAlign: '-0.125em' }} />}
                    shape="round"
                    size={"large"}
                    // onClick={() => onClickSec()}
                  >
                    <span style={{ marginLeft: '8px' }}  >{titleSubmitSec}</span>
                  </Button>
                </Popconfirm>
              }
            </Form.Item>
          </Grid>

        </Grid>
      </Form>
    </ConfigProvider>
  );
};

export const FormAntdCrud = (props) => {

  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext
  const { formItems, onChangeSelect, loading = false } = props
  const [formItem] = useState([])

  ///Upload
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e.fileList;
  };
  const swicthTipo = {
    "Input": ({ placeholder }) => <Input placeholder={placeholder} />,
    "InputPassword": () => <Input.Password />,
    "InputNumber": ({ min = "1", max, step = "0.01", width = 200 }) =>
      <InputNumber
        defaultValue="1"
        min={min}
        max={max}
        step={step}
        stringMode
        style={{
          width: width,
        }}
      />,

    "InputTextArea": ({ maxLength, showCount = false }) => <Input.TextArea showCount={showCount} maxLength={maxLength && maxLength} />,

    "DatePicker": ({ showTime, format }) => <DatePicker showTime={showTime} format={format} />,
    "RangePicker": ({ showTime, format }) => <RangePicker showTime={showTime} format={format} />,
    "TimePicker": ({ format }) => <TimePicker format={format} />,

    "Select": ({ placeholder, arrayOption, mode, key }) =>
      <Select
        key={key}
        mode={mode}
        placeholder={placeholder}
        showSearch
        optionFilterProp="children"
        onChange={(value, event) => onChangeSelect && onChangeSelect(value, event, key)}
        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        dropdownStyle={{ zIndex: 2000 }}
      >
        {arrayOption.map((dato_row, index) =>
          <Option key={index} value={dato_row.value} >{dato_row.label}</Option>
        )}
      </Select>,


    "Switch": () => <Switch />,
    "Slider": ({ marksSlider }) => <Slider marks={marksSlider} />,
    "RadioGroup": ({ arrayRadio, groupButton }) =>
      <Radio.Group>
        {arrayRadio.map((dato_row, index) =>
          !groupButton ?
            <Radio key={index} value={dato_row.value} >{dato_row.text}</Radio>
            :
            <Radio.Button key={index} value={dato_row.value} >{dato_row.text}</Radio.Button>
        )}
      </Radio.Group>,
    "CheckboxGroup": ({ arrayCheckbox }) =>
      <Checkbox.Group>
        {arrayCheckbox.map((dato_row, index) =>
          <Checkbox key={index} value={dato_row.value} >{dato_row.text}</Checkbox>
        )}
      </Checkbox.Group>,
    "Rate": () => <Rate />,
    "Upload": ({ namefile, actionUrl, listType, tipoFile, multipleFile, textButton, dragger, antuploadtext, antuploadhint }) => (
      <>
        {
          !dragger ?
            < Upload name={namefile} action={actionUrl} listType={listType} >
              <Button icon={<UploadOutlined />}>{textButton}</Button>
            </Upload >
            :
            <Upload.Dragger name={namefile} action={actionUrl}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{antuploadtext}</p>
              <p className="ant-upload-hint">{antuploadhint}</p>
            </Upload.Dragger>
        }
      </>),

    "": () => { "Erro en tipo" },
  }
  const ItemsForm = () => {
    formItems.length && formItems.forEach(Item => {
      let obj =
      {
        ...Item,
        rules: [
          {
            required: Item.rulesRequired == '1' && Item.rulesRequired,
            message: Item.rulesMessage && Item.rulesMessage,
          },

          // {
          //   type: Item.rulestype && Item.rulestype,
          //   message: Item.rulestypemessage && Item.rulestypemessage,
          // },

        ],
        name_element: swicthTipo[Item.name_element] && swicthTipo[Item.name_element](
          {
            key: Item.name,
            placeholder: Item.placeholder && Item.placeholder,
            min: Item.min && Item.min,
            max: Item.max && Item.max,
            step: Item.step && Item.step,
            width: Item.width && Item.width,
            maxLength: Item.maxLength && Item.maxLength,
            showCount: Item.showCount && Item.showCount,
            showTime: Item.showTime && Item.showTime,
            format: Item.format && Item.format,
            arrayOption: Item.options && Item.options,
            mode: Item.mode && Item.mode,
            valuePropName: Item.valuePropName && Item.valuePropName,
            marksSlider: Item.marksSlider && Item.marksSlider,
            arrayRadio: Item.arrayRadio && Item.arrayRadio,
            groupButton: Item.groupButton && Item.groupButton,
            arrayCheckbox: Item.arrayCheckbox && Item.arrayCheckbox,

            dragger: Item.dragger && Item.dragger,
            namefile: Item.namefile && Item.namefile,
            actionUrl: Item.actionUrl && Item.actionUrl,
            listType: Item.listType && Item.listType,
            tipoFile: Item.tipoFile && Item.tipoFile,
            multipleFile: Item.multipleFile && Item.multipleFile,
            textButton: Item.textButton && Item.textButton,
            antuploadtext: Item.antuploadtext && Item.antuploadtext,
            antuploadhint: Item.antuploadhint && Item.antuploadhint,
          }

        )
      }
      formItem.push(obj)
    });

  
  }

  formItem.length === 0 && ItemsForm();

  return (
    <ConfigProvider locale={idiomaGral}>
      <Spin spinning={loading}>
        <Grid container spacing={1}>
          {formItem.map((row, index) =>
            <Grid item xs={12} sm={12} md={12} key={index}>
              <Form.Item
                key={index}
                label={row.label}
                name={row.name}
                rules={row.rules}
                hasFeedback={row.hasFeedback}
                tooltip={row.tooltip}
                extra={row.extra}
                valuePropName={row.valuePropName}
                initialValue={row.initialValue}
              //getValueFromEvent={(e) => normFile(e)}
              >
                {row.name_element}
              </Form.Item>
            </Grid>
          )}
        </Grid>
      </Spin>
    </ConfigProvider>
  );
};

export default FormAntd;
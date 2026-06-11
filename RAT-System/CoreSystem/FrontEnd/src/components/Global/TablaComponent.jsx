import React, { useState, useContext, useRef, useCallback } from 'react'
import ThemeContext from '../../context/ThemContext'
import {
  ConfigProvider,
  Upload, Table, Button, Input, Tooltip, Popconfirm, Select,
  Typography as TypographyAntd, DatePicker, Badge, Avatar,
  Rate, Switch
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { InfoCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
//MUI
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
//iconos
import { Icon } from '@iconify/react';
//COMPONENTES
import BadgeMUIImg from '../Global/BadgeComponent.jsx'
import { ModdalANTD } from '../Global/ModalComponent.jsx';
import CardMUI from '../Global/CardComponent.jsx';
// FUNCIONES
import separator, { formatDate, formatDateTime, ExportToExcel, Uid, beforeUpload } from './funciones.jsx'
//colores
import { green, red, yellow } from '@mui/material/colors';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import update from "immutability-helper";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SearchOutlined } from '@ant-design/icons';
import TextField from '@mui/material/TextField'

const { Link } = TypographyAntd;
const { Option } = Select;
const type = "DraggableBodyRow";

const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = useRef(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) { return {}; }
      return {
        isOver: monitor.isOver(),
        dropClassName:
          dragIndex < index ? " drop-over-downward" : " drop-over-upward"
      };
    },
    drop: (item) => {
      moveRow(item.index, index);
    }
  });
  const [, drag] = useDrag({
    type,
    item: {
      index
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ""}`}
      style={{
        cursor: "move",
        ...style
      }}
      {...restProps}
    />
  );
};

const TablaANTD = (props) => {
  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { themeGral, idiomaGral, colorBadge } = themeContext
  const {
    loading = false,
    loadingAdd = false,
    datasource = [],
    setDataSource,
    pagination = false,
    pageSize = "10",
    simplepage = false,
    positionBottom = "bottomRight",
    positionTop = "topRight",
    size = "small",
    bordered = false,
    virtual = false,
    scrollX = false,
    scrollY = false,
    tableLayout = "auto",
    dragSorting = false,
    Title,
    IconAvatar,
    columnsTable,
    OnClickAction,
    ActualizaTabla,
    ExportaExcel,
    Agregar,
    AgregarTitle,
    AgregarIcon,
    ExportaExcelOtro,
    Sumary,
    tbSimple = false,
  } = props
  // funciones de la tabla 
  const [pageSizeTbl, setPageSizeTbl] = useState(pageSize)
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [searchedColumnT, setSearchedColumnT] = useState('');
  const searchInput = useRef(null);
  const components = { body: { row: DraggableBodyRow } };
  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = datasource[dragIndex];
      let infoRow = {
        drag_row: {
          row_data: dragRow,
          last_position: dragIndex,
          current_position: hoverIndex
        },
        hover_row: {
          row_data: datasource[hoverIndex],
          last_position: hoverIndex,
          current_position: dragIndex
        }
      };
      setDataSource.length > 0 && setDataSource(
        update(datasource, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow]
          ]
        })
      );
    },
    [datasource]
  );
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Buscar en ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex, title)}
          style={{ width: 278, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex, title)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8, }}
        >
          Buscar
        </Button>
        <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90, marginRight: 8, }}>
          Limpiar
        </Button>
        <Button
          style={{ width: 90 }}
          size="small"
          onClick={() => {
            confirm({
              closeDropdown: false
            });
            setSearchText(selectedKeys[0] && selectedKeys[0].toUpperCase());
            setSearchedColumn(dataIndex);
            setSearchedColumnT(title.toUpperCase());
          }}
        >
          Restaurar
        </Button>
      </div>
    ),
    filterIcon: filtered => <Icon icon={'line-md:search'} style={{ fontSize: 15, color: filtered ? themeGral.table_color : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] && record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) { }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <>
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        </>
      ) : (text),
  });
  const handleSearch = (selectedKeys, confirm, dataIndex, title) => {
    confirm();
    setSearchText(selectedKeys[0] && selectedKeys[0].toUpperCase())
    setSearchedColumn(dataIndex)
    setSearchedColumnT(title.toUpperCase());
  };
  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('')
  };

  const handleTableChange = (pagination, filters, sorter, extra) => {
    if (pagination === 1) {
      setPageSizeTbl(filters);
    }
  };

  //Función para mostrar las acciones de cada fila -> editar o eliminar

  const actionEstaus = (row, key, icon, iconB, titleMSGA, titleMSGB, text, campoAvalidar, valorAvalidar, TooltipA, TooltipB) => {
    return (
      <>
        {row[campoAvalidar] === valorAvalidar ?
          <Tooltip title={TooltipA} key={Uid(1)}>
            {titleMSGA ?
              <Popconfirm
                key={Uid(2)}
                title={titleMSGA}
                okText="Si"
                cancelText="No"
                onConfirm={() => OnClickAction(row, key)}
              >
                <>
                  <Icon icon={icon} key={key}
                    style={{
                      cursor: "pointer",
                      fontSize: themeGral.action_sizeIcon,
                      marginLeft: "5px",
                      color: themeGral.action_colorIcon
                    }}
                  />
                </>
              </Popconfirm>
              :
              <>
                <Icon icon={icon} key={key}
                  style={{
                    cursor: "pointer",
                    fontSize: themeGral.action_sizeIcon,
                    marginLeft: "5px",
                    color: themeGral.action_colorIcon
                  }}
                  onClick={() => OnClickAction(row, key)}
                />
              </>
            }
          </Tooltip>
          :
          <Tooltip title={TooltipB} key={Uid(1.1)}>
            {titleMSGB ?
              <Popconfirm
                key={Uid(2.1)}
                title={titleMSGB}
                okText="Si"
                cancelText="No"
                onConfirm={() => OnClickAction(row, key)}
              >
                <>
                  <Icon icon={iconB} key={key}
                    style={{
                      cursor: "pointer",
                      fontSize: themeGral.action_sizeIcon,
                      marginLeft: "5px",
                      color: themeGral.action_colorIcon
                    }}
                  />
                </>
              </Popconfirm>
              :
              <>
                <Icon icon={iconB} key={key}
                  style={{
                    cursor: "pointer",
                    fontSize: themeGral.action_sizeIcon,
                    marginLeft: "5px",
                    color: themeGral.action_colorIcon
                  }}
                  onClick={() => OnClickAction(row, key)}
                />
              </>
            }
          </Tooltip>
        }
      </>
    );
  };
  const objAccionesEstaus = (key, icon, iconB, titleMSGA, titleMSGB, campoAvalidar, valorAvalidar, TooltipA, TooltipB) => ({
    render: (text, row, index) => actionEstaus(row, key, icon, iconB, titleMSGA, titleMSGB, text, campoAvalidar, valorAvalidar, TooltipA, TooltipB),
  })
  const GetInformation = (row, key, titleMSG, icon, tipoFile, multipleFile, listType, actionUrl, campoAvalidar, id, index) => {
    return (
      row[campoAvalidar] &&
      <Upload
        key={key}
        name='file'
        accept={tipoFile}
        multiple={multipleFile}
        action={actionUrl + row[id]}
        defaultFileList={row.defaultFileList}
        listType={listType}
        onPreview={listType !== 'text' && handlePreview}
      >
        <Tooltip title={titleMSG} key={Uid(index)}>
          <Icon icon={icon}
            style={{
              cursor: "pointer",
              fontSize: themeGral.action_sizeIcon,
              marginLeft: "5px",
              color: themeGral.action_colorIcon
            }}
            key={Uid(index)}
          />
        </Tooltip>
      </Upload>
    )
  };
  const objGetInformation = (key, titleMSG, icon, tipoFile, multipleFile, listType, actionUrl, campoAvalidar, id) => ({
    render: (row, index) => GetInformation(row, key, titleMSG, icon, tipoFile, multipleFile, listType, actionUrl, campoAvalidar, id, index),
  })
  const SwitchFn = (row, key, nameValue) => {
    return (
      <>
        <Switch
          key={Uid(25)}
          defaultChecked={row[nameValue]}
          onChange={(e) => OnClickAction(row, key, e)}
        />
      </>
    );
  };
  const objSwitch = (key, nameValue) => ({
    render: (text, row, index) => SwitchFn(row, key, nameValue),
  })
  const actionBooleano = (row, key, IconAction, titleMSG, text, campoAvalidar, index, tooltip) => {
    return (
      <>
        {row[campoAvalidar] &&
          <Tooltip
            placement="topRight"
            title={tooltip}
            key={Uid(index)}
          >
            {titleMSG ?
              <Popconfirm
                key={Uid(index)}
                title={titleMSG}
                okText="Si"
                cancelText="No"
                onConfirm={() => OnClickAction(row, key)}
              >
                <>
                  <Icon icon={IconAction} key={Uid(index)}
                    style={{
                      cursor: "pointer",
                      fontSize: themeGral.action_sizeIcon,
                      marginLeft: "5px",
                      color: themeGral.action_colorIcon
                    }}
                  />
                </>
              </Popconfirm>
              :
              <>
                <Icon icon={IconAction} key={Uid(index)}
                  style={{
                    cursor: "pointer",
                    fontSize: themeGral.action_sizeIcon,
                    marginLeft: "5px",
                    color: themeGral.action_colorIcon
                  }}
                  onClick={() => OnClickAction(row, key)}
                />
              </>
            }
          </Tooltip>
        }
      </>
    );
  };
  const objAccionesBooleano = (key, IconAction, titleMSG, campoAvalidar,tooltip) => ({
    render: (text, row, index) => actionBooleano(row, key, IconAction, titleMSG, text, campoAvalidar, index,tooltip),
  })
  const actionBander = (row, key, icon, titleMSG, text, campoAvalidar, valorAvalidar,tooltip) => {
    return (
      <>
        {row[campoAvalidar] === valorAvalidar &&
          <Tooltip title={tooltip} key={Uid(1)}>
            {titleMSG ?
              <Popconfirm
                key={Uid(2)}
                title={titleMSG}
                okText="Si"
                cancelText="No"
                onConfirm={() => OnClickAction(row, key)}
              >
                <>
                  <Icon icon={icon} key={key}
                    style={{
                      cursor: "pointer",
                      fontSize: themeGral.action_sizeIcon,
                      marginLeft: "5px",
                      color: themeGral.action_colorIcon
                    }}
                  />
                </>
              </Popconfirm>
              :
              <>
                <Icon icon={icon} key={key}
                  style={{
                    cursor: "pointer",
                    fontSize: themeGral.action_sizeIcon,
                    marginLeft: "5px",
                    color: themeGral.action_colorIcon
                  }}
                  onClick={() => OnClickAction(row, key)}
                />
              </>
            }
          </Tooltip>
        }
      </>
    );
  };
  const objAccionesBandera = (key, icon, titleMSG, campoAvalidar, valorAvalidar,tooltip) => ({
    render: (text, row, index) => actionBander(row, key, icon, titleMSG, text, campoAvalidar, valorAvalidar,tooltip),
  })
  const rate = (row, nameValue,) => {
    return (
      <>
        <Rate allowHalf defaultValue={Number(row[nameValue])} disabled />
      </>
    );
  };
  const objRate = (nameValue) => ({
    render: (text, row, index) => rate(row, nameValue,),
  })
  const avatar = (row, nameUrl, size, nameTexShow, shape) => {
    return (
      <>
        <Avatar
          shape={shape ? shape : "circle"}
          size={Number(size)}
          key={Uid()}
          src={row[nameUrl]}
          style={{
            backgroundColor: themeGral.table_color,
          }}
        >
          {row[nameTexShow]}
        </Avatar>
      </>
    );
  };
  const objAvatar = (nameUrl, size, nameTexShow, shape) => ({
    render: (text, row, index) => avatar(row, nameUrl, size, nameTexShow, shape),
  })
  const iconT = (row, nameUrl, size) => {
    return (
      <>
        <Icon
          icon={row[nameUrl] ? row[nameUrl] : "clarity:add-line"}
          style={{ fontSize: themeGral.action_sizeIcon, color: themeGral.action_colorIcon }}
        />
      </>
    );
  };
  const objIcon = (nameUrl, size) => ({
    render: (text, row, index) => iconT(row, nameUrl, size),
  })
  const objNo = () => ({
    render: (text, record, index) => (index + 1),
  })
  const action = (row, key, IconAction, titleMSG, index, text,tooltip) => {
    return (
      <Tooltip
        title={tooltip}
        key={Uid(index)}
        placement="topRight"
      >
        {titleMSG ?
          <Popconfirm
            key={Uid(index)}
            title={titleMSG}
            // description={titleMSG}
            style={{
              position: "relative",
              right: 500
            }}
            //icon={<Icon icon={IconAction} style={{color: backgroundColor}} />}
            okText="Si"
            cancelText="No"
            onConfirm={() => OnClickAction(row, key)}
          >
            <>
              <Icon icon={IconAction} key={Uid(index)}
                style={{
                  cursor: "pointer",
                  fontSize: themeGral.action_sizeIcon,
                  marginLeft: "5px",
                  color: themeGral.action_colorIcon
                }}
              />
            </>
          </Popconfirm>
          :
          <>
            <Icon icon={IconAction} key={Uid(index)}
              style={{
                cursor: "pointer",
                fontSize: themeGral.action_sizeIcon,
                color: themeGral.action_colorIcon
              }}
              onClick={() => OnClickAction(row, key)}
            />
          </>
        }
      </Tooltip>
    );
  };
  const objAcciones = (key, IconAction, titleMSG,tooltip) => ({
    render: (text, row, index) => action(row, key, IconAction, titleMSG, index, text,tooltip),
  })
  // ver imagen
  const [visibleIMG, setVisibleIMG] = useState(false);
  const [srcIMG, setSrcIMG] = useState('');
  const OnClickVerImg = (row, key, srcIMG) => {
    if (srcIMG) {
      setVisibleIMG(true)
      setSrcIMG(row.src)
    } else {
      OnClickAction(row, key)
    }
  }
  const VerImg = (row, key, IconAction, titleIMG, srcIMG) => {
    return (
      <>
        <Tooltip title={titleIMG}>
          <Icon icon={IconAction}
            style={{
              cursor: "pointer",
              fontSize: themeGral.action_sizeIcon,
              marginLeft: "5px",
              color: themeGral.action_colorIcon
            }}
            onClick={() => OnClickVerImg(row, key, srcIMG)}
          />
        </Tooltip>
      </>
    );
  };
  const objImg = (key, IconAction, titleIMG, srcIMG) => ({
    render: (row) => VerImg(row, key, IconAction, titleIMG, srcIMG),
  })
  // upload
  const upload = (row, key, IconUploadC, IconUploadD, titleMSGC, titleMSGD, tipoFile, multipleFile, listType, actionUrl, nameid, namepath, index,) => {
    return (
      row[namepath] ?
        (<Tooltip title={titleMSGD} key={Uid(index)}>
          <Link href={row[namepath]} target="_blank" key={Uid(index)}>
            <Icon icon={IconUploadD}
              style={{
                cursor: "pointer",
                fontSize: themeGral.action_sizeIcon,
                marginLeft: "5px",
                color: themeGral.action_colorIcon
              }}
              key={Uid(index)}
            />
          </Link>
        </Tooltip>
        ) :
        (<Upload
          key={key}
          name='file'
          accept={tipoFile}
          multiple={multipleFile}
          action={actionUrl + row[nameid]}
          onChange={(e) => OnClickAction(row, key, e, 'change')}
          onRemove={(e) => OnClickAction(row, key, e, 'remove')}
          // beforeUpload={ beforeUpload2}
          defaultFileList={row.defaultFileList}
          listType={listType}
          onPreview={listType !== 'text' && handlePreview}
        >
          <Tooltip title={titleMSGC} key={Uid(index)}>
            <Icon icon={IconUploadC}
              style={{
                cursor: "pointer",
                fontSize: themeGral.action_sizeIcon,
                marginLeft: "5px",
                color: themeGral.action_colorIcon
              }}
              key={Uid(index)}
            />
          </Tooltip>
        </Upload>)
    );
  };
  const objUploads = (key, IconUploadC, IconUploadD, titleMSGC, titleMSGD, tipoFile, multipleFile, listType, actionUrl, nameid, namepath) => ({
    render: (text, row, index) => upload(row, key, IconUploadC, IconUploadD, titleMSGC, titleMSGD, tipoFile, multipleFile, listType, actionUrl, nameid, namepath, index),
  })

  // upload Badera
  const uploadBandera = (row, key, IconUploadC, IconUploadD, titleMSGC, titleMSGD, tipoFile, multipleFile, listType, actionUrl, nameid, namepath, index, campoAvalidar) => {
    return (
      row[campoAvalidar] ?
        row[namepath] ?
          (<Tooltip title={titleMSGD} key={Uid(index)}>
            <Link href={row[namepath]} target="_blank" key={Uid(index)}>
              <Icon icon={IconUploadD}
                style={{
                  cursor: "pointer",
                  fontSize: themeGral.action_sizeIcon,
                  marginLeft: "5px",
                  color: themeGral.action_colorIcon
                }}
                key={Uid(index)}
              />
            </Link>
          </Tooltip>
          ) :
          (<Upload
            key={key}
            name='file'
            accept={tipoFile}
            multiple={multipleFile}
            action={actionUrl + row[nameid]}
            onChange={(e) => OnClickAction(row, key, e, 'change')}
            onRemove={(e) => OnClickAction(row, key, e, 'remove')}
            // beforeUpload={ beforeUpload2}
            defaultFileList={row.defaultFileList}
            listType={listType}
            onPreview={listType !== 'text' && handlePreview}
          >
            <Tooltip title={titleMSGC} key={Uid(index)}>
              <Icon icon={IconUploadC}
                style={{
                  cursor: "pointer",
                  fontSize: themeGral.action_sizeIcon,
                  marginLeft: "5px",
                  color: themeGral.action_colorIcon
                }}
                key={Uid(index)}
              />
            </Tooltip>
          </Upload>)

        : " "
    );
  };

  const objUploadsBandera = (key, IconUploadC, IconUploadD, titleMSGC, titleMSGD, tipoFile, multipleFile, listType, actionUrl, nameid, namepath, campoAvalidar) => ({
    render: (text, row, index) => uploadBandera(row, key, IconUploadC, IconUploadD, titleMSGC, titleMSGD, tipoFile, multipleFile, listType, actionUrl, nameid, namepath, index, campoAvalidar),
  })
  //DatePicker
  const datePicker = (row, key, IconAction, placeholder, format, showTime) => {
    return (
      <>
        <DatePicker
          key={row.id_asignacion}
          placeholder={placeholder}
          //disabledDate={(current) => disabledDateinspeccion(current, moment(row.asignado, "DD/MM/YYYY"))}
          //defaultValue={row.fecha_inspeccion && moment(row.fecha_inspeccion, "DD/MM/YYYY HH:mm:ss")}
          format={showTime ? format + ' ' + showTime : format}
          showTime={showTime}
          //showTime={ {showTime:!showTime, defaultValue: moment(row.fecha_inspeccion, 'HH:mm:ss') }}
          onChange={(value, dateString) => OnClickAction(row, key, value, dateString)}
        />
      </>
    );
  };
  const objDatePicker = (key, IconAction, placeholder, format, showTime) => ({
    render: (row) => datePicker(row, key, IconAction, placeholder, format, showTime),
  })
  //input
  const input = (row, key, placeholder, suffixTitle) => {
    return (
      <>
        <Input
          key={row.attribute_id}
          onBlur={(event) => OnClickAction(row, key, event)}
          placeholder={placeholder}
          // maxLength={25}
          defaultValue={row.defaultValue}
          suffix={suffixTitle &&
            <Tooltip title={row.help_description}>
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </>
    );
  };
  const objInput = (key, placeholder, suffixTitle) => ({
    render: (row) => input(row, key, placeholder, suffixTitle),
  })
  //textArea
  const textArea = (row, key, IconAction, placeholder, height) => {
    return (
      <>
        <Input.TextArea
          //showCount
          key={row.id_asignacion}
          onBlur={(e) => OnClickAction(row, key, e.target.value)}
          placeholder={placeholder}
          //maxLength={100}
          defaultValue={row.monto_presupuesto}
          style={{
            height: height,
          }}
        />
      </>
    );
  };
  const objTextArea = (key, IconAction, placeholder, height) => ({
    render: (row) => textArea(row, key, IconAction, placeholder, height),
  })
  //Select
  const Combo = (row, key, IconAction, placeholder, arrayOption, index, width) => {
    return (
      <>
        <Select
          style={{
            width: width,
          }}
          key={index}
          allowClear
          showSearch
          placeholder={placeholder}
          optionFilterProp="children"
          onChange={(e) => OnClickAction(row, key, e, index)}
          defaultValue={row.SelectValue}
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        >
          {row[arrayOption] && row[arrayOption].map((dato_row, index) =>
            <Option key={index} value={dato_row.value} >{dato_row.text}</Option>
          )}
        </Select>
      </>
    );
  };
  const objSelect = (key, IconAction, placeholder, arrayOption, width) => ({
    render: (text, record, index) => Combo(record, key, IconAction, placeholder, arrayOption, index, width),
  })
  //ordenamiento de las columnas
  const objSorterNumber = (dataIndex) => ({
    sorter: (a, b) => a[dataIndex] - b[dataIndex],
  })
  const objSorterString = (dataIndex) => ({
    sorter: (a, b) => a[dataIndex] < b[dataIndex],
  })
  //filtrado de la columna
  const filtersOption = (dataIndex) => ({
    onFilter: (value, record) => record[dataIndex] && record[dataIndex].startsWith(value),
  })
  //Formato de datos de la columna
  const tipoMonedaMiles = (prefi) => ({
    render: (row) => prefi + separator(row + ""),
  })
  const tipoFecha = () => ({
    render: (row) => formatDate(row),
  })
  const tipoFechaTime = () => ({
    render: (row) => formatDateTime(row),
  })
  //ellipsis
  const funcEllipsis = () => ({
    ellipsis: {
      showTitle: false,
    },
    render: (row) => (
      <Tooltip placement="topLeft" title={row}>
        {row}
      </Tooltip>
    ),
  })
  //Badge % 100
  const funcBadge100 = () => ({
    render: (row) => (
      row === 100 ?
        <Badge
          className="site-badge-count-109"
          count={row + ' %'}
          style={{
            backgroundColor: green[500],
          }}
          overflowCount={100}
        />
        : row === 0 ?
          <Badge
            className="site-badge-count-109"
            count={row + ' %'}
            style={{
              backgroundColor: red[500],
            }}
            overflowCount={100}
          />
          :
          <Badge
            className="site-badge-count-109"
            count={row + ' %'}
            style={{
              backgroundColor: yellow[600],
            }}
            overflowCount={100}
          />
    ),
  })
  //CREA COLUMNAS
  const columns = []
  const columnasTabla = () => {
    while (columns.length > 0) {
      columns.pop();
    }
    columnsTable && columnsTable.forEach(col => {
      let obj = Object.assign(
        {},
        col,
        col.no && objNo(),
        col.getInformation && objGetInformation(col.key, col.titleMSG, col.icon, col.tipoFile, col.multipleFile, col.listType, col.actionUrl, col.campoAvalidar, col.nameid),
        col.actionsBandera && objAccionesBandera(col.key, col.icon, col.iconB, col.titleMSG, col.campoAvalidar, col.valorAvalidar,col.Tooltip),
        col.actionsEstaus && objAccionesEstaus(col.key, col.icon, col.iconB, col.titleMSG, col.titleMSGB, col.campoAvalidar, col.valorAvalidar, col.Tooltip, col.TooltipB),
        col.actionsBooleano && objAccionesBooleano(col.key, col.icon, col.titleMSG, col.campoAvalidar,col.Tooltip),
        col.actions && objAcciones(col.key, col.icon, col.titleMSG,col.Tooltip),
        col.avatar && objAvatar(col.nameUrl, col.size, col.nameTexShow, col.shape),
        col.icono && objIcon(col.nameUrl, col.size,),
        col.rate && objRate(col.nameValue,),
        col.switch && objSwitch(col.key, col.nameValue),
        col.img && objImg(col.key, col.icon, col.titleIMG, col.srcIMG),
        col.datePicker && objDatePicker(col.key, col.icon, col.placeholder, col.format, col.showTime),
        col.Input && objInput(col.key, col.placeholder, col.suffixTitle),
        col.textArea && objTextArea(col.key, col.icon, col.placeholder, col.height),
        col.Select && objSelect(col.key, col.icon, col.placeholder, col.arrayOption, col.width),

        col.upload && objUploads(
          col.key,
          col.iconC,
          col.iconD,
          col.titleMSGC,
          col.titleMSGD,
          col.tipoFile,
          col.multipleFile,
          col.listType,
          col.actionUrl,
          col.nameid,
          col.namepath,
        ),

        col.uploadBandera && objUploadsBandera(
          col.key,
          col.iconC,
          col.iconD,
          col.titleMSGC,
          col.titleMSGD,
          col.tipoFile,
          col.multipleFile,
          col.listType,
          col.actionUrl,
          col.nameid,
          col.namepath,
          col.campoAvalidar,
        ),

        col.busqueda && getColumnSearchProps(col.dataIndex, col.title),
        col.orderNumber && objSorterNumber(col.dataIndex),
        col.orderString && objSorterString(col.dataIndex),
        col.orderDouble && objSorterNumber(col.dataIndex),
        col.orderDate && objSorterString(col.dataIndex),
        col.filters && filtersOption(col.dataIndex),
        col.tipoMoneda && tipoMonedaMiles(col.tipoMoneda),
        col.tipoMiles && tipoMonedaMiles(""),
        col.tipoFecha && tipoFecha(),
        col.tipoFechaTime && tipoFechaTime(),
        col.ellipsis && funcEllipsis(),
        col.badge100 && funcBadge100(),
      )
      columns.push(obj)
    });
  }
  columnasTabla();
  // actualiza el resultado del onchange
  const [noChange, setNoChange] = useState(0);
  const onChange = (pagination, filters, sorter, extra,) => {
    setNoChange(extra.currentDataSource.length)
  };
  //vista cuando son foto
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };
  const handleCancel = () => setPreviewVisible(false);
  //EXPORTA A EXCEL
  const ExportToExcelButton = () => {
    ExportaExcelOtro ?
      ExportToExcel({ datasource: ExportaExcelOtro, Title: Title })
      :
      ExportToExcel({ datasource: datasource, Title: Title })
  }
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return (
    <>
      <ConfigProvider locale={idiomaGral}>
        {!tbSimple ?
          <div style={{ position: "relative", overflow: "hidden", }}>
            <CardMUI

              styleCardHeader={{ backgroundColor: themeGral.table_color }}
              title={
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  style={{ color: themeGral.text_color_secundario }}
                >  {Title && "  |    " + Title}
                </Typography>
              }
              avatarCardHeader={
                <>
                  <BadgeMUIImg
                    sizeIcon={themeGral.table_sizeIcon + 10}
                    icon={IconAvatar}
                    badgeContent={datasource && datasource.length}
                    max={9999}
                    colorIcon={themeGral.text_color_secundario}
                    colorBadge={colorBadge}
                  />
                </>
              }
              actionsCardHeader={
                <>
                  {Agregar &&
                    <Tooltip title={AgregarTitle ? AgregarTitle : "Agregar"}>
                      <IconButton aria-label="settings"
                        onClick={() => Agregar()}
                        disabled={loadingAdd}
                      >
                        {loadingAdd ?
                          <Spin indicator={antIcon} spinning={true} />
                          :
                          <Icon icon={AgregarIcon ? AgregarIcon : "clarity:add-line"} style={{ fontSize: themeGral.table_sizeIcon, color: themeGral.table_colorIcon }} />
                        }
                      </IconButton>
                    </Tooltip>
                  }
                  {ExportaExcel &&
                    // < a href={currenturlapi + "ExportaExcel/" + urlexportaExcel} target="_blank" >
                    <Tooltip title={"Exportar a Excel"} >
                      <IconButton aria-label="settings" onClick={() => ExportToExcelButton()} >
                        <Icon icon={"mdi:microsoft-excel"} style={{ fontSize: themeGral.table_sizeIcon, color: themeGral.table_colorIcon }} />
                      </IconButton>
                    </Tooltip>
                    // </a>
                  }
                  {ActualizaTabla &&
                    <Tooltip title="Actualizar tabla">
                      <IconButton aria-label="settings"
                        onClick={() => ActualizaTabla()}
                      >
                        <SyncOutlined spin={loading}
                          style={{ fontSize: themeGral.table_sizeIcon, color: themeGral.table_colorIcon }}
                        />
                      </IconButton>
                    </Tooltip>
                  }
                </>
              }
            >
              <DndProvider backend={HTML5Backend}>
                <Table
                  virtual={virtual}
                  loading={loading}
                  dataSource={datasource}
                  onChange={onChange}
                  bordered={bordered}
                  size={size}
                  tableLayout={tableLayout} //"fixed" //- | auto | fixed

                  // pagination={
                  //   pagination !== false &&
                  //   {
                  //     responsive: true,
                  //     pageSize: pageSize,
                  //     simple: simplepage,
                  //     position: [positionTop, positionBottom],
                  //     // topLeft |topCenter |topRight| bottomLeft |bottomCenter|bottomRight
                  //   }
                  // }

                  pagination={
                    pagination !== false &&
                    {
                      responsive: true,
                      pageSize: pageSizeTbl,
                      simple: simplepage,
                      placement: [positionTop, positionBottom],
                      onChange: handleTableChange,
                    }
                  }


                  scroll={{ x: scrollX, y: scrollY }}
                  rowKey={(record) => {
                    if (record.id) return record.id;
                    return JSON.stringify(record);
                  }}
                  columns={columns}
                  title={() =>
                    noChange > 0 && noChange !== datasource.length ?
                      searchText &&
                      <Typography
                        variant="body2"
                        style={{ color: themeGral.table_color }}
                      ><b style={{ fontSize: '17px' }} > {noChange}</b>{' registros de '} <b> {searchText}</b>{' en la columna '}<b>{searchedColumnT}</b>
                      </Typography>
                      : ""}
                  summary={(pageData) => Sumary && Sumary(pageData)}
                  components={dragSorting && components}
                  onRow={dragSorting ? ((_, index) => {
                    const attr = {
                      index,
                      moveRow
                    };
                    return attr;
                  }) : null}
                />
              </DndProvider>
              {props.children}
            </CardMUI>
          </div>
          :
          <DndProvider backend={HTML5Backend}>
            <Table
              virtual={virtual}
              loading={loading}
              dataSource={datasource}
              onChange={onChange}
              bordered={bordered}
              size={size}
              tableLayout={tableLayout}
              
              // pagination={
              //   pagination !== false &&
              //   {
              //     responsive: true,
              //     pageSize: pageSize,
              //     simple: simplepage,
              //     position: [positionTop, positionBottom],
              //   }
              // }

              pagination={
                    pagination !== false &&
                    {
                      responsive: true,
                      pageSize: pageSizeTbl,
                      simple: simplepage,
                      placement: [positionTop, positionBottom],
                      onChange: handleTableChange,
                    }
                  }


              scroll={{ x: scrollX, y: scrollY }}
              rowKey={(record) => {
                if (record.id) return record.id;
                return JSON.stringify(record);
              }}
              columns={columns}
              title={() =>
                noChange > 0 && noChange !== datasource.length ?
                  searchText &&
                  <Typography
                    variant="body2"
                    style={{ color: themeGral.table_color }}
                  ><b style={{ fontSize: '17px' }} > {noChange}</b>{' registros de '} <b> {searchText}</b>{' en la columna '}<b>{searchedColumnT}</b>
                  </Typography>
                  : ""}
              summary={(pageData) => Sumary && Sumary(pageData)}
              components={dragSorting && components}
              onRow={dragSorting ? ((_, index) => {
                const attr = {
                  index,
                  moveRow
                };
                return attr;
              }) : null}
            />
          </DndProvider>
        }
        <ModdalANTD
          visible={previewVisible}
          centered={true}
          title={previewTitle}
          footer={null}
          onCancel={handleCancel}>
          <img alt="example" style={{ width: '100%', }} src={previewImage} />
        </ModdalANTD>
      </ConfigProvider >
    </>
  );
}
export default TablaANTD;
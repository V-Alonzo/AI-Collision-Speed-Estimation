import NotificationMessageANTD from './notification.jsx'
import clienteAxios from './axios.js'
import "moment/locale/es-mx";
import moment from "moment";
import exportFromJSON from 'export-from-json'
import { nanoid } from 'nanoid';
import CryptoJS from 'crypto-js';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

//Convierte Cadena en arreglo
export const CadenaArreglo = (cadena, separador = ",") => {
  let arreglo = cadena.split(separador)
  return arreglo
}


//Convierte Cadena en arreglo numerico
export const ArregloNumerico = (cadena) => {
  let arreglo = cadena.split(",")
  let arregloNumerico = arreglo.map(function (elemento) {
    return Number(elemento);
  })
  return arregloNumerico
}


export const CryptoJSAesEncrypt = (data) => {

  const passphrase =  process.env.REACT_APP_PASS_CRIPTO;
  const valorIV =  process.env.REACT_APP_VALORIV_CRIPTO;

  var iv = CryptoJS.SHA1(valorIV);
  var key = CryptoJS.SHA256(passphrase);
  // Prepare substances
  iv = iv.toString(CryptoJS.enc.Base64).substr(0, 16);
  iv = CryptoJS.enc.Utf8.parse(iv);
  key = key.toString(CryptoJS.enc.Base64).substr(0, 32);
  key = CryptoJS.enc.Utf8.parse(key);
  // Cipher
  let dataSt = JSON.stringify(data);
  var ciphertext = CryptoJS.AES.encrypt(dataSt, key, { iv: iv });
  return ciphertext.toString();
}

const showSessionExpiredModal = (keycloak, logoutOptions) => {
  Modal.confirm({
    title: 'Sesión expirada',
    content: 'Su sesión terminó, por favor inicie sesión nuevamente.',
    okText: 'Ir a login',
    icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    okButtonProps: { type: 'primary' },
    cancelButtonProps: { style: { display: 'none' } },
    onOk: () => keycloak?.logout && keycloak.logout(logoutOptions),
  })
}

export const deCryptoJSAesEncrypt = (data) => {

  const passphrase =  process.env.REACT_APP_PASS_CRIPTO;
  const valorIV =  process.env.REACT_APP_VALORIV_CRIPTO;

  var iv = CryptoJS.SHA1(valorIV);
  var key = CryptoJS.SHA256(passphrase);
  // Prepare substances
  iv = iv.toString(CryptoJS.enc.Base64).substr(0, 16);
  iv = CryptoJS.enc.Utf8.parse(iv);
  key = key.toString(CryptoJS.enc.Base64).substr(0, 32);
  key = CryptoJS.enc.Utf8.parse(key);
  // Cipher
  var ciphertext = CryptoJS.AES.decrypt(data, key, { iv: iv });
  return ciphertext.toString(CryptoJS.enc.Utf8);
}


export const getAxiosLumenHea = async (propX) => {
  const { uri, setloading, msErrorApi, keycloak, notification, parametros, request, logoutOptions, headers, data } = propX;
  setloading && setloading(true)

  try {

    let response

    switch (request) {
      case 'get':
      case 'delete':
      case 'head':
        response = await clienteAxios[request](
          uri,
          //{ headers: { 'Authorization': `${keycloak.tokenParsed.typ} ${keycloak.token}`, }, },
        );
        break;
      case 'post':
      case 'put':
      case 'patch':
        response = await clienteAxios[request](
          uri,
          data,
          { headers: headers },
        );
        break;
      default:
        break;
    }

    notification && NotificationMessageANTD({
      type: response.data.type,
      texto: response.data.message,
      tipoComponent: response.data.tipoComponent,
    })

    setloading && setloading(false)

    switch (response.status) {
      case 200:
      case 201:
        return response.data
        break;
      case 401:
        setloading && setloading(false)
        showSessionExpiredModal(keycloak, logoutOptions)
        break;

      default:
        break;
    }

  } catch (error) {

    if (error?.response?.status === 401) {
      setloading && setloading(false)
      showSessionExpiredModal(keycloak, logoutOptions)
      return []
    }

    msErrorApi && NotificationMessageANTD({
      type: 'error',
      texto: msErrorApi,
      tipoComponent: 'notification',
    })

    setloading && setloading(false)
    return []

  }
}

export const statusRecord = {
  pulling: 'pulling',
  canRelease: 'Puede liberar',
  refreshing: 'Cargando...',
  complete: 'Actualizado',
}

//Claves unicas
export function Uid(extra = 0) {
  return (new Date()).getTime() + Math.random().toString(16).slice(2) + nanoid() + extra

}

//EXPORTA A EXCEL
export const ExportToExcel = (propX) => {
  const { datasource, Title, } = propX;
  exportFromJSON({ data: datasource, fileName: Title, exportType: 'xls' })
}

export const getAxiosLumen = async (propX) => {
  const { test, uri, setloading, msErrorApi, keycloak, notification, parametros, request, logoutOptions } = propX;
  setloading && setloading(true)
  try {
    let response
    switch (request) {
      case 'get':
      case 'delete':
      case 'head':
        response = await clienteAxios[request](
          uri,
          { headers: { 'Authorization': `${keycloak.tokenParsed.typ} ${keycloak.token}`, }, },
        );
        break;
      case 'post':
      case 'put':
      case 'patch':
        response = await clienteAxios[request](
          uri,
          [CryptoJSAesEncrypt(parametros)],
          { headers: { 'Authorization': `${keycloak.tokenParsed.typ} ${keycloak.token}`, }, },
        );
        break;
      default:
        break;
    }

    let dataResponse;
    if (response.data.type) {
      dataResponse = response.data;
    } else if (response.data[0].id_keycloak) {
      dataResponse = response.data;
    } else {
      let responseDes1 = deCryptoJSAesEncrypt(response.data)
      let responseDes = responseDes1.split('\r\n\r\n')
      responseDes = JSON.parse("[" + responseDes[1] + "]")
      dataResponse = { ...responseDes[0] }
    }

    notification && NotificationMessageANTD({
      type: dataResponse.type,
      texto: dataResponse.message,
      tipoComponent: dataResponse.tipoComponent,
    })

    setloading && setloading(false)
    switch (response.status) {
      case 200:
      case 201:
        return dataResponse
        break;
      case 401:
        showSessionExpiredModal(keycloak, logoutOptions)
        break;
      default:
        break;
    }

  } catch (error) {

    if (error?.response?.status === 401) {
      setloading && setloading(false)
      showSessionExpiredModal(keycloak, logoutOptions)
      return []
    }

    NotificationMessageANTD({
      type: 'error',
      texto: msErrorApi,
      tipoComponent: 'notification',
    })

    setloading && setloading(false)
    return []

  }
}

export const getAxiosLumenFree = async (propX) => {
  const { uri, setloading, msErrorApi,  notification, parametros, request, logoutOptions } = propX;
  setloading && setloading(true)
 
  try {
 
    let response
 
    switch (request) {
      case 'get':
      case 'delete':
      case 'head':
        response = await clienteAxios[request](
          uri
        );
        break;
      case 'post':
      case 'put':
      case 'patch':
        response = await clienteAxios[request](
          uri,
          CryptoJSAesEncrypt(parametros),
         
        );
        break;
      default:
        break;
    }
 
    let dataResponse;
 
 
   
    let responseDes1 = deCryptoJSAesEncrypt(response.data)
    let responseDes = responseDes1.split('\r\n\r\n')
    responseDes = JSON.parse("[" + responseDes[1] + "]")
    dataResponse = { ...responseDes[0] }
 
   
    notification && NotificationMessageANTD({
      type: dataResponse.type,
      texto: dataResponse.message,
      tipoComponent: dataResponse.tipoComponent,
    })
 
    setloading && setloading(false)
 
    switch (dataResponse.status) {
      case 200:
      case 201:
        return dataResponse
        break;
      case 401:
        setloading && setloading(false)
        showSessionExpiredModal(keycloak, logoutOptions)
        break;

      default:
        break;
    }


  } catch (error) {

    if (error?.response?.status === 401) {
      setloading && setloading(false)
      showSessionExpiredModal(keycloak, logoutOptions)
      return []
    }

    NotificationMessageANTD({
      type: 'error',
      texto: msErrorApi,
      tipoComponent: 'notification',
    })

    setloading && setloading(false)
    return []

  }
}

export const getAxiosLumenMultForData = async (propX) => {
  const { test, uri, setloading, msErrorApi, keycloak, notification, parametros, request, logoutOptions } = propX;
  setloading && setloading(true)
  try {
    let response
    switch (request) {
      case 'get':
      case 'delete':
      case 'head':
        response = await clienteAxios[request](
          uri,
          { headers: { 'Authorization': `${keycloak.tokenParsed.typ} ${keycloak.token}`, }, },
        );
        break;
      case 'post':
      case 'put':
        case 'patch':
       response = await clienteAxios[request](
    uri,
    parametros, // ✅ FormData tal cual
    {
      headers: {
        Authorization: `${keycloak.tokenParsed.typ} ${keycloak.token}`,
        // ✅ NO pongas Content-Type aquí
      },
    }
  );

          break;
        default:
          break;
      }

    let dataResponse;
    if (response.data.type) {
      dataResponse = response.data;
    } else if (response.data[0].id_keycloak) {
      dataResponse = response.data;
    } else {
      let responseDes1 = deCryptoJSAesEncrypt(response.data)
      let responseDes = responseDes1.split('\r\n\r\n')
      responseDes = JSON.parse("[" + responseDes[1] + "]")
      dataResponse = { ...responseDes[0] }
    }

    notification && NotificationMessageANTD({
      type: dataResponse.type,
      texto: dataResponse.message,
      tipoComponent: dataResponse.tipoComponent,
    })

    setloading && setloading(false)
    switch (response.status) {
      case 200:
      case 201:
        return dataResponse
        break;
      case 401:
        showSessionExpiredModal(keycloak, logoutOptions)
        break;
      default:
        break;
    }

  } catch (error) {

    if (error?.response?.status === 401) {
      setloading && setloading(false)
      showSessionExpiredModal(keycloak, logoutOptions)
      return []
    }

    NotificationMessageANTD({
      type: 'error',
      texto: msErrorApi,
      tipoComponent: 'notification',
    })

    setloading && setloading(false)
    return []

  }
}


// utils/formdataEncrypt.js
export const encryptFormDataExceptFiles = (fd) => {
  const plain = {};
  const out = new FormData();

  for (const [key, value] of fd.entries()) {
    // Si es archivo -> se queda igual
    if (value instanceof File || value instanceof Blob) {
      out.append(key, value);
    } else {
      // texto -> lo juntamos para cifrarlo todo en un solo payload
      plain[key] = value;
    }
  }

  // Aquí ciframos SOLO el JSON de campos texto
  out.append("payload", CryptoJSAesEncrypt(plain));

  return out;
};



// formato de con comas para numeros
function separator(numb) {
  var str = numb.toString().split(".");
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return str.join(".");
}

//Formaro fecha usuario
export const formatDate = (dateOriginal) => {
  let formatted_date = moment(dateOriginal).format("DD/MM/YYYY ")
  return formatted_date;
}

//Formaro fecha hora usuario 
export const formatDateTime = (dateOriginal) => {
  let formatted_date = moment(dateOriginal).format("DD/MM/YYYY HH:mm:ss")
  return formatted_date;
}


export const formatDateTimeBD = (dateOriginal) => {
  let formatted_date = moment(dateOriginal).format("YYYY-MM-DD HH:mm:ss")
  return formatted_date;
}

export const formatDateBD = (dateOriginal) => {
  let formatted_date = moment(dateOriginal).format("YYYY-MM-DD")
  return formatted_date;
}

export const formatTimeBD = (dateOriginal) => {
  let formatted_date = moment(dateOriginal).format("HH:mm:ss")
  return formatted_date;
}

/* resize imagen antes de subir  JVICENCIO*/
export const beforeUpload = file => {
  // Validar que sea imagen
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    console.error('El archivo debe ser una imagen válida');
    return false;
  }

  // Validar tamaño máximo (2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    console.error('La imagen es demasiado grande (máximo 2MB)');
    return false;
  }

  // Retornar false para prevenir auto-upload
  return false;
}

/* Función para redimensionar imagen a 650x650 JVICENCIO*/
export const resizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onerror = () => {
      reject('Error al leer el archivo');
    };

    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;

      img.onload = () => {
        try {
          var maxW = 1250;
          var maxH = 1250;
          var iw = img.naturalWidth;
          var ih = img.naturalHeight;
          var scale = Math.min((maxW / iw), (maxH / ih));
          const canvas = document.createElement('canvas');
          var iwScaled = iw * scale;
          var ihScaled = ih * scale;
          canvas.width = iwScaled;
          canvas.height = ihScaled;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, iwScaled, ihScaled);
          
          canvas.toBlob((result) => {
            if (result) {
              resolve(result);
            } else {
              reject('Error al procesar la imagen');
            }
          }, file.type, 0.9);
        } catch (error) {
          reject('Error al procesar la imagen: ' + error.message);
        }
      };

      img.onerror = () => {
        reject('No se pudo cargar la imagen. Verifica que sea un formato válido (JPG, PNG, etc.)');
      };
    };
  });
}

//formato de tiempo transcurrido JVICENCIO
export const secondToTiempoTracurrido = (seconds) => {
  var days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  var hrs = Math.floor(seconds / 3600);
  seconds -= hrs * 3600;
  var mnts = Math.floor(seconds / 60);
  seconds -= mnts * 60;
  let res = days + "d, " + hrs + "h, " + mnts + "m";
  return res;
}

//RANFO DE FECHAS A DESABILITAR JVICENCIO
export const disableDateRangesDatepiker = (range = { startDate: false, endDate: false }) => {
  const { startDate, endDate } = range;
  return function disabledDate(current) {
    let startCheck = true;
    let endCheck = true;
    if (startDate) {
      startCheck = current && current < moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    }
    if (endDate) {
      endCheck = current && current > moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    }
    return (startDate && startCheck) || (endDate && endCheck);
  };
}

export default separator;

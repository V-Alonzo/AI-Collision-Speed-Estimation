import React from "react";
import { Button,   Col, Row, Image, Card, } from 'antd';
import { Icon } from '@iconify/react';


const ProfilePage = (props) => {
    const {
      data = {
        path_foto: 'path_foto',
        nombre: 'nombre',
        cve_empleado: 'clave',
        correo: 'correo',
        extension: 'extension',
        telefono: 'telefono',
        celular: 'celular',
        puesto: 'puesto',
        puesto_cloud: 'puesto',
        depto: 'departemento',
        area: 'area',
        lider: 'lider',
        supervisa: 'supervisa',
        fecha_ingreso: 'fecha_ingreso',
        antiguedad: 'antiguedad',
        h_tomadas: '0',
        h_disponibles: '0',
        porcentaje: '0',
        p_anterior: '0',
        p_actual: '0',
        total: '0',
        historial: 'historial'
      }
    } = props
  
    const style_hr = { color: 'black', margin:'10px 20px'}
    const style_pu = { color: 'gray', fontSize: '12px',  margin:'0', padding:'0'}
    const style_p = { color: 'gray', fontSize: '12px', margin:'5px' }
    function  goToPdf() {    
      window.open(process.env.REACT_APP_BASE_URL+'SIC_Empleado_Fotos/CM0068.JPG', '_blank');
  }

  return (
    <section
      style={{
        // backgroundColor: '#eee' ,
        // marginTop:-25
      }}
    >
  
    <Row
      gutter={{
        lg: 32,
      }}>
        <Col
          className="gutter-row" span={6}
          style={ {padding:'10px'}}
        >
          <Card
            style={ { width: '100%', margin:'0 0 20px 0 ', borderRadius:'20px', border:'1px solid gray', textAlign: 'center', padding:'0'}} >
              <Image
                width = {120}
                height = {135}
                preview = {false}
                style={{width: '100%',  borderRadius:'50%', padding:'0 ' }}
                src={data.path_foto}
              ></Image>
              <p style={{ margin:'5px 0 0 5px ',color: 'gray', fontSize: '14px', padding:'0px 10px'}}>{data.nombre}</p>
          </Card>
          <Card
              bodyStyle = {{padding:'25px 5px'}}
              style={ { width: '100%', margin:'0', borderRadius:'20px', border:'1px solid gray', padding:'0'}} >
                <Row
                  gutter={{
                    lg: 32,
                    }}
                  style={ { margin:'0', padding: '0'}}
                > 
                  <Col className="gutter-row" span={8}>
                    <p style={style_pu}>Clave:</p>
                  </Col>
                  <Col className="gutter-row" span={16}>
                    <p style={style_pu}>{data.cve_empleado}</p>
                  </Col>
                </Row>
                <hr  style={style_hr}></hr>
                <Row
                  gutter={{
                    lg: 32,
                    }}
                    style={ { margin:'0', padding: '0'}}
                > 
                  <Col className="gutter-row" span={8}>
                    <p style={style_pu}>Correo-e:</p>
                  </Col>
                  <Col className="gutter-row" span={16}>
                    <p style={style_pu}>{data.correo}</p>
                  </Col>
                </Row>
                <hr  style={style_hr}></hr>
                <Row
                  gutter={{
                    lg: 32,
                    }}
                    style={ { margin:'0', padding: '0'}}
                > 
                  <Col className="gutter-row" span={8}>
                    <p style={style_pu}>Extensión:</p>
                  </Col>
                  <Col className="gutter-row" span={16}>
                    <p style={style_pu}>{data.extension}</p>
                  </Col>
                </Row>
                <hr  style={style_hr}></hr>
                <Row
                  gutter={{
                    lg: 32,
                    }}
                    style={ { margin:'0', padding: '0'}}
                  > 
                  <Col className="gutter-row" span={8}>
                    <p style={style_pu}>Teléfono:</p>
                  </Col>
                  <Col className="gutter-row" span={16}>
                    <p style={style_pu}>{data.telefono}</p>
                  </Col>
                </Row>
                <hr  style={style_hr}></hr>
                <Row
                  gutter={{
                    lg: 32,
                    }}
                    style={ { margin:'0', padding: '0'}}
                > 
                  <Col className="gutter-row" span={8}>
                    <p style={style_pu}>Célular:</p>
                  </Col>
                  <Col className="gutter-row" span={16}>
                    <p style={style_pu}>{data.celular}</p>
                  </Col>
                </Row>
                <hr  style={style_hr}></hr>
                <Row
                  gutter={{
                    lg: 32,
                    }}
                    style={ { margin:'0', padding: '0'}}
                > 
                  <Col className="gutter-row" span={8}>
                    <p style={{color: 'gray', fontSize: '12px',  margin:'0', padding:'1em 0 0 0'}}>Credencial:</p>
                  </Col>
                  <Col className="gutter-row" span={16} style = {{padding: '0'}}>
                    <Button 
                      type="icon"
                      style = {{fontSize: '45px', padding: '0', height: '60px'}}
                    >
                      <Icon icon="iwwa:file-pdf" style = {{padding: '0px 0'}}/>
                    </Button>
                  </Col>
                </Row>
          </Card>
        </Col>
        <Col
          className="gutter-row" span={18}
          style={ {padding:'10px'}}
          size = {'20px'}
        >
            <Card
              bodyStyle = {{padding:'5px 5px'}}
              style={ { width: '100%', borderRadius:'20px', border:'1px solid gray', textAlign: 'left', padding:'10px 0 0 0'}} 
            >
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Puesto:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.puesto_cloud}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={{ color: 'gray', fontSize: '12px', margin:'5px'}}>Departamento:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={{ color: 'gray', fontSize: '12px', margin:'5px' }}>{data.depto}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Área:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.area}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Líder:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.lider}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Supervisa a:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.supervisa}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Fecha de ingreso:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.fecha_ingreso}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Antigüedad:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.antiguedad}</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Permisos (18 horas):</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>Horas tomadas: {data.h_tomadas}, Horas disponibles: {data.h_disponibles}, Porcentaje tomado: {data.porcentaje}%</p>
                </Col>
              </Row>
              <hr  style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Vacaciones:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>Periodo anterior: {data.p_anterior} días, Periodo actual: {data.p_actual} días, Total: {data.total} días</p>
                </Col>
              </Row>
              <hr style={style_hr}></hr>
              <Row
                gutter={{
                  lg: 32,
                  }}
                  style={{ margin:'10px 0'}}
              > 
                <Col className="gutter-row" span={4}>
                  <p style={style_p}>Historial en CESVI:</p>
                </Col>
                <Col className="gutter-row" span={20}>
                  <p style={style_p}>{data.historial}</p>
                </Col>
              </Row>
            </Card> 
        </Col>
    </Row> 
    </section>
  );
}


export default ProfilePage
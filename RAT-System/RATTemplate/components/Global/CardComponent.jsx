import React, {  useContext } from 'react';
import ThemeContext from '../../context/ThemContext'

//MUI
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

//Componentes
import { AvatarANTD } from './AvatarComponent.jsx'


//ant.design/
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { ConfigProvider, Card as CardAnt } from 'antd';

const CardMUI = (props) => {

  const {
    width, title, subheader, 
    avatarCardHeader,  actionsCardHeader,
    cardMediacomponent, cardMediheight, cardMediimage, cardMedialt,
    cardActions, styleCard, styleCardHeader

  } = props;


  return (
    <Card sx={{ width: width }} style={styleCard && styleCard}>
      {title &&
        <CardHeader
          style={styleCardHeader && styleCardHeader}
          avatar={avatarCardHeader && avatarCardHeader}
          action={actionsCardHeader && actionsCardHeader}
          title={title && title}
          subheader={subheader && subheader}
        />
      }

      {
        cardMediacomponent &&
        <CardMedia
          component={cardMediacomponent}
          height={cardMediheight}
          image={cardMediimage}
          alt={cardMedialt}
        />
      }

      {props.children &&
        <CardContent>{props.children}</CardContent>
      }

      {cardActions &&
        <CardActions disableSpacing>
          {cardActions}
        </CardActions>
      }
    </Card >
  );
}

const { Meta } = CardAnt;
export const CardAntd = (props) => {
  // Hook y funciones o metodos Globales
  const themeContext = useContext(ThemeContext)
  const { idiomaGral } = themeContext

  const {
    width, title, descriptionMeta, coverSrc,
    avataSrcMeta, actions, extra, titleMeta,
    metaView, bordered, type
  } = props;

  return (
    <ConfigProvider locale={idiomaGral}>
      <CardAnt
        type={type && type}
        bordered={bordered}
        title={title}
        style={{ width: width, marginTop: 16, }}
        cover={coverSrc && <img alt={title} src={coverSrc} />}

        actions={actions && [
          <SettingOutlined key="setting" />,
          <EditOutlined key="edit" />,
          <EllipsisOutlined key="ellipsis" />,
        ]}

        extra={extra && <a href="#">More</a>}

      >
        {metaView &&
          <Meta
            avatar={avataSrcMeta && <AvatarANTD src={avataSrcMeta} />}
            title={titleMeta && titleMeta}
            description={descriptionMeta && descriptionMeta}
          />
        }

        {props.children}
      </CardAnt>
    </ConfigProvider>
  );
};

export default CardMUI;
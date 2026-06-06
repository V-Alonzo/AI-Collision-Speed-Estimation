import * as React from 'react';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';


import Grid from "@mui/material/Grid";
import accountEdit from "@iconify/icons-mdi/account-edit";

//componentes
import AvatarMUIIcon from "../AvatarComponent";

const CardColaborador = (props) => {
  const {user, orientation="horizontal"}= props

  return (
    <Box
      sx={{
        width: '94%',
        position: 'relative',
        overflow: { xs: 'auto', sm: 'initial' },
      }}    >
     
      <Card
        orientation={orientation}
        sx={{
          width: '100%',
          flexWrap: 'wrap',
          [`& > *`]: {
            '--stack-point': '500px',
            minWidth:
              'clamp(0px, (calc(var(--stack-point) - 2 * var(--Card-padding) - 2 * var(--variant-borderWidth, 0px)) + 1px - 100%) * 999, 100%)',
          },
          // make the card resizable for demo
          overflow: 'auto',
          resize: {orientation},
        }}
      >
        {/* <AspectRatio flex ratio="0" maxHeight={182} sx={{ minWidth: 182 }}>
          <img
            src={user.path_foto}
            srcSet={user.path_foto}
            loading="lazy"
            alt=""
          />
        </AspectRatio> */}
        <CardContent>
          <Typography fontSize="xl" fontWeight="lg">
          {user.nombre}
          </Typography>
          <Typography level="body-sm" fontWeight="lg" textColor="text.tertiary">
          {user.depto}
          </Typography>
          <Typography level="body-sm" fontWeight="lg" textColor="text.tertiary">
          {user.puesto}
          </Typography>
          <Sheet
            sx={{
              bgcolor: 'background.level1',
              borderRadius: 'sm',
              p: 1.5,
              my: 1.5,
              display: 'flex',
              gap: 2,
              '& > div': { flex: 1 },
            }}
          >
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Retardos
              </Typography>
              <Typography fontWeight="lg">3</Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Comidas
              </Typography>
              <Typography fontWeight="lg">10</Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Rating
              </Typography>
              <Typography fontWeight="lg">8.9</Typography>
            </div>
          </Sheet>
          {/* <Box sx={{ display: 'flex', gap: 1.5, '& > button': { flex: 1 } }}>
            <Button variant="outlined" color="neutral">
              Chat
            </Button>
            <Button variant="solid" color="primary">
              Follow
            </Button>
          </Box> */}
        </CardContent>
      </Card>
    </Box>
  );
}

export const GridColaborador = (props) => {

  const {user}= props

  return (
    <Grid align="center" sx={{ width: 280 }}>
      <Grid item>
        <AvatarMUIIcon
          iconHijo={accountEdit}
          sizeHijo={"38px"}
          altHijo={"Editar Perfil"}
          width={90}
          height={90}
          action={() => console.log("Editar Perfil")}
          src={user.path_foto}
        />
      </Grid>
      <Grid item>
        <Typography variant="h6" component="div" gutterBottom>
          {user.nombre}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="caption" display="block" gutterBottom>
          {user.nivel_puesto}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="caption" display="block" gutterBottom>
          {user.email}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="caption" display="block" gutterBottom>
          {user.rol}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="caption" display="block" gutterBottom>
          {user.cve_empleado}
        </Typography>
      </Grid>
    </Grid>
  );
}


export default CardColaborador;
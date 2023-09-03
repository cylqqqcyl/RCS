import WarehouseContainer from 'src/sections/warehouse/warehouse-container';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import Head from 'next/head';




const Page = () => (
    <>
    <Head>
      <title>
        RCS | 地图编辑
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 0,
        px: 0,
        height: '100%',
        width: '100%'
      }}
    >
        <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          position: 'sticky', // Use absolute positioning
          height: '100%',
          width: '100%',
          padding: 0,
        }}
        disableGutters={true}
      >
        <div style={{ flex: 1 }}>
          <WarehouseContainer /> {/* Use the WarehouseContainer component */}
        </div>
      </Container>
      
    </Box>
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;

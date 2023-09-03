import Head from 'next/head';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import WarehouseMap from 'src/sections/warehouse/warehouse-map'; // 导入 WarehouseMap 组件
import DeviceTable from 'src/sections/warehouse/device-table'; // Import the DeviceTable component
import WarehouseContainer from 'src/sections/warehouse/warehouse-container';
import io from 'socket.io-client';

const socket = io('http://localhost:8080'); // Connect to the socket.io server

let lastHeartbeat = Date.now(); // Initialize the lastHeartbeat variable with the current time

socket.on('heartbeat', (data) => {
  console.log('Received heartbeat:', data);
  lastHeartbeat = Date.now(); // Update the lastHeartbeat variable with the current time
});

setInterval(() => {
  const now = Date.now();
  const timeSinceLastHeartbeat = now - lastHeartbeat; // Calculate the time since the last heartbeat
  if (timeSinceLastHeartbeat > 20000) { // If it has been more than 20 seconds since the last heartbeat
    socket.connect(); // Attempt to reconnect
  }
}, 10000); // Check every 10 seconds

const now = new Date();


const Page = () => (
  <>
    <Head>
      <title>
        RCS | 机器人调度系统
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
        <div style={{ position: 'absolute', zIndex: 1 }}>
          <DeviceTable /> {/* Use the DeviceTable component */}
        </div>
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

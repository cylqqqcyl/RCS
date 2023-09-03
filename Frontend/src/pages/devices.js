import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  InputLabel,
  Divider
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { DeviceSearch } from 'src/sections/devices/devices-search';
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';
import PaginationItem from '@mui/material/PaginationItem';
import Pagination from '@mui/material/Pagination';
import axios from 'axios';
import io from 'socket.io-client';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import PauseIcon from '@heroicons/react/24/solid/PauseIcon';
import MapPinIcon from '@heroicons/react/24/solid/MapPinIcon';
import SignalWifi0BarIcon from '@mui/icons-material/SignalWifi0Bar';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi3BarIcon from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import CircleIcon from '@mui/icons-material/Circle';

// Connect to the socket.io server
const socket = io('http://localhost:8080');


function CustomPagination() { // 自定义分页栏
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);


  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page + 1}
      count={pageCount}
      // @ts-expect-error
      renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
    />
  );
}

function CustomNoRowsOverlay() {
  return (
      <Box
       sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          无设备
      </Box>
  );
}

const PAGE_SIZE = 5;

const Page = () => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: PAGE_SIZE,
    page: 0,
  });
  const [deviceRows, setDeviceRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = useState("");
  const [infoDialogText, setInfoDialogText] = useState('');
  const [openChangeDialog, setOpenChangeDialog] = useState(false);
  const [changeDialogData, setChangeDialogData] = useState({deviceId: '', deviceMission: ''});
  const [selectDeviceValue, setSelectDeviceValue] = useState('autoChange');
  const [selectOptions, setSelectOptions] = useState([]);
  const [inputReasonValue, setInputReasonValue] = useState('');
  

  const deviceColumns = [
    { 
      field: 'id', 
      headerName: '设备编号', 
      flex: 1, 
      disableColumnMenu: true, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (params) => {
        let Icon;
        // 信号显示
        // switch (params.row.signalStrength) {
        //   case 0:
        //     Icon = SignalWifi0BarIcon;
        //     break;
        //   case 1:
        //     Icon = SignalWifi1BarIcon;
        //     break;
        //   case 2:
        //     Icon = SignalWifi2BarIcon;
        //     break;
        //   case 3:
        //     Icon = SignalWifi3BarIcon;
        //     break;
        //   case 4:
        //     Icon = SignalWifi4BarIcon;
        //     break;
        //   default:
        //     Icon = SignalWifi0BarIcon;
        // }
        Icon = SignalWifi4BarIcon;
        return (
          <Box display="flex" alignItems="center">
            <Icon color="success" />
            <Box mr={1}>{params.value}</Box>
          </Box>
        );
      }
    },
    { 
      field: 'status', 
      headerName: '状态', 
      flex: 1, 
      disableColumnMenu: true, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case '在线':
            color = 'success';
            break;
          case '离线':
            color = 'error';
            break;
          case '故障':
            color = 'warning';
            break;
          // Add more cases as needed
          default:
            color = 'action';
        }
        return (
          <Box display="flex" alignItems="center">
            <CircleIcon color={color} />
            <Box ml={1}>{params.value}</Box>
          </Box>
        );
      }
    },
    { field: 'mission', headerName: '设备任务', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { field: 'EXEstatus', headerName: '执行状态', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { field: 'battery', headerName: '电量', flex: 1, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { 
      field: 'operation', 
      headerName: '操作', 
      flex: 1, 
      disableColumnMenu: true, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.row.mission !== '无') {
          return (
            <Button color="primary"  onClick={() => handleChangeClick(params.row.id, params.row.mission)}>
              换车
            </Button>
          );
        }
        return null;
      }    
    },
  ];

  const handleOptionButtonClick = (action) => {
    if (selectedRows.length === 0) {
      setInfoDialogTitle("请先选择一行");
      setOpenInfoDialog(true);
    } else {
      // Send the selected rows to the backend
      axios.post(`http://localhost:8080/devices/${action}`, { ids: selectedRows })
        .then(response => {
          console.log(response);
          setInfoDialogTitle("操作成功！")
          setInfoDialogText(response.data.message);  // 假设后端返回的数据中包含一个 message 字段
          setOpenInfoDialog(true);
        })
        .catch(error => {
          setInfoDialogTitle("操作失败！")
          setInfoDialogText('Error: ' + error.message);
          setOpenInfoDialog(true);
        });
    }
  };

  function handleChangeClick(deviceId, deviceMission) {
    axios.get('http://localhost:8080/devices')
      .then(response => {
        if (response.data.devices.length === 0) {
          setInfoDialogTitle("无可用设备");
          setOpenInfoDialog(true);
          setOpenChangeDialog(false);
          return;
        }
        setSelectOptions(response.data.devices);
        setOpenChangeDialog(true);
        setChangeDialogData({deviceId: deviceId, deviceMission: deviceMission});
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  function handleChangeConfirmClick() {
    axios.post('http://localhost:8080/devices/changeConfirm', {
      deviceId: changeDialogData.deviceId,
      deviceMission: changeDialogData.deviceMission,
      selectedDevice: selectDeviceValue,
      text: inputReasonValue
    })
      .then(response => {
        setInfoDialogTitle("操作成功！")
        setInfoDialogText(response.data.message);  // 假设后端返回的数据中包含一个 message 字段
        setOpenInfoDialog(true);
        setOpenChangeDialog(false);  // 关闭对话框
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  
  function rowGenerator(originalRow) {
    return {
      id: originalRow.id,
      status: originalRow.status,
      mission: originalRow.mission,
      EXEstatus: originalRow.EXEstatus,
      battery: originalRow.battery
    };
  }

  useEffect(() => {
    // When the component mounts, listen for 'deviceStatus' events from the server
    socket.on('deviceStatus', (newStatusArray) => {
      // When a 'deviceStatus' event is received, update the deviceRows state
      newStatusArray.forEach(newStatus => {
        setDeviceRows((prevRows) => {
          // Check if there is already a device with the same id in the array
          const existingDeviceIndex = prevRows.findIndex(device => device.id === newStatus.id);
  
          if (existingDeviceIndex !== -1) {
            // If there is, update the status of that device
            return prevRows.map((device, index) => {
              if (index === existingDeviceIndex) {
                return rowGenerator(newStatus);
              } else {
                return device;
              }
            });
          } else {
            // If there isn't, add the new status to the array
            return [...prevRows, rowGenerator(newStatus)];
          }
        });
      });
    });
  
    // When the component unmounts, clean up the event listener
    return () => socket.off('deviceStatus');
  }, []);

  return(
  <>
    <Head>
      <title>
        RCS | 设备状态
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={4}
          >
            <Stack spacing={1}>
              <Typography variant="h4">
                设备状态
              </Typography>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
              >
                <Button
                  color="inherit"
                  startIcon={(
                    <SvgIcon fontSize="small">
                      <PlayIcon />
                    </SvgIcon>
                  )}
                  onClick={() => handleOptionButtonClick('continueDevice')}
                >
                  继续
                </Button>
                <Button
                  color="inherit"
                  startIcon={(
                    <SvgIcon fontSize="small">
                      <PauseIcon />
                    </SvgIcon>
                  )}
                  onClick={() => handleOptionButtonClick('pauseDevice')}
                >
                  暂停
                </Button>
                <Button
                  color="inherit"
                  startIcon={(
                    <SvgIcon fontSize="small">
                      <MapPinIcon />
                    </SvgIcon>
                  )}
                  onClick={() => handleOptionButtonClick('refreshLoc')}
                >
                  刷新定位
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <DeviceSearch />
          <DataGrid
              rows={deviceRows}
              columns={deviceColumns}
              getRowId={(row) => row.id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[PAGE_SIZE]}
              slots={{
                  pagination: CustomPagination,
                  noRowsOverlay: CustomNoRowsOverlay,
                }}
              hideFooterSelectedRowCount
              checkboxSelection={true}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedRows(newSelection);
              }}
              />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
          </Box>
        </Stack>
      </Container>
    </Box>
    <Dialog
      open={openChangeDialog}
      onClose={() => setOpenChangeDialog(false)}
      fullWidth={true}
    >
      <DialogTitle>换车</DialogTitle>
      <Divider />
      <DialogContent>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="left" 
          justifyContent="center"
        >
          <FormControl>
            <FormLabel>设备ID</FormLabel>
            <Select
              labelId="select-label"
              value={selectDeviceValue}
              onChange={(event) => setSelectDeviceValue(event.target.value)}
            >
              <MenuItem value={'autoChange'}>自动换车</MenuItem>
              {selectOptions.map((option, index) => (
              <MenuItem key={index} value={option.id}>
                {option.id}
              </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box mt={2} width="100%">
            <TextField
              label="换车原因"
              value={inputReasonValue}
              onChange={(event) => setInputReasonValue(event.target.value)}
              fullWidth
              multiline
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleChangeConfirmClick}
        >
          确定
        </Button>
        <Button onClick={() => setOpenChangeDialog(false)}>
          取消
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog
      open={openInfoDialog}
      onClose={() => setOpenInfoDialog(false)}
    >
      <DialogTitle>{infoDialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {infoDialogText}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  </>
  )

};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;

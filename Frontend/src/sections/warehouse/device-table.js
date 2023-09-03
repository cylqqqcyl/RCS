import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // 引入Link组件
// import * as React from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Drawer, 
    useMediaQuery, 
    SvgIcon,
    experimentalStyled as styled} 
    from '@mui/material';
import EllipsisVerticalIcon from '@heroicons/react/24/solid/EllipsisVerticalIcon';
import {
    DataGrid,
  } from '@mui/x-data-grid';


const countColumns = [
    { field: 'total', width: 90, sortable: false, disableColumnMenu: true, fontWeight: 'bold', align: 'center', headerAlign: 'center',
    renderCell: (params) => (
        <strong>{params.value}</strong> 
      ),
    renderHeader: (GridColumnHeaderParams) => (
    <strong>
        {'全部 '}
    </strong>), headerClassName: 'total-header', cellClassName: 'total-cell'},
    { field: 'online', headerName: '在线', width: 90, sortable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { field: 'offline', headerName: '离线', width: 90, sortable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { field: 'error', headerName: '异常', width: 90, sortable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { field: 'exception', headerName: '排除', width: 90, sortable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center', },
    { field: 'fixing', headerName: '维修', width: 90, sortable: false, disableColumnMenu: true, align: 'center', headerAlign: 'center', }
  ];
  
  const countRows = [
    { id:0, total: 4, online: 4, offline: 0, error: 0, exception: 0, fixing: 0, borderBottom: 'none'}
  ];

export default function DeviceTable() {
  // Initialize the deviceRows state with an empty array

  return (
    <div style={{ position: 'sticky', left: 0, top: 0, transition: 'height 0.5s'}}>
        <Box sx={{ height: 173, width:"100%",
        '& .total-header': {
        fontWeight: 'bold',
        fontSize: '1.2rem',
      },'& .total-cell': {
        fontWeight: 'bold',
        fontSize: '1.2rem',
      }}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'neutral.800',color: 'common.white', padding:1, width:'100%'}}>
                <Typography variant="h6">设备列表</Typography>
                <Link href="/devices">
                    <Button
                        sx={{
                            minWidth: 'auto', // 设置最小宽度为自动
                            width: '40px', // 设置宽度为40px
                            height: '40px', // 设置高度为40px
                            borderRadius: '50%', // 设置边框半径为50%
                            padding: '8px', // 设置内边距为8px
                        }}
                        color="primary"
                        startIcon={(
                        <SvgIcon fontSize="small">
                            <EllipsisVerticalIcon />
                        </SvgIcon>
                        )}
                    >
                    </Button>
                </Link>
            </Box>
            <DataGrid
                rows={countRows}
                columns={countColumns}
                hideFooter
                sx={{height: 117,
                    backgroundColor: 'neutral.800',
                    color: 'common.white', 
                    borderColor:'neutral.800',
                     alignItems: 'center', 
                     borderRadius: 0,
                     '&>.MuiDataGrid-main': {
                        '&>.MuiDataGrid-columnHeaders': {
                            borderBottom: 'none'
                        },

                        '& div div div div >.MuiDataGrid-cell': {
                            borderBottom: 'none'
                        }
                    }}}
                />
        </Box>
    </div>
  );
}

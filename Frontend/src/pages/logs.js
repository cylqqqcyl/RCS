import Head from 'next/head';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { LogSearch } from 'src/sections/logs/logs-search';
import {
  DataGrid,
  useGridApiContext,
} from '@mui/x-data-grid';
import PaginationItem from '@mui/material/PaginationItem';
import Pagination from '@mui/material/Pagination';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { SeverityPill } from 'src/components/severity-pill';
import { tr } from 'date-fns/locale';



const logLevelWeights = {
  'ERROR': 3,
  'WARNING': 2,
  'INFO': 1
};

const columns = [
  { field: 'id', headerName: '日志ID', width: 70, disableColumnMenu: true, align: 'center', headerAlign: 'center'},
  { 
    field: 'level', 
    headerName: '日志级别', 
    width: 100, 
    disableColumnMenu: true, 
    align: 'center', 
    headerAlign: 'center',
    sortComparator: (v1, v2) => logLevelWeights[v1] - logLevelWeights[v2],
    renderCell: (params) => {
      let color;
      switch(params.value) {
        case 'INFO':
          color = 'info';
          break;
        case 'WARNING':
          color = 'warning';
          break;
        case 'ERROR':
          color = 'error';
          break;
        default:
          color = 'primary';
      }
      return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SeverityPill color={color}>
            {params.value}
          </SeverityPill>
        </div>
      );
    }
  },
  { field: 'createdAt', headerName: '日志产生时间', width: 160, disableColumnMenu: true, align: 'center', headerAlign: 'center'},
  { 
    field: 'content', 
    headerName: '日志内容', 
    width: 0, 
    flex: 1, 
    sortable: false, 
    disableColumnMenu: true
  },
];


function CustomNoRowsOverlay() {
  return (
      <Box
       sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
          无日志
      </Box>
  );
}

function CustomPagination({ page, setPage, pageCount }) {
  const apiRef = useGridApiContext();
  
  const handlePageChange = (event, value) => {
    apiRef.current.setPage(value); // 直接设置value
    setPage(value); // 更新page值
  };

  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page} // 使用传入的page值
      count={pageCount}
      // @ts-expect-error
      renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
      onChange={handlePageChange}
      onNextPage={() => handlePageChange(null, page + 1)}
      onPreviousPage={() => handlePageChange(null, page - 1)}
    />
  );
}

const Page = () => {
  const [logs, setLogs] = useState([]);
  const [sortModel, setSortModel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  var sortField = null;
  var sortOrder = null;

  useEffect(() => {
    if (sortModel !== null && sortModel[0] !== undefined) {
      sortField = sortModel[0].field;
      sortOrder = sortModel[0].sort;
    }
    axios.get(`http://localhost:8080/logs?page=${currentPage}&sortField=${sortField?sortField:'createdAt'}&sortOrder=${sortOrder?sortOrder:'desc'}`)
    .then(response => {
      setLogs(response.data.logs);
      setPageCount(response.data.pageCount);  // Get the total page count from the response
    })
    .catch(error => {
      console.error('Error fetching logs:', error);
    });

  }, [sortModel, currentPage]);

  return(
  <>
    <Head>
      <title>
        RCS | 日志管理
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
                日志管理
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
                      <ArrowUpOnSquareIcon />
                    </SvgIcon>
                  )}
                >
                  导出日志
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <LogSearch />
            <DataGrid
              rows={logs}
              columns={columns}
              pageSize={10}
              onSortModelChange={(model) => setSortModel(model)}
              sortingMode="server"
              rowsPerPageOptions={[5]}
              slots={{
                pagination: () => <CustomPagination page={currentPage} setPage={setCurrentPage} pageCount={pageCount} />,
                noRowsOverlay: CustomNoRowsOverlay,
              }}
              hideFooterSelectedRowCount
              checkboxSelection={true}
              onCellClick={(params, event) => {
                if (event.detail === 2 && params.field === 'content') {  // Check if it's a double click and the clicked cell is 'content'
                  setSelectedLog(params.row);
                  setDialogOpen(true);
                }
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>日志内容</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedLog ? selectedLog.content : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            关闭
          </Button>
        </DialogActions>
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

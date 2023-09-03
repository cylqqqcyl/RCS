import { SvgIcon } from '@mui/material';
import TvIcon from '@heroicons/react/24/solid/TvIcon';
import DocIcon from '@heroicons/react/24/solid/DocumentTextIcon';
import MonitorIcon from '@mui/icons-material/MonitorHeart';
import MapIcon from '@heroicons/react/24/solid/MapIcon';

export const items = [
  {
    title: '仓库监控',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <TvIcon />
      </SvgIcon>
    )
  },  
  {
    title: '设备状态',
    path: '/devices',
    icon: (
      <SvgIcon fontSize="small">
        <MonitorIcon />
      </SvgIcon>
    )
  },
  {
    title: '日志管理',
    path: '/logs',
    icon: (
      <SvgIcon fontSize="small">
        <DocIcon />
      </SvgIcon>
    )
  },
  {
    title: '地图编辑',
    path: '/map',
    icon: (
      <SvgIcon fontSize="small">
        <MapIcon />
      </SvgIcon>
    )
  }

];

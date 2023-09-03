import React, { useEffect, useState } from 'react';
import WarehouseMap from './warehouse-map';
import io from 'socket.io-client';

const WarehouseContainer = () => {
  const [forklift, setForklift] = useState({});

  useEffect(() => {
    const socket = io('http://localhost:8080');

    socket.on('forklift', data => {
      setForklift(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <WarehouseMap forklift={forklift} />;
};

export default WarehouseContainer;

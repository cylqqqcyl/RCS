import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, IconButton, Button } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import io from 'socket.io-client';
const forkliftImage = './assets/warehouse/forklift.png';

const pathColorMap = {
  1300: 'red',
  1301: 'blue',
  1302: 'green',
  1303: 'purple',
};


const WarehouseMap = () => {
  const ref = useRef();
  const gRef = useRef();
  const zoomRef = useRef();
  const forkliftElement = useRef([]);
  const [deviceStatus, setDeviceStatus] = useState([]);

  useEffect(() => { // hook for connecting to the socket.io server
    const socket = io('http://localhost:8080'); // Connect to the socket.io server
  
    socket.on('deviceStatus', (data) => {
      setDeviceStatus(data);
    });
  
    return () => {
      socket.off('deviceStatus');
    };
  }, []);

  useEffect(() => { // hook for initializing the SVG
    const svg = d3.select(ref.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('background', 'skyblue') // Set the background color to light blue
      .style('border', '1px solid black'); // Add a border to the SVG

    const g = svg.append('g');
    gRef.current = g.node();

    const zoom = d3.zoom()
      .scaleExtent([.5, 10])
      .on('zoom', zoomed);

    svg.call(zoom);
    zoomRef.current = zoom;

    function zoomed(event) {
      g.attr('transform', event.transform);
    }

    function selectUnit() {
      const currentUnit = d3.select(this);
      const id = currentUnit.attr('id'); // Get the identifier of the clicked element
      const isSelected = currentUnit.attr('data-selected') === 'true'; // Get the selected status of the clicked unit

      if (isSelected) {
        // If the clicked unit is already selected, deselect it
        currentUnit.attr('fill', 'white');
        currentUnit.attr('data-selected', false);
      } else {
        // If the clicked unit is not selected, select it
        currentUnit.attr('fill', 'orange');
        currentUnit.attr('data-selected', true);
      }
    }
    const line = d3.line();

    const pointsOutside = [
      [250-55, 250-47],
      [250-55, 250+2*300+160+47],
      [250+8*150+40+55, 250+2*300+160+47],
      [250+8*150+40+55, 250-47],
      [250-55, 250-47]
    ];

    g.append('path')
      .datum(pointsOutside)
      .attr('d', line)
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round') // Set the line join style to round
      .attr('stroke-linecap', 'round'); // Set the line cap style to round

    const shelfTooltip = d3.select('body').append('div') // Create a tooltip for the shelves
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('border-radius', '5px')
      .style('font-size', '6px')
      .style('padding', '5px');
    

    // Create 3 rows of 9 shelves, each shelf is made up of 8x2 squares
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 9; j++) {
        for (let k = 0; k < 8; k++) {
          for (let l = 0; l < 2; l++) {
            const id = `${i+1}${j+1}${k+1}${l+1}`; // Create a unique identifier for each shelf unit
            g.append('rect')
              .attr('id', 'u'+id) // Add the identifier to the element
              .attr('x', 250 + j * 150 + l * 20)
              .attr('y', 250 + i * 300 + k * 20)
              .attr('width', 20)
              .attr('height', 20)
              .attr('fill', 'white')
              .attr('stroke', 'steelblue')
              .attr('data-selected', 'false') // Add the selected status to the element
              .style('cursor', 'pointer') // 设置鼠标悬浮时为指针
              .on('click', selectUnit)
              .on('mouseover', function(event) { // Show the tooltip when the mouse hovers over the shelf
                shelfTooltip.style('visibility', 'visible')
                  .style('pointer-events', 'auto')
                  .html(`Shelf ID: ${id}`);
                shelfTooltip.style('top', (event.pageY - 10) + 'px')
                  .style('left', (event.pageX + 10) + 'px');
              })
              .on('mouseout', function() { // Hide the tooltip when the mouse leaves the shelf
                shelfTooltip.style('visibility', 'hidden')
                shelfTooltip.style('pointer-events', 'none')
              });
            
            var pointsBetweenUnits;

            if (l === 0) {
              pointsBetweenUnits = [
                [250 + j * 150 + l * 20, 250 + i * 300 + k * 20 + 10],
                [250 + j * 150 + l * 20 - 55, 250 + i * 300 + k * 20 + 10]
              ];
            }
            else
            {
              pointsBetweenUnits = [
                [250 + j * 150 + l * 20 + 20, 250 + i * 300 + k * 20 + 10],
                [250 + j * 150 + l * 20 + 20 + 55, 250 + i * 300 + k * 20 + 10]
              ];
            }
            g.append('path')
              .datum(pointsBetweenUnits)
              .attr('d', line)
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .attr('fill', 'none');
          }
        }
        const pointsBetweenShelves = [
          [250 + j * 150 + 95, 250 + i * 300 - 47],
          [250 + j * 150 + 95, 250 + i * 300 + 160 + 47]
        ];
        if (j !== 8) {
        g.append('path')
          .datum(pointsBetweenShelves)
          .attr('d', line)
          .attr('stroke', 'white')
          .attr('stroke-width', 3)
          .attr('fill', 'none');
        }
      }
      const pointsBetweenRows = [
        [250 - 55, 250 + i * 300 + 160 + 47],
        [250 + 8 * 150 + 40 + 55, 250 + i * 300 + 160 + 47]
      ];
      if (i !== 2) {
      g.append('path')
          .datum(pointsBetweenRows)
          .attr('d', line)
          .attr('stroke', 'white')
          .attr('stroke-width', 3)
          .attr('fill', 'none');
      }
      const pointsBetweenRows2 = [
        [250-55, 250 + i * 300 + 160 + 93],
        [250 + 8 * 150 + 40 + 55, 250 + i * 300 + 160 + 93]
      ];
      if (i !== 2) {
      g.append('path')
          .datum(pointsBetweenRows2)
          .attr('d', line)
          .attr('stroke', 'white')
          .attr('stroke-width', 3)
          .attr('fill', 'none');
      }
    }


    // Add drag behavior to the rectangle
    const drag = d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged);

    svg.call(drag);

    function dragstarted(event) {
      d3.select(this).raise();
    }

    function dragged(event, d) {
      svg.attr('transform', `translate(${event.x}, ${event.y})`);
    }

    return () => {
      g.remove(); // Remove the g element when the component unmounts
    };

  }, []);

  useEffect(() => { // hook for connecting to the socket.io server
    const socket = io('http://localhost:8080'); // Connect to the socket.io server
  
    // Create tooltips for all devices
    const tooltips = {};
  
    socket.on('deviceStatus', (data) => {
      setDeviceStatus(data);
      data.forEach((device, index) => {
        if (!forkliftElement.current[index]) { //if the device element does not exist
          // Add the device image
          forkliftElement.current[index] = d3.select(gRef.current).append('image')
            .attr('x', device.x? device.x-9 : 250)
            .attr('y', device.y? device.y-25 : 250)
            .attr('width', 18)
            .attr('height', 50)
            .attr('href', forkliftImage)
            .attr('transform', `rotate(${device.angle? device.angle : 0}, ${device.x}, ${device.y})`)
            .attr('id', `device-${device.id}`); // Add the id attribute
  
          // Add a tooltip
          tooltips[device.id] = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'white')
            .style('border', '1px solid black')
            .style('border-radius', '5px')
            .style('font-size', '6px')
            .style('padding', '5px');
  
          // Show the tooltip when the mouse hovers over the device
          forkliftElement.current[index].on('mouseover', function() {
            tooltips[device.id].style('visibility', 'visible');
            tooltips[device.id].style('pointer-events', 'auto');
          });
  
          // Move the tooltip to follow the mouse
          forkliftElement.current[index].on('mousemove', function(event) {
            tooltips[device.id].style('top', (event.pageY - 10) + 'px')
              .style('left', (event.pageX + 10) + 'px');
          });
  
          // Hide the tooltip when the mouse leaves the device
          forkliftElement.current[index].on('mouseout', function() {
            tooltips[device.id].style('visibility', 'hidden');
            tooltips[device.id].style('pointer-events', 'none');
          }); 
        }
  
        // Update the tooltip content
        tooltips[device.id].html(`
          <p>设备编号：${device.id}</p>
          <p>状态：
            <span style="color: green;">${device.status}</span>
            </p>
          <p>设备任务：${device.mission}</p>
          <p>执行状态：${device.EXEstatus}</p>
          <p>电量：
            <span style="color: green;">${device.battery}%</span>
          </p>
        `);
      });
    });
  
    return () => {
      socket.off('deviceStatus');
    };
  }, []);
  

    // Update the device's position and rotation when the device prop changes
  deviceStatus.forEach((device, index) => {
    if (forkliftElement.current) { 
      if (!forkliftElement.current[index]) {
        return;  // Skip this iteration if forkliftElement.current[index] is undefined
      }
      forkliftElement.current[index].attr('x', device.x? device.x-9 : 250)
        .attr('y', device.y? device.y-25 : 250)
        .attr('transform', `rotate(${device.angle? device.angle : 0}, ${device.x}, ${device.y})`);
    }
    

  }, [deviceStatus]);

  const zoomIn = () => {
    d3.select(ref.current).transition().duration(750).call(zoomRef.current.scaleBy, 2);
  };

  const zoomOut = () => {
    d3.select(ref.current).transition().duration(750).call(zoomRef.current.scaleBy, 0.5);
  };

  // get all the path nodes
  // function getTrackNodes() {
  //   const paths = d3.selectAll('path').nodes(); // Select all path elements
  //   const nodes = [];
  
  //   paths.forEach(path => {
  //     const d = path.getAttribute('d'); // Get the "d" attribute of the path
  //     const commands = d.split(/(?=[ML])/); // Split the "d" attribute into individual commands
  //     commands.forEach(command => {
  //       const type = command.charAt(0); // Get the type of the command (M or L)
  //       const point = command.slice(1); // Get the point of the command
  //       const coordinates = point.split(',').map(coord => coord.trim()); // Split the point into x and y coordinates
  
  //       // Iterate over pairs of coordinates
  //       for (let i = 0; i < coordinates.length; i += 2) {
  //         const x = parseFloat(coordinates[i]);
  //         const y = parseFloat(coordinates[i + 1]);
  
  //         if (type === 'M' || type === 'L') { // Only add the point if the command is M or L
  //           nodes.push({ x, y }); // Add the coordinates to the nodes array
  //         }
  //       }
  //     });
  //   });
  
  //   return nodes;
  // }
  

  const sendSelectedUnit = () => {
    const allUnits = d3.selectAll('rect'); // Select all units
    const selectedUnits = allUnits.filter(function() { // Filter out the selected units
      return d3.select(this).attr('data-selected') === 'true';
    });
    const selectedIds = selectedUnits.nodes().map(node => node.id); // Get the IDs of the selected units
    // const trackNodes = getTrackNodes(); // Get the nodes of the track (use when the track is new)

    const socket = io('http://localhost:8080'); // Connect to the backend server
    socket.emit('selectedUnits', selectedIds); // Send the IDs to the backend
    // socket.emit('trackNodes', trackNodes); // Send the track nodes to the backend (use when the track is new)
  };
  
  
  // Listen for path events from the backend server
  useEffect(() => {
    const socket = io('http://localhost:8080'); // Connect to the backend server
  
    // Listen for the 'pathPoint' event
    socket.on('pathPoints', (msg) => {
      // Call the function to draw the path
      // Remove all old paths
      // d3.select(gRef.current).selectAll('path.robotPath').remove();
      const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y);

      const pathData = lineGenerator(msg.data);
      const color = pathColorMap[msg.forkliftId];

      // Draw the path
      d3.select(gRef.current).append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', color) // Use the color for this forklift
        .attr('stroke-width', 2)
        .attr('class', 'robotPath');
    });
  
    // Clean up the effect
    return () => socket.off('pathPoints');
  }, []);
  

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        border: '1px solid black',
        position: 'relative',
        backgroundColor: 'white',
      }}
    >
      <svg ref={ref} />
      <IconButton
        aria-label="zoom in"
        style={{
          position: 'absolute',
          bottom: '50px',
          right: '10px',
        }}
        onClick={zoomIn}
      >
        <ZoomInIcon />
      </IconButton>
      <IconButton
        aria-label="zoom out"
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
        onClick={zoomOut}
      >
        <ZoomOutIcon />
      </IconButton>
      <Button
        variant="contained"
        color="primary"
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
        }}
        onClick={sendSelectedUnit}
      >
        发送任务
      </Button>
    </Box>
  );
};

export default WarehouseMap;

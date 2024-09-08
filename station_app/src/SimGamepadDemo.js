import React, { useState, useEffect } from 'react';
import { SimGamepad, ImageStream } from 'ros-ui-react';
import ROSLIB from 'roslib';
import { Card, CardContent, Typography, Grid, Button } from '@mui/material'; // Import Button from @mui/material
import './App.css';
import './scss/style.scss';
import logoLeft from './images/bimi.png';


function SimGamepadDemo() {
  const [throttle, setThrottle] = useState(0);
  const [steering, setSteering] = useState(0);

  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://141.215.208.63:9090'
    });

    const throttleListener = new ROSLIB.Topic({
      ros: ros,
      name: '/throttle_wheel_position',
      messageType: 'std_msgs/Float32'
    });

    const steeringListener = new ROSLIB.Topic({
      ros: ros,
      name: '/steer_wheel_position',
      messageType: 'std_msgs/Float32'
    });

    throttleListener.subscribe((message) => {
      setThrottle(message.data);
    });

    steeringListener.subscribe((message) => {
      setSteering(message.data);
    });

    return () => {
      throttleListener.unsubscribe();
      steeringListener.unsubscribe();
    };
  }, []);

  const handleArm = (arm) => {
    const ros = new ROSLIB.Ros({
      url: 'ws://141.215.208.63:9090'
    });

    const armService = new ROSLIB.Service({
      ros: ros,
      name: '/mavros/cmd/arming',
      serviceType: 'mavros_msgs/CommandBool'
    });

    const request = new ROSLIB.ServiceRequest({
      value: arm
    });

    armService.callService(request, (result) => {
      console.log(`Service call result: ${result.success}`);
    });
  };

  const handleModeChange = (mode) => {
    const ros = new ROSLIB.Ros({
      url: 'ws://141.215.208.63:9090'
    });

    const modeService = new ROSLIB.Service({
      ros: ros,
      name: '/mavros/set_mode',
      serviceType: 'mavros_msgs/SetMode'
    });

    const request = new ROSLIB.ServiceRequest({
      custom_mode: mode
    });

    modeService.callService(request, (result) => {
      console.log(`Mode change result: ${result.success}`);
    });
  };


  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <img src={logoLeft} alt="Logo Left" className="logo-left" />
        </div>
      </header>
      
      <ImageStream src="http://141.215.208.63:11315/stream?topic=/camera/image_raw" />
      <div className="dashboard">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Throttle Speed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {throttle.toFixed(2)} m/s
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Steering Angle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {steering.toFixed(2)} °
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>

      <div className="button-container">
        <Button variant="contained" onClick={() => handleModeChange('MANUAL')}>
          Manual
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleArm(true)}>
          Arm
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleArm(false)}>
          Disarm
        </Button>
        <Button variant="contained" onClick={() => handleModeChange('OFFBOARD')}>
          Offboard
        </Button>
      </div>

      <SimGamepad rosbridgeAddress="ws://141.215.208.63:9090" />
      {/* Embed foxglove */}
      <div className="foxglove-container">
      <iframe 
        src="http://141.215.208.63:8080" 
        title="FoxGlove" 
        style={{ width: '100%', height: '500px', border: 'none' }} 
      />
      </div>
    </div>
  );
}

export default SimGamepadDemo;

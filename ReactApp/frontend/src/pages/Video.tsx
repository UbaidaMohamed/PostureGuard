import { useState, useRef, useEffect } from "react";
import { Camera, CameraOff, Volume2, VolumeX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Video() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [postureStatus, setPostureStatus] = useState<"good" | "bad">("good");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [postureAngle, setPostureAngle] = useState(0);
  const [frame, setFrame] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alertIntervalRef = useRef<number | null>(null);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setCameraPermissionGranted(true);
      // Connect to WebSocket after camera permission is granted
      connectWebSocket();
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Camera access denied. Please grant camera permission to use this feature.");
      setCameraPermissionGranted(false);
    }
  };

  // Connect to Django WebSocket
  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/posture/');
    
    ws.onopen = () => {
      console.log('WebSocket Connected to Django Backend');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Update frame
      if (data.frame) {
        setFrame(`data:image/jpeg;base64,${data.frame}`);
      }
      
      // Update posture data
      if (data.angle) {
        setPostureAngle(Math.round(data.angle));
      }

      // Update posture status based on posture text
      if (data.posture) {
        if (data.posture === 'Good Posture') {
          setPostureStatus('good');
        } else {
          setPostureStatus('bad');
        }

        // Show alert if posture is not good
        if (data.posture !== 'Good Posture' && alertsEnabled) {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      setIsStreaming(false);
      
      // Attempt to reconnect after 3 seconds if camera permission is still granted
      if (cameraPermissionGranted) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      }
    };

    wsRef.current = ws;
  };

  const startCamera = () => {
    if (!cameraPermissionGranted) {
      requestCameraPermission();
      return;
    }

    // Immediately set streaming to true for instant UI feedback
    setIsStreaming(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: 'start' }));
      if (audioEnabled) {
        try {
          if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        } catch (e) {
          console.error('Audio context error:', e);
        }
      }
    }
  };

  const stopCamera = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: 'stop' }));
      wsRef.current.close();
    }
    setIsStreaming(false);
    setIsConnected(false);
    setCameraPermissionGranted(false);
    setFrame(null);
    setPostureAngle(0);
    setPostureStatus('good');
    wsRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Create a simple WebAudio notification player
  const playNotification = (type: "good" | "bad") => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      if (type === 'bad') {
        // Short repetitive beep for bad so it can repeat at 200ms intervals
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(440, now);
        g.gain.setValueAtTime(0, now);
        // quick attack, short release
        g.gain.linearRampToValueAtTime(0.7, now + 0.005);
        g.gain.linearRampToValueAtTime(0, now + 0.08);
        o.connect(g).connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.09);
      } else if (type === 'good') {
        // OK: short double beep
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = 'sine';
        o1.frequency.setValueAtTime(880, now);
        g1.gain.setValueAtTime(0, now);
        g1.gain.linearRampToValueAtTime(0.5, now + 0.01);
        g1.gain.linearRampToValueAtTime(0, now + 0.12);
        o1.connect(g1).connect(ctx.destination);
        o1.start(now);
        o1.stop(now + 0.14);

        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'sine';
        o2.frequency.setValueAtTime(980, now + 0.16);
        g2.gain.setValueAtTime(0, now + 0.16);
        g2.gain.linearRampToValueAtTime(0.45, now + 0.17);
        g2.gain.linearRampToValueAtTime(0, now + 0.3);
        o2.connect(g2).connect(ctx.destination);
        o2.start(now + 0.16);
        o2.stop(now + 0.32);
      }
    } catch (e) {
      // ignore audio errors
    }
  };

  // Play audio notifications and repeat while posture is bad
  useEffect(() => {
    // clear any existing interval if conditions aren't met
    const clearExisting = () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
    };

    if (!audioEnabled || !isStreaming || !alertsEnabled) {
      clearExisting();
      return;
    }

    // If posture is bad, play immediately and start repeating
    if (postureStatus === 'bad') {
      // play once immediately
      playNotification('bad');

      // clear old interval then start a new repeat interval
      clearExisting();
      alertIntervalRef.current = window.setInterval(() => {
        playNotification('bad');
      }, 200); // repeat every 200ms while posture remains bad
    } else if (postureStatus === 'good') {
      // On good posture, clear repeating alerts and play confirmation sound once
      clearExisting();
      playNotification('good');
    }

    return () => clearExisting();
  }, [postureStatus, audioEnabled, alertsEnabled, isStreaming]);

  const getStatusText = () => {
    switch (postureStatus) {
      case "good": return "Good Posture";
      case "bad": return "Poor Posture";
      default: return "Monitoring...";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Posture Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor your sitting posture in real-time with AI-powered detection
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Video Feed</CardTitle>
                <StatusBadge variant={postureStatus}>
                  {getStatusText()}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                {frame ? (
                  <img 
                    src={frame} 
                    alt="Posture Detection Feed" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <CameraOff className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center px-4">
                      {!cameraPermissionGranted 
                        ? 'Click "Start Camera" to grant camera permission' 
                        : isConnected 
                          ? 'Camera not active' 
                          : 'Connecting to backend...'}
                    </p>
                    {cameraError && (
                      <p className="text-destructive text-sm mt-2 px-4 text-center">{cameraError}</p>
                    )}
                  </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                  <Button
                    onClick={isStreaming ? stopCamera : startCamera}
                    size="lg"
                    className="shadow-lg"
                    variant={isStreaming ? "destructive" : "default"}
                  >
                    {isStreaming ? (
                      <>
                        <CameraOff className="w-5 h-5 mr-2" />
                        Stop Camera
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        Start Camera
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Banner - Under Video */}
          {showAlert && (
            <Card className="border-warning bg-warning/10 animate-in slide-in-from-top">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-medium text-warning">Posture Alert: {getStatusText()}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Detection Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="alerts" className="text-sm font-medium">
                  Visual Alerts
                </Label>
                <Switch
                  id="alerts"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="audio" className="text-sm font-medium">
                  Audio Notifications
                </Label>
                <Switch
                  id="audio"
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Current Status</h4>
                <div className="flex items-center space-x-2">
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isStreaming ? "Monitoring active" : "Monitoring paused"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected to Backend' : 'Disconnected'}
                </span>
              </div>
              {!cameraPermissionGranted && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Camera permission required to start monitoring
                  </p>
                </div>
              )}
              {postureAngle > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Hip Angle</h4>
                  <div className="text-3xl font-bold">{postureAngle}°</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        postureAngle > 90 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((postureAngle / 180) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Tips for Good Posture</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keep your back straight against the chair</li>
                <li>• Feet flat on the floor</li>
                <li>• Monitor at eye level</li>
                <li>• Shoulders relaxed</li>
                <li>• Take breaks every 30 minutes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
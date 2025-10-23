import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, Card } from 'antd';
import {
  ClearOutlined,
  CheckOutlined,
  SignatureOutlined
} from '@ant-design/icons';
import './SignatureCapture.css';

const SignatureCapture = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = 200;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    if (!hasSignature) return;

    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');

    if (onComplete) {
      onComplete(signatureData);
    }
  };

  return (
    <div className="signature-capture">
      <Card
        className="signature-canvas-container"
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '12px', background: '#fafafa', borderBottom: '1px solid #d9d9d9' }}>
          <Space>
            <SignatureOutlined />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Sign Here</span>
          </Space>
        </div>
        <div style={{ padding: 16, background: '#fff' }}>
          <canvas
            ref={canvasRef}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </Card>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Space size="middle">
          <Button
            icon={<ClearOutlined />}
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            Clear
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={saveSignature}
            disabled={!hasSignature}
          >
            Complete Signature
          </Button>
        </Space>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
        {hasSignature ? (
          'Click "Complete Signature" to proceed'
        ) : (
          'Draw your signature using your mouse or touch screen'
        )}
      </div>
    </div>
  );
};

export default SignatureCapture;

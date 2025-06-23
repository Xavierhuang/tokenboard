import React, { useState } from 'react';

const SecuritizeIframe = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div
      style={{
        width: '100%',
        minHeight: 800,
        height: '60vh',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <iframe
        src="https://securitize.io/invest"
        width="100%"
        height="100%"
        style={{ border: 'none', flex: 1 }}
        title="Securitize Listings"
        allowFullScreen
      />
    </div>
  );
};

export default SecuritizeIframe;

// src/components/PowerBIReport.js
import React from 'react';

const PowerBIReport = () => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <iframe
        title="Power BI Report"
        width="100%"
        height="100%"
        src="https://app.powerbi.com/reportEmbed?reportId=438a8c36-f334-4697-9fb5-275897ea3696&autoAuth=true&ctid=f93d5f40-88c0-4650-b8f2-cc4ec3ef6a10"
        frameBorder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  );
};

export default PowerBIReport;

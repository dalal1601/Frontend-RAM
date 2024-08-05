import { Box } from "@mui/material";

const BarChart = ({ isDashboard = false }) => {
  return (
    <Box
      sx={{
        height: '100%', // Ensure it takes up full height of its parent
        width: '100%',  // Ensure it takes up full width of its parent
        position: 'relative',
      }}
    >
      <iframe
        src="https://app.powerbi.com/reportEmbed?reportId=14dc1dbe-2bfa-46ac-a32f-737802e9f5bb&autoAuth=true&ctid=f93d5f40-88c0-4650-b8f2-cc4ec3ef6a10&filterPaneEnabled=false&navContentPaneEnabled=false"
        frameBorder="0"
        allowFullScreen="true"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

export default BarChart;

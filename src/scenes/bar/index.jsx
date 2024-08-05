import { Box } from "@mui/material";
import Header from "../../components/Header";

const Bar = () => {
  return (
    <Box>
      <Header />
      <Box
        sx={{
          height: '800px', // Ajustez la hauteur en fonction de vos besoins
          width: '100%',
          position: 'relative',
        }}
      >
        <iframe
          src="https://app.powerbi.com/reportEmbed?reportId=14dc1dbe-2bfa-46ac-a32f-737802e9f5bb&autoAuth=true&ctid=f93d5f40-88c0-4650-b8f2-cc4ec3ef6a10&filterPaneEnabled=false&navContentPaneEnabled=false"
          frameBorder="0"
          allowFullScreen
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
    </Box>
  );
};

export default Bar;

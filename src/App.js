import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import LoadingAnimation from "./components/LoadingAnimation";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Login from "./scenes/Login/Login";
import AuditForm from "./scenes/Formulaire/Formulaire";
import FormulaireDetail from "./scenes/Formulaire/FormulaireDetail";
import AllFormulaire from "./scenes/Formulaire/AllFormulaire";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Reponse from "./scenes/Reponse/Reponse";
import Audits from "./scenes/Audits/Audits";
import ProtectedRoute from "./ProtectedRoute";
import AuditeList from "./scenes/team/AuditeList"
import Loginch from "./scenes/Login/Loginch"

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  const isLoginPage = location.pathname === "/" || location.pathname === "/login";
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showLoading ? (
          <LoadingAnimation />
        ) : (
          <div className="app">
            {!isLoginPage && <Sidebar isSidebar={isSidebar} />}
            <main className="content">
              {!isLoginPage && <Topbar setIsSidebar={setIsSidebar} />}

              <Routes>
               
                <Route path="/" element={<Loginch />} />
                <Route path="login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                <Route path="/form" element={<ProtectedRoute><Form /></ProtectedRoute>} />
                <Route path="/bar" element={<ProtectedRoute><Bar /></ProtectedRoute>} />
                <Route path="/pie" element={<ProtectedRoute><Pie /></ProtectedRoute>} />
                <Route path="/line" element={<ProtectedRoute><Line /></ProtectedRoute>} />
                <Route path="/AuditForm" element={<ProtectedRoute><AuditForm /></ProtectedRoute>} />
                <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/geography" element={<ProtectedRoute><Geography /></ProtectedRoute>} />
                <Route path="/formulaires" element={<ProtectedRoute><AllFormulaire /></ProtectedRoute>} />
                <Route path="/formulaire/:id" element={<ProtectedRoute><FormulaireDetail /></ProtectedRoute>} />
                <Route path="/reponse/:auditId" element={<ProtectedRoute><Reponse /></ProtectedRoute>} />
                <Route path="/Audits/:userId" element={<ProtectedRoute><Audits /></ProtectedRoute>} />
                <Route path="/AuditeList" element={<ProtectedRoute><AuditeList /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

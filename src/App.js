import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Actions from "./scenes/actions";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import LoadingAnimation from "./components/LoadingAnimation";
import Form from "./scenes/form";
import Line from "./scenes/line";
import ChatRoom from "./scenes/chat";
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
import AdminAudite from "./scenes/adminvisfiles/AdminAudite";
import AdminAuditeur from "./scenes/adminvisfiles/AdminAuditeur";
import Audits from "./scenes/Audits/Audits";
import ProtectedRoute from "./ProtectedRoute";
import AuditeList from "./scenes/team/AuditeList"
import Loginch from "./scenes/Login/Loginch"
import Admins from "./scenes/team/Admins"
import AuditeurAuditinfo from "./scenes/adminvisfiles/AuditeurAuditinfo";
import UploadWidget from "./scenes/form/UploadWidget";
import NotFound from "./scenes/NotFound/NotFound";

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
  const isNotFoundPage = location.pathname === "/NotFound";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showLoading ? (
          <LoadingAnimation />
        ) : (
          <div className="app">
            {!isLoginPage && !isNotFoundPage && <Sidebar isSidebar={isSidebar} />}
            <main className="content">
              {!isLoginPage && !isNotFoundPage && <Topbar setIsSidebar={setIsSidebar} />}

              <Routes>
               
                <Route path="/" element={<Loginch />} />
                <Route path="login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute requiredRole="ADMIN" ><Dashboard /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute requiredRole="ADMIN"><Team /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute requiredRole="ADMIN"><Contacts /></ProtectedRoute>} />
                <Route path="/actions/:userId" element={<ProtectedRoute><Actions /></ProtectedRoute>} />
                <Route path="/form/:userId" element={<ProtectedRoute requiredRole="AUDITE"><Form /></ProtectedRoute>} />
                <Route path="/bar" element={<ProtectedRoute requiredRole="ADMIN"><Bar /></ProtectedRoute>} />
                <Route path="/chat/:userId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
                <Route path="/line" element={<ProtectedRoute><Line /></ProtectedRoute>} />
                <Route path="/AuditForm" element={<ProtectedRoute><AuditForm /></ProtectedRoute>} />
                <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute requiredRole="ADMIN"><Calendar /></ProtectedRoute>} />
                <Route path="/Admins" element={<ProtectedRoute requiredRole="ADMIN"><Admins /></ProtectedRoute>} />
                <Route path="/AdminAuditeur/:auditId" element={<ProtectedRoute><AdminAuditeur /></ProtectedRoute>} />
                <Route path="/geography" element={<ProtectedRoute requiredRole="ADMIN"><Geography /></ProtectedRoute>} />
                <Route path="/formulaires" element={<ProtectedRoute requiredRole="ADMIN"><AllFormulaire /></ProtectedRoute>} />
                <Route path="/AdminAudite/:auditId" element={<ProtectedRoute><AdminAudite /> </ProtectedRoute>} />
                <Route path="/formulaire/:id" element={<ProtectedRoute requiredRole="ADMIN"><FormulaireDetail /></ProtectedRoute>} />
                <Route path="/reponse/:auditId" element={<ProtectedRoute><Reponse /></ProtectedRoute>} />
                <Route path="/AuditeurAuditinfo/:auditId" element={<ProtectedRoute><AuditeurAuditinfo /> </ProtectedRoute>} />
                <Route path="/Audits/:userId" element={<ProtectedRoute requiredRole="AUDITEUR"><Audits /></ProtectedRoute>} />
                <Route path="/AuditeList" element={<ProtectedRoute requiredRole="ADMIN" ><AuditeList /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        )}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
//
export default App;

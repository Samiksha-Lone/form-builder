import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './Dashboard';
import FormViewer from './components/FormViewer';
import FormResponses from './pages/FormResponses';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl) {
    localStorage.setItem('jwtToken', tokenFromUrl);
    window.history.replaceState({}, '', window.location.pathname);
  }

  const token = localStorage.getItem('jwtToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 
          <Route path="/forms/:formId" element={<FormViewer />} /> 
          <Route path="/forms/:formId/responses" element={<ProtectedRoute><FormResponses /></ProtectedRoute>} /> 
          <Route path="*" element={<div className="p-8 text-center text-slate-500">Route not found. Current Path: {window.location.pathname}</div>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
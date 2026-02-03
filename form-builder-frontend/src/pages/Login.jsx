import { API_BASE_URL } from '../config';

const LoginPage = () => {
  const handleAirtableLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/airtable`;
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-8 sm:p-12 w-full max-w-md text-center border border-slate-100">
        <div className="w-16 h-16 bg-sky-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-sky-200">
          <span className="text-white text-3xl font-black">F</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-10 font-medium">Choose your preferred login method</p>
        
        <div className="space-y-4">
          <button
            onClick={handleAirtableLogin}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
          >
            <img src="https://www.vectorlogo.zone/logos/airtable/airtable-icon.svg" className="w-5 h-5" alt="Airtable" />
            Connect with Airtable
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">or</span></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

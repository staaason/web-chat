import { Route, Routes } from 'react-router-dom';
import './App.css';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import NotFound from './pages/NotFound';
import MainPage from './pages/MainPage';
import ConfirmedEmail from './pages/ConfirmedEmail';
import PasswordRecover from './pages/PasswordRecover';
import BlogPost from './pages/BlogPost';
import AdminPage from './pages/AdminPage';
import { QueryClient, QueryClientProvider } from 'react-query'
import Layout from './components/Layout';
import RequireAuth from './hooks/RequireAuth';


const queryClient = new QueryClient()
const ROLES = {
  'User': 'USER',
  'Admin': 'ADMIN'
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<SignIn />} />
          <Route path="register" element={<SignUp />} />
          <Route path="verify" element={<ConfirmedEmail />} />
          <Route path="recover-password" element={<PasswordRecover />} />
          <Route element={<RequireAuth allowedRoles={[ROLES.User, ROLES.Admin]} />}>
            <Route path="/app" element={<MainPage />} exact />
            <Route path="posts/:slug" element={<BlogPost />} />
          </Route>
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            < Route path="create-post" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}



export default App;

import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Dashboard from './pages/Admin/Dashboard';
import ManageTasks from './pages/Admin/ManageTasks';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import ViewTaskDetails from "./pages/User/ViewTaskDetails";
import CreateTask from './pages/Admin/CreateTask';
import ManageUsers from './pages/Admin/ManageUsers';
import PrivateRoute from './route/PrivateRoute';
import ProtectedRoute from './utils/ProtectedRoute';
import UserProvider, { UserContext } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import Chat from './pages/Chat/Chat';
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import { SocketProvider } from "./context/socket"; // ✅ Add this

const App = () => {
  return (
    <UserProvider>
      <SocketProvider> {/* ✅ Provide socket context */}
        <OnlineStatusProvider> {/* ✅ Provide online users context */}
          <div>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signUp" element={<SignUp />} />

                {/* Admin Routes */}
                <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/tasks" element={<ManageTasks />} />
                  <Route path="/admin/create-task" element={<CreateTask />} />
                  <Route path="/admin/users" element={<ManageUsers />} />
                  <Route
                    path="/admin/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* User Routes */}
                <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                  <Route path="/user/dashboard" element={<UserDashboard />} />
                  <Route path="/user/tasks" element={<MyTasks />} />
                  <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
                  <Route
                    path="/user/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Default Route */}
                <Route path="/" element={<Root />} />
              </Routes>
            </Router>
          </div>

          <Toaster
            toastOptions={{
              className: "",
              style: {
                fontSize: "13px",
              },
            }}
          />
        </OnlineStatusProvider>
      </SocketProvider>
    </UserProvider>
  );
};

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Outlet />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />;
};

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./components/Login";
import Register from "./components/Register";
import CustomerDashboard from "./components/CustomerDashboard";
import CreateTicket from "./components/CreateTicket";
import TicketList from "./components/TicketList";
import TicketDetails from "./components/TicketDetails";
import AgentDashboard from "./components/AgentDashboard";
import AgentTicketDetails from "./components/AgentTicketDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/customer"
                        element={
                            <ProtectedRoute role="customer">
                                <CustomerDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customer/tickets"
                        element={
                            <ProtectedRoute role="customer">
                                <TicketList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customer/tickets/create"
                        element={
                            <ProtectedRoute role="customer">
                                <CreateTicket />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customer/tickets/:id"
                        element={
                            <ProtectedRoute role="customer">
                                <TicketDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/agent"
                        element={
                            <ProtectedRoute role="agent">
                                <AgentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/agent/tickets/:id"
                        element={
                            <ProtectedRoute role="agent">
                                <AgentTicketDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
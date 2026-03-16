import { HashRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Patients from "./pages/Patients"
import Schedule from "./pages/Schedule"
import Financial from "./pages/Financial"
import Inventory from "./pages/Inventory"
import Procedures from "./pages/Procedures"
import Assets from "./pages/Assets"
import Branches from "./pages/Branches"
import Staff from "./pages/Staff"
import Settings from "./pages/Settings"
import { ThemeProvider } from "./components/ThemeProvider"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pacientes" element={<Patients />} />
            <Route path="agenda" element={<Schedule />} />
            <Route path="financeiro" element={<Financial />} />
            <Route path="estoque" element={<Inventory />} />
            <Route path="procedimentos" element={<Procedures />} />
            <Route path="patrimonio" element={<Assets />} />
            <Route path="filiais" element={<Branches />} />
            <Route path="equipe" element={<Staff />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}

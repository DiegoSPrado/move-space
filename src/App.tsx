import { HashRouter, Routes, Route } from "react-router-dom";
import Control from "./screens/Control";
import Dashboard from "./screens/Dashboard";
import Result from "./screens/Result";
import Configuration from "./screens/Configuration";
import CheckupBiotriagem from "./screens/CheckupBio";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/control" element={<Control />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/result" element={<Result />} />
        <Route path="/config" element={<Configuration />} />
        <Route path="/checkup" element={<CheckupBiotriagem />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

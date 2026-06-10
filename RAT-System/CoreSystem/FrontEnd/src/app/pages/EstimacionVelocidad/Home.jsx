import { PageWithBackground } from "./Componentes/PageWithBackground";
import EstimacionVelocidad from "./EstimacionVelocidad";
import NuevoCasoEstimacion from "./NuevoCasoEstimacion";
import { Routes, Route } from "react-router-dom";

export default function Home() {
  return (
    <PageWithBackground>
      <Routes>
        <Route index element={<EstimacionVelocidad />} />
        <Route path="nuevo" element={<NuevoCasoEstimacion />} />
      </Routes>
    </PageWithBackground>
  );
}
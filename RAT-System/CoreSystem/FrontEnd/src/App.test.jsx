import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("smoke test", () => {
  it("renderiza contenido mínimo", () => {
    render(<div>Hola Vite</div>);
    expect(screen.getByText("Hola Vite")).toBeInTheDocument();
  });
});

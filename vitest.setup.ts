import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/font/google", () => ({
  Anton_SC: () => ({ variable: "--font-display" }),
  Manrope: () => ({ variable: "--font-body" }),
}));

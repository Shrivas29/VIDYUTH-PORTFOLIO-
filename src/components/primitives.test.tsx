import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Monogram } from "./Monogram";
import { SectionMarker } from "./SectionMarker";
import { Sticker12 } from "./Sticker12";

describe("primitives", () => {
  it("Monogram renders the V12 mark", () => {
    render(<Monogram />);
    expect(screen.getByTitle("V12 — Vidyuth Nº12")).toBeInTheDocument();
    expect(screen.getByLabelText("V12")).toBeInTheDocument();
  });
  it("SectionMarker renders its label uppercase", () => {
    render(<SectionMarker label="The Driver" />);
    expect(screen.getByText("The Driver")).toBeInTheDocument();
    expect(screen.getByText("The Driver")).toHaveClass("uppercase");
  });
  it("SectionMarker inverts to white-soft on dark sections", () => {
    render(<SectionMarker label="Road to F1" inverted />);
    expect(screen.getByText("Road to F1")).toHaveClass("text-white-soft");
  });
  it("Sticker12 renders the race number", () => {
    render(<Sticker12 />);
    expect(screen.getByTitle("Race number 12")).toBeInTheDocument();
  });
});

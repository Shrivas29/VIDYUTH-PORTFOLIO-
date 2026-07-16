import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Monogram } from "./Monogram";
import { SectionMarker } from "./SectionMarker";
import { Sticker12 } from "./Sticker12";

describe("primitives", () => {
  it("Monogram renders an svg with V12 title", () => {
    render(<Monogram />);
    expect(screen.getByTitle("V12")).toBeInTheDocument();
  });
  it("SectionMarker renders its label uppercase", () => {
    render(<SectionMarker label="The Driver" />);
    expect(screen.getByText("The Driver")).toBeInTheDocument();
  });
  it("Sticker12 renders the race number", () => {
    render(<Sticker12 />);
    expect(screen.getByTitle("Race number 12")).toBeInTheDocument();
  });
});

import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { RoadToF1 } from "./RoadToF1";
import { roadToF1 } from "@/data/site";

afterEach(() => cleanup());

describe("RoadToF1 track", () => {
  it("renders every stage and the Now badge on the current stage", () => {
    render(<RoadToF1 />);
    for (const stage of roadToF1) {
      expect(screen.getByText(stage.stage)).toBeInTheDocument();
    }
    expect(screen.getByText(/^Now$/i)).toBeInTheDocument();
  });

  it("renders the section shell and the kart marker", () => {
    render(<RoadToF1 />);
    expect(document.getElementById("road-to-f1")).toBeInTheDocument();
    expect(screen.getByTestId("track-marker")).toBeInTheDocument();
  });
});

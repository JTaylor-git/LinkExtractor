import { Mosaic, MosaicWindow } from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";
import { useState } from "react";
import BrowserPane from "../workspace/BrowserPane";
import CodePane from "../workspace/CodePane";
import LogsPane from "../workspace/LogsPane";

type Tile = "browser" | "code" | "logs";
const DEFAULT_LAYOUT = {
  direction: "row" as const,
  first: "browser" as Tile,
  second: { 
    direction: "column" as const, 
    first: "code" as Tile, 
    second: "logs" as Tile, 
    splitPercentage: 50 
  },
  splitPercentage: 55
};

export default function Workspace() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const render = (id: Tile) =>
    id === "browser" ? <BrowserPane /> : id === "code" ? <CodePane /> : <LogsPane />;

  return (
    <Mosaic
      value={layout}
      onChange={setLayout}
      renderTile={(id, path) => (
        <MosaicWindow path={path} title={id.toUpperCase()}>
          {render(id)}
        </MosaicWindow>
      )}
      className="!outline-none h-full"
    />
  );
}
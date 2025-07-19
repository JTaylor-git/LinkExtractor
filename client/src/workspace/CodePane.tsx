import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodePane() {
  const [code, setCode] = useState("// edit here");
  
  return (
    <Editor 
      height="100%" 
      theme="vs-dark" 
      defaultLanguage="javascript" 
      value={code} 
      onChange={v => setCode(v ?? "")} 
      options={{
        minimap: { enabled: false }
      }}
    />
  );
}
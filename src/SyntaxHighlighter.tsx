import React, { useState, useEffect } from "react";
import { tokenize, bottomUpParse, Token } from "./parser";

function SyntaxHighlighter() {
  const [error, setError] = useState<Error | null>(null);
  const [code, setCode] = useState(
`int a = 5 + a * b / k;
char b = 12 * 5;`);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [valid, setValid] = useState<boolean>(true);

  useEffect(() => {
    let isValid = false;
    let error = false;
    try{
      const t = tokenize(code);
      setTokens(t);
      isValid = bottomUpParse(t)
    }catch(e){
      error = true;
      setError(e as Error);
      console.error(e);
    }finally{
      !error && setError(null);
      setValid(isValid);
    }
  }, [code]);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 8 }}>
        Syntax Highlighter
      </h1>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="syntax-highlight-textarea"
      />
      <div className="syntax-highlight-output">
        {tokens.map((token, index) => (
          <span
            key={index}
            style={{ color: getColor(token.type), backgroundColor: token.type === "error" ? "#fbb" : "transparent" }}
          >
            {token.value}
          </span>
        ))}
      </div>
        {
          error && <p>{error.message}</p>
        }
      <p
        style={{
          marginTop: 12,
          fontWeight: "bold",
          color: valid ? "green" : "red",
        }}
      >
        {valid ? "✔ Geçerli ifade" : "✖ Geçersiz ifade"}
      </p>
    </div>
  );
}

function getColor(type: string) {
  switch (type) {
    case "keyword":
      return "blue";
    case "number":
      return "green";
    case "identifier":
      return "purple";
    case "assign":
      return "orange";
    case "operator":
      return "red";
    case "punctuation":
      return "gray";
    case "error":
      return "black";
    default:
      return "black";
  }
}

export default SyntaxHighlighter;

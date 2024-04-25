import SyntaxHighlighter from "react-syntax-highlighter";
import {
  defaultStyle,
  obsidian,
} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { ThemeContext } from "@/components/Navbar/ThemePicker";
import React from "react";

export default function ThemedSyntaxHighlighter({
  language,
  style,
  children,
}: {
  language?: string;
  style?: React.CSSProperties;
  children: string;
}) {
  const theme = React.useContext(ThemeContext);

  return (
    <SyntaxHighlighter
      language={language}
      style={theme === "Light" ? defaultStyle : obsidian}
      customStyle={style}
    >
      {children}
    </SyntaxHighlighter>
  );
}

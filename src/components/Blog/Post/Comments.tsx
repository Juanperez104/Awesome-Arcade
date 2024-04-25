import React from "react";
import getElement from "@/scripts/Utils/Element";
import { ThemeContext } from "@/components/Navbar/ThemePicker";
import inContextualEditor from "@/scripts/Utils/In/ContextualEditingMode";

const REPO = "UnsignedArduino/Awesome-Arcade-Blog-Comments";

export default function Comments({
  title,
}: {
  title: string;
}): React.ReactNode {
  const inEditor = inContextualEditor();
  const [showComments, setShowComments] = React.useState(!inEditor);

  const theme = React.useContext(ThemeContext);
  const [state, setState] = React.useState<
    "loading" | "loaded" | "error" | null
  >(null);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const utterancesFrame = document.querySelector(
        ".utterances",
      ) as HTMLDivElement | null;
      if (utterancesFrame) {
        utterancesFrame.style.margin = "0";
        if (parseInt(utterancesFrame.style.height) > 0) {
          setState("loaded");
        }
      }
    });

    observer.observe(getElement("comments-container"), {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const parent = getElement("comments-container");

    if (!showComments) {
      console.log("Comments hidden");
      setState(null);
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      return;
    }

    console.log(`Loading comments widget for blog post ${title}`);
    setState("loading");

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", REPO);
    script.setAttribute("issue-term", title);
    script.setAttribute("label", "blog comments");
    script.setAttribute(
      "theme",
      theme === "Dark" ? "github-dark" : "github-light",
    );
    script.setAttribute("crossorigin", "anonymous");
    script.onload = () => {
      console.log(`Loaded comments widget for blog post ${title}`);
      const comments = getElement("comments-container");
      if (comments.children[1]) {
        // @ts-ignore
        comments.children[1].style.display = "none";
      }
    };
    script.onerror = () => {
      console.error(`Error loading comments widget for blog post ${title}`);
      setState("error");
    };
    script.async = true;
    parent.appendChild(script);

    return () => {
      console.log(`Removing comments widget for blog post ${title}`);
      setState(null);
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    };
  }, [title, theme, showComments]);

  function onContextualEditingPostAssist(event: CustomEvent) {
    if (event.detail === "showall") {
      setShowComments(true);
    } else if (event.detail === "hideall") {
      setShowComments(false);
    }
  }

  React.useEffect(() => {
    window.document.documentElement.addEventListener(
      "contextualeditingpostassist",
      onContextualEditingPostAssist,
    );

    return () => {
      window.document.documentElement.removeEventListener(
        "contextualeditingpostassist",
        onContextualEditingPostAssist,
      );
    };
  }, []);

  return (
    <>
      {inEditor && (
        <button
          className="btn btn-sm btn-primary mb-2"
          onClick={() => {
            setShowComments(!showComments);
          }}
        >
          {showComments ? "Hide" : "Show"} comments
        </button>
      )}
      <div id="comments-container" />
      {(() => {
        switch (state) {
          case "loading":
            return (
              <div className="alert alert-secondary" role="alert">
                Loading comments...
              </div>
            );
          case "error":
            return (
              <div className="alert alert-danger" role="alert">
                Error loading comments! Try refreshing the page!
              </div>
            );
          case "loaded":
          case null:
          default:
            return null;
        }
      })()}
    </>
  );
}

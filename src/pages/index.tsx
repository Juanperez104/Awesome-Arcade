import React from "react";
import { promises as fs } from "fs";
import path from "path";
import Layout from "../components/Layout";
import getAppProps, { AppProps } from "../components/WithAppProps";
import generateSiteWebmanifest from "../scripts/Utils/SiteWebmanifest/manifest";
import AwesomeArcadeExtensionList from "../components/AwesomeArcadeExtensionList";
import parseExtensionXML, {
  Extension,
  ExtensionList,
  Tool,
} from "@/scripts/Utils/ParseExtensionsXML";
import { smoothScrollToID } from "@/components/AwesomeArcadeExtensionList/linkableHeader";
import { debounce } from "@/scripts/Utils/Timers";
import { AnalyticEvents } from "@/components/Analytics";
import { formatNumber } from "@/scripts/Utils/Numbers";

const pageName = "Home";

type HomeProps = { appProps: AppProps; list: ExtensionList };

type ClickCountListing = { [repo: string]: string };

declare global {
  interface HTMLElementEventMap {
    clickrepo: CustomEvent<string>;
    repoclickcountchange: CustomEvent<{
      repo: string;
      count: string | undefined;
    }>;
  }
}

export function Home({ appProps, list }: HomeProps): JSX.Element {
  const [_, setTheme] = React.useState<"dark" | "light">("light");

  function onThemeChange(event: CustomEvent<"Dark" | "Light">) {
    setTheme(event.detail.toLowerCase() as "dark" | "light");
  }

  React.useEffect(() => {
    let theme = window.localStorage.getItem("themeUsed");
    if (theme === null) {
      theme = "light";
    } else {
      theme = theme.toLowerCase();
    }

    window.document.documentElement.addEventListener(
      "themeused",
      onThemeChange
    );

    setTheme(theme as "dark" | "light");
  }, []);

  const [search, setSearch] = React.useState("");
  const [filteredList, setFilteredList] = React.useState(list);
  const [resultCount, setResultCount] = React.useState<
    { extensions: number; tools: number } | undefined
  >(undefined);

  const searchParam = "q";

  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search).get(searchParam);
    if (q !== null) {
      setSearch(q);
    }
    if (window.location.hash.length > 0) {
      smoothScrollToID(window.location.hash.replace("#", ""));
    }
  }, []);

  React.useEffect(() => {
    const url = new URL(window.location.toString());
    if (search === "") {
      url.searchParams.delete(searchParam);
    } else {
      url.searchParams.set(searchParam, search);
    }
    window.history.replaceState({}, "", url.toString());
  }, [search]);

  React.useEffect(() => {
    if (search.length > 0) {
      const filtered = structuredClone(list);
      let extCount = 0;
      let toolCount = 0;
      for (const group of Object.values(filtered)) {
        for (let i = group.length - 1; i >= 0; i--) {
          if (
            !group[i].repo
              .trim()
              .toLowerCase()
              .includes(search.trim().toLowerCase())
          ) {
            group.splice(i, 1);
          }
        }
        if (group.length > 0) {
          switch (group[0].type) {
            case "Extension": {
              extCount += group.length;
              break;
            }
            case "Tool": {
              toolCount += group.length;
              break;
            }
          }
        }
      }
      setFilteredList(filtered);
      setResultCount({
        extensions: extCount,
        tools: toolCount,
      });
    } else {
      setFilteredList(list);
      setResultCount(undefined);
    }
  }, [search, list]);

  const allReposRef = React.useRef<string[]>([]);

  const dispatchRepoClickCountChange = (
    repo: string,
    count: string | undefined
  ) => {
    window.document.documentElement.dispatchEvent(
      new CustomEvent<{ repo: string; count: string | undefined }>(
        "repoclickcountchange",
        {
          detail: {
            repo,
            count,
          },
        }
      )
    );
  };

  const dispatchRepoClickCountChanges = (
    listing: ClickCountListing | undefined
  ) => {
    for (const key of allReposRef.current) {
      dispatchRepoClickCountChange(
        key,
        listing != undefined ? listing[key] : undefined
      );
    }
  };

  const refreshAllClickCounts = () => {
    console.log("Refreshing click counts");
    fetch(`${window.location.origin}/api/all/`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        allReposRef.current = [];
        for (const key of Object.keys(json)) {
          json[key] = formatNumber(json[key]);
          allReposRef.current.push(key);
        }
        dispatchRepoClickCountChanges(json);
        console.log(
          `Successfully refreshed ${allReposRef.current.length} click counts`
        );
      })
      .catch((error) => {
        allReposRef.current = [];
        dispatchRepoClickCountChanges(undefined);
        console.error(`Error fetching click counts: ${error}`);
      });
  };

  const refreshCountsRef = React.useRef<number | undefined>(undefined);
  const REFRESH_CLICK_COUNT_PERIOD = 1000 * 60 * 2;

  React.useEffect(() => {
    window.clearInterval(refreshCountsRef.current);

    refreshAllClickCounts();

    refreshCountsRef.current = window.setInterval(
      refreshAllClickCounts,
      REFRESH_CLICK_COUNT_PERIOD
    );
    return () => {
      window.clearInterval(refreshCountsRef.current);
    };
  }, []); // eslint-disable-line

  const logRepoClickFromEvent = (event: CustomEvent<string>) => {
    const repo = event.detail;
    fetch(`${window.location.origin}/api/click?repo=${repo}`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        const repo = Object.keys(json)[0];
        const count = formatNumber(json[repo]);
        dispatchRepoClickCountChange(repo, count);
      })
      .catch((error) => {
        console.error(
          `Error refreshing individual click count for ${repo}: ${error}`
        );
      });
  };

  React.useEffect(() => {
    window.document.documentElement.addEventListener(
      "clickrepo",
      logRepoClickFromEvent
    );
    return () => {
      window.document.documentElement.removeEventListener(
        "clickrepo",
        logRepoClickFromEvent
      );
    };
  }, []); // eslint-disable-line

  return (
    <Layout
      title={pageName}
      currentPage={pageName}
      appProps={appProps}
      description="This is a list of MakeCode Arcade extensions that I find super useful (or just plain cool) in my projects."
      keywords="Game development, Awesome, Modules, Libraries, Extensions, Curated, Arcade, Useful, Curated list, MakeCode, Awesome extensions, Useful extensions, MakeCode Arcade, MakeCode Arcade Extensions, Arcade Extensions"
    >
      <h1>Welcome to Awesome Arcade Extensions</h1>
      <p>
        This is a list of MakeCode Arcade extensions that I find super useful
        (or just plain cool) in my projects.
      </p>
      <p>
        Please note that this website is not developed, affiliated, or endorsed
        by Microsoft, the owner of MakeCode Arcade.
      </p>
      <div>
        <div className="input-group mb-3">
          <span className="input-group-text" id="searchLabel">
            Search:
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by author or name!"
            defaultValue={search}
            onChange={(event) => {
              const v = event.target.value;
              setSearch(v);
              debounce(
                "searchChange",
                () => {
                  AnalyticEvents.sendSearch(v);
                },
                1000
              );
            }}
            aria-label="Search query"
            aria-describedby="searchLabel"
          />
        </div>
        {resultCount != undefined ? (
          <p>
            Found {resultCount.extensions} extension
            {resultCount.extensions !== 1 ? "s" : ""} and {resultCount.tools}{" "}
            tool{resultCount.tools !== 1 ? "s" : ""}.
          </p>
        ) : undefined}
        <AwesomeArcadeExtensionList list={filteredList} />
      </div>
    </Layout>
  );
}

export async function getStaticProps(): Promise<{
  props: HomeProps;
}> {
  await fs.writeFile(
    "./public/site.webmanifest",
    await generateSiteWebmanifest()
  );

  const list = await parseExtensionXML(
    (
      await fs.readFile(path.resolve(process.cwd(), "src", "extensions.xml"))
    ).toString()
  );

  await fs.writeFile(
    "./public/extensions.json",
    JSON.stringify(list, undefined, 2)
  );

  return {
    props: {
      appProps: await getAppProps(),
      list,
    },
  };
}

export default Home;

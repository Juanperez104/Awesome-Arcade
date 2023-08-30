import Head from "next/head";
import Link from "next/link";
import React from "react";
// import AdblockDetectionBanner from "../AdblockDetectionBanner";
import ErrorBoundary from "../ErrorBoundary";
import Footer from "../Footer";
import Navbar from "../Navbar";
import ThemeProxy from "../Navbar/ThemePicker";
import Notifications from "../Notifications";
import TOSBanner from "../TOSBanner";
import { AppProps } from "../WithAppProps";
import ProfileOffcanvas from "@/components/Authentication/Offcanvas";

const appName = "Awesome Arcade Extensions";

type LayoutProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  breadCrumbs?: { [title: string]: string }[] | undefined;
  appProps: AppProps;
  description?: string;
  keywords?: string;
  currentPage?: string;
  putInDIV?: boolean;
  showFooter?: boolean;
  dontShowServicesWarning?: boolean;
  dontShowAdblockerWarning?: boolean;
  extraNavbarHTML?: JSX.Element | undefined;
};

function Layout({
  children,
  title,
  breadCrumbs,
  appProps,
  description,
  keywords,
  currentPage,
  putInDIV,
  showFooter,
  dontShowServicesWarning,
  extraNavbarHTML,
}: // dontShowAdblockerWarning,
LayoutProps): JSX.Element {
  const breadCrumbsHTML =
    breadCrumbs != undefined ? (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          {breadCrumbs.map((value, index, array) => {
            const v = Object.entries(value)[0];
            const pageTitle = v[0];
            const link = v[1];
            if (index === array.length - 1) {
              return (
                <li
                  className="breadcrumb-item active"
                  aria-current="page"
                  key={pageTitle}
                >
                  {pageTitle}
                </li>
              );
            } else {
              return (
                <li className="breadcrumb-item" key={pageTitle}>
                  <Link href={link}>{pageTitle}</Link>
                </li>
              );
            }
          })}
        </ol>
      </nav>
    ) : (
      <></>
    );

  const titleContent = `${title} | ${appName}${(() => {
    switch (appProps.environment) {
      case "production": {
        return "";
      }
      case "preview": {
        return " Beta";
      }
      case "development": {
        return " Development";
      }
    }
  })()}`;

  return (
    <ErrorBoundary>
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="google-site-verification"
          content="Re7-kI6r0A2mxsfnqJgahmiE8O_8WVYTh1MFU02fA5I"
        />
        <title>{titleContent}</title>
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:title" content={titleContent} />
        <meta name="twitter:title" content={titleContent} />

        {description != undefined && description != "" ? (
          <>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta name="twitter:description" content={description} />
          </>
        ) : (
          <></>
        )}
        {keywords != undefined && keywords != "" ? (
          <meta name="keywords" content={keywords} />
        ) : (
          <></>
        )}
        {/* <meta property="og:image" content="/opengraph.png" /> */}
        {/* <meta name="twitter:image" content="/opengraph.png" /> */}
      </Head>

      <Navbar
        appName={appName}
        appProps={appProps}
        currentPage={currentPage}
        extraNavbarHTML={extraNavbarHTML}
      />
      <ProfileOffcanvas />

      {dontShowServicesWarning ? <></> : <TOSBanner />}
      {/* {dontShowAdblockerWarning ? <></> : <AdblockDetectionBanner />} */}

      <ErrorBoundary>
        <main>
          {(() => {
            if (putInDIV == undefined || putInDIV) {
              return (
                <div className="container-fluid p-2">
                  <>
                    {breadCrumbsHTML}
                    {children}
                  </>
                </div>
              );
            } else {
              return (
                <>
                  {breadCrumbsHTML}
                  {children}
                </>
              );
            }
          })()}
        </main>
      </ErrorBoundary>

      {showFooter == undefined || showFooter ? <Footer /> : <></>}

      <Notifications />
      <ThemeProxy />
    </ErrorBoundary>
  );
}

export default Layout;

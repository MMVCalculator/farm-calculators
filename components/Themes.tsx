import React, { useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
];

const Themes = () => {
  const [themeName, setThemeName] = useLocalStorageState<string>("theme", {
    ssr: true,
  });

  useEffect(() => {
    if (!themeName) {
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? setThemeName("dark")
        : setThemeName("light");
      return;
    }

    document.getElementsByTagName("html")[0].dataset.theme = themeName;
  }, [setThemeName, themeName]);

  return (
    <div title="Change Theme" className="dropdown dropdown-end">
      <div tabIndex={0} className="btn btn-ghost gap-1 normal-case">
        <svg
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="md:h-6 md:w-6 inline-block w-5 h-5 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          ></path>
        </svg>
        <span className="md:inline hidden">Theme</span>
        <svg
          width="12px"
          height="12px"
          className="opacity-60 sm:inline-block hidden w-3 h-3 ml-1 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <div className="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 h-[70vh] w-52 overflow-y-auto shadow-2xl mt-16">
        <div className="grid grid-cols-1 gap-3 p-3" tabIndex={0}>
          {themeName &&
            themes.map((theme) => {
              return (
                <div
                  className={`outline-base-content overflow-hidden rounded-lg outline-2 outline-offset-2 ${
                    theme === themeName ? "outline" : ""
                  }`}
                  key={theme}
                  data-set-theme={theme}
                  data-act-class="outline"
                  onClick={(e) => {
                    setThemeName(e.currentTarget.dataset.setTheme);
                  }}
                >
                  <div
                    data-theme={theme}
                    className="bg-base-100 text-base-content w-full font-sans cursor-pointer"
                  >
                    <div className="grid grid-cols-5 grid-rows-3">
                      <div className="flex col-span-5 row-span-3 row-start-1 gap-1 px-4 py-3">
                        <div
                          className={`flex-grow text-sm font-bold ${
                            theme === "cmyk" ? "uppercase" : "capitalize"
                          }`}
                        >
                          {theme}
                        </div>
                        <div className="flex flex-wrap flex-shrink-0 gap-1">
                          <div className="bg-primary w-2 rounded"></div>
                          <div className="bg-secondary w-2 rounded"></div>
                          <div className="bg-accent w-2 rounded"></div>
                          <div className="bg-neutral w-2 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Themes;

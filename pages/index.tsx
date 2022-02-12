import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { BitkubTicker, CoinExTicker } from "../interfaces/Ticker";
import Link from "next/link";

type Props = {
  THB_KUB: number;
  THB_USDT: number;
  LUMI_USDT: number;
};

type PlantKind = "SEED" | "STEM";
type StemLP = "LKKUB" | "LKUSDT";
type SeedKind = "TOMATO" | "CORN" | "CABBAGE" | "CARROT";
type RewardMultiplier = 8 | 15 | 20 | 24 | 25 | 30;

const Home: NextPage<Props> = ({ THB_KUB, THB_USDT, LUMI_USDT }) => {
  const [thbKub, setThbKub] = useState<number>(THB_KUB);
  const [thbUsdt, setThbUsdt] = useState<number>(THB_USDT);
  const [lumiUsdt, setLumiUsdt] = useState<number>(LUMI_USDT);

  const [plantKind, setPlantKind] = useState<PlantKind>("SEED");
  const [stemLP, setStemLP] = useState<StemLP>("LKKUB");
  const [seedKind, setSeedKind] = useState<SeedKind>("TOMATO");
  const [rewardMultiplier, setRewardMultiplier] = useState<RewardMultiplier>(8);
  const [seedOrStemAmount, setSeedOrStemAmount] = useState<number | null>(null);
  const [totalLiquidity, setTotalLiquidity] = useState<number | null>(null);
  const [cropsPerDay, setCropsPerDay] = useState<number | "-">("-");

  useEffect(() => {
    document.getElementsByTagName("html")[0].dataset.theme = "light";

    const BASE_API_URL_BITKUB = "wss://api.bitkub.com/websocket-api";
    const BASE_API_URL_COINEX = "wss://socket.coinex.com/";

    const wsBitkub = new WebSocket(
      `${BASE_API_URL_BITKUB}/market.ticker.thb_kub,market.ticker.thb_usdt`
    );
    const wsCoinEx = new WebSocket(`${BASE_API_URL_COINEX}`);

    wsBitkub.onopen = () => {
      wsBitkub.onmessage = (ev) => {
        try {
          const { id, last } = JSON.parse(ev.data) as BitkubTicker;

          switch (id) {
            case 8:
              setThbUsdt(last);
              break;

            case 92:
              setThbKub(last);
              break;
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            // Do nothing
            return;
          }

          console.log("❗️", (error as Error).name);
        }
      };
    };

    wsCoinEx.onopen = () => {
      wsCoinEx.onmessage = (ev) => {
        try {
          const data: CoinExTicker = JSON.parse(ev.data);
          setLumiUsdt(data.params[0].LUMIUSDT.last);
        } catch (error) {
          if (error instanceof SyntaxError) {
            // Do nothing
            return;
          }

          console.log("❗️", (error as Error).name);
        }
      };

      const request = {
        method: "state.subscribe",
        params: ["LUMIUSDT"],
        id: 1,
      };

      wsCoinEx.send(JSON.stringify(request));
    };
  }, []);

  useEffect(() => {
    switch (plantKind) {
      case "SEED":
        const rewardsSeedPercentage =
          (seedOrStemAmount || 0) /
          ((typeof totalLiquidity === "number" && totalLiquidity >= 0
            ? totalLiquidity
            : Infinity) +
            (seedOrStemAmount || 0));

        const cropsPerDaySeed = parseFloat(
          (17280 * 0.1 * rewardMultiplier * rewardsSeedPercentage).toFixed(2)
        );

        setCropsPerDay(
          cropsPerDaySeed <= 0 ||
            cropsPerDaySeed === Infinity ||
            isNaN(cropsPerDaySeed)
            ? "-"
            : cropsPerDaySeed
        );
        break;

      case "STEM":
        switch (stemLP) {
          case "LKKUB":
            const stemLkKubAmountToUsdt =
              ((seedOrStemAmount || 0) * thbKub * 0.625) / thbUsdt;
            const rewardsLkkubPercentage =
              stemLkKubAmountToUsdt /
              ((typeof totalLiquidity === "number" && totalLiquidity >= 0
                ? totalLiquidity
                : Infinity) +
                stemLkKubAmountToUsdt);

            const cropsPerDayStemLkKub = parseFloat(
              (17280 * 0.1 * rewardMultiplier * rewardsLkkubPercentage).toFixed(
                2
              )
            );

            setCropsPerDay(
              cropsPerDayStemLkKub <= 0 ||
                cropsPerDayStemLkKub === Infinity ||
                isNaN(cropsPerDayStemLkKub)
                ? "-"
                : cropsPerDayStemLkKub
            );
            break;

          case "LKUSDT":
            const stemLkUsdtAmountToUsdt = (seedOrStemAmount || 0) * 1.995;
            const rewardsLkUsdtPercentage =
              stemLkUsdtAmountToUsdt /
              ((typeof totalLiquidity === "number" && totalLiquidity >= 0
                ? totalLiquidity
                : Infinity) +
                stemLkUsdtAmountToUsdt);

            const cropsPerDayStemLkUsdt = parseFloat(
              (
                17280 *
                0.1 *
                rewardMultiplier *
                rewardsLkUsdtPercentage
              ).toFixed(2)
            );

            setCropsPerDay(
              cropsPerDayStemLkUsdt <= 0 ||
                cropsPerDayStemLkUsdt === Infinity ||
                isNaN(cropsPerDayStemLkUsdt)
                ? "-"
                : cropsPerDayStemLkUsdt
            );
            break;
        }

        break;
    }
  }, [
    plantKind,
    rewardMultiplier,
    seedOrStemAmount,
    stemLP,
    thbKub,
    thbUsdt,
    totalLiquidity,
  ]);

  return (
    <div className="bg-slate-100 flex flex-col w-screen h-screen overflow-auto">
      <Head>
        <title>MMVez</title>
      </Head>

      <nav className="navbar sticky top-0 z-50 flex space-x-2 bg-white shadow-lg">
        <div className="flex flex-1 ml-2 space-x-2">
          <div className="aspect-square flex flex-col items-center justify-center w-10 h-10">
            <Image
              src="/icons/mmv_logo.png"
              alt="mmv-logo"
              width={960}
              height={960}
            />
          </div>
          <span className="select-none font-[Chewy]">MMVez</span>
        </div>

        {/* <div className="lg:flex flex-none hidden">
          <ul className="flex items-stretch space-x-2">
            <a className="btn btn-ghost btn-sm rounded-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-5 mr-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
              Likes
            </a>

            <a className="btn btn-ghost btn-sm rounded-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-5 mr-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              Notifications
            </a>

            <a className="btn btn-ghost btn-sm rounded-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-5 mr-2 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                ></path>
              </svg>
              Files
            </a>
          </ul>
        </div> */}

        <div className="flex-none">
          <button className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </nav>

      <div className="sm:max-w-screen-sm container z-0 self-center flex-1 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex flex-row space-x-2 overflow-hidden bg-white shadow-lg">
            <div className="bg-zinc-700 flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/kub.png" alt="kub" width={80} height={80} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="text-zinc-700 font-bold">{thbKub}</h1>
              <p className="text-2xs text-stone-400 font-medium">THB/KUB</p>
            </div>
          </div>
          <div className="card flex flex-row space-x-2 overflow-hidden bg-white shadow-lg">
            <div className="bg-zinc-700 flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/usdt.png" alt="usdt" width={80} height={80} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="text-zinc-700 font-bold">{thbUsdt}</h1>
              <p className="text-2xs text-stone-400 font-medium">THB/USDT</p>
            </div>
          </div>
          <div className="card flex flex-row space-x-2 overflow-visible bg-white shadow-lg">
            <div className="bg-zinc-700 rounded-l-2xl flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/lumi.png" alt="lumi" width={80} height={80} />
            </div>
            <div className="relative flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="text-zinc-700 font-bold">
                {(thbUsdt * lumiUsdt).toFixed(2)}
              </h1>
              <p className="text-2xs text-stone-400 font-medium">THB/LUMI</p>
              <div className="badge badge-secondary badge-xs -top-1.5 absolute right-0">
                beta
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col p-4 space-y-4 overflow-hidden bg-white shadow-lg">
          <h1 className="text-lg font-medium text-center">คำนวณผลผลิตต่อวัน</h1>

          <div className="btn-group self-center">
            <button
              className={`btn btn-outline btn-sm${
                plantKind === "SEED" ? " btn-active" : ""
              }`}
              onClick={() => {
                setPlantKind("SEED");

                switch (seedKind) {
                  case "TOMATO":
                    setRewardMultiplier(8);
                    break;
                  case "CORN":
                    setRewardMultiplier(8);
                    break;
                  case "CABBAGE":
                    setRewardMultiplier(8);
                    break;
                  case "CARROT":
                    setRewardMultiplier(15);
                    break;
                }
              }}
            >
              SEED
            </button>
            <button
              className={`btn btn-outline btn-sm${
                plantKind === "STEM" ? " btn-active" : ""
              }`}
              onClick={() => {
                setPlantKind("STEM");

                switch (stemLP) {
                  case "LKKUB":
                    switch (seedKind) {
                      case "TOMATO":
                        setRewardMultiplier(24);
                        break;
                      case "CORN":
                        setRewardMultiplier(24);
                        break;
                      case "CABBAGE":
                        setRewardMultiplier(24);
                        break;
                      case "CARROT":
                        setRewardMultiplier(30);
                        break;
                    }
                    break;
                  case "LKUSDT":
                    switch (seedKind) {
                      case "TOMATO":
                        setRewardMultiplier(20);
                        break;
                      case "CORN":
                        setRewardMultiplier(20);
                        break;
                      case "CABBAGE":
                        setRewardMultiplier(20);
                        break;
                      case "CARROT":
                        setRewardMultiplier(25);
                        break;
                    }
                    break;
                }
              }}
            >
              STEM
            </button>
          </div>

          {plantKind === "STEM" && (
            <div className="btn-group self-center">
              <button
                className={`btn btn-outline btn-sm${
                  stemLP === "LKKUB" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setStemLP("LKKUB");

                  switch (seedKind) {
                    case "TOMATO":
                      setRewardMultiplier(24);
                      break;
                    case "CORN":
                      setRewardMultiplier(24);
                      break;
                    case "CABBAGE":
                      setRewardMultiplier(24);
                      break;
                    case "CARROT":
                      setRewardMultiplier(30);
                      break;
                  }
                }}
              >
                LKKUB
              </button>
              <button
                className={`btn btn-outline btn-sm${
                  stemLP === "LKUSDT" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setStemLP("LKUSDT");

                  switch (seedKind) {
                    case "TOMATO":
                      setRewardMultiplier(20);
                      break;
                    case "CORN":
                      setRewardMultiplier(20);
                      break;
                    case "CABBAGE":
                      setRewardMultiplier(20);
                      break;
                    case "CARROT":
                      setRewardMultiplier(25);
                      break;
                  }
                }}
              >
                LKUSDT
              </button>
            </div>
          )}

          <div className="ring ring-neutral self-center w-10 h-10 rounded-full">
            <Image
              src={`/icons/crop-${seedKind.toLocaleLowerCase()}.png`}
              alt={`crop-${seedKind.toLocaleLowerCase()}`}
              width={80}
              height={80}
            />
          </div>

          <div className="btn-group self-center">
            <button
              className={`btn btn-outline btn-xs${
                seedKind === "TOMATO" ? " btn-active" : ""
              }`}
              onClick={() => {
                setSeedKind("TOMATO");

                switch (plantKind) {
                  case "SEED":
                    setRewardMultiplier(8);
                    break;
                  case "STEM":
                    switch (stemLP) {
                      case "LKKUB":
                        setRewardMultiplier(24);
                        break;
                      case "LKUSDT":
                        setRewardMultiplier(20);
                        break;
                    }
                    break;
                }
              }}
            >
              TOMATO
            </button>
            <button
              className={`btn btn-outline btn-xs${
                seedKind === "CORN" ? " btn-active" : ""
              }`}
              onClick={() => {
                setSeedKind("CORN");

                switch (plantKind) {
                  case "SEED":
                    setRewardMultiplier(8);
                    break;
                  case "STEM":
                    switch (stemLP) {
                      case "LKKUB":
                        setRewardMultiplier(24);
                        break;
                      case "LKUSDT":
                        setRewardMultiplier(20);
                        break;
                    }
                    break;
                }
              }}
            >
              CORN
            </button>
            <button
              className={`btn btn-outline btn-xs${
                seedKind === "CABBAGE" ? " btn-active" : ""
              }`}
              onClick={() => {
                setSeedKind("CABBAGE");

                switch (plantKind) {
                  case "SEED":
                    setRewardMultiplier(8);
                    break;
                  case "STEM":
                    switch (stemLP) {
                      case "LKKUB":
                        setRewardMultiplier(24);
                        break;
                      case "LKUSDT":
                        setRewardMultiplier(20);
                        break;
                    }
                    break;
                }
              }}
            >
              CABBAGE
            </button>
            <button
              className={`btn btn-outline btn-xs${
                seedKind === "CARROT" ? " btn-active" : ""
              }`}
              onClick={() => {
                setSeedKind("CARROT");

                switch (plantKind) {
                  case "SEED":
                    setRewardMultiplier(15);
                    break;
                  case "STEM":
                    switch (stemLP) {
                      case "LKKUB":
                        setRewardMultiplier(30);
                        break;
                      case "LKUSDT":
                        setRewardMultiplier(25);
                        break;
                    }
                    break;
                }
              }}
            >
              CARROT
            </button>
          </div>

          <div className="btn-group self-center">
            <button
              className={`btn btn-outline btn-xs${
                rewardMultiplier === 8 ? " btn-active" : ""
              }`}
              disabled
            >
              8X
            </button>
            <button
              className={`btn btn-outline btn-xs${
                rewardMultiplier === 15 ? " btn-active" : ""
              }`}
              disabled
            >
              15X
            </button>
            <button
              className={`btn btn-outline btn-xs${
                rewardMultiplier === 20 ? " btn-active" : ""
              }`}
              disabled
            >
              20X
            </button>
            <button
              className={`btn btn-outline btn-xs${
                rewardMultiplier === 24 ? " btn-active" : ""
              }`}
              disabled
            >
              24X
            </button>
            <button
              className={`btn btn-outline btn-xs${
                rewardMultiplier === 25 ? " btn-active" : ""
              }`}
              disabled
            >
              25X
            </button>
            <button
              className={`btn btn-outline btn-xs${
                rewardMultiplier === 30 ? " btn-active" : ""
              }`}
              disabled
            >
              30X
            </button>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                จำนวน {plantKind === "SEED" ? "SEED" : "STEM"} ที่จะปลูก
              </span>
            </label>
            <label className="input-group input-group-sm">
              <input
                className="input input-bordered input-sm w-full"
                type="number"
                placeholder="0.00"
                value={
                  typeof seedOrStemAmount === "number" ? seedOrStemAmount : ""
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSeedOrStemAmount(isNaN(value) || value < 0 ? null : value);
                }}
              />
              <span>{plantKind === "SEED" ? "SEEDS" : "STEMS"}</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Liquidity</span>
              <div
                data-tip="คลิกที่แปลงผักที่จะปลูกในเกม"
                className="label-text-alt tooltip tooltip-left"
              >
                อยู่ตรงไหน?
              </div>
            </label>
            <label className="input-group input-group-sm">
              <input
                className="input input-bordered input-sm w-full"
                type="number"
                placeholder="0.00"
                value={typeof totalLiquidity === "number" ? totalLiquidity : ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setTotalLiquidity(isNaN(value) || value < 0 ? null : value);
                }}
              />
              <span>{plantKind === "SEED" ? "SEEDS" : "$"}</span>
            </label>
          </div>

          <div className="grid grid-cols-2">
            <div className="stat p-2 border-none">
              <div className="stat-title flex items-center space-x-2 text-xs opacity-100">
                <div className="flex items-center justify-center opacity-50">
                  Produce Rate
                </div>
                <div className="ring-[1.5px] ring-neutral self-center w-4 h-4 rounded-full">
                  <Image
                    src={`/icons/crop-${seedKind.toLowerCase()}.png`}
                    alt={`crop-${seedKind.toLocaleLowerCase()}`}
                    width={80}
                    height={80}
                  />
                </div>
              </div>
              <div className="stat-value text-lg">
                {`${
                  plantKind === "STEM" && typeof cropsPerDay === "number"
                    ? "≈ "
                    : ""
                }${cropsPerDay.toLocaleString("th-TH")}`}
              </div>
              <div className="stat-title text-xs">Crops/Day</div>
            </div>

            {plantKind === "SEED" && (
              <div className="stat p-2 border-none">
                <div className="stat-title flex items-center space-x-2 text-xs opacity-100">
                  <div className="flex items-center justify-center opacity-50">
                    48 hours earn
                  </div>
                  <div className="ring-[1.5px] ring-neutral self-center w-4 h-4 rounded-full">
                    <Image
                      src={`/icons/crop-${seedKind.toLowerCase()}.png`}
                      alt={`crop-${seedKind.toLocaleLowerCase()}`}
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
                <div className="stat-value text-lg">
                  {typeof cropsPerDay === "number"
                    ? `≈ ${(cropsPerDay * 2).toLocaleString("th-TH")}`
                    : "-"}
                </div>
                <div className="stat-title text-xs">Crops</div>
              </div>
            )}

            <div className="stat p-2 border-none">
              <div className="stat-title flex items-center space-x-1 text-xs opacity-100">
                <div className="stat-title flex items-center space-x-2 text-xs opacity-100">
                  <div className="flex items-center justify-center opacity-50">
                    Sell to KYLE
                  </div>
                  <div className="ring-[1.5px] ring-neutral self-center w-4 h-4 rounded-full">
                    <Image
                      src="/icons/lumi.png"
                      alt="lumi"
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
              </div>
              <div className="stat-value text-lg">
                {typeof cropsPerDay === "number"
                  ? `≈ ${(
                      cropsPerDay *
                      (plantKind === "STEM" ? 1 : 2) *
                      0.095
                    ).toLocaleString("th-TH")}`
                  : "-"}
              </div>
              <div className="stat-title text-xs">
                {`LUMI${plantKind === "STEM" ? "/Day" : ""}`}
              </div>
            </div>

            <div className="stat p-2 border-none">
              <div className="stat-title text-xs">Estimated</div>
              <div className="stat-value text-lg">
                {typeof cropsPerDay === "number"
                  ? `≈ ${parseFloat(
                      (
                        cropsPerDay *
                        (plantKind === "STEM" ? 1 : 2) *
                        0.095 *
                        (lumiUsdt * thbUsdt)
                      ).toFixed(2)
                    ).toLocaleString("th-TH")}`
                  : "-"}
              </div>
              <div className="stat-title text-xs">
                THB{plantKind === "STEM" ? "/Day" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer bg-neutral text-neutral-content items-center gap-4 p-4">
        <div className="items-center grid-flow-col">
          <p>Copyright © 2022 - All right reserved</p>
        </div>
        <div className="md:place-self-center md:justify-self-end grid-flow-col gap-4">
          <Link href="https://www.facebook.com/artzeeker/">
            <a target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </Link>
          <Link href="https://www.youtube.com/channel/UCyqsJtVoVGO98oHvaI14UXg">
            <a target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
          </Link>
          <Link href="https://twitter.com/artzeeker">
            <a target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const responses = await Promise.all([
    axios.get("https://api.bitkub.com/api/market/ticker?sym=THB_KUB"),
    axios.get("https://api.bitkub.com/api/market/ticker?sym=THB_USDT"),
    axios.get("https://api.coinex.com/v1/market/ticker?market=LUMIUSDT"),
  ]);

  return {
    props: {
      THB_KUB: responses[0].data.THB_KUB.last,
      THB_USDT: responses[1].data.THB_USDT.last,
      LUMI_USDT: responses[2].data.data.ticker.last,
    },
  };
};

export default Home;

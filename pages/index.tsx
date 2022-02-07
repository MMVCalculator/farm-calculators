import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Ticker } from "../interfaces/Ticker";

type Data = {
  THB_KUB: number;
  THB_USDT: number;
};

type PlantKind = "SEED" | "STEM";
type StemLP = "LKKUB" | "LKUSDT";
type SeedKind = "TOMATO" | "CORN" | "CABBAGE" | "CARROT";
type RewardMultiplier = 8 | 15 | 20 | 24 | 25 | 30;

const Home: NextPage<Data> = ({ THB_KUB, THB_USDT }) => {
  const [thbKub, setThbKub] = useState<number>(THB_KUB);
  const [thbUsdt, setThbUsdt] = useState<number>(THB_USDT);

  const [plantKind, setPlantKind] = useState<PlantKind>("SEED");
  const [stemLP, setStemLP] = useState<StemLP>("LKKUB");
  const [seedKind, setSeedKind] = useState<SeedKind>("TOMATO");
  const [rewardMultiplier, setRewardMultiplier] = useState<RewardMultiplier>(8);
  const [seedOrStemAmount, setSeedOrStemAmount] = useState<number | null>(null);
  const [totalLiquidity, setTotalLiquidity] = useState<number | null>(null);
  const [cropsPerDay, setCropsPerDay] = useState<string | "-">("-");

  useEffect(() => {
    document.getElementsByTagName("html")[0].dataset.theme = "light";

    const BASE_API_URL = "wss://api.bitkub.com/websocket-api";

    const ws = new WebSocket(
      `${BASE_API_URL}/market.ticker.thb_kub,market.ticker.thb_usdt`
    );

    ws.onopen = () => {
      ws.onmessage = (ev) => {
        try {
          const { id, last } = JSON.parse(ev.data) as Ticker;

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
  }, []);

  useEffect(() => {
    switch (plantKind) {
      case "SEED":
        const cropsPerDaySeed = parseFloat(
          (
            (17280 * (0.1 * rewardMultiplier) * (seedOrStemAmount || 0)) /
            (totalLiquidity ? totalLiquidity + (seedOrStemAmount || 0) : 0)
          ).toFixed(2)
        );

        setCropsPerDay(
          cropsPerDaySeed <= 0 ||
            cropsPerDaySeed === Infinity ||
            isNaN(cropsPerDaySeed)
            ? "-"
            : cropsPerDaySeed.toLocaleString("th-TH")
        );
        break;

      case "STEM":
        const cropsPerDayStem = parseFloat(
          (
            (17280 * (0.1 * rewardMultiplier) * (seedOrStemAmount || 0)) /
            (totalLiquidity
              ? totalLiquidity / 2.01 + (seedOrStemAmount || 0)
              : 0)
          ).toFixed(2)
        );

        setCropsPerDay(
          cropsPerDayStem <= 0 ||
            cropsPerDayStem === Infinity ||
            isNaN(cropsPerDayStem)
            ? "-"
            : cropsPerDayStem.toLocaleString("th-TH")
        );
        break;
    }
  }, [plantKind, rewardMultiplier, seedOrStemAmount, totalLiquidity]);

  return (
    <div className="bg-slate-100 flex flex-col w-screen h-screen overflow-auto">
      <Head>
        <title>MMV EZ - Home</title>
      </Head>

      <nav className="navbar sticky top-0 flex space-x-2 bg-white shadow-lg">
        <div className="flex-1">
          <span className="text-lg font-bold select-none">MMV EZ</span>
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

      <div className="container self-center flex-1 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex flex-row space-x-2 overflow-hidden bg-white shadow-lg">
            <div className="bg-zinc-700 flex flex-col items-center justify-center p-2">
              <Image src="/icons/KUB.png" alt="KUB" width={32} height={32} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="text-zinc-700 font-bold">{thbKub}</h1>
              <p className="text-2xs text-stone-400 font-medium">THB/KUB</p>
            </div>
          </div>
          <div className="card flex flex-row space-x-2 overflow-hidden bg-white shadow-lg">
            <div className="bg-zinc-700 flex flex-col items-center justify-center p-2">
              <Image src="/icons/USDT.png" alt="USDT" width={32} height={32} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="text-zinc-700 font-bold">{thbUsdt}</h1>
              <p className="text-2xs text-stone-400 font-medium">THB/USDT</p>
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
              <span>{plantKind === "SEED" ? "SEED" : "STEM"}</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Liquidity</span>
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

          <div
            className={`grid${
              plantKind === "SEED" ? " grid-cols-2" : "grid-cols-1"
            }`}
          >
            <div className="stat p-4 border-none">
              <div className="stat-title text-sm">Produce Rate</div>
              <div className="stat-value text-2xl">{cropsPerDay}</div>
              <div className="stat-title text-xs">Crops/Day</div>
            </div>
            {plantKind === "SEED" && (
              <div className="stat p-4 border-none">
                <div className="stat-title text-sm">48 hours earn</div>
                <div className="stat-value text-2xl">
                  {parseFloat(cropsPerDay) * 2 || "-"}
                </div>
                <div className="stat-title text-xs">Crops</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer bg-base-300 text-base-content footer-center p-4">
        <div>
          <p>Copyright © 2022 - All right reserved by Artzeeker</p>
        </div>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Data> = async (context) => {
  const responses = await Promise.all([
    axios.get("https://api.bitkub.com/api/market/ticker?sym=THB_KUB"),
    axios.get("https://api.bitkub.com/api/market/ticker?sym=THB_USDT"),
  ]);

  return {
    props: {
      THB_KUB: responses[0].data.THB_KUB.last,
      THB_USDT: responses[1].data.THB_USDT.last,
    },
  };
};

export default Home;

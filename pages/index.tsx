import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  IBitkubTicker,
  ILatestRates,
  IUsdLumiCurrentPrice,
} from "../interfaces/responses";
import Link from "next/link";
import useSWR from "swr";
import Navbar from "../components/Navbar";

type Props = {
  THB_KUB: number;
  THB_USDT: number;
  latestRates: ILatestRates;
  usdLumi: number;
};

type PlantKind = "SEED" | "STEM";
type StemLP = "LKKUB" | "LKUSDT";
type SeedKind = "TOMATO" | "CORN" | "CABBAGE" | "CARROT";
type RewardMultiplier = 8 | 12 | 20 | 24;

const Home: NextPage<Props> = ({ THB_KUB, THB_USDT, latestRates, usdLumi }) => {
  const [thbKub, setThbKub] = useState<number>(THB_KUB);
  const [thbUsdt, setThbUsdt] = useState<number>(THB_USDT);
  const [thbLumi, setThbLumi] = useState<number>(
    latestRates.rates.THB * usdLumi
  );
  const [thbUsd, setThbUsd] = useState<number>(latestRates.rates.THB);

  const [plantKind, setPlantKind] = useState<PlantKind>("SEED");
  const [stemLP, setStemLP] = useState<StemLP>("LKKUB");
  const [seedKind, setSeedKind] = useState<SeedKind>("TOMATO");
  const [rewardMultiplier, setRewardMultiplier] = useState<RewardMultiplier>(8);
  const [seedOrStemAmount, setSeedOrStemAmount] = useState<number | null>(null);
  const [totalLiquidity, setTotalLiquidity] = useState<number | null>(null);
  const [cropsPerDay, setCropsPerDay] = useState<number | "-">("-");

  useSWR(
    "https://api.loremboard.finance/api/v1/dashboard/fiat/latest",
    async (apiPath) => {
      const latestRatesResponse = await axios.get<ILatestRates>(apiPath);
      setThbUsd(latestRatesResponse.data.rates.THB);
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  useSWR(
    "lumiUsdCurrentPrice",
    async () => {
      const now = Math.floor(Date.now() / 1000);

      const usdLumiCurrentPriceResponse = await axios.get<IUsdLumiCurrentPrice>(
        `https://api.bkc.loremboard.finance/charts/history?symbol=LUMI&resolution=120&from=${
          now - 10000
        }&to=${now}&currencyCode=USD`
      );

      setThbLumi(
        thbUsd *
          usdLumiCurrentPriceResponse.data.c[
            usdLumiCurrentPriceResponse.data.c.length - 1
          ]
      );
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  // useSWR(
  //   "https://api.bkcport.com/v1/token-ranking",
  //   async (apiPath) => {
  //     const tokenRankingResponse = await axios.get<ITokenRanking[]>(apiPath);
  //     setThbLumi(
  //       thbUsd *
  //         (tokenRankingResponse.data.find((token) => token.symbol === "LUMI")
  //           ?.last || 0)
  //     );
  //   },
  //   {
  //     refreshInterval: 10000,
  //     revalidateOnFocus: true,
  //   }
  // );

  useEffect(() => {
    const BASE_API_URL_BITKUB = "wss://api.bitkub.com/websocket-api";

    const wsBitkub = new WebSocket(
      `${BASE_API_URL_BITKUB}/market.ticker.thb_kub,market.ticker.thb_usdt`
    );

    wsBitkub.onopen = () => {
      wsBitkub.onmessage = (ev) => {
        try {
          const { id, last } = JSON.parse(ev.data) as IBitkubTicker;

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
              ((seedOrStemAmount || 0) * thbKub * 0.5445) / thbUsdt; // ! Get rate from SHOP > STEM > SELL
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
            const stemLkUsdtAmountToUsdt = (seedOrStemAmount || 0) * 1.5274; // ! Get rate from SHOP > STEM > SELL
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
    <div className="bg-base-200 flex flex-col w-screen h-screen overflow-auto min-w-[20rem]">
      <Head>
        <title>MMVez</title>
      </Head>

      <Navbar />

      <div className="sm:max-w-screen-sm gap-y-4 container flex flex-col self-center flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card bg-base-100 flex flex-row overflow-hidden shadow-lg">
            <div className="bg-neutral flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/kub.png" alt="kub" width={80} height={80} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="font-bold">{thbKub.toLocaleString("th-TH")}</h1>
              <p className="text-2xs opacity-60">THB/KUB</p>
            </div>
          </div>
          <div className="card bg-base-100 flex flex-row overflow-hidden shadow-lg">
            <div className="bg-neutral flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/usdt.png" alt="usdt" width={80} height={80} />
            </div>
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="font-bold">{thbUsdt.toLocaleString("th-TH")}</h1>
              <p className="text-2xs opacity-60">THB/USDT</p>
            </div>
          </div>
          <div className="card bg-base-100 flex flex-row overflow-hidden shadow-lg">
            <div className="bg-neutral flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/lumi.png" alt="lumi" width={80} height={80} />
            </div>
            <div className="relative flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="font-bold">
                {parseFloat(thbLumi.toFixed(2)).toLocaleString("th-TH")}
              </h1>
              <p className="text-2xs opacity-60">THB/LUMI</p>
            </div>
          </div>
          <div className="card bg-base-100 flex flex-row overflow-hidden shadow-lg">
            <div className="bg-neutral flex flex-col items-center justify-center w-12 h-12 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 -m-1"
                viewBox="0 0 20 20"
                fill="gold"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="relative flex flex-col items-center justify-center flex-1 text-center">
              <h1 className="font-bold">
                {parseFloat(thbUsd.toFixed(2)).toLocaleString("th-TH")}
              </h1>
              <p className="text-2xs opacity-60">THB/USD</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 flex flex-col p-4 space-y-4 overflow-hidden shadow-lg">
          <h1 className="text-lg font-medium text-center">คำนวณผลผลิตต่อวัน</h1>

          <div className="btn-group self-center">
            <input
              className="btn"
              type="radio"
              name="plantKind"
              data-title="SEED"
              readOnly
              checked={plantKind === "SEED"}
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
                    setRewardMultiplier(12);
                    break;
                }
              }}
            />

            <input
              className="btn"
              type="radio"
              name="plantKind"
              data-title="STEM"
              readOnly
              checked={plantKind === "STEM"}
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
                        setRewardMultiplier(24);
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
                        setRewardMultiplier(20);
                        break;
                    }
                    break;
                }
              }}
            />
          </div>

          {plantKind === "STEM" && (
            <div className="btn-group self-center">
              <input
                className="btn btn-sm"
                type="radio"
                name="stemLp"
                data-title="LKKUB"
                readOnly
                checked={stemLP === "LKKUB"}
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
                      setRewardMultiplier(24);
                      break;
                  }
                }}
              />

              <input
                className="btn btn-sm"
                type="radio"
                name="stemLp"
                data-title="LKUSDT"
                readOnly
                checked={stemLP === "LKUSDT"}
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
                      setRewardMultiplier(20);
                      break;
                  }
                }}
              />
            </div>
          )}

          <div className="ring ring-accent self-center w-10 h-10 rounded-full">
            <Image
              src={`/icons/crop-${seedKind.toLocaleLowerCase()}.png`}
              alt={`crop-${seedKind.toLocaleLowerCase()}`}
              width={80}
              height={80}
            />
          </div>

          <div className="btn-group self-center">
            <input
              className="btn btn-xs"
              type="radio"
              name="seed"
              data-title="TOMATO"
              readOnly
              checked={seedKind === "TOMATO"}
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
            />

            <input
              className="btn btn-xs"
              type="radio"
              name="seed"
              data-title="CORN"
              readOnly
              checked={seedKind === "CORN"}
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
            />

            <input
              className="btn btn-xs"
              type="radio"
              name="seed"
              data-title="CABBAGE"
              readOnly
              checked={seedKind === "CABBAGE"}
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
            />

            <input
              className="btn btn-xs"
              type="radio"
              name="seed"
              data-title="CARROT"
              readOnly
              checked={seedKind === "CARROT"}
              onClick={() => {
                setSeedKind("CARROT");
                switch (plantKind) {
                  case "SEED":
                    setRewardMultiplier(12);
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
            />
          </div>

          <div className="btn-group self-center">
            <input
              className="btn btn-xs !btn-accent disabled:!btn-disabled"
              type="radio"
              readOnly
              name="multiplier"
              data-title="8X"
              disabled={rewardMultiplier !== 8}
              checked={rewardMultiplier === 8}
            />

            <input
              className="btn btn-xs !btn-accent disabled:!btn-disabled"
              type="radio"
              readOnly
              name="multiplier"
              data-title="12X"
              disabled={rewardMultiplier !== 12}
              checked={rewardMultiplier === 12}
            />

            <input
              className="btn btn-xs !btn-accent disabled:!btn-disabled"
              type="radio"
              readOnly
              name="multiplier"
              data-title="20X"
              disabled={rewardMultiplier !== 20}
              checked={rewardMultiplier === 20}
            />

            <input
              className="btn btn-xs !btn-accent disabled:!btn-disabled"
              type="radio"
              readOnly
              name="multiplier"
              data-title="24X"
              disabled={rewardMultiplier !== 24}
              checked={rewardMultiplier === 24}
            />
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
                type="text"
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
              <div className="stat-title flex items-center gap-2 text-xs opacity-100">
                <div className="flex items-center justify-center opacity-50">
                  Produce Rate
                </div>
                <div className="ring-[1.5px] ring-accent self-center w-4 h-4 rounded-full">
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
                <div className="stat-title flex items-center gap-2 text-xs opacity-100">
                  <div className="flex items-center justify-center opacity-50">
                    48 hours earn
                  </div>
                  <div className="ring-[1.5px] ring-accent self-center w-4 h-4 rounded-full">
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
              <div className="stat-title flex items-center gap-1 text-xs opacity-100">
                <div className="stat-title flex items-center gap-2 text-xs opacity-100">
                  <div className="flex items-center justify-center opacity-50">
                    Sell to KYLE
                  </div>
                  <div className="ring-[1.5px] ring-accent self-center w-4 h-4 rounded-full">
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
                        thbLumi
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
  const now = Math.floor(Date.now() / 1000);
  const responses = await Promise.all([
    axios.get("https://api.bitkub.com/api/market/ticker?sym=THB_KUB"),
    axios.get("https://api.bitkub.com/api/market/ticker?sym=THB_USDT"),
    axios.get<ILatestRates>(
      "https://api.loremboard.finance/api/v1/dashboard/fiat/latest"
    ),
    axios.get<IUsdLumiCurrentPrice>(
      `https://api.bkc.loremboard.finance/charts/history?symbol=LUMI&resolution=120&from=${
        now - 10000
      }&to=${now}&currencyCode=USD`
    ),
  ]);
  return {
    props: {
      THB_KUB: responses[0].data.THB_KUB.last,

      THB_USDT: responses[1].data.THB_USDT.last,
      latestRates: responses[2].data,
      usdLumi: responses[3].data.c[responses[3].data.c.length - 1],
    },
  };
};
export default Home;

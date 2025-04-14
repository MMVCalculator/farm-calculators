import type { NextPage } from "next";
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
import { CSSTransition } from "react-transition-group";

type PlantKind = "SEED" | "STEM" | "LUMI";
type StemLP = "LKKUB" | "LKUSDT";
type SeedKind =
  | "TOMATO"
  | "CORN"
  | "CABBAGE"
  | "CARROT"
  | "COFFEE"
  | "BLUEBERRY"
  | "FISH FOOD"
  | "CHICKEN FOOD"
  | "GRASSHOPPER"
  | "VENGEANCE SPIRIT";
type RewardMultiplier = 1 | 2 | 3 | 4 | 6 | 8 | 14 | 18;

const Home: NextPage = () => {
  const [thbKub, setThbKub] = useState<number | null>(null);
  const [thbUsdt, setThbUsdt] = useState<number | null>(null);
  const [thbLumi, setThbLumi] = useState<number | null>(null);
  const [thbUsd, setThbUsd] = useState<number | null>(null);

  const [plantKind, setPlantKind] = useState<PlantKind>("SEED");
  const [stemLP, setStemLP] = useState<StemLP>("LKKUB");
  const [stemLkusdtCompose, setStemLkusdtCompose] = useState<{
    lumi: number;
    kusdt: number;
  }>();
  const [stemLkusdtPrice, setStemLkusdtPrice] = useState<number>();
  const [stemLkkubCompose, setStemLkkubCompose] = useState<{
    lumi: number;
    kkub: number;
  }>();
  const [stemLkkubPrice, setStemLkkubPrice] = useState<number>();
  const [seedKind, setSeedKind] = useState<SeedKind>("TOMATO");
  const [rewardMultiplier, setRewardMultiplier] = useState<RewardMultiplier>(1);
  const [plantAmount, setPlantAmount] = useState<number | null>(null);
  const [totalLiquidity, setTotalLiquidity] = useState<number | null>(null);
  const [totalLiquidities, setTotalLiquidities] = useState<
    {
      name: string;
      totalLiquidity: number;
    }[]
  >([]);
  const [yieldPerDay, setYieldPerDay] = useState<number | "-">("-");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>("");

  const initialRates = async () => {
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

    setThbKub(responses[0].data.THB_KUB.last);
    setThbUsdt(responses[1].data.THB_USDT.last);
    setThbUsd(responses[2].data.rates.THB);
    setThbLumi(
      responses[3].data.c[responses[3].data.c.length - 1] *
        responses[2].data.rates.THB
    );
  };

  useEffect(() => {
    initialRates();
  }, []);

  useSWR(
    "stemLkusdtPrice",
    async () => {
      const response = await axios.post<{
        error: { code: number; message: string };
        result: string;
      }>("https://bitkub-chain-rpc.morningmoonvillage.com", {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "eth_call",
        params: [
          {
            data: "0x252dba420000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006e9e62018a013b20bcb7c573690fd1425ddd6b26000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a4d06ca61f00000000000000000000000000000000000000000000000011b18a8faacd4b4f0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000095013dcb6a561e6c003aed9c43fb8b64008aa3610000000000000000000000007d984c24d2499d840eb3b7016077164e15e5faa600000000000000000000000000000000000000000000000000000000",
            to: "0xb2dd98bd8a916a9fef1ce0e35302a53ae23fd260",
          },
          "latest",
        ],
      });

      const lumi =
        parseInt(
          (
            response.data.result.replace("0x", "").match(/.{64}/g) as string[]
          )[7],
          16
        ) / Math.pow(10, 18);

      const kusdt =
        parseInt(
          (
            response.data.result.replace("0x", "").match(/.{64}/g) as string[]
          )[8],
          16
        ) / Math.pow(10, 18);

      setStemLkusdtCompose({ lumi, kusdt });
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  useSWR(
    "stemLkkubPrice",
    async () => {
      const response = await axios.post<{
        error: { code: number; message: string };
        result: string;
      }>("https://bitkub-chain-rpc.morningmoonvillage.com", {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "eth_call",
        params: [
          {
            data: "0x252dba420000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000006e9e62018a013b20bcb7c573690fd1425ddd6b26000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a4d06ca61f00000000000000000000000000000000000000000000000032a3b4df72f80e5400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000095013dcb6a561e6c003aed9c43fb8b64008aa36100000000000000000000000067ebd850304c70d983b2d1b93ea79c7cd6c3f6b500000000000000000000000000000000000000000000000000000000",
            to: "0xb2dd98bd8a916a9fef1ce0e35302a53ae23fd260",
          },
          "latest",
        ],
      });

      const lumi =
        parseInt(
          (
            response.data.result.replace("0x", "").match(/.{64}/g) as string[]
          )[7],
          16
        ) / Math.pow(10, 18);

      const kkub =
        parseInt(
          (
            response.data.result.replace("0x", "").match(/.{64}/g) as string[]
          )[8],
          16
        ) / Math.pow(10, 18);

      setStemLkkubCompose({ lumi, kkub });
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

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
        (thbUsd || 0) *
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

  useSWR(
    "totalLiquidities",
    async () => {
      const tokens = [
        {
          name: "seedFarmTomato",
          address: "ec85f017ea248c169c5ae32a782e380e0db3b10d",
        },
        {
          name: "seedFarmCorn",
          address: "eef084a9e4efb5436ed7115f271dd1f47789b81b",
        },
        {
          name: "seedFarmCabage",
          address: "e0c8e0d1e281deb31a305369b5527f45898e2fd8",
        },
        {
          name: "seedFarmCarrot",
          address: "b92cd3ab59d8fbb1156f07f9bc0deacc9bc4954d",
        },
        {
          name: "lumiCowMilkFarm",
          address: "d8356f78379afca40d2a966beb95e9c27ebc2915",
        },
        {
          name: "seedFarmCoffee",
          address: "91e6512a01ddfbe0027f191832cd9cc877d84f15",
        },
        {
          name: "seedFarmBlueberry",
          address: "018391166b47632b95fd50b3c37e8b25cc61ea29",
        },
        {
          name: "seedFarmFISH FOOD",
          address: "2ca957c560151148aa4ab677f4171e265e76806e",
        },
        {
          name: "seedFarmCHICKEN FOOD",
          address: "fb0d3b5Fa8C211B88Be2bb4F51399bfBAA28dd7c",
        },
        {
          name: "seedFarmGRASSHOPPER",
          address: "3aFe6bA743E39d220E6f8Be326E90768D9693BED",
        },
        {
          name: "seedFarmVENGEANCE SPIRIT",
          address: "f28BD01f921F8415Ca94812724D8562A21ACB96F",
        },
      ];

      const totalLiquiditiesResponse = await Promise.all(
        tokens.map((token) => {
          return axios.post<{
            error: { code: number; message: string };
            result: string;
          }>("https://bitkub-chain-rpc.morningmoonvillage.com", {
            jsonrpc: "2.0",
            id: Date.now(),
            method: "eth_call",
            params: [
              {
                data:
                  token.name === "lumiCowMilkFarm"
                    ? "0x252dba42000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000449df8d3300000000000000000000000000000000000000000000000000000000000000000000000000000000d8356f78379afca40d2a966beb95e9c27ebc2915000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000241959a00200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000095013dcb6a561e6c003aed9c43fb8b64008aa3610000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002470a08231000000000000000000000000d8356f78379afca40d2a966beb95e9c27ebc291500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000024f40f0f52000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
                    : `0x252dba420000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000003800000000000000000000000000000000000000000000000000000000000000420000000000000000000000000${token.address}0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000449df8d3300000000000000000000000000000000000000000000000000000000000000000000000000000000${token.address}00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000004921979af000000000000000000000000000000000000000000000000000000000000000000000000000000006e9e62018a013b20bcb7c573690fd1425ddd6b26000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a4d06ca61f0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000200000000000000000000000095013dcb6a561e6c003aed9c43fb8b64008aa3610000000000000000000000007d984c24d2499d840eb3b7016077164e15e5faa600000000000000000000000000000000000000000000000000000000000000000000000000000000${token.address}000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000241959a002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000${token.address}00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000024f40f0f52000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ec85f017ea248c169c5ae32a782e380e0db3b10d000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000042705e86500000000000000000000000000000000000000000000000000000000`,
                to: "0xb2dd98bd8a916a9fef1ce0e35302a53ae23fd260",
              },
              "latest",
            ],
          });
        })
      );

      const totalLiquidities = totalLiquiditiesResponse.map(
        (totalLiquidityResponse, index) => {
          return {
            name: tokens[index].name,
            totalLiquidity:
              parseInt(
                (
                  totalLiquidityResponse.data.result
                    .replace("0x", "")
                    .match(/.{64}/g) as string[]
                )[12],
                16
              ) / Math.pow(10, 18),
          };
        }
      );

      setTotalLiquidities([...totalLiquidities]);
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    const wsBitkubConnection = () => {
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

      wsBitkub.onclose = () => wsBitkubConnection();
    };

    wsBitkubConnection();
  }, []);

  useEffect(() => {
    if (
      stemLkusdtCompose?.kusdt &&
      stemLkusdtCompose?.lumi &&
      thbLumi &&
      thbUsdt
    ) {
      setStemLkusdtPrice(
        (stemLkusdtCompose.lumi * thbLumi + stemLkusdtCompose.kusdt * thbUsdt) /
          thbUsdt
      );
    }

    if (stemLkkubCompose?.lumi && thbLumi && stemLkkubCompose?.kkub && thbKub) {
      setStemLkkubPrice(
        (stemLkkubCompose.lumi * thbLumi + stemLkkubCompose.kkub * thbKub) /
          thbKub
      );
    }
  }, [
    stemLkkubCompose?.kkub,
    stemLkkubCompose?.lumi,
    stemLkusdtCompose?.kusdt,
    stemLkusdtCompose?.lumi,
    thbKub,
    thbLumi,
    thbUsdt,
  ]);

  useEffect(() => {
    switch (plantKind) {
      case "SEED":
        const rewardsSeedPercentage =
          (plantAmount || 0) /
          ((typeof totalLiquidity === "number" && totalLiquidity >= 0
            ? totalLiquidity
            : seedKind === "TOMATO"
            ? totalLiquidities[0]?.totalLiquidity
            : seedKind === "CORN"
            ? totalLiquidities[1]?.totalLiquidity
            : seedKind === "CABBAGE"
            ? totalLiquidities[2]?.totalLiquidity
            : seedKind === "CARROT"
            ? totalLiquidities[3]?.totalLiquidity
            : seedKind === "COFFEE"
            ? totalLiquidities[5]?.totalLiquidity
            : seedKind === "BLUEBERRY"
            ? totalLiquidities[6]?.totalLiquidity
            : seedKind === "FISH FOOD"
            ? totalLiquidities[7]?.totalLiquidity
            : seedKind === "CHICKEN FOOD"
            ? totalLiquidities[8]?.totalLiquidity
            : seedKind === "GRASSHOPPER"
            ? totalLiquidities[9]?.totalLiquidity
            : seedKind === "VENGEANCE SPIRIT"
            ? totalLiquidities[10]?.totalLiquidity
            : Infinity) +
            (plantAmount || 0));

        const yieldPerDaySeed = parseFloat(
          (
            (seedKind === "TOMATO" ||
            seedKind === "CORN" ||
            seedKind === "CABBAGE" ||
            seedKind === "CARROT"
              ? 17280 // 96 ชั่วโมง (4 วัน)
              : seedKind === "COFFEE" ||
                seedKind === "FISH FOOD" ||
                seedKind === "BLUEBERRY" ||
                seedKind === "CHICKEN FOOD" ||
                seedKind === "GRASSHOPPER" ||
                seedKind === "VENGEANCE SPIRIT"
              ? 17280 // 48 ชั่วโมง (2 วัน)
              : 17280) * // 24 ชั่วโมง (1 วัน)
            0.1 *
            rewardMultiplier *
            rewardsSeedPercentage
          ).toFixed(2)
        );

        setYieldPerDay(
          yieldPerDaySeed <= 0 ||
            yieldPerDaySeed === Infinity ||
            isNaN(yieldPerDaySeed)
            ? "-"
            : yieldPerDaySeed
        );
        break;

      case "STEM":
        switch (stemLP) {
          case "LKKUB":
            const stemLkKubAmountToUsd =
              ((plantAmount || 0) * (stemLkkubPrice || 0) * (thbKub || 0)) /
              (thbUsd || 0);
            const rewardsLkkubPercentage =
              stemLkKubAmountToUsd /
              ((typeof totalLiquidity === "number" && totalLiquidity >= 0
                ? totalLiquidity
                : Infinity) +
                stemLkKubAmountToUsd);

            const yieldPerDayStemLkKub = parseFloat(
              (
                (seedKind === "TOMATO" ||
                seedKind === "CORN" ||
                seedKind === "CABBAGE" ||
                seedKind === "CARROT"
                  ? 17280 // 96 ชั่วโมง (4 วัน)
                  : seedKind === "COFFEE" ||
                    seedKind === "FISH FOOD" ||
                    seedKind === "BLUEBERRY" ||
                    seedKind === "CHICKEN FOOD" ||
                    seedKind === "GRASSHOPPER" ||
                    seedKind === "VENGEANCE SPIRIT"
                  ? 17280 // 48 ชั่วโมง (2 วัน)
                  : 17280) * // 24 ชั่วโมง (1 วัน)
                0.1 *
                rewardMultiplier *
                rewardsLkkubPercentage
              ).toFixed(2)
            );

            setYieldPerDay(
              yieldPerDayStemLkKub <= 0 ||
                yieldPerDayStemLkKub === Infinity ||
                isNaN(yieldPerDayStemLkKub)
                ? "-"
                : yieldPerDayStemLkKub
            );
            break;

          case "LKUSDT":
            const stemLkUsdtAmountToUsd =
              ((plantAmount || 0) * (stemLkusdtPrice || 0) * (thbUsdt || 0)) /
              (thbUsd || 0);
            const rewardsLkUsdtPercentage =
              stemLkUsdtAmountToUsd /
              ((typeof totalLiquidity === "number" && totalLiquidity >= 0
                ? totalLiquidity
                : Infinity) +
                stemLkUsdtAmountToUsd);

            const yieldPerDayStemLkUsdt = parseFloat(
              (
                (seedKind === "TOMATO" ||
                seedKind === "CORN" ||
                seedKind === "CABBAGE" ||
                seedKind === "CARROT"
                  ? 17280 // 96 ชั่วโมง (4 วัน)
                  : seedKind === "COFFEE" ||
                    seedKind === "FISH FOOD" ||
                    seedKind === "BLUEBERRY" ||
                    seedKind === "CHICKEN FOOD" ||
                    seedKind === "GRASSHOPPER" ||
                    seedKind === "VENGEANCE SPIRIT"
                  ? 17280 // 48 ชั่วโมง (2 วัน)
                  : 17280) * // 24 ชั่วโมง (1 วัน)
                0.1 *
                rewardMultiplier *
                rewardsLkUsdtPercentage
              ).toFixed(2)
            );

            setYieldPerDay(
              yieldPerDayStemLkUsdt <= 0 ||
                yieldPerDayStemLkUsdt === Infinity ||
                isNaN(yieldPerDayStemLkUsdt)
                ? "-"
                : yieldPerDayStemLkUsdt
            );
            break;
        }

        break;

      case "LUMI":
        const rewardsLumiPercentage =
          (plantAmount || 0) /
          ((typeof totalLiquidity === "number" && totalLiquidity >= 0
            ? totalLiquidity
            : totalLiquidities[4]?.totalLiquidity) +
            (plantAmount || 0));

        const yieldPerDayLumi = parseFloat(
          (17280 * 0.1 * rewardMultiplier * rewardsLumiPercentage) // LUMI ใช้ 48 ชั่วโมง
            .toFixed(2)
        );

        setYieldPerDay(
          yieldPerDayLumi <= 0 ||
            yieldPerDayLumi === Infinity ||
            isNaN(yieldPerDayLumi)
            ? "-"
            : yieldPerDayLumi
        );
        break;
    }
  }, [
    plantKind,
    rewardMultiplier,
    seedKind,
    plantAmount,
    stemLP,
    stemLkkubPrice,
    stemLkusdtPrice,
    thbKub,
    thbUsd,
    thbUsdt,
    totalLiquidities,
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
            <div className="relative flex flex-col items-center justify-center flex-1 text-center">
              <CSSTransition
                in={!thbKub}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <Image
                  className="absolute"
                  src="/images/chicken_loading.gif"
                  alt="chicken_loading"
                  width={36}
                  height={36}
                />
              </CSSTransition>
              <CSSTransition
                in={!!thbKub}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <div className="absolute flex flex-col">
                  <h1 className="font-bold">
                    {(thbKub || 0).toLocaleString("th-TH")}
                  </h1>
                  <p className="text-2xs opacity-60">THB/KUB</p>
                </div>
              </CSSTransition>
            </div>
          </div>
          <div className="card bg-base-100 flex flex-row overflow-hidden shadow-lg">
            <div className="bg-neutral flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/usdt.png" alt="usdt" width={80} height={80} />
            </div>
            <div className="relative flex flex-col items-center justify-center flex-1 text-center">
              <CSSTransition
                in={!thbUsdt}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <Image
                  className="absolute"
                  src="/images/chicken_loading.gif"
                  alt="chicken_loading"
                  width={36}
                  height={36}
                />
              </CSSTransition>
              <CSSTransition
                in={!!thbUsdt}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <div className="absolute flex flex-col">
                  <h1 className="font-bold">
                    {(thbUsdt || 0).toLocaleString("th-TH")}
                  </h1>
                  <p className="text-2xs opacity-60">THB/USDT</p>
                </div>
              </CSSTransition>
            </div>
          </div>
          <div className="card bg-base-100 flex flex-row overflow-hidden shadow-lg">
            <div className="bg-neutral flex flex-col items-center justify-center w-12 h-12 p-2">
              <Image src="/icons/lumi.png" alt="lumi" width={80} height={80} />
            </div>
            <div className="relative flex flex-col items-center justify-center flex-1 text-center">
              <CSSTransition
                in={!thbLumi}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <Image
                  className="absolute"
                  src="/images/chicken_loading.gif"
                  alt="chicken_loading"
                  width={36}
                  height={36}
                />
              </CSSTransition>
              <CSSTransition
                in={!!thbLumi}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <div className="absolute flex flex-col">
                  <h1 className="font-bold">
                    {parseFloat((thbLumi || 0).toFixed(2)).toLocaleString(
                      "th-TH"
                    )}
                  </h1>
                  <p className="text-2xs opacity-60">THB/LUMI</p>
                </div>
              </CSSTransition>
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
              <CSSTransition
                in={!thbUsd}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <Image
                  className="absolute"
                  src="/images/chicken_loading.gif"
                  alt="chicken_loading"
                  width={36}
                  height={36}
                />
              </CSSTransition>
              <CSSTransition
                in={!!thbUsd}
                timeout={150}
                classNames="pop"
                unmountOnExit
              >
                <div className="absolute flex flex-col">
                  <h1 className="font-bold">
                    {parseFloat((thbUsd || 0).toFixed(2)).toLocaleString(
                      "th-TH"
                    )}
                  </h1>
                  <p className="text-2xs opacity-60">THB/USD</p>
                </div>
              </CSSTransition>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 flex flex-col p-4 space-y-4 overflow-hidden shadow-lg">
          <h1 className="text-lg font-medium text-center">คำนวณผลผลิตต่อวัน</h1>

          <div className="btn-group flex flex-wrap self-center justify-center">
            <button
              className={`btn${plantKind === "SEED" ? " btn-active" : ""}`}
              onClick={() => {
                setPlantKind("SEED");
                switch (seedKind) {
                  case "TOMATO":
                    setRewardMultiplier(1);
                    break;
                  case "CORN":
                    setRewardMultiplier(1);
                    break;
                  case "CABBAGE":
                    setRewardMultiplier(1);
                    break;
                  case "CARROT":
                    setRewardMultiplier(6);
                    break;
                  case "COFFEE":
                    setRewardMultiplier(2);
                    break;
                  case "BLUEBERRY":
                    setRewardMultiplier(2);
                    break;
                  case "FISH FOOD":
                    setRewardMultiplier(8);
                    break;
                  case "CHICKEN FOOD":
                    setRewardMultiplier(2);
                    break;
                  case "GRASSHOPPER":
                    setRewardMultiplier(1);
                    break;
                  case "VENGEANCE SPIRIT":
                    setRewardMultiplier(3);
                    break;
                }
              }}
            >
              SEED
            </button>

            <div className="flex items-center self-center">
              <button
                className={`rounded-none btn${
                  plantKind === "STEM" ? " btn-active" : ""
                }`}
                disabled
                onClick={() => {
                  setPlantKind("STEM");
                  switch (stemLP) {
                    case "LKKUB":
                      switch (seedKind) {
                        case "TOMATO":
                          setRewardMultiplier(18);
                          break;
                        case "CORN":
                          setRewardMultiplier(18);
                          break;
                        case "CABBAGE":
                          setRewardMultiplier(18);
                          break;
                        case "CARROT":
                          setRewardMultiplier(18);
                          break;
                      }
                      break;
                    case "LKUSDT":
                      switch (seedKind) {
                        case "TOMATO":
                          setRewardMultiplier(14);
                          break;
                        case "CORN":
                          setRewardMultiplier(14);
                          break;
                        case "CABBAGE":
                          setRewardMultiplier(14);
                          break;
                        case "CARROT":
                          setRewardMultiplier(14);
                          break;
                      }
                      break;
                  }
                }}
              >
                STEM
              </button>
              <button
                className="btn btn-circle btn-ghost btn-xs text-info ml-1"
                onClick={() => {
                  setModalContent(
                    "ปิดการใช้งานการคำนวณ STEM ไว้ชั่วคราว เนื่องจากมีการคำนวณที่คาดเคลื่อนสูงเกินไป"
                  );
                  setShowModal(true);
                }}
              >
                ⓘ
              </button>
            </div>

            <button
              className={`btn${plantKind === "LUMI" ? " btn-active" : ""}`}
              onClick={() => {
                setPlantKind("LUMI");
                setRewardMultiplier(8);
              }}
            >
              LUMI
            </button>
          </div>

          {plantKind === "STEM" && (
            <div className="btn-group flex flex-wrap self-center justify-center">
              <button
                className={`btn btn-sm${
                  stemLP === "LKKUB" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setStemLP("LKKUB");
                  switch (seedKind) {
                    case "TOMATO":
                      setRewardMultiplier(18);
                      break;
                    case "CORN":
                      setRewardMultiplier(18);
                      break;
                    case "CABBAGE":
                      setRewardMultiplier(18);
                      break;
                    case "CARROT":
                      setRewardMultiplier(18);
                      break;
                  }
                }}
              >
                LKKUB
              </button>

              <button
                className={`btn btn-sm${
                  stemLP === "LKUSDT" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setStemLP("LKUSDT");
                  switch (seedKind) {
                    case "TOMATO":
                      setRewardMultiplier(14);
                      break;
                    case "CORN":
                      setRewardMultiplier(14);
                      break;
                    case "CABBAGE":
                      setRewardMultiplier(14);
                      break;
                    case "CARROT":
                      setRewardMultiplier(14);
                      break;
                  }
                }}
              >
                LKUSDT
              </button>
            </div>
          )}

          <div className="ring ring-accent self-center w-10 h-10 rounded-full">
            <Image
              src={
                plantKind === "LUMI"
                  ? "/icons/lumi.png"
                  : `/icons/seed_${seedKind.toLocaleLowerCase()}.png`
              }
              alt="plant_kind"
              width={80}
              height={80}
            />
          </div>

          {plantKind !== "LUMI" && (
            <div className="btn-group flex flex-wrap self-center justify-center">
              <button
                className={`btn btn-xs tomato-btn${
                  seedKind === "TOMATO" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("TOMATO");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(1);
                      break;
                    case "STEM":
                      switch (stemLP) {
                        case "LKKUB":
                          setRewardMultiplier(18);
                          break;
                        case "LKUSDT":
                          setRewardMultiplier(14);
                          break;
                      }
                      break;
                  }
                }}
              >
                TOMATO
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "CORN" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("CORN");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(1);
                      break;
                    case "STEM":
                      switch (stemLP) {
                        case "LKKUB":
                          setRewardMultiplier(18);
                          break;
                        case "LKUSDT":
                          setRewardMultiplier(14);
                          break;
                      }
                      break;
                  }
                }}
              >
                CORN
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "CABBAGE" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("CABBAGE");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(1);
                      break;
                    case "STEM":
                      switch (stemLP) {
                        case "LKKUB":
                          setRewardMultiplier(18);
                          break;
                        case "LKUSDT":
                          setRewardMultiplier(14);
                          break;
                      }
                      break;
                  }
                }}
              >
                CABBAGE
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "CARROT" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("CARROT");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(6);
                      break;
                    case "STEM":
                      switch (stemLP) {
                        case "LKKUB":
                          setRewardMultiplier(18);
                          break;
                        case "LKUSDT":
                          setRewardMultiplier(14);
                          break;
                      }
                      break;
                  }
                }}
              >
                CARROT
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "COFFEE" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("COFFEE");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(2);
                      break;
                  }
                }}
              >
                COFFEE
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "BLUEBERRY" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("BLUEBERRY");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(2);
                      break;
                  }
                }}
              >
                BLUEBERRY
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "FISH FOOD" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("FISH FOOD");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(8);
                      break;
                  }
                }}
              >
                FISH FOOD
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "CHICKEN FOOD" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("CHICKEN FOOD");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(2);
                      break;
                  }
                }}
              >
                CHICKEN FOOD
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "GRASSHOPPER" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("GRASSHOPPER");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(1);
                      break;
                  }
                }}
              >
                GRASSHOPPER
              </button>

              <button
                className={`btn btn-xs${
                  seedKind === "VENGEANCE SPIRIT" ? " btn-active" : ""
                }`}
                onClick={() => {
                  setSeedKind("VENGEANCE SPIRIT");
                  switch (plantKind) {
                    case "SEED":
                      setRewardMultiplier(3);
                      break;
                  }
                }}
              >
                VENGEANCE SPIRIT
              </button>
            </div>
          )}

          <div className="btn-group flex flex-wrap self-center justify-center">
            <button
              className={`btn btn-xs${
                rewardMultiplier === 1 ? " !btn-accent" : ""
              }`}
              disabled
            >
              1X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 2 ? " !btn-accent" : ""
              }`}
              disabled
            >
              2X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 3 ? " !btn-accent" : ""
              }`}
              disabled
            >
              3X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 4 ? " !btn-accent" : ""
              }`}
              disabled
            >
              4X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 6 ? " !btn-accent" : ""
              }`}
              disabled
            >
              6X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 8 ? " !btn-accent" : ""
              }`}
              disabled
            >
              8X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 14 ? " !btn-accent" : ""
              }`}
              disabled
            >
              14X
            </button>

            <button
              className={`btn btn-xs${
                rewardMultiplier === 18 ? " !btn-accent" : ""
              }`}
              disabled
            >
              18X
            </button>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                จำนวน {plantKind} ที่จะ
                {plantKind === "LUMI" ? " stake" : "ปลูก"}
              </span>
            </label>
            <label className="input-group input-group-sm">
              <input
                className="input input-bordered input-sm w-full"
                type="number"
                placeholder="0.00"
                value={typeof plantAmount === "number" ? plantAmount : ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setPlantAmount(isNaN(value) || value < 0 ? null : value);
                }}
              />
              <span>{plantKind}</span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Total Liquidity</span>
              <button
                className="label-text-alt btn btn-circle btn-ghost btn-xs text-info"
                onClick={() => {
                  setModalContent("คลิกที่แปลงผักที่จะปลูกในเกม");
                  setShowModal(true);
                }}
              >
                ⓘ
              </button>
            </label>
            <label className="input-group input-group-sm">
              <input
                className="input input-bordered input-sm w-full"
                type="number"
                placeholder={
                  plantKind === "SEED"
                    ? seedKind === "TOMATO"
                      ? (totalLiquidities[0] &&
                          parseFloat(
                            totalLiquidities[0].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "CORN"
                      ? (totalLiquidities[1] &&
                          parseFloat(
                            totalLiquidities[1].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "CABBAGE"
                      ? (totalLiquidities[2] &&
                          parseFloat(
                            totalLiquidities[2].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "CARROT"
                      ? (totalLiquidities[3] &&
                          parseFloat(
                            totalLiquidities[3].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "COFFEE"
                      ? (totalLiquidities[5] &&
                          parseFloat(
                            totalLiquidities[5].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "BLUEBERRY"
                      ? (totalLiquidities[6] &&
                          parseFloat(
                            totalLiquidities[6].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "FISH FOOD"
                      ? (totalLiquidities[7] &&
                          parseFloat(
                            totalLiquidities[7].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "CHICKEN FOOD"
                      ? (totalLiquidities[8] &&
                          parseFloat(
                            totalLiquidities[8].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "GRASSHOPPER"
                      ? (totalLiquidities[9] &&
                          parseFloat(
                            totalLiquidities[9].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : seedKind === "VENGEANCE SPIRIT"
                      ? (totalLiquidities[10] &&
                          parseFloat(
                            totalLiquidities[10].totalLiquidity.toFixed(2)
                          ).toLocaleString("th-TH")) ||
                        "-"
                      : "-"
                    : plantKind === "LUMI"
                    ? (totalLiquidities[4] &&
                        parseFloat(
                          totalLiquidities[4].totalLiquidity.toFixed(2)
                        ).toLocaleString("th-TH")) ||
                      "-"
                    : "-"
                }
                value={typeof totalLiquidity === "number" ? totalLiquidity : ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setTotalLiquidity(isNaN(value) || value < 0 ? null : value);
                }}
              />
              <span>
                {plantKind === "SEED"
                  ? "SEEDS"
                  : plantKind === "STEM"
                  ? "$"
                  : plantKind === "LUMI"
                  ? "LUMI"
                  : ""}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2">
            <div className="stat p-2 border-none">
              <div className="stat-title flex items-center gap-2 text-xs opacity-100">
                <div className="flex items-center justify-center opacity-50">
                  Produce Rate (ต่อวัน)
                </div>
                <div className="ring-[1.5px] ring-accent self-center w-4 h-4 rounded-full">
                  <Image
                    src={
                      plantKind === "LUMI"
                        ? "/icons/cowmilk.png"
                        : `/icons/crop_${seedKind.toLowerCase()}.png`
                    }
                    alt={"plant_kind"}
                    width={80}
                    height={80}
                  />
                </div>
              </div>
              <div className="stat-value text-lg">
                {`${
                  plantKind === "STEM" && typeof yieldPerDay === "number"
                    ? "≈ "
                    : ""
                }${yieldPerDay.toLocaleString("th-TH")}`}
              </div>
              <div className="stat-title flex items-start text-xs">
                <div className="relative flex items-center w-full h-8 pb-4">
                  <span className="whitespace-nowrap">
                    {plantKind === "LUMI" ? "Milk" : "Crops"}/Day
                  </span>
                  <button
                    className="btn btn-circle btn-ghost btn-xs text-info ml-1"
                    onClick={() => {
                      setModalContent(
                        plantKind === "LUMI"
                          ? "48 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (คำนวณเป็นต่อวัน)"
                          : seedKind === "TOMATO" ||
                            seedKind === "CORN" ||
                            seedKind === "CABBAGE" ||
                            seedKind === "CARROT"
                          ? "96 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (คำนวณเป็นต่อวัน)"
                          : seedKind === "COFFEE" ||
                            seedKind === "FISH FOOD" ||
                            seedKind === "BLUEBERRY" ||
                            seedKind === "CHICKEN FOOD" ||
                            seedKind === "GRASSHOPPER" ||
                            seedKind === "VENGEANCE SPIRIT"
                          ? "48 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (คำนวณเป็นต่อวัน)"
                          : "24 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (คำนวณเป็นต่อวัน)"
                      );
                      setShowModal(true);
                    }}
                  >
                    ⓘ
                  </button>
                </div>
              </div>
            </div>

            {plantKind === "SEED" && (
              <div className="stat p-2 border-none">
                <div className="stat-title flex items-center gap-2 text-xs opacity-100">
                  <div className="flex items-center justify-center opacity-50">
                    earn
                  </div>
                  <div className="ring-[1.5px] ring-accent self-center w-4 h-4 rounded-full">
                    <Image
                      src={`/icons/crop_${seedKind.toLowerCase()}.png`}
                      alt="plant_kind"
                      width={80}
                      height={80}
                    />
                  </div>
                </div>
                <div className="stat-value text-lg">
                  {typeof yieldPerDay === "number"
                    ? `≈ ${(
                        yieldPerDay *
                        (seedKind === "TOMATO" ||
                        seedKind === "CORN" ||
                        seedKind === "CABBAGE" ||
                        seedKind === "CARROT"
                          ? 4 // 4 วัน
                          : 2)
                      ) // 2 วัน
                        .toLocaleString("th-TH")}`
                    : "-"}
                </div>
                <div className="stat-title flex items-start text-xs">
                  <div className="relative flex items-center w-full h-8 pb-4">
                    <span className="whitespace-nowrap">Crops/Harvest</span>
                    <button
                      className="btn btn-circle btn-ghost btn-xs text-info ml-1"
                      onClick={() => {
                        setModalContent(
                          seedKind === "TOMATO" ||
                            seedKind === "CORN" ||
                            seedKind === "CABBAGE" ||
                            seedKind === "CARROT"
                            ? "96 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (ผลผลิตเมื่อครบเวลา)"
                            : seedKind === "COFFEE" ||
                              seedKind === "FISH FOOD" ||
                              seedKind === "BLUEBERRY" ||
                              seedKind === "CHICKEN FOOD" ||
                              seedKind === "GRASSHOPPER" ||
                              seedKind === "VENGEANCE SPIRIT"
                            ? "48 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (ผลผลิตเมื่อครบเวลา)"
                            : "24 ชั่วโมงต่อการเก็บเกี่ยว 1 ครั้ง (ผลผลิตเมื่อครบเวลา)"
                        );
                        setShowModal(true);
                      }}
                    >
                      ⓘ
                    </button>
                  </div>
                </div>
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
                {typeof yieldPerDay === "number"
                  ? `≈ ${(
                      yieldPerDay *
                      (plantKind === "STEM"
                        ? 1
                        : seedKind === "TOMATO" ||
                          seedKind === "CORN" ||
                          seedKind === "CABBAGE" ||
                          seedKind === "CARROT"
                        ? 4 // 4 วัน
                        : 2) * // 2 วัน
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
                {typeof yieldPerDay === "number"
                  ? `≈ ${parseFloat(
                      (
                        yieldPerDay *
                        (plantKind === "STEM"
                          ? 1
                          : seedKind === "TOMATO" ||
                            seedKind === "CORN" ||
                            seedKind === "CABBAGE" ||
                            seedKind === "CARROT"
                          ? 4 // 4 วัน
                          : 2) * // 2 วัน
                        0.095 *
                        (thbLumi || 0)
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
          <p>Copyright © 2025 - All right reserved</p>
        </div>
        <div className="md:place-self-center md:justify-self-end grid-flow-col gap-4">
          <Link href="https://m.facebook.com/BreezFin14?/">
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
          <Link href="https://www.youtube.com/@pisanupongthamthitipong7885">
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
          <Link href="https://twitter.com/">
            <a target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-.433.232-1.205.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
          </Link>
        </div>
      </footer>

      {/* โมดอลสำหรับแสดงข้อความ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-base-100 w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-bold">ข้อมูลเพิ่มเติม</h3>
            <p className="py-4">{modalContent}</p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(false)}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;

import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  hello: string;
};

const hello = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.status(200).json({ hello: "world" });
};

export default hello;

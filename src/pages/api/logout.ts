import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0), // Set an expiry date in the past to delete the cookie
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({ message: "Logged out successfully" });
}

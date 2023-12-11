import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string;

  const params: Record<string, string> = {
    code,
    redirect_uri:
      process.env.NEXT_PUBLIC_REDIRECT_URI ??
      "http://localhost:3000/api/callback",
    grant_type: "authorization_code",
  };
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.NEXT_PUBLIC_CLIENT_ID + ":" + process.env.CLIENT_SECRET
        ).toString("base64"),
    },

    body: new URLSearchParams(params),
  });

  const data = await response.json();

  // Redirect to home page with token
  res.redirect(`/?token=${data.access_token}`);
}

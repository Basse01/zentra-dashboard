import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect("/");
  res.cookies.delete("dashboard_auth");
  return res;
}

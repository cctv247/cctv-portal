import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cronKey = searchParams.get("key");

    // Security check taaki koi random person hit na kare
    if (cronKey !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase client uninitialized" }, { status: 500 });
    }

    // 1. Supabase Database Ping (Keep-Alive query)
    const { data: devices, error: fetchError } = await supabaseAdmin
      .from("devices")
      .select("device_sn, site_name, last_maintenance, is_reseller");

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 2. AMC Check logic
    const today = new Date();
    let expiredCount = 0;
    let activeCount = 0;

    for (const dev of devices || []) {
      if (dev.is_reseller && dev.last_maintenance) {
        const startDate = new Date(dev.last_maintenance);
        const expiryDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        
        if (expiryDate < today) {
          expiredCount++;
        } else {
          activeCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database pinged and AMC scan completed",
      totalDevices: devices?.length || 0,
      activeAmc: activeCount,
      expiredAmc: expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
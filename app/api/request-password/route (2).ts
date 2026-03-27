import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { mobile, device_id } = await req.json();

    // 1. Fetch Device details
    const { data: device, error: fetchError } = await supabase
      .from("devices")
      .select("*")
      .eq("sn", device_id)
      .single();

    if (fetchError || !device) {
      return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });
    }

    // 💡 Current Date & Time for Subject (India Timezone)
    const requestDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 2. Format WhatsApp Reply Link
    const cleanMobile = mobile.replace(/\D/g, "");
    const techMobile = cleanMobile.startsWith("91") ? cleanMobile : `91${cleanMobile}`;
    const waMessage = encodeURIComponent(
      `Hello! Here are the requested credentials for ${device.site_name}:\n\n` +
      `🔑 User: ${device.user_pass}\n` +
      `🛡️ Admin: ${device.admin_pass}\n` +
      `🌐 IP: ${device.ip_address || 'N/A'}`
    );
    const techWaLink = `https://api.whatsapp.com/send?phone=${techMobile}&text=${waMessage}`;

    // 3. Send Professional Email Alert
    await resend.emails.send({
      from: "CCTV Portal <onboarding@resend.dev>",
      to: "wazahul@gmail.com",
      // 💡 Subject updated with Site Name and Date
      subject: `🚨 REQUEST: ${device.site_name} | ${requestDate}`, 
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e2e8f0; padding: 30px; border-radius: 24px; max-width: 500px; color: #1e293b; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
             <span style="background: #fee2e2; color: #ef4444; padding: 6px 14px; rounded-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Urgent Request</span>
             <h2 style="color: #0f172a; margin: 15px 0 5px 0; font-size: 22px;">Password Alert</h2>
             <p style="color: #64748b; font-size: 13px; margin: 0;">New request received from site</p>
          </div>
          
          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-bottom: 25px;">
            <p style="margin: 8px 0; font-size: 14px;"><b>📍 Site:</b> <span style="color: #2563eb;">${device.site_name}</span></p>
            <p style="margin: 8px 0; font-size: 14px;"><b>🔢 SN:</b> ${device.sn}</p>
            <p style="margin: 8px 0; font-size: 14px;"><b>📱 Tech Mobile:</b> ${mobile}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 18px; border: 1px solid #f1f5f9; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Device Credentials</p>
            <p style="margin: 5px 0; font-size: 15px;"><b>User:</b> <code style="background: #eee; padding: 2px 5px;">${device.user_pass}</code></p>
            <p style="margin: 5px 0; font-size: 15px;"><b>Admin:</b> <code style="background: #eee; padding: 2px 5px;">${device.admin_pass}</code></p>
            <p style="margin: 5px 0; font-size: 15px;"><b>IP:</b> ${device.ip_address || 'N/A'}</p>
          </div>

          <a href="${techWaLink}" 
             style="display: block; text-align: center; background: #22c55e; color: white; padding: 18px; border-radius: 20px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.25);">
             💬 REPLY VIA WHATSAPP
          </a>

          <p style="text-align: center; font-size: 11px; color: #cbd5e1; margin-top: 30px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
            Portal Engine 2026
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
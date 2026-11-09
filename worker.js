// Cloudflare Worker backend for Omni GPT. Set GEMINI_API_KEY as a Worker secret.
// Deploy: wrangler deploy; configure secret with: wrangler secret put GEMINI_API_KEY
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (new URL(request.url).pathname !== "/api/chat") return new Response(JSON.stringify({error:"Not found"}), {status:404,headers:cors});
    if (request.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}), {status:405,headers:cors});
    if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({error:"Backend chưa cấu hình Gemini API key."}), {status:503,headers:cors});
    try {
      const data = await request.json();
      const mode = ["basic","pro","max"].includes(data.mode) ? data.mode : "pro";
      const prompt = String(data.prompt || "").slice(0, 30000);
      if (!prompt.trim()) return new Response(JSON.stringify({error:"Tin nhắn trống."}), {status:400,headers:cors});
      const instructions = "Bạn là Omni GPT, trợ lý AI thân thiện, chính xác, giỏi giải thích, lập trình và hỗ trợ sáng tạo. Trả lời bằng ngôn ngữ người dùng. Không khẳng định đã chạy/kiểm thử nếu chưa làm. "+
        (mode === "basic" ? "Chế độ Basic: ngắn gọn, dễ hiểu." : mode === "max" ? "Chế độ Max: phân tích sâu, kiểm tra lỗi, bảo mật, hiệu năng và trường hợp biên." : "Chế độ Pro: cân bằng chi tiết và thực tiễn, đưa ví dụ khi hữu ích.");
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
        method:"POST", headers:{"Content-Type":"application/json", "x-goog-api-key":env.GEMINI_API_KEY},
        body:JSON.stringify({systemInstruction:{parts:[{text:instructions}]},contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.6}})
      });
      const result = await response.json();
      if (!response.ok) return new Response(JSON.stringify({error:result.error && result.error.message ? result.error.message : "Gemini API error"}), {status:502,headers:cors});
      const answer = result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts ? result.candidates[0].content.parts.map(p=>p.text||"").join("") : "";
      if (!answer) return new Response(JSON.stringify({error:"Gemini không trả về nội dung."}), {status:502,headers:cors});
      return new Response(JSON.stringify({answer}), {status:200,headers:cors});
    } catch (e) { return new Response(JSON.stringify({error:"Yêu cầu không hợp lệ hoặc máy chủ gặp lỗi."}), {status:400,headers:cors}); }
  }
};

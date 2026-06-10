import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const { perfil, medicamentos, alimentos, fitoterapicos, chas } = req.body;

  if (!medicamentos && !alimentos && !fitoterapicos && !chas)
    return res.status(400).json({ error: "Preencha ao menos uma substância." });

  const prompt = `Você é farmacêutico clínico especialista em interações e plantas medicinais brasileiras.

PERFIL: ${perfil.nome || "?"}, ${perfil.idade || "?"} anos, ${perfil.sexo || "?"}, ${perfil.etnia || "?"}
Condições: ${perfil.condicoes || "nenhuma"} | Hábitos: ${perfil.habitos || "nenhum"}

SUBSTÂNCIAS:
- Medicamentos: ${medicamentos || "nenhum"}
- Alimentos: ${alimentos || "nenhum"}
- Fitoterápicos/Suplementos: ${fitoterapicos || "nenhum"}
- Chás/Plantas: ${chas || "nenhum"}

Responda em português simples, como conversa com familiar. Cada bullet deve ter NO MÁXIMO 250 caracteres. Seja direto e curto. Use EXATAMENTE esta estrutura:

🔎 RESUMO: [SEGURO / ATENÇÃO / RISCO ALTO] — frase curta

⚠️ CUIDADOS:
• [par]: o que pode acontecer (curto)

👤 SOBRE ESSE PACIENTE:
• [ponto relevante do perfil]

✅ O QUE FAZER:
• [ação prática]

🚨 VÁ AO MÉDICO SE:
• [sinal de alerta claro]`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const texto = message.content.find((b) => b.type === "text")?.text || "";
    return res.status(200).json({ texto });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

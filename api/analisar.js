module.exports = async function handler(req, res) {
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
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ texto });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

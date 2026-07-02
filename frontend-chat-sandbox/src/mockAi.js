// Mirrors ai-engine's response shape — used only if ai-engine is offline.
export function mockAiParse(text) {
  const t = (text || "").toLowerCase();
  const qtyMatch = t.match(/\b(\d+)\b/);
  const qty = qtyMatch ? Number(qtyMatch[1]) :
              /\btwo\b/.test(t) ? 2 :
              /\bthree\b/.test(t) ? 3 : 1;
  const sizeMatch = t.match(/\b(small|medium|large|xl|xxl|s|m|l)\b/);
  const size = sizeMatch ? sizeMatch[1].toUpperCase().replace("SMALL","S").replace("MEDIUM","M").replace("LARGE","L") : null;
  const colors = ["black","white","red","blue","green","yellow","brown"];
  const color = colors.find(c => t.includes(c)) || null;
  const nouns = ["tracksuit","shirt","gown","jollof","shoe","bag","cap","dress","hoodie"];
  const noun = nouns.find(n => t.includes(n)) || "item";
  const itemName = color ? `${color[0].toUpperCase()+color.slice(1)} ${noun}` : noun[0].toUpperCase()+noun.slice(1);
  const addrMatch = t.match(/(?:to|for|at)\s+([a-z0-9 ,'\-]+)/);
  const address = addrMatch ? addrMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : null;

  return {
    items: [{ item: itemName, qty, size, color }],
    delivery_address: address,
    delivery_type: /pickup|pick up|collect/.test(t) ? "pickup" : "rider",
    missing_fields: address ? [] : ["delivery_address"],
    follow_up_question: address ? null : "Where should we deliver it?",
    confidence: "medium",
  };
}

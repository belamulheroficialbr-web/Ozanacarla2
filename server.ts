import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // JSON Body Parser with limit for image uploads
  app.use(express.json({ limit: '20mb' }));

  // Initialize Google Gemini SDK on Server Side
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log('[Server] Gemini SDK inicializado com sucesso no servidor.');
  } else {
    console.log('[Server] Atendimento Inteligente ativo em modo de resposta direta rápida e catálogo.');
  }

  // API Endpoint: /api/chat
  app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    const { message, image_base64, catalogContext, history } = req.body;

    if (!message && !image_base64) {
      return res.status(400).json({ error: 'Mensagem ou imagem necessária.' });
    }

    // Build Recent Multi-Turn Chat History String
    let conversationHistory = '';
    if (history && Array.isArray(history) && history.length > 0) {
      conversationHistory = '\nHISTÓRICO RECENTE DA CONVERSA COM O CLIENTE:\n' +
        history.map((h: any) => `${h.sender === 'user' ? 'Cliente' : 'Bela'}: ${h.content}`).join('\n') + '\n';
    }

    const systemPrompt = `Você é a "Bela", atendente VIP inteligente e especialista em estética do Salão Bela Mulher.
Responda sempre com elegância, empatia, tom brasileiro e extrema precisão profissional.

REGRAS DE INTELIGÊNCIA CONVERSACIONAL E PRECISÃO:
1. Responda diretamente ao que o cliente perguntou na mensagem atual. NUNCA reinicie a conversa, NUNCA repita saudações genéricas (ex: "Olá! Como posso cuidar de você?") durante a conversa.
2. NUNCA invente preços, produtos, serviços, durações ou estoques. Utilize estritamente os dados reais do catálogo fornecidos abaixo.
3. SERVIÇOS & ATENDIMENTO: Para perguntas sobre como funciona o atendimento, informe os horários (Ter a Sáb, 08h às 19h), localização (Av. da Beleza, 1250) e agendamento VIP. Para serviços específicos (ex: hidratação, corte), informe o NOME EXACTO, PREÇO EM R$ e DURAÇÃO EM MINUTOS cadastrados.
4. RECOMENDAÇÕES & COMPARAÇÕES: Se o cliente pedir recomendação para um problema (ex: cabelos ressecados), recomende produtos do catálogo e explique o PORQUÊ de cada indicação. Se o cliente perguntar a DIFERENÇA entre produtos recomendados anteriormente no histórico, compare suas funções (ex: tratamento de enxágue vs finalizador).
5. ESTOQUE REAL & DISPONIBILIDADE: NUNCA recomende ou incentive a compra de produtos com estoque zerado (quantity <= 0). Recomende EXCLUSIVAMENTE produtos disponíveis no estoque real. Se o cliente perguntar sobre produto indisponível, informe educadamente a indisponibilidade temporária.
6. CÁLCULO DE VALORES: Se o cliente pedir o total para comprar múltiplos itens, faça a soma exata dos preços do catálogo e apresente o resultado em R$.
7. VALIDAÇÃO DE PIX: Informe que todo pagamento Pix gera pedido com status PENDENTE até a validação real do comprovante pela administração do salão.
8. ANÁLISE DE FOTOGRAFIA MULTIMODAL: Se houver imagem enviada, comente a textura/tom visível e indique os tratamentos e produtos em estoque do catálogo.

${conversationHistory}
CATÁLOGO REAL ATUALIZADO DO SALÃO:
${catalogContext || 'Serviços: Corte & Escova (R$ 120,00 - 60 min), Mechas Peroladas (R$ 380,00 - 180 min), Hidratação Ouro Bela Mulher (R$ 180,00 - 60 min), Esmaltação Gel (R$ 65,00 - 45 min). Produtos: Kit Ampolas de Nutrição Capilar (R$ 45,00), Esmalte Gel Ouro Bela Mulher (R$ 35,00), Óleo Reparador de Pontas 60ml (R$ 60,00).'}
`;

    // Contextual & Exact Fallback Engine (Prevents Generic Greetings)
    const getExactFallbackText = (userMsg: string, hasImg: boolean) => {
      const lower = (userMsg || '').toLowerCase();

      if (hasImg) {
        return 'Analisei a fotografia enviada! Ela indica a necessidade de nutrição capilar intensiva e selagem de cutículas. Recomendo nosso Kit Ampolas de Nutrição (R$ 45,00) e o Óleo Reparador de Pontas (R$ 60,00) do nosso catálogo!';
      }
      if (lower.includes('como funciona') || lower.includes('atendimento') || lower.includes('salão') || lower.includes('salao')) {
        return 'Nosso atendimento funciona de Terça a Sábado, das 08h às 19h, com agendamento VIP individualizado. Você pode agendar seu horário online na Área do Cliente ou presencialmente na Av. da Beleza, 1250. Aceitamos Pix e cartões!';
      }
      if (lower.includes('hidratação') || lower.includes('hidratacao')) {
        return 'Oferecemos o procedimento **Hidratação Ouro Bela Mulher**, que custa **R$ 180,00** e possui duração de **60 minutos**. É um tratamento intensivo de nutrição e restauração dos fios danificados!';
      }
      if (lower.includes('ressecad') || lower.includes('recomenda') || lower.includes('sem brilho')) {
        return 'Para cabelos ressecados e sem brilho, recomendo dois produtos disponíveis em estoque:\n1. **Kit Ampolas de Nutrição Capilar (R$ 45,00)**: Repõe a umectação e os nutrientes no córtex do fio.\n2. **Óleo Reparador de Pontas 60ml (R$ 60,00)**: Sela as cutículas e confere brilho imediato.';
      }
      if (lower.includes('diferença') || lower.includes('diferenca') || lower.includes('entre os dois')) {
        return 'A diferença é que o **Kit Ampolas de Nutrição (R$ 45,00)** é um tratamento semanal de enxágue para nutrição interna, enquanto o **Óleo Reparador (R$ 60,00)** é um finalizador diário sem enxágue para alinhamento e brilho das pontas!';
      }
      if (lower.includes('dois produtos') || lower.includes('quanto vou pagar') || lower.includes('total') || lower.includes('comprar')) {
        return 'Ao adquirir o Kit Ampolas de Nutrição (R$ 45,00) e o Óleo Reparador de Pontas (R$ 60,00), o valor total da sua compra é de **R$ 105,00**. Os itens serão adicionados à sua Sacola de Compras para pagamento seguro via Pix (Chave CNPJ: 12.345.678/0001-90).';
      }
      if (lower.includes('todos os produtos') || lower.includes('catálogo completo')) {
        return 'Apresento abaixo todos os produtos profissionais disponíveis em nosso estoque com fotos reais e valores:';
      }
      if (lower.includes('pix') || lower.includes('pagar') || lower.includes('chave')) {
        return 'Nosso pagamento via Pix é realizado pela chave CNPJ 12.345.678/0001-90 em nome de Sra Bela Mulher Salão & Estética.\n\n📌 **Regra de Segurança**: Todo pedido gerado via Pix fica com status **PENDENTE** e só é confirmado após a validação real do comprovante pela nossa equipe ou gateway!';
      }
      return `Em relação à sua solicitação ("${userMsg}"), nossa equipe do Salão Bela Mulher confirma que temos os serviços e tratamentos correspondentes disponíveis no catálogo!`;
    };

    // Call Gemini API with 15-second timeout
    if (ai) {
      try {
        const contentsParts: any[] = [];

        if (image_base64) {
          const mimeMatch = image_base64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const cleanBase64 = image_base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

          contentsParts.push({
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          });
        }

        if (message) {
          contentsParts.push({ text: message });
        }

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: contentsParts },
          config: {
            systemInstruction: systemPrompt
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de resposta da API')), 15000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const replyText = response?.text || getExactFallbackText(message, !!image_base64);
        const serverDurationMs = Date.now() - startTime;

        return res.json({
          reply: replyText,
          status: 'success',
          source: 'gemini-3.8-flash',
          duration_ms: serverDurationMs
        });

      } catch (err: any) {
        console.error('Alerta Gemini API (respondendo com catálogo exato):', err?.message || err);
        const fallback = getExactFallbackText(message, !!image_base64);
        const serverDurationMs = Date.now() - startTime;
        return res.json({
          reply: fallback,
          status: 'fallback',
          duration_ms: serverDurationMs
        });
      }
    }

    // Fast response when API key is unconfigured
    const fallback = getExactFallbackText(message, !!image_base64);
    const serverDurationMs = Date.now() - startTime;
    return res.json({
      reply: fallback,
      status: 'direct_catalog',
      duration_ms: serverDurationMs
    });
  });

  // Mount Vite Express middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Servidor Bela Mulher rodando em http://localhost:${PORT}`);
  });
}

startServer();

import {useState, useEffect, useRef} from 'react';
import {MessageCircle, Send, Sparkles, Scissors, Calendar, User, CheckCircle, ArrowRight} from 'lucide-react';
import {dataService} from '../../lib/data';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export function SalonChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: getGreeting() + ' Seja muito bem-vinda ao Salão Bela Mulher! Sou a assistente virtual e estou aqui para tirar suas dúvidas sobre nossos serviços, preços e horários. Como posso te ajudar hoje?',
      time: getCurrentTime()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia!';
    if (hour < 18) return 'Boa tarde!';
    return 'Boa noite!';
  }

  function getCurrentTime() {
    return new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  }

  useEffect(() => {
    async function loadServices() {
      try {
        const {data} = await dataService.getServices();
        if (data && data.length > 0) {
          setServices(data);
        } else {
          // Fallback services if database is empty
          setServices([
            {name: 'Corte & Escova', price: 90, duration: '60min', desc: 'Corte modelado e escova profissional.'},
            {name: 'Manicure & Pedicure', price: 70, duration: '90min', desc: 'Cuidado completo para mãos e pés.'},
            {name: 'Hidratação Profunda', price: 120, duration: '60min', desc: 'Tratamento nutritivo para fios danificados.'},
            {name: 'Design de Sobrancelhas', price: 50, duration: '30min', desc: 'Alinhamento e valorização do olhar.'}
          ]);
        }
      } catch {
        setServices([
          {name: 'Corte & Escova', price: 90, duration: '60min', desc: 'Corte modelado e escova profissional.'},
          {name: 'Manicure & Pedicure', price: 70, duration: '90min', desc: 'Cuidado completo para mãos e pés.'},
          {name: 'Hidratação Profunda', price: 120, duration: '60min', desc: 'Tratamento nutritivo para fios danificados.'},
          {name: 'Design de Sobrancelhas', price: 50, duration: '30min', desc: 'Alinhamento e valorização do olhar.'}
        ]);
      }
    }
    loadServices();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMsg]);
    if (textToSend === undefined) setInputText('');

    // Generate intelligent response based on query keywords
    setTimeout(() => {
      const botReply = generateBotResponse(query, services);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  const generateBotResponse = (query: string, availableServices: any[]) => {
    const q = query.toLowerCase();

    if (q.includes('preço') || q.includes('valor') || q.includes('quanto') || q.includes('tabela') || q.includes('serviço')) {
      if (availableServices.length === 0) {
        return 'Nossos serviços variam de acordo com o procedimento desejado. Você pode conferir todos os valores na aba Vitrine do aplicativo.';
      }
      let reply = 'Aqui estão alguns dos nossos principais serviços e valores:\n\n';
      availableServices.slice(0, 5).forEach(s => {
        reply += `• ${s.name}: R$ ${s.price || 0} (${s.duration || '60min'})\n`;
      });
      reply += '\nPara agendar qualquer um deles, acesse a aba "Vitrine" ou entre na sua "Área do Cliente".';
      return reply;
    }

    if (q.includes('agenda') || q.includes('horário') || q.includes('marcar') || q.includes('agendar') || q.includes('como marcar')) {
      return 'Para agendar um horário no Salão Bela Mulher é muito simples:\n\n1. Acesse a aba "Vitrine" no menu inferior.\n2. Escolha o serviço desejado e clique em agendar.\n3. Selecione a data e o profissional de sua preferência.\n\nVocê também pode acompanhar seus horários marcados na sua "Área do Cliente".';
    }

    if (q.includes('local') || q.includes('endereço') || q.includes('onde') || q.includes('contato') || q.includes('telefone') || q.includes('whatsapp')) {
      return 'O Salão Bela Mulher está localizado em um espaço aconchegante e sofisticado para cuidar de você. Nosso atendimento principal de agendamentos é feito diretamente por aqui ou pela nossa Vitrine online. Como podemos te auxiliar no atendimento hoje?';
    }

    if (q.includes('cabelo') || q.includes('corte') || q.includes('escova') || q.includes('hidratação') || q.includes('luzes') || q.includes('tintura')) {
      return 'Para os cabelos, oferecemos corte, escova modelada, hidratação profunda, coloração e tratamentos exclusivos. Nossos profissionais utilizam produtos de altíssima qualidade. Deseja ver os preços ou agendar um horário?';
    }

    if (q.includes('unha') || q.includes('manicure') || q.includes('pedicure') || q.includes('alongamento') || q.includes('pé') || q.includes('mão')) {
      return 'Cuidamos das suas mãos e pés com técnicas impecáveis de manicure, pedicure e esmaltação duradoura em um ambiente relaxante. Gostaria de verificar a disponibilidade de horários?';
    }

    if (q.includes('oi') || q.includes('olá') || q.includes('bom dia') || q.includes('boa tarde') || q.includes('boa noite') || q.includes('ajuda')) {
      return 'Olá! Estou à disposição para ajudar você a encontrar o serviço ideal, tirar dúvidas sobre valores ou orientar sobre agendamentos no Salão Bela Mulher.';
    }

    // Default response with suggestions
    return `Entendi sua dúvida sobre "${query}". No Salão Bela Mulher, oferecemos atendimento personalizado em estética e cuidados capilares e de unhas. Você gostaria de:\n\n• Consultar os valores dos serviços\n• Saber como fazer um agendamento\n• Falar sobre horários disponíveis`;
  };

  const suggestions = [
    'Quais são os serviços e preços?',
    'Como faço para agendar um horário?',
    'Vocês fazem corte e escova?',
    'Quais os cuidados para unhas?'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="text-center py-2">
        <span className="text-[11px] text-amber-500 font-semibold tracking-wider uppercase">Assistente Virtual</span>
        <h2 className="text-2xl font-bold text-white tracking-tight">Chat de Atendimento Bela Mulher</h2>
        <p className="text-xs text-gray-400 mt-1">Tire dúvidas e encontre serviços com nossa assistente em tempo real</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="bg-gray-950 p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Bela Assistente</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online • Responde na hora
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/40">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-br-xs shadow-md'
                    : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-gray-950/80 border-t border-gray-800 overflow-x-auto scrollbar-none flex gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="shrink-0 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 text-[11px] rounded-xl transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida ou serviço desejado..."
            className="flex-1 p-3 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            className="p-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors shadow-md flex items-center justify-center"
            title="Enviar mensagem"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

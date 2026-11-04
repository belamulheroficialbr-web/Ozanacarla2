import React, {useState} from 'react';
import {Calculator as CalcIcon, X, Minus, Plus, Percent, Divide, Equal, RefreshCw} from 'lucide-react';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const calculate = (expr: string) => {
    try {
      // Safe math evaluation
      const sanitized = expr.replace(/[^0-9+\-*/.]/g, '');
      const res = Function(`"use strict"; return (${sanitized})`)();
      return isNaN(res) ? 'Erro' : res.toString();
    } catch {
      return 'Erro';
    }
  };

  const handlePress = (val: string) => {
    if (val === '=') {
      const res = calculate(expression);
      setDisplay(res);
      setExpression(res);
    } else if (val === 'C') {
      setDisplay('0');
      setExpression('');
    } else if (val === 'comissao') {
      try {
        const valNum = parseFloat(display) || parseFloat(expression) || 0;
        const comissao = (valNum * 0.3).toFixed(2); // 30% comissão padrão
        setDisplay(`Comissão 30%: R$ ${comissao}`);
        setExpression(comissao);
      } catch {
        setDisplay('Erro');
      }
    } else {
      setExpression(prev => prev + val);
      setDisplay(prev => prev === '0' ? val : prev + val);
    }
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <CalcIcon size={18} className="text-amber-400" />
          <span>Calculadora Profissional do Salão</span>
        </h3>
      </div>

      <div className="p-4 bg-black border border-gray-800 rounded-2xl text-right">
        <span className="text-[10px] text-gray-500 block font-mono min-h-[1rem] truncate">{expression || '0'}</span>
        <div className="text-2xl font-mono font-bold text-amber-400 tracking-wider truncate mt-1">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', 'C', '=', '+'].map(btn => (
          <button
            key={btn}
            onClick={() => handlePress(btn)}
            className={`p-3.5 rounded-xl font-bold font-mono text-sm transition-colors ${
              btn === '='
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : btn === 'C'
                ? 'bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/50'
                : ['/', '*', '-', '+'].includes(btn)
                ? 'bg-gray-800 hover:bg-gray-700 text-amber-400'
                : 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-800'
            }`}
          >
            {btn}
          </button>
        ))}

        <button
          onClick={() => handlePress('comissao')}
          className="col-span-4 p-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Calcular Comissão Padrão (30%)</span>
        </button>
      </div>
    </div>
  );
}

export function CalculatorModal({onClose}: {onClose: () => void}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl w-full max-w-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white">Calculadora</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <Calculator />
      </div>
    </div>
  );
}

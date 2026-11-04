import {useState} from 'react';
import {Calculator as CalcIcon, X, Minus, Plus, Percent, Divide, Equal} from 'lucide-react';

export function CalculatorModal({onClose}: {onClose: () => void}) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');

  const calculate = (expr: string) => {
    try {
      return eval(expr).toString();
    } catch {
      return 'Erro';
    }
  };

  const handlePress = (val: string) => {
    if (val === '=') setDisplay(calculate(expression));
    else if (val === 'C') { setDisplay('0'); setExpression(''); }
    else if (val === '%') setExpression(prev => (parseFloat(prev) / 100).toString());
    else if (val === 'comissao') setExpression(prev => (parseFloat(prev) * 0.3).toString()); // Exemplo 30%
    else {
      setExpression(prev => prev + val);
      setDisplay(prev => prev === '0' ? val : prev + val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 border border-gray-700 p-4 rounded-2xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-amber-500 font-bold">Calculadora Profissional</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="bg-black p-4 text-right text-2xl font-mono text-white mb-4 rounded-lg">{display}</div>
        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', 'C', '=', '+'].map(btn => (
            <button key={btn} onClick={() => handlePress(btn)} className="bg-gray-800 p-4 rounded-lg text-white font-bold">{btn}</button>
          ))}
          <button onClick={() => handlePress('comissao')} className="bg-amber-600 col-span-2 p-4 rounded-lg text-white font-bold text-sm">Calc. Comissão</button>
          <button onClick={() => handlePress('%')} className="bg-gray-700 col-span-2 p-4 rounded-lg text-white font-bold">%</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, Loader2, CheckCircle2, AlertTriangle, Info, TrendingUp, ShieldCheck } from 'lucide-react';
import { Customer, CreditStatus } from '@/lib/types';
import { motion } from 'motion/react';

interface AIAnalysisProps {
  customer: Partial<Customer>;
}

export function AIAnalysis({ customer }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise o seguinte perfil de crédito imobiliário e forneça um parecer técnico estruturado em JSON.
        
        Dados do Cliente:
        - Nome: ${customer.name}
        - Renda Mensal: R$ ${customer.income}
        - Valor do Imóvel: R$ ${customer.propertyValue}
        - Valor Financiado: R$ ${customer.financedValue}
        - Empreendimento: ${customer.project}
        - Documentos Anexados: ${customer.documents?.length || 0}
        
        Considere as seguintes regras de mercado:
        1. Comprometimento de renda ideal: até 30% da renda mensal.
        2. LTV (Loan-to-Value): ideal até 80% do valor do imóvel.
        3. Documentação: RG, CPF, Comprovante de Renda e IRPF são essenciais.
        
        Retorne um JSON com:
        {
          "score": number (0-100),
          "recommendation": "string (Aprovar, Pré-Aprovar, Revisar ou Reprovar)",
          "ltv": number (porcentagem),
          "dti": number (estimativa de comprometimento de renda em %),
          "risks": ["string"],
          "strengths": ["string"],
          "nextSteps": ["string"],
          "summary": "string (resumo executivo de 2 frases)"
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const response = await model;
      const result = JSON.parse(response.text || '{}');
      setAnalysis(result);
    } catch (err: any) {
      console.error('AI Analysis error:', err);
      setError('Não foi possível realizar a análise automática no momento.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer.name || !customer.income || !customer.propertyValue || !customer.financedValue) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Info className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-sm text-gray-500 font-medium">Preencha os dados básicos do cliente para habilitar a análise de IA.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!analysis && !isLoading && (
        <div className="p-8 text-center bg-indigo-50 rounded-2xl border border-indigo-100">
          <Brain className="mx-auto text-indigo-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Análise Inteligente de Crédito</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Utilize nossa inteligência artificial para avaliar o perfil do cliente, calcular riscos e obter uma recomendação instantânea baseada em dados de mercado.
          </p>
          <button 
            onClick={runAnalysis}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto"
          >
            Iniciar Análise IA
          </button>
        </div>
      )}

      {isLoading && (
        <div className="p-12 text-center">
          <Loader2 className="mx-auto text-indigo-600 animate-spin mb-4" size={48} />
          <p className="text-lg font-bold text-gray-900">Processando Dados...</p>
          <p className="text-sm text-gray-500 mt-2">Nossa IA está avaliando o perfil financeiro e documentos.</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button onClick={runAnalysis} className="mt-4 text-xs font-bold text-red-600 underline">Tentar novamente</button>
        </div>
      )}

      {analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Score */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score HOME CRED</p>
              <div className={`text-3xl font-black ${analysis.score > 70 ? 'text-emerald-600' : analysis.score > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                {analysis.score}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">LTV</p>
              <div className="text-xl font-bold text-gray-900">{analysis.ltv}%</div>
              <p className="text-[10px] text-gray-400">Financiamento</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DTI Est.</p>
              <div className="text-xl font-bold text-gray-900">{analysis.dti}%</div>
              <p className="text-[10px] text-gray-400">Comprometimento</p>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
            analysis.recommendation === 'Aprovar' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
            analysis.recommendation === 'Pré-Aprovar' ? 'bg-blue-50 border-blue-100 text-blue-800' :
            analysis.recommendation === 'Revisar' ? 'bg-amber-50 border-amber-100 text-amber-800' :
            'bg-red-50 border-red-100 text-red-800'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              analysis.recommendation === 'Aprovar' ? 'bg-emerald-500 text-white' :
              analysis.recommendation === 'Pré-Aprovar' ? 'bg-blue-500 text-white' :
              analysis.recommendation === 'Revisar' ? 'bg-amber-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {analysis.recommendation === 'Aprovar' ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Parecer Técnico</p>
              <h4 className="text-lg font-black">{analysis.recommendation}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Info size={16} className="text-indigo-600" />
              Resumo da Análise
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" />
                Pontos Fortes
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Riscos Identificados
              </h4>
              <ul className="space-y-2">
                {analysis.risks.map((r: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">Próximos Passos Recomendados</h4>
            <div className="space-y-2">
              {analysis.nextSteps.map((step: string, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-indigo-100/50">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </div>
                  <p className="text-xs text-gray-700 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={runAnalysis}
            className="w-full py-2 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
          >
            Refazer Análise
          </button>
        </motion.div>
      )}
    </div>
  );
}

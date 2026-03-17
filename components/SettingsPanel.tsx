'use client';

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Lock, 
  Save, 
  CheckCircle2,
  AlertCircle,
  UserCog
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '@/lib/types';

interface SettingsPanelProps {
  userRole: UserRole;
}

export function SettingsPanel({ userRole }: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isAdmin = userRole === 'admin';
  const isAnalyst = userRole === 'analyst';

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-sm text-gray-500">Gerencie as preferências e permissões da plataforma.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
            showSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-100' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
          }`}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : showSuccess ? (
            <CheckCircle2 size={20} />
          ) : (
            <Save size={20} />
          )}
          {showSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Tabs (Visual only for now) */}
        <div className="space-y-1">
          {[
            { id: 'general', label: 'Geral', icon: Globe },
            { id: 'security', label: 'Segurança', icon: Shield },
            { id: 'notifications', label: 'Notificações', icon: Bell },
            { id: 'database', label: 'Banco de Dados', icon: Database },
            { id: 'roles', label: 'Permissões', icon: UserCog },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab.id === 'general' ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* General Settings */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-50">
              <Globe className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-900">Preferências Gerais</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome da Plataforma</label>
                <input 
                  type="text" 
                  defaultValue="CrediFlow CRM"
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Moeda Padrão</label>
                <select 
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                >
                  <option>Real Brasileiro (BRL)</option>
                  <option>Dólar Americano (USD)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Security & Permissions */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-50">
              <Shield className="text-indigo-600" size={20} />
              <h3 className="font-bold text-gray-900">Segurança e Níveis de Acesso</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Autenticação em Duas Etapas (2FA)</p>
                  <p className="text-xs text-gray-500">Exigir código via SMS ou E-mail para login.</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${isAdmin ? 'bg-indigo-600' : 'bg-gray-300 opacity-50'}`}>
                  <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                </div>
              </div>

              <div className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock size={14} />
                  Seu Nível de Permissão: {userRole.toUpperCase()}
                </h4>
                <div className="space-y-2">
                  <PermissionItem label="Visualizar Dashboard" allowed={true} />
                  <PermissionItem label="Editar Clientes" allowed={isAdmin || isAnalyst} />
                  <PermissionItem label="Excluir Clientes" allowed={isAdmin} />
                  <PermissionItem label="Gerir Corretores" allowed={isAdmin || isAnalyst} />
                  <PermissionItem label="Alterar Configurações Globais" allowed={isAdmin} />
                </div>
              </div>
            </div>
          </section>

          {!isAdmin && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800 leading-relaxed">
                Algumas configurações estão bloqueadas. Apenas usuários com perfil de <span className="font-bold">Administrador</span> podem realizar alterações críticas no sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PermissionItem({ label, allowed }: { label: string, allowed: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${allowed ? 'text-emerald-600' : 'text-red-400'}`}>
        {allowed ? 'Permitido' : 'Bloqueado'}
      </span>
    </div>
  );
}

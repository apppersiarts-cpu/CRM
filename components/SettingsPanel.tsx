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
  UserCog,
  ListTodo,
  Edit2,
  Plus,
  Trash2,
  UserPlus,
  ShieldCheck,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, CreditStatus, STATUS_ORDER } from '@/lib/types';

interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
  created_at?: string;
}

interface SettingsPanelProps {
  userRole: UserRole;
}

export function SettingsPanel({ userRole }: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stageLabels, setStageLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffUser>>({ role: 'analyst' });

  const isAdmin = userRole === 'admin';
  const isAnalyst = userRole === 'analyst';

  // Load settings and staff
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, staffRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/staff')
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.stageLabels) {
            setStageLabels(data.stageLabels);
          } else {
            const initial: Record<string, string> = {};
            STATUS_ORDER.forEach(status => {
              initial[status] = status;
            });
            setStageLabels(initial);
          }
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaff(staffData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.password) {
      alert('Preencha nome e senha.');
      return;
    }

    const staffToAdd = {
      ...newStaff,
      id: Math.random().toString(36).substr(2, 9)
    } as StaffUser;

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffToAdd)
      });

      if (res.ok) {
        setStaff([staffToAdd, ...staff]);
        setIsAddingStaff(false);
        setNewStaff({ role: 'analyst' });
        // Reload to update global user list (for login)
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Failed to add staff:', error);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (confirm('Deseja realmente excluir este membro da equipe?')) {
      try {
        const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setStaff(staff.filter(s => s.id !== id));
          // Reload to update global user list
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (error) {
        console.error('Failed to delete staff:', error);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'stageLabels', value: stageLabels })
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      // Reload page to apply changes everywhere (simplest way for now)
      window.location.reload();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
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

          {/* Custom Stages (Processo de Crédito) */}
          {isAdmin && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-50">
                <ListTodo className="text-indigo-600" size={20} />
                <h3 className="font-bold text-gray-900">Personalização das Etapas</h3>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-4">
                  Altere os nomes das etapas do processo de crédito. Essas alterações serão aplicadas em todo o sistema (Kanban, Tabelas e Filtros).
                </p>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {STATUS_ORDER.map((status) => (
                      <div key={status} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-focus-within:text-indigo-600 group-focus-within:border-indigo-200 transition-all">
                          <Edit2 size={14} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Etapa Original: {status}</label>
                          <input 
                            type="text"
                            value={stageLabels[status] || status}
                            onChange={(e) => setStageLabels({ ...stageLabels, [status]: e.target.value })}
                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 focus:ring-0 outline-none"
                            placeholder={`Nome para ${status}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Staff Management */}
          {isAdmin && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <UserCog className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-gray-900">Gestão de Equipe (Analistas e ADMs)</h3>
                </div>
                <button 
                  onClick={() => setIsAddingStaff(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                >
                  <Plus size={14} />
                  Novo Membro
                </button>
              </div>

              <AnimatePresence>
                {isAddingStaff && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
                          <input 
                            type="text"
                            value={newStaff.name || ''}
                            onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="Ex: João Silva"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Senha de Acesso</label>
                          <input 
                            type="password"
                            value={newStaff.password || ''}
                            onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="Mínimo 3 caracteres"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nível de Acesso</label>
                          <select 
                            value={newStaff.role}
                            onChange={e => setNewStaff({...newStaff, role: e.target.value as UserRole})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          >
                            <option value="analyst">Analista (Correspondente)</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => setIsAddingStaff(false)}
                          className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddStaff}
                          className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                          Criar Usuário
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        member.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            member.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {member.role === 'admin' ? 'Administrador' : 'Analista'}
                          </span>
                          <span className="text-[10px] text-gray-400">ID: {member.id}</span>
                        </div>
                      </div>
                    </div>
                    {member.id !== '1' && ( // Don't allow deleting the main admin
                      <button 
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

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

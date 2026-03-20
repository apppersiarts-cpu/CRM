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
  status: 'active' | 'inactive';
  created_at?: string;
}

interface SettingsPanelProps {
  userRole: UserRole;
  currentUserId: string;
}

export function SettingsPanel({ userRole, currentUserId }: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stageLabels, setStageLabels] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState<Partial<StaffUser>>({ role: 'analyst', status: 'active' });

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
    if (!newStaff.name || (!editingStaff && !newStaff.password)) {
      alert('Preencha nome e senha.');
      return;
    }

    const staffToSave = {
      ...newStaff,
      id: editingStaff ? editingStaff.id : Math.random().toString(36).substr(2, 9)
    } as StaffUser;

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffToSave)
      });

      if (res.ok) {
        if (editingStaff) {
          setStaff(staff.map(s => s.id === editingStaff.id ? staffToSave : s));
        } else {
          setStaff([staffToSave, ...staff]);
        }
        setIsAddingStaff(false);
        setEditingStaff(null);
        setNewStaff({ role: 'analyst', status: 'active' });
        // Reload to update global user list (for login)
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
    }
  };

  const handleEditStaff = (member: StaffUser) => {
    setEditingStaff(member);
    setNewStaff({
      name: member.name,
      role: member.role,
      password: member.password,
      status: member.status
    });
    setIsAddingStaff(true);
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStaff(staff.filter(s => s.id !== id));
        setDeleteConfirmId(null);
        // Reload to update global user list
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
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
                  defaultValue="HOME CRED CRM"
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
                  onClick={() => {
                    setEditingStaff(null);
                    setNewStaff({ role: 'analyst', status: 'active' });
                    setIsAddingStaff(true);
                  }}
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
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 mb-6 shadow-inner">
                      <h4 className="text-sm font-bold text-gray-900 mb-2">
                        {editingStaff ? 'Editar Membro da Equipe' : 'Cadastrar Novo Membro'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nome Completo</label>
                          <input 
                            type="text"
                            value={newStaff.name || ''}
                            onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder="Ex: João Silva"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Senha de Acesso</label>
                          <input 
                            type="password"
                            value={newStaff.password || ''}
                            onChange={e => setNewStaff({...newStaff, password: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            placeholder={editingStaff ? "Deixe em branco para manter" : "Mínimo 3 caracteres"}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                          <select 
                            value={newStaff.status || 'active'}
                            onChange={e => setNewStaff({...newStaff, status: e.target.value as any})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          >
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nível de Acesso</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setNewStaff({...newStaff, role: 'analyst'})}
                              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${newStaff.role === 'analyst' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            >
                              <User size={16} />
                              Analista
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewStaff({...newStaff, role: 'admin'})}
                              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${newStaff.role === 'admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                            >
                              <ShieldCheck size={16} />
                              Administrador
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200/50">
                        <button 
                          onClick={() => {
                            setIsAddingStaff(false);
                            setEditingStaff(null);
                          }}
                          className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddStaff}
                          className="px-6 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                          {editingStaff ? 'Salvar Alterações' : 'Criar Usuário'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${
                        member.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${member.status === 'inactive' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {member.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            member.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {member.role === 'admin' ? 'Administrador' : 'Analista'}
                          </span>
                          {member.status === 'inactive' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                              Inativo
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-mono">ID: {member.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditStaff(member)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      {member.id !== currentUserId && ( // Don't allow deleting yourself to prevent lockout
                        <button 
                          onClick={() => setDeleteConfirmId(member.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete Confirmation Modal */}
              <AnimatePresence>
                {deleteConfirmId && (
                  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center"
                    >
                      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
                      <p className="text-sm text-gray-500 mb-8">
                        Tem certeza que deseja excluir este membro da equipe? Esta ação não pode ser desfeita.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(deleteConfirmId)}
                          className="flex-1 px-6 py-3 bg-red-500 text-white text-sm font-bold hover:bg-red-600 rounded-xl transition-all shadow-lg shadow-red-100"
                        >
                          Excluir
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
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

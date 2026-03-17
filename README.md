# CrediFlow CRM - Gestão de Crédito Imobiliário

Plataforma avançada para gestão de processos de crédito imobiliário, integrando corretores, analistas e inteligência artificial para agilizar a aprovação de financiamentos.

## 🚀 Funcionalidades Principais

- **Dashboard Executivo:** Visualização em tempo real de métricas, conversão e volume financeiro.
- **Fluxo Kanban:** Gestão visual do status de cada cliente, desde o cadastro até a assinatura do contrato.
- **Análise de Crédito com IA:** Integração com Google Gemini para análise instantânea de perfil, cálculo de LTV/DTI e recomendações técnicas.
- **Gestão de Documentos:** Upload e organização de documentos obrigatórios (RG, CPF, Renda, etc) via Vercel Blob.
- **Painel de Configurações:** Controle de permissões baseado em perfis (Admin, Analista, Corretor).
- **Interface Responsiva:** Design moderno e fluido utilizando Tailwind CSS e Framer Motion.

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion (motion/react)
- **IA:** Google Gemini API (@google/genai)
- **Ícones:** Lucide React
- **Armazenamento:** Vercel Blob

## ⚙️ Configuração Necessária

Para o funcionamento pleno da plataforma, as seguintes variáveis de ambiente devem ser configuradas:

```env
# Gemini API Key (Para Análise de Crédito)
NEXT_PUBLIC_GEMINI_API_KEY=seu_token_aqui

# Vercel Blob (Para Upload de Documentos)
BLOB_READ_WRITE_TOKEN=seu_token_aqui
```

## 👥 Perfis de Acesso

- **Administrador:** Acesso total ao sistema, configurações globais e gestão de usuários.
- **Analista:** Foco na análise técnica, revisão de documentos e pareceres de IA.
- **Corretor:** Cadastro de novos clientes e acompanhamento do status de suas vendas.

---
Desenvolvido no **Google AI Studio Build**.

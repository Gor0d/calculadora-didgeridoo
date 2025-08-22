# 💾 Sistema de Projetos - Opções de Implementação

Este documento registra as opções discutidas para implementar o sistema de projetos funcional no Didgemap, incluindo arquiteturas, custos e cronogramas.

## 🎯 Contexto

Atualmente o sistema de projetos está implementado localmente, mas para torná-lo funcional em produção no Netlify, precisamos escolher uma arquitetura de backend.

## 🏗️ Opções de Arquitetura

### 1. 💾 Armazenamento Local (Mais Simples)

**Tecnologias:**
- localStorage / IndexedDB
- Dexie.js (wrapper para IndexedDB)

**Prós:**
- ✅ Implementação mais simples
- ✅ Funciona 100% offline  
- ✅ Sem custos de servidor
- ✅ Sem latência de rede
- ✅ Privacy total (dados não saem do dispositivo)

**Contras:**
- ❌ Limitado ao dispositivo/navegador
- ❌ Perdido se limpar dados do browser
- ❌ Não sincroniza entre dispositivos
- ❌ Não permite compartilhamento
- ❌ Backup manual necessário

**Código exemplo:**
```javascript
// services/LocalProjectStorage.js
class LocalProjectStorage {
  static saveProject(project) {
    const projects = JSON.parse(localStorage.getItem('didgemap_projects') || '[]');
    const projectWithId = { ...project, id: Date.now(), updatedAt: new Date() };
    projects.push(projectWithId);
    localStorage.setItem('didgemap_projects', JSON.stringify(projects));
    return projectWithId.id;
  }
  
  static getProjects() {
    return JSON.parse(localStorage.getItem('didgemap_projects') || '[]');
  }
  
  static deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem('didgemap_projects', JSON.stringify(projects));
  }
}
```

### 2. ☁️ Backend-as-a-Service (Recomendado)

#### Firebase (Google)

**Tecnologias:**
- Firestore (NoSQL database)
- Firebase Auth (autenticação)
- Firebase Hosting (opcional)

**Prós:**
- ✅ Gratuito até 1GB de dados
- ✅ Real-time sync automático
- ✅ Autenticação social integrada
- ✅ Funciona offline com cache
- ✅ Escalável automaticamente
- ✅ SDK bem documentado
- ✅ Integração nativa com Netlify

**Contras:**
- ❌ Vendor lock-in (Google)
- ❌ Curva de aprendizado inicial
- ❌ Limitações do plano gratuito

**Limites gratuitos:**
- 1GB de armazenamento
- 50k leituras/dia
- 20k escritas/dia
- 20k deleções/dia
- 10k usuários autenticados/mês

**Código exemplo:**
```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

```javascript
// services/ProjectService.js
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  getDocs, query, where, orderBy 
} from 'firebase/firestore';
import { db, auth } from '../firebase-config';

export class ProjectService {
  static async saveProject(projectData) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const projectRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return projectRef.id;
  }
  
  static async getUserProjects() {
    const user = auth.currentUser;
    if (!user) return [];
    
    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}
```

#### Supabase (Alternativa ao Firebase)

**Tecnologias:**
- PostgreSQL database
- Supabase Auth
- Real-time subscriptions

**Prós:**
- ✅ Open source (menos vendor lock-in)
- ✅ SQL familiar (PostgreSQL)
- ✅ Dashboard excelente
- ✅ Políticas de segurança (RLS)
- ✅ Self-hosteable

**Contras:**
- ❌ Menos maduro que Firebase
- ❌ Plano gratuito mais limitado

**Limites gratuitos:**
- 500MB database
- 2GB bandwidth/mês
- 50k usuários autenticados

### 3. ⚡ Netlify Functions + Database

**Tecnologias:**
- Netlify Functions (serverless)
- PlanetScale (MySQL) ou MongoDB Atlas
- Netlify Identity (auth)

**Prós:**
- ✅ Integração nativa com Netlify
- ✅ Functions serverless incluídas
- ✅ Deploy automático

**Contras:**
- ❌ Mais complexo de configurar
- ❌ Múltiplos serviços para gerenciar
- ❌ Cold starts nas functions

## 📊 Estrutura de Dados Proposta

```javascript
// Firestore/Supabase structure
users: {
  [userId]: {
    email: "user@email.com",
    name: "Nome do Usuário",
    avatar: "https://...",
    createdAt: timestamp
  }
}

projects: {
  [projectId]: {
    name: "Tradicional Customizado",
    description: "Projeto baseado no template tradicional",
    geometry: "0 28\n50 26\n100 30\n150 38",
    geometryStats: {
      totalLength: 155,
      volume: 245.5,
      pointCount: 4
    },
    analysisResults: [
      {
        note: "C3",
        frequency: 131.5,
        centDiff: -5,
        amplitude: 0.85
      }
    ],
    metadata: {
      effectiveLength: 155,
      volume: 245.5,
      averageRadius: 15.2
    },
    userId: "user123",
    currentUnit: "metric",
    tags: ["tradicional", "customizado"],
    isPublic: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1
  }
}

// Para projetos públicos (opcional)
public_projects: {
  [projectId]: {
    // Mesma estrutura, mas sem userId
    // Aprovado por moderação
    isApproved: true,
    downloads: 145,
    likes: 23
  }
}
```

## 🛠️ Plano de Implementação Detalhado

### Sprint 1: Autenticação Básica (2-3 dias)
**Objetivos:**
- Setup do Firebase/Supabase
- Login/logout com Google
- Estado de autenticação global
- UI básica de autenticação

**Tarefas:**
- [ ] Criar conta Firebase/Supabase
- [ ] Configurar autenticação social
- [ ] Implementar AuthProvider/Context
- [ ] Criar componente de Login
- [ ] Adicionar estado de user no app
- [ ] Configurar variáveis de ambiente
- [ ] Testar deploy no Netlify

**Arquivos a criar/modificar:**
- `src/firebase-config.js`
- `src/contexts/AuthContext.js`
- `src/components/Auth/LoginModal.js`
- `src/services/AuthService.js`
- `netlify.toml`

### Sprint 2: CRUD de Projetos (3-4 dias)
**Objetivos:**
- Salvar projetos na nuvem
- Listar projetos do usuário
- Carregar projeto existente
- Deletar projetos

**Tarefas:**
- [ ] Implementar ProjectService
- [ ] Modificar ProjectManager existente
- [ ] Sincronizar com estado local
- [ ] Adicionar loading states
- [ ] Tratamento de erros
- [ ] Validação de dados
- [ ] Testes básicos

**Arquivos a criar/modificar:**
- `src/services/ProjectService.js`
- `src/components/ProjectManager.js` (atualizar)
- `src/hooks/useProjects.js`

### Sprint 3: UI/UX Avançada (2-3 dias)
**Objetivos:**
- Interface intuitiva para projetos
- Busca e filtros
- Sincronização visual
- Feedback de estados

**Tarefas:**
- [ ] Redesign do modal de projetos
- [ ] Adicionar search/filter
- [ ] Estados de loading/erro
- [ ] Confirmações de deleção
- [ ] Sync indicators
- [ ] Responsive design

**Componentes:**
- `ProjectListModal.js`
- `ProjectCard.js`
- `ProjectFilters.js`
- `SyncIndicator.js`

### Sprint 4: Features Extras (2-3 dias)
**Objetivos:**
- Compartilhamento de projetos
- Import/export
- Offline support
- Analytics básicas

**Tarefas:**
- [ ] Projetos públicos (opcional)
- [ ] Share links
- [ ] Export para JSON/CSV
- [ ] Offline caching
- [ ] Usage analytics
- [ ] Backup/restore

## 💰 Análise de Custos

### Opção 1: Local Storage
- **Desenvolvimento:** 1-2 dias
- **Hospedagem:** $0/mês
- **Manutenção:** Mínima
- **Total mensal:** $0

### Opção 2: Firebase
- **Desenvolvimento:** 1 semana
- **Hospedagem:** $0/mês (até limites)
- **Escalabilidade:** $0.18/100k reads
- **Total mensal:** $0-25 (dependendo do uso)

### Opção 3: Supabase  
- **Desenvolvimento:** 1 semana
- **Hospedagem:** $0/mês (até 500MB)
- **Escalabilidade:** $25/mês (plano Pro)
- **Total mensal:** $0-25

### Opção 4: Netlify + PlanetScale
- **Desenvolvimento:** 1.5 semanas
- **Functions:** Incluídas no Netlify
- **Database:** $0/mês (5GB PlanetScale)
- **Total mensal:** $0-39

## 🎯 Recomendação Final

### Para Lançamento Inicial: **Firebase**

**Justificativa:**
1. **Custo zero** para começar
2. **Implementação rápida** (1 semana)
3. **Autenticação social** integrada
4. **Real-time sync** automático
5. **Offline first** por padrão
6. **Escalável** conforme crescimento

### Roadmap de Features:

**v1.0 - MVP (1 semana):**
- ✅ Autenticação Google
- ✅ Salvar/carregar projetos pessoais
- ✅ Lista de projetos com busca
- ✅ Sync automático

**v1.1 - Melhorias (2-3 dias):**
- ✅ Tags e categorias
- ✅ Export/import
- ✅ Duplicar projetos
- ✅ Histórico básico

**v1.2 - Social (1 semana):**
- ✅ Projetos públicos
- ✅ Galeria de templates
- ✅ Sistema de likes
- ✅ Compartilhamento

## 🚀 Próximos Passos

Quando decidir implementar:

1. **Escolher provider** (Firebase recomendado)
2. **Configurar projeto** no console
3. **Implementar autenticação** primeiro
4. **CRUD básico** de projetos
5. **UI/UX polish**
6. **Testes e deploy**

## 📝 Considerações Técnicas

### Segurança:
- Validação client + server
- Rules/Policies para acesso
- Rate limiting automático

### Performance:
- Lazy loading de projetos
- Cache inteligente
- Pagination para muitos projetos

### Backup:
- Export automático (JSON)
- Sync com Google Drive (futuro)
- Versioning de projetos

---

*Documento criado em: 22 de agosto de 2025*  
*Status: Aguardando decisão de implementação*  
*Estimativa de desenvolvimento: 1-2 semanas*  
*Investimento inicial: $0*
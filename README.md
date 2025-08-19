# Haval Tool

<div align="center">
  <img src="public/icon.png" alt="Haval Tool Icon" width="128" height="128">
</div>

Uma aplicação desktop moderna construída com Tauri, React e TypeScript para gerenciamento e ferramentas relacionadas ao Haval.

## 🚀 Características

- **Interface Moderna**: Interface de usuário elegante e responsiva construída com React e Tailwind CSS
- **Aplicação Desktop**: Aplicação nativa multiplataforma usando Tauri
- **Performance**: Rápida e eficiente, com baixo consumo de recursos
- **Multiplataforma**: Suporte para Windows, macOS e Linux

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **Bun** (recomendado) ou npm/yarn
- **Rust** (para compilação do Tauri)
- **Git**

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/tontonhaval/haval-tool.git
cd haval-tool
```

### 2. Instale as dependências
```bash
# Usando Bun (recomendado)
bun install
```

### 3. Instale as dependências do Rust
```bash
cd src-tauri
cargo install tauri-cli
cd ..
```

## 🚀 Desenvolvimento

### Executar em modo de desenvolvimento
```bash
# Usando Bun
bun run tauri dev

# Ou usando npm
npm run tauri dev

# Ou usando yarn
yarn tauri dev
```

### Build para produção
```bash
# Usando Bun
bun run tauri build

# Ou usando npm
npm run tauri build

# Ou usando yarn
yarn tauri build
```

## 📦 Scripts Disponíveis

- `bun run dev` - Inicia o servidor de desenvolvimento Vite
- `bun run build` - Compila o projeto para produção
- `bun run preview` - Visualiza o build de produção
- `bun run tauri dev` - Executa a aplicação Tauri em modo desenvolvimento
- `bun run tauri build` - Cria o executável da aplicação

## 🏗️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Tauri (Rust)
- **Build Tool**: Vite
- **Package Manager**: Bun
- **UI Components**: Lucide React

## 📁 Estrutura do Projeto

```
haval-tool-gui/
├── src/                    # Código fonte React/TypeScript
│   ├── components/         # Componentes reutilizáveis
│   ├── screens/           # Telas da aplicação
│   └── main.tsx           # Ponto de entrada
├── src-tauri/             # Código Rust do Tauri
│   ├── src/               # Código fonte Rust
│   └── tauri.conf.json    # Configuração do Tauri
├── public/                # Arquivos estáticos
└── package.json           # Dependências e scripts
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Aviso Legal e Limitação de Responsabilidade

**ISENÇÃO DE GARANTIAS E LIMITAÇÃO DE RESPONSABILIDADE**

Este software é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a, garantias de comercialização, adequação a um propósito específico e não violação.

**OS DESENVOLVEDORES E CONTRIBUINTES DESTE PROJETO NÃO SE RESPONSABILIZAM POR:**

- Quaisquer danos diretos, indiretos, incidentais, especiais, exemplares ou consequenciais
- Perda de dados, lucros, uso, boa vontade ou outras perdas intangíveis
- Danos resultantes do uso ou incapacidade de usar este software
- Danos causados por bugs, falhas de segurança ou vulnerabilidades no software
- Qualquer prejuízo financeiro, técnico ou de qualquer outra natureza
- Danos a sistemas, hardware, software ou dados de terceiros

**USO POR SUA CONTA E RISCO**

O uso deste software é feito inteiramente por sua conta e risco. Você é responsável por:
- Fazer backup de seus dados antes de usar o software
- Testar o software em um ambiente seguro antes de uso em produção
- Verificar a compatibilidade com seus sistemas e requisitos
- Implementar medidas de segurança adequadas

**RECOMENDAÇÕES**

- Sempre faça backup de dados importantes antes de usar qualquer ferramenta
- Teste o software em um ambiente de desenvolvimento antes de uso em produção
- Mantenha seus sistemas e dependências atualizados
- Reporte bugs e problemas através das issues do GitHub

Ao usar este software, você concorda com estes termos e reconhece que os desenvolvedores não podem ser responsabilizados por quaisquer danos que possam ocorrer.

## 📞 Suporte

Se você encontrar problemas ou tiver dúvidas, apenas chore
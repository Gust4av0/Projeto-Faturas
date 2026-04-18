# Guia de Teste - Sistema de Faturas com PDF

## Mudanças Implementadas

### ✅ Detecção Inteligente de Senhas

- Sistema agora detecta corretamente se um PDF tem senha ou não
- PDFs sem senha são processados imediatamente
- PDFs com senha solicitam a senha via modal

### ✅ Processamento de PDF

- PDF sem senha: Gera automaticamente com descrição intercalada
- PDF com senha: Abre modal, usuário digita senha, processa com descrição

### ✅ Interface Melhorada

- Mensagens de erro mais claras
- Modal de senha com melhor UX
- Feedback visual durante processamento

---

## Teste 1: PDF SEM Senha ✓

### Pré-requisitos

1. Sistema iniciado (backend em :3001 e frontend em :5173)
2. Ter um PDF simples sem proteção

### Passos

1. Acesse http://localhost:5173
2. Crie uma nova fatura:
   - Clique em "Nova Fatura"
   - Título: "Boleto Teste 1"
   - Descrição: "Este é um boleto de teste sem senha"
   - Clique em "Salvar"

3. Na fatura criada, clique em "Importar PDF"
4. Arraste/selecione um PDF **SEM SENHA**
5. Clique em "Enviar"

### Resultado Esperado

❌ **NÃO DEVE** aparecer modal de senha  
✅ PDF deve ser processado imediatamente  
✅ Aparece mensagem de sucesso  
✅ PDF está pronto para download

---

## Teste 2: PDF COM Senha ✓

### Pré-requisitos

1. Sistema iniciado (backend em :3001 e frontend em :5173)
2. Ter um PDF protegido com senha (exemplo: "teste123")

### Passos

1. Acesse http://localhost:5173
2. Crie uma nova fatura:
   - Clique em "Nova Fatura"
   - Título: "Boleto Teste 2"
   - Descrição: "Este é um boleto de teste COM senha"
   - Clique em "Salvar"

3. Na fatura criada, clique em "Importar PDF"
4. Arraste/selecione um PDF **COM SENHA**
5. Clique em "Enviar"

### Resultado Esperado

✅ **DEVE** aparecer um alerta amarelo: "Este PDF está protegido com senha"  
✅ Campo de entrada de senha aparece  
✅ Digite a senha correta e clique "Enviar"  
✅ Se senha correta: PDF processado com sucesso  
❌ Se senha errada: Mensagem de erro "Senha do PDF inválida"

---

## Teste 3: Validação do PDF Gerado ✓

### Para ambos os casos (com e sem senha):

1. **Após o processamento bem-sucedido:**
   - Clique em "Baixar PDF"
   - Verifique se o arquivo foi baixado

2. **Valide o conteúdo do PDF:**
   - Abra o PDF baixado
   - Página 1: Deve ter o boleto/nota original
   - Página 2: Deve ter a descrição cadastrada com título "DESCRICAO DA FATURA"
   - Se PDF tinha mais páginas:
     - Página 3: Boleto/nota
     - Página 4: Descrição
     - ... e assim por diante

---

## Checklist de Validação

- [ ] PDF sem senha é processado sem pedir senha
- [ ] PDF com senha mostra modal pedindo senha
- [ ] Senha incorreta retorna erro
- [ ] Senha correta processa o PDF
- [ ] PDF final tem páginas intercaladas (original + descrição)
- [ ] Descrição aparece com formatação correta
- [ ] Descrição respeita tamanho da página original
- [ ] Download funciona corretamente
- [ ] Não há erros no console do servidor

---

## Logs para Verificar

### Backend (Terminal 1)

Procure por logs de sucesso:

```
✓ PDF protegido por senha - tentativa com pdfjs
✓ PDF detectado sem proteção
✓ Processando PDF...
✓ PDF salvo com sucesso
```

### Frontend (Terminal 2)

Deve estar funcionando normalmente sem erros

---

## Se Algo Não Funcionar

1. **PDF sem senha pede senha:**
   - Verifique se o PDF é realmente sem senha
   - Tente em outro programa (ex: Adobe Reader)
   - Possível problema na detecção - verificar logs do servidor

2. **Erro ao processar PDF com senha:**
   - Verifique se a senha está correta
   - Certifique-se de que pdfjs-dist está instalado em pdf-runtime
   - Verifique logs do servidor para mais detalhes

3. **PDF final não tem descrição:**
   - Verifique se a descrição foi cadastrada na fatura
   - Certifique-se de que descrição não está vazia
   - Verifique tamanho da descrição (não pode ser muito longa)

---

**Data das Mudanças:** 17 de Abril de 2026  
**Versão:** 1.0 - Detecção de Senha Melhorada

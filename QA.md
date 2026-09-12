# Roteiro de QA — VemVan

Checklist manual pra validar o que já está construído. Repita esse
roteiro sempre que eu avisar que subi uma mudança grande.

## 0. Pré-requisitos (uma vez, ou quando eu avisar de nova migração)

- [ ] Rodar a migração pendente no Supabase (Dashboard → SQL Editor):
      `supabase/migrations/0003_guardian_email_and_notifications.sql`
- [ ] Confirmar que o deploy mais recente já subiu (vemvan.vercel.app —
      olha a data/hora do último deploy no painel da Vercel)

⚠️ **Sobre e-mail**: sua conta Resend ainda não tem domínio verificado.
Nesse modo, o remetente de teste (`onboarding@resend.dev`) só consegue
mandar e-mail pro **próprio e-mail da sua conta Resend**
(`matheusopme@gmail.com`). Pra receber a notificação de check-in
durante o teste, o **responsável de teste precisa usar esse mesmo
e-mail** ao criar a conta — com outro e-mail, o check-in funciona
normal, só o e-mail não chega (e isso é esperado, não é bug).

## 1. Cadastro do motorista

- [ ] Abrir `vemvan.vercel.app/cadastro`
- [ ] Criar conta com nome da van, e-mail e senha
- [ ] Confirma que cai direto no Dashboard do motorista (`/motorista`)

## 2. Cadastrar aluno + responsável

- [ ] `/motorista/alunos` → **+ Novo Aluno** → preencher e salvar
- [ ] Cair automaticamente no dossiê do aluno recém-criado
- [ ] Abrir "+ Adicionar responsável" → preencher → salvar
- [ ] O responsável aparece na lista com badge **Pendente**
- [ ] Clicar em **Copiar link de convite** (deve copiar algo tipo
      `.../convite/xxxxxxxx-...`)

## 3. Vínculo do responsável

- [ ] Abrir o link copiado numa aba anônima (ou outro navegador)
- [ ] Criar conta usando **o e-mail da sua conta Resend** (ver aviso
      acima) + uma senha
- [ ] Confirma que cai em `/responsavel` mostrando o aluno cadastrado,
      status "Aguardando coleta"
- [ ] Voltar na aba do motorista, recarregar o dossiê do aluno → o
      responsável agora deve aparecer como **Vinculado**

## 4. Check-in e notificação (o coração do produto)

- [ ] Motorista: `/motorista/rota` → deve listar o aluno cadastrado
- [ ] Clicar **Coletar**
- [ ] Aba do responsável: recarregar `/responsavel` → deve mostrar
      **"Na van — a caminho"** com o horário
- [ ] Checar a caixa de entrada do e-mail de teste → deve ter chegado
      "[Aluno] embarcou na van"
- [ ] Motorista: clicar **Confirmar entrega**
- [ ] Responsável: recarregar → deve mostrar **"Entregue com
      segurança"**
- [ ] Conferir o segundo e-mail

## 5. Segurança básica

- [ ] Deslogado, tentar acessar `/motorista` direto pela URL → deve
      cair no `/login`
- [ ] Logado como responsável, tentar acessar `/motorista` → também
      deve barrar (cada papel só entra na sua área)
- [ ] Copiar o link de convite de um responsável **já vinculado** e
      tentar abrir de novo → deve dar erro de "convite inválido ou já
      utilizado"

## 6. PWA (instalar como app)

- [ ] No celular, abrir `vemvan.vercel.app/motorista` (ou
      `/responsavel`) no Chrome/Safari
- [ ] Adicionar à Tela de Início
- [ ] Confirmar que abre em tela cheia (sem barra do navegador) e com
      o ícone da VemVan

---

Qualquer passo que falhar, me manda: em qual etapa, o que esperava
acontecer e o que aconteceu de verdade (print ajuda bastante).

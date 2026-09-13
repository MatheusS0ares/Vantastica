# Roteiro de QA — VemVan

Checklist manual pra validar o que já está construído. Repita esse
roteiro sempre que eu avisar que subi uma mudança grande.

## 0. Pré-requisitos

- [ ] Rodar no Supabase (Dashboard → SQL Editor), na ordem, as migrações
      que ainda não rodaram:
      `0007_student_expected_times.sql`,
      `0008_shifts.sql`,
      `0009_organization_invites.sql`,
      `0010_invoices_unique_month.sql`
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

## 2. Cadastrar aluno + configurar turnos

- [ ] `/motorista/alunos` → **+ Novo Aluno** → preencher e salvar
- [ ] Cair automaticamente no dossiê do aluno recém-criado
- [ ] No dossiê, abrir **Editar turnos** e configurar pelo menos o
      turno **Matutino** (horário de busca e de entrega)
- [ ] Salvar e confirmar que o card "Turnos" agora mostra o Matutino
      com os horários certos
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

## 4. Rota de Hoje — ciclo completo do turno (coração do produto)

Um turno é a ida-e-volta inteira, não só um embarque e uma entrega.

- [ ] Motorista: `/motorista/rota` → confirmar que abre na aba
      **Matutino** (ou a aba correspondente à hora atual) e lista o
      aluno cadastrado
- [ ] Tocar **Coletar** → confirmar no modal → status deve virar
      **"A caminho da escola"**
- [ ] Aba do responsável: recarregar `/responsavel` → deve mostrar
      **"Na van — a caminho"**
- [ ] Checar e-mail de teste → deve ter chegado aviso de embarque
- [ ] Motorista: tocar **Confirmar chegada na escola** → status vira
      **"Na escola"**
- [ ] Motorista: tocar **Buscar na escola** → status vira **"A
      caminho de casa"**
- [ ] Motorista: tocar **Confirmar entrega em casa** → status vira
      **"Entregue"**, sem mais botões de ação pra esse aluno/turno
- [ ] Responsável: recarregar → deve mostrar **"Entregue com
      segurança"**

## 5. Ausência

- [ ] Em outro aluno (ou no dia seguinte), tocar **Ausente** logo no
      início do turno → status vira **"Ausente"**, sem mais botões
- [ ] Testar também marcar **Ausente** na etapa "Na escola" (segunda
      busca) — deve travar o turno do mesmo jeito, mas o relatório
      (próximo item) continua mostrando os horários de busca/chegada
      que já tinham acontecido antes da ausência

## 6. Relatório de pontualidade

- [ ] No dossiê do aluno, tocar **Ver relatório →**
- [ ] Conferir a seção **Hoje**: mostra os horários reais de cada
      etapa do turno, com selo **"No horário"** ou **"Atrasado
      Xmin"** comparando com o horário previsto
- [ ] Conferir **Últimos 30 dias**: deve acumular os dias testados

## 7. Financeiro

- [ ] `/motorista/financeiro` → cadastrar a **Chave PIX** da
      organização
- [ ] **+ Nova mensalidade**: lançar uma fatura individual pro aluno
      de teste
- [ ] **+ Gerar mensalidades do mês**: gerar em lote pra todos os
      alunos ativos → conferir que quem já tinha mensalidade nesse mês
      não duplicou
- [ ] Marcar uma fatura como **Paga** → status muda
- [ ] Responsável: `/responsavel/financeiro` → deve ver a fatura atual
      e a chave PIX pra copiar

## 8. Ocorrências

- [ ] No dossiê do aluno, **+ Registrar ocorrência** → preencher e
      salvar
- [ ] Ocorrência aparece na lista do dossiê
- [ ] Responsável: `/responsavel/historico` → ocorrência aparece em
      "Avisos"

## 9. Perfil (van + calendário + motoristas)

- [ ] `/motorista/perfil` → editar nome/telefone da van e salvar
- [ ] **+ Novo evento no calendário** → cadastrar um feriado
- [ ] Responsável: `/responsavel/calendario` → o feriado aparece em
      "Próximos eventos"
- [ ] Em **Motoristas**, tocar **+ Convidar motorista** → deve
      aparecer um convite pendente com botão de copiar link
- [ ] Abrir o link copiado numa aba anônima, criar uma segunda conta
      de motorista → deve cair em `/motorista` da **mesma organização**
      (mesmos alunos, mesma rota)
- [ ] Voltar no perfil da primeira conta → contagem de motoristas deve
      ter subido pra 2 e o convite não aparece mais como pendente

## 10. Segurança básica

- [ ] Deslogado, tentar acessar `/motorista` direto pela URL → deve
      cair no `/login`
- [ ] Logado como responsável, tentar acessar `/motorista` → também
      deve barrar (cada papel só entra na sua área)
- [ ] Copiar o link de convite de um responsável **já vinculado** e
      tentar abrir de novo → deve dar erro de "convite inválido ou já
      utilizado" (mesma coisa pro convite de motorista já usado)

## 11. PWA (instalar como app)

- [ ] No celular, abrir `vemvan.vercel.app/motorista` (ou
      `/responsavel`) no Chrome/Safari
- [ ] Adicionar à Tela de Início
- [ ] Confirmar que abre em tela cheia (sem barra do navegador) e com
      o ícone da VemVan

## 12. Feedback ao toque

- [ ] Em qualquer botão do app (Coletar, Salvar, abas de turno, etc.),
      confirmar que dá um leve "aperto" visual assim que toca, antes
      da tela atualizar

---

Qualquer passo que falhar, me manda: em qual etapa, o que esperava
acontecer e o que aconteceu de verdade (print ajuda bastante).

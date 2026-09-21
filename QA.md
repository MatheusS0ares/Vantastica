# Roteiro de QA — VanTástica

Checklist manual pra validar o que já está construído. Repita esse
roteiro sempre que eu avisar que subi uma mudança grande.

## 0. Pré-requisitos

- [ ] Rodar no Supabase (Dashboard → SQL Editor), na ordem, as migrações
      que ainda não rodaram:
      `0007_student_expected_times.sql`,
      `0008_shifts.sql`,
      `0009_organization_invites.sql`,
      `0010_invoices_unique_month.sql`,
      `0011_platform_admin_and_branding.sql`,
      `0012_vehicle_locations.sql`,
      `0013_student_shift_sequence.sql`,
      `0014_get_user_context_rpc.sql` (⚠️ **precisa rodar essa antes do
      próximo deploy** — o código já espera essa função existir)
- [ ] Virar admin da plataforma (só dá pra fazer direto no banco, de
      propósito): no SQL Editor, rodar
      `insert into platform_admins (user_id) select id from auth.users where email = 'SEU_EMAIL_AQUI';`
      trocando pelo e-mail da conta que você já usa pra logar no VanTástica
- [ ] Confirmar que o deploy mais recente já subiu (vantastica.com.br —
      olha a data/hora do último deploy no painel da Vercel)

⚠️ **Sobre e-mail**: o domínio `vantastica.com.br` já está verificado no
Resend, então o check-in deve chegar em **qualquer e-mail** de
responsável de teste (não só no seu). Se não chegar, confira a caixa de
spam primeiro — domínio novo ainda está construindo reputação — antes
de considerar bug.

## 1. Cadastro do motorista

- [ ] Abrir `vantastica.com.br/cadastro`
- [ ] Criar conta com nome da van, e-mail e senha
- [ ] Confirma que cai direto no Dashboard do motorista (`/motorista`)

## 2. Cadastrar aluno + configurar turnos

- [ ] `/motorista/alunos` → **+ Novo Aluno** → preencher e salvar
- [ ] Cair automaticamente no dossiê do aluno recém-criado
- [ ] No dossiê, abrir **Editar turnos** e configurar pelo menos o
      turno **Matutino** (horário de busca e de entrega)
- [ ] Salvar e confirmar que o card "Turnos" agora mostra o Matutino
      com os horários certos
- [ ] Cadastrar um segundo aluno sem configurar turno nenhum
- [ ] `/motorista/rota` na aba de um turno sem ninguém configurado →
      tocar **Configurar turnos** → deve cair em
      `/motorista/alunos/turnos` já filtrado nesse turno, listando só
      quem está sem horário
- [ ] Preencher busca/entrega de um dos alunos listados e tocar
      **Salvar horários preenchidos** → deve mostrar confirmação e
      esse aluno some da lista de pendentes (some da tela, já que
      ficou configurado)
- [ ] Abrir "+ Adicionar responsável" → preencher → salvar
- [ ] O responsável aparece na lista com badge **Pendente**
- [ ] Clicar em **Copiar link de convite** (deve copiar algo tipo
      `.../convite/xxxxxxxx-...`)

## 3. Vínculo do responsável

- [ ] Abrir o link copiado numa aba anônima (ou outro navegador)
- [ ] Criar conta usando um e-mail de teste (qualquer um — ver aviso
      sobre domínio verificado acima) + uma senha
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

## 9. Perfil (van + identidade visual + calendário + motoristas)

- [ ] `/motorista/perfil` → editar nome/telefone/placa/modelo/capacidade
      da van e salvar
- [ ] Em **Identidade Visual**, enviar uma logo → confirmar que ela
      aparece no topo do app do motorista (ao lado do nome da
      organização) depois de recarregar
- [ ] Enviar também uma foto da van → confirmar que ela aparece no
      card
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

## 10. Admin da plataforma

- [ ] Logado com a conta que você tornou admin (passo 0), abrir
      `/admin` → deve listar **todas** as organizações cadastradas
      (mesmo as que você não criou), com contagem de motoristas/alunos
- [ ] Tocar **Entrar como [organização de teste]** → deve cair em
      `/motorista` dessa organização, com uma faixa azul no topo
      "Modo admin — vendo como esta organização"
- [ ] Usar o app normalmente nesse modo (ver um aluno, registrar um
      check-in) → deve funcionar exatamente como se fosse o motorista
      dono da organização
- [ ] Tocar **Sair** na faixa azul → deve voltar pra `/admin`
- [ ] Confirmar que uma conta comum de motorista (não-admin) continua
      **sem** acesso a `/admin` (deve cair no login se tentar acessar
      a URL direto)

## 11. Segurança básica

- [ ] Deslogado, tentar acessar `/motorista` direto pela URL → deve
      cair no `/login`
- [ ] Logado como responsável, tentar acessar `/motorista` → também
      deve barrar (cada papel só entra na sua área)
- [ ] Copiar o link de convite de um responsável **já vinculado** e
      tentar abrir de novo → deve dar erro de "convite inválido ou já
      utilizado" (mesma coisa pro convite de motorista já usado)

## 12. PWA (instalar como app)

- [ ] No celular, abrir `vantastica.com.br/motorista` (ou
      `/responsavel`) no Chrome/Safari
- [ ] Adicionar à Tela de Início
- [ ] Confirmar que abre em tela cheia (sem barra do navegador) e com
      o ícone da VanTástica

## 13. Feedback ao toque

- [ ] Em qualquer botão do app (Coletar, Salvar, abas de turno, etc.),
      confirmar que dá um leve "aperto" visual assim que toca, antes
      da tela atualizar

## 14. Localização ao vivo (GPS)

Precisa de dois celulares (ou um celular + notebook com GPS/localização
aproximada) — um como motorista, outro como responsável.

- [ ] Motorista: `/motorista/rota` → tocar **Compartilhar** no card
      "Localização ao vivo" → o navegador deve pedir permissão de
      localização → aceitar
- [ ] Confirma que aparece "Localização sendo enviada" no card
- [ ] Responsável: abrir `/responsavel` → deve aparecer um mapa com um
      pino na posição do motorista, atualizando a cada ~12s
- [ ] Mover o celular do motorista (ou simular outra localização) →
      conferir que o pino se move no mapa do responsável em menos de
      1 minuto
- [ ] Motorista: tocar **Parar** → depois de 5 minutos sem atualização,
      o mapa do responsável deve voltar a mostrar "Sem localização em
      tempo real no momento"
- [ ] Confirmar que um responsável de **outra organização** não vê
      esse mapa nem essa localização (isolamento entre organizações)

## 15. Sequência de paradas

- [ ] Cadastrar (ou usar) pelo menos 3 alunos no mesmo turno em
      `/motorista/rota`
- [ ] Confirmar que aparecem as setinhas **↑/↓** ao lado de cada aluno
      da lista (só aparecem quando há mais de um aluno no turno)
- [ ] Tocar **↓** no primeiro aluno da lista → ele deve trocar de
      posição com o segundo
- [ ] Recarregar a página → a nova ordem deve se manter (a sequência é
      salva, não só visual)
- [ ] No primeiro aluno da lista, a seta **↑** deve estar desabilitada;
      no último, a seta **↓** deve estar desabilitada
- [ ] Trocar de turno (aba Vespertino, por exemplo) → a sequência de um
      turno não deve afetar a ordem dos alunos nos outros turnos

## 16. Componentes de UI novos (toasts, modais, calendário, etc.)

- [ ] Fazer uma ação com sucesso (ex.: salvar aluno) e uma com erro
      (ex.: submeter um formulário inválido, se houver como) → toast
      aparece no topo da tela e some sozinho
- [ ] No dossiê do aluno, tocar num check-in → no celular deve abrir
      como **gaveta** subindo de baixo; no desktop (tela larga), deve
      abrir como **modal** centralizado
- [ ] No financeiro, abrir o seletor de aluno → deve permitir buscar
      digitando o nome (combobox), não só rolar uma lista
- [ ] No perfil, ao lançar um evento de calendário, o campo de data deve
      abrir um calendário visual (não só um input de texto)
- [ ] Seções expansíveis (turnos, ocorrências, etc.) devem abrir/fechar
      suavemente, sem "pulo" brusco de layout
- [ ] Excluir um evento de calendário → deve pedir confirmação num
      modal antes de excluir de fato
- [ ] Enquanto uma tela carrega dados (ex.: entrar em `/motorista/rota`
      numa conexão lenta), deve aparecer um esqueleto cinza piscando no
      lugar do conteúdo, não uma tela em branco

## 17. Páginas de erro

- [ ] Acessar uma URL que não existe (ex.: `vantastica.com.br/xyz123`)
      → deve mostrar a página 404 com a marca VanTástica, não o erro
      genérico da Vercel
- [ ] Se possível provocar um erro real numa tela (ex.: pedir pra mim
      simular um), confirmar que aparece a tela "Algo deu errado" com
      botão **Tentar de novo**, também com a marca do app

## 18. SEO e compartilhamento

- [ ] Colar o link `vantastica.com.br` no WhatsApp (pra você mesmo, por
      exemplo) → deve aparecer um card de preview com título, descrição
      e a imagem oficial da VanTástica (não um card vazio)
- [ ] Abrir `vantastica.com.br/robots.txt` → deve listar as rotas
      privadas bloqueadas (`/motorista`, `/responsavel`, `/admin`) e
      apontar pro sitemap
- [ ] Abrir `vantastica.com.br/sitemap.xml` → deve listar as páginas
      públicas (`/`, `/login`, `/cadastro`, `/privacidade`, `/termos`)

## 19. Política de Privacidade e Termos de Uso

- [ ] No rodapé da landing (`vantastica.com.br`), os links **Política
      de Privacidade** e **Termos de Uso** abrem as páginas certas
- [ ] Nas telas de cadastro (motorista em `/cadastro` e responsável via
      link de convite), aparece o aviso de concordância com os Termos e
      a Política, com os links funcionando
- [ ] Ler o texto e confirmar que faz sentido pro seu negócio — **isto
      não é aconselhamento jurídico**; recomendo revisar com um
      advogado antes de divulgar amplamente, principalmente pela parte
      de dados de crianças (LGPD)

---

Qualquer passo que falhar, me manda: em qual etapa, o que esperava
acontecer e o que aconteceu de verdade (print ajuda bastante).

Qualquer passo que falhar, me manda: em qual etapa, o que esperava
acontecer e o que aconteceu de verdade (print ajuda bastante).

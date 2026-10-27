# Equilíbrio

MVP de bem-estar pessoal para registrar um check-in diário e acompanhar pequenas ações de autocuidado. A interface está em português do Brasil e funciona sem conta ou servidor.

## Como executar

Abra `index.html` em um navegador moderno. Não é necessário instalar dependências ou iniciar um servidor.

## Funcionalidades

- Check-in diário com estado emocional e anotação opcional.
- Quatro passos simples de autocuidado, que podem ser marcados e desmarcados.
- Resumo dos check-ins e passos concluídos nos últimos sete dias.
- Dados armazenados localmente no navegador; nenhum dado é enviado a um servidor.
- Layout adaptável para celular e desktop, com controles acessíveis por teclado.

Os dados ficam no navegador e podem ser apagados limpando o armazenamento local. Este MVP não substitui acompanhamento profissional.

## Deploy no GitHub Pages

O site é publicado automaticamente pelo GitHub Actions quando há um push na branch `main`. Depois que o deploy terminar, ele ficará disponível em:

https://tecinfo2a.github.io/equilibrio/

Na primeira publicação, confirme em **Settings > Pages** que a origem de build está configurada como **GitHub Actions**.

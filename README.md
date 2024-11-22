![iRecipes](https://storage.googleapis.com/irecipes-images/assets/logo-transparent.png)


 ## Índice 
 * [Objetivo](#objetivo) 
 * [Escopo](#escopo) 
 * [Contexto](#contexto)
 * [Restrições](#restricoes)
 * [Trade Offs](#trade-offs)
 * [C4 Model](#c4-model)
 * [Requisitos e Casos de Uso](#requisitos-e-casos-de-uso)
 * [Modelagem](#modelagem)


## Objetivo

Este projeto tem como objetivo principal ser uma rede social para postagem de receitas em vídeos curtos e dinâmicos, iRecipes, foca em facilitar o dia a dia das pessoas fornecendo conteúdos de receitas que elas gostam conforme o algoritmo dinâmico. Sendo fácil e prático de utilizar utilizando os mesmos padrões de outras redes sociais.

## Escopo

iRecipes tem como objetivo ser uma rede social onde as pessoas compartilham suas receitas postem vídeos as ensinando, dando dicas culinárias. Tem como meta revolucionar o meio de como se aprende a cozinhar e a consumir conteúdos sobre. Assim como, incitando o usuário compartilhar novas descobertas com seus seguidores e amigos.

 * Produtos do Projeto
    * Plataforma de Rede Social: O aplicativo irá funcionar como uma rede social, permitindo os usuários a criarem perfis, seguir outros usuários, e interagir com postagens das receitas.
    * Sistema de Postagem de Vídeos Curtos: Terá uma seção para realizar a postagem do vídeo pré-gravado podendo adicionar título, descrição da receita e suas tags para relaciona-lo no algoritmo.
    * Feed Personalizado: Terá um feed de conteúdo dinâmico que exibirá vídeos e postagens de receitas de acordo com as preferências e o uso dos usuários, assim sendo sempre sugestões personalizadas.
    * Sistema de Interação e Compartilhamento: Também irá permitir que os usuários compartilhem com amigos e familiares as novas descobertas de receitas, assim como deem like e comentem nas postagens.

  * Coleta de dados
    * Cadastro de Usuários: terá um cadastro de usuários, onde será necessário informar nome, e-mail e senha.
    * Preferências do Usuário: irá coletar dados sobre as preferências do usuário, como tipo de receitas preferidas, ingredientes favoritos, entre outros.
    * Interações do Usuário: será coletado dados sobre as interações do usuário, como likes, comentários e compartilhamentos.
    * Galeria de fotos: O apliativo fará uso da galeria de fotos do dispositivo para que o usuário possa escolher a foto de perfil e postar seus vídeos.
    * Logs e Erros: Será deixado em código logs de erros para facilitar depuração no futuro.
 
 * Premissas
    * Conteúdo Breve: Tem foco em vídeos curtos e dinâmicos, com fácil entendimento.
    * Facilidade de Uso: O aplicativo deve ser intuitivo e fácil de usar, com uma interface amigável.
    * Receitas Simples: As receitas devem ser fáceis de serem reproduzidas em casa.
    * Algoritmo Dinâmico: O feed de conteúdo deve ser personalizado de acordo com as preferências do usuário.

 * Exclusões do Escopo
    * Cálculo Nutricional: Não terá cálculo nutricional das receitas postadas.
    * Receitas Complexas: Não terá receitas complexas que necessitem de muitos ingredientes ou técnicas avançadas.
    * Funcionalidades de câmera e edição de vídeo: Não terá funcionalidades de câmera e edição de vídeo no aplicativo.
    * Compra de Ingredientes: Não terá funcionalidades de compra de ingredientes para as receitas postadas.

 * Pré processamento
    * Será utilizado MongoDB para armazenar os dados dos usuários e das receitas.

 * Design
    * Neste projeto se fará uso de sketchs para o design do aplicativo.

 * Desenvolvimento
    * Será utilizado React Native em conjunto com Expo Go para o desenvolvimento do aplicativo, utilizando no backend Python com Flask e MongoDB.

 * CI/CD
    * A API será hospedada no Google Cloud e o aplicativo será publicado na App Store no TestFlight.
  
 * Observabilidade
    * Para monitoramento de logs na API, o google cloud fica responsável por isso, para front end a própria ferramenta do expo.


## Contexto

O projeto iRecipes visa desenvolver uma rede social de culinária adequada à era dos conteúdos dinâmicos, com foco em vídeos curtos. Diante da realidade em que o tempo das pessoas é precioso e a preferência por conteúdos breves é crescente.
Alguns dos problemas a serem abordados pelo projeto são: a falta de tempo para consumir conteúdo longo e maçante sobre culinária, a dificuldade em encontrar receitas que se adequem as necessidades do usuário ou às preferências alimentares do mesmo e a falta de interação e compartilhamento de receitas simples e rápidas. 

## Restrições

 * Tecnologia: O aplicativo será desenvolvido para dispositivos móveis, com foco em smartphones IOS e Android.
 * Recursos: O projeto terá um orçamento limitado para o desenvolvimento do aplicativo.

## Trade Offs

 - **Qualidade x Custo:** 
 
  O projeto terá um orçamento limitado, o que pode impactar na qualidade do aplicativo.
 
 - **Inovação x Risco:** 
 
  O projeto visa inovar no mercado de culinária, o que pode trazer riscos para o negócio.

 - **Portabilidade x Desempenho:**

  O aplicativo será desenvolvido para dispositivos móveis IOS e Android, o que pode impactar no desempenho do aplicativo.

 - **Usabilidade:**
  
  Está sendo seguido os últimos padrões de usabilidade para redes sociais.

 - **Manutenabilidade:**
  
  O código está sendo desenvolvido seguindo boas práticas de programação para facilitar a manutenção no futuro.

## C4 Model

O diagrama do sistema com base no C4 Model pode ser encontrado na pasta [`docs`](docs/c4.drawio.png) do repositório.

## Requisitos e Casos de Uso

 - **Requisitos Funcionais:**

  * RF01 - Cadastro de Usuário: O sistema deve permitir o cadastro de novos usuários.
  * RF02 - Login de Usuário: O sistema deve permitir o login de usuários cadastrados.
  * RF03 - Postagem de Vídeo: O sistema deve permitir a postagem de vídeos de receitas.
  * RF04 - Feed de Conteúdo: O sistema deve exibir um feed de conteúdo personalizado para cada usuário.
  * RF05 - Interação com Postagens: O sistema deve permitir que os usuários interajam com as postagens, dando like, comentando e compartilhando.
  * RF06 - Busca de Receitas: O sistema deve permitir a busca de receitas por título, descrição e tags.
  * RF07 - Edição de Perfil: O sistema deve permitir a edição do perfil do usuário.
  * RF08 - Seguir Usuários: O sistema deve permitir que os usuários sigam outros usuários.

  - **Requisitos Não Funcionais:**

  * RNF01 - Usabilidade: O sistema deve ser intuitivo e fácil de usar.
  * RNF02 - Desempenho: O sistema deve ter um bom desempenho, mesmo em dispositivos móveis.
  * RNF03 - Segurança: O sistema deve garantir a segurança dos dados dos usuários.
  * RNF04 - Escalabilidade: O sistema deve ser escalável para suportar um grande número de usuários.
  * RNF05 - Disponibilidade: O sistema deve estar disponível 24 horas por dia, 7 dias por semana.

  - **Casos de Uso:**

  O diagrama de casos de uso pode ser encontrado na pasta [`docs`](docs/use-case.drawio.png) do repositório.

## Modelagem

O acompanhamento do projeto foi feito utilizando o Trello.

## Como rodar o projeto

### API

Para rodar a API, siga o readme do diretório [`api`](api/README.md).

### Mobile

Para rodar o aplicativo mobile será necessário ter o Expo Go instalado no seu dispositivo móvel, siga o readme do diretório [`mobile`](mobile/README.md).

### Usuários para total acesso a aplicação

   * Email: joao@yopmail.com
   * Senha: 123Joao

   * Email: bestchef@gmail.com (Tem o maior número de posts)
   * Senha: 123Best

## Como contribuir?

Para contribuir com este projeto crie uma branch a partir da staging, crie seu PR com a nova feature/fix e espere pela aprovação.
Após isso o merge poderá ser feito para teste em staging e com isso tendo a possibilidade de ser feito deploy para produção (master).


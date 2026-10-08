No visão geral => /dashboard
    - Ulitmos 5 modelos utilizados
    - ultimos 3 - 5 gerações
    - quantidade de token gasto (% do ultima top up)
    - Quantidade disponivel
    - Promoções do site 
    - Número de projetos ativos
    - Speed dial (O usuário escolhe o que colocar)
    - Banner de destaque (espaço no admin para escolher unico, vários, com ou sem link)

Créditos e Recarga -> dashboard/credits
    - Tirar menção ao mercado pago
    - Melhorar cor/contraste de BÔNUS VIP DOBRADO (+10 CR/DIA)

tasks -> Excluir essa página e do menu

Chat
    ## Error Type
Console Error

## Error Message
Erro no reconhecimento de voz: "network"


    at recognition.onerror (src/components/dashboard/chat/chat-view.tsx:271:17)

## Code Frame
  269 |
  270 |       recognition.onerror = (event: any) => {
> 271 |         console.error("Erro no reconhecimento de voz:", event.error);
      |                 ^
  272 |         setIsRecordingVoice(false);
  273 |       };
  274 |

Next.js version: 16.3.6 (Turbopack)

A biblia tem que ser conectada com projetos

No studio:


Em todos:

Melhorar barra de rolagem quando houver
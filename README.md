# Portale Video Tecnologie CGT-CAT
Portale web statico pensato per la consultazione rapida via QR code di video istruzioni, tutorial e contenuti tecnici CGT-CAT, con fruizione mobile-friendly.

## Contesto
Il progetto nasce per offrire un punto di accesso semplice e intuitivo a video operativi destinati agli utenti finali, con particolare attenzione all’utilizzo da smartphone.

## Obiettivo
Permettere all’utente di:
- cercare rapidamente il video di interesse
- filtrare i contenuti per macro tema o tipologia
- visualizzare il video direttamente all’interno della card selezionata

## Caratteristiche principali
- interfaccia mobile-friendly
- ricerca libera per parole chiave
- filtro per argomento
- player video embedded direttamente nella card
- struttura facilmente estendibile con nuovi video

## Struttura file
- index.html - struttura pagina
- styles.css - stile grafico e responsive
- videos.js - archivio contenuti video
- script.js - logica di rendering, ricerca, filtro e paginazione

## Gestione contenuti
Per aggiungere un nuovo video, inserire un nuovo oggetto nell’array presente in 'videos.js' con la seguente struttura:

```js
{
  id: 'id-univoco',
  title: 'Titolo video',
  description: 'Breve descrizione',
  theme: 'Macro tema',
  tag: 'Tag o tipologia',
  youtubeId: 'ID YouTube',
  homepage: false
}

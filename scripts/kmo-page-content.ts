/**
 * The KMO page content as it shipped before it moved into Sanity: the seed
 * for `pnpm kmo:seed`. After seeding, the Studio is the source of truth and
 * this file is only a starting point for a fresh dataset.
 */

type Feature = {name: string; detail: string; sheetOnly?: boolean}

export type KmoPackageSeed = {
  name: string
  shortName: string
  summary: string
  audience: string
  features: Feature[]
  priceFrom: number
  priceTo: number
  maintenanceFrom: number
  mock: 'phone' | 'portal' | 'tool'
  sheetHeadline: string
  sheetIntro: string
  painPoints: string[]
  stepNotes: string[]
  ownershipNote: string
}

export const KMO_PAGE_CONTENT = {
  eyebrow: 'Voor KMO’s · web en mobiel',
  title: 'Software op maat voor KMO’s',
  description:
    'Apps en webtools die papier, losse Excel-bestanden en eindeloze mails vervangen. Drie vaste pakketten met een duidelijke prijsvork en onderhoud.',
  intro:
    'Ik bouw apps en webtools die papier, losse Excel-bestanden en eindeloze mails vervangen. Drie vaste pakketten met een duidelijke prijsvork, en onderhoud zodat het blijft werken.',
  overviewNote: 'Elk pakket start met een verkenning van 1–2 dagen',
  packages: [
    {
      name: 'Werkbon- en inspectie-app',
      shortName: 'Werkbon- en inspectie-app',
      summary: 'Werkbonnen en inspecties op je gsm, ook zonder bereik. Het rapport maakt zichzelf.',
      audience: 'Voor installateurs, technici en inspecteurs',
      features: [
        {name: 'App', detail: 'iPhone en iPad, Android in overleg'},
        {name: 'Checklists', detail: 'Per type werk of toestel'},
        {name: "Foto's", detail: 'Met opmerkingen en handtekening'},
        {name: 'Offline', detail: 'Synchroniseert zodra er bereik is'},
        {name: 'PDF-rapport', detail: 'Automatisch naar klant en kantoor'},
        {name: 'Overzicht', detail: 'Op kantoor: wat is klaar, wat niet', sheetOnly: true},
      ],
      priceFrom: 12500,
      priceTo: 25000,
      maintenanceFrom: 160,
      mock: 'phone',
      sheetHeadline: 'Werkbonnen op je gsm, ook zonder bereik',
      sheetIntro:
        "Voor installateurs, technici en inspecteurs die nu werken met papier, foto's in WhatsApp en rapporten die 's avonds worden overgetypt.",
      painPoints: [
        'Werkbonnen die achteraf worden overgetypt',
        "Foto's en handtekeningen die zoekraken",
        'Geen bereik in kelders en technische ruimtes',
      ],
      stepNotes: [
        '1–2 dagen, €1.250. Verrekend als je doorgaat.',
        'Na elke fase test je met je team',
        'Op de toestellen van je team',
        'Updates, hosting en hulp',
      ],
      ownershipNote: 'Je app en je gegevens blijven van jou.',
    },
    {
      name: 'Klantenportaal',
      shortName: 'Klantenportaal',
      summary: 'Je klanten zien zelf hoe ver hun dossier staat, met alle documenten op één plek.',
      audience: 'Voor aannemers, maatwerk en dienstverleners',
      features: [
        {name: 'Portaal', detail: 'In je huisstijl, op je domein'},
        {name: 'Login', detail: 'Veilig, apart per klant', sheetOnly: true},
        {name: 'Status', detail: 'Per dossier, altijd actueel'},
        {name: 'Documenten', detail: 'Offertes, plannen en facturen'},
        {name: 'Vragen', detail: 'Per dossier, geen losse mails'},
        {name: 'Meldingen', detail: 'Bij elke nieuwe stap'},
      ],
      priceFrom: 15000,
      priceTo: 25000,
      maintenanceFrom: 190,
      mock: 'portal',
      sheetHeadline: 'Je klanten zien zelf hoe ver hun dossier staat',
      sheetIntro:
        'Voor aannemers, maatwerkbedrijven en dienstverleners die klanten op de hoogte houden van lopende bestellingen of dossiers.',
      painPoints: [
        'Klanten die bellen: hoe ver staat het?',
        'Documenten verspreid over mailboxen',
        'Elke week dezelfde vragen beantwoorden',
      ],
      stepNotes: [
        '1–2 dagen, €1.250. Verrekend als je doorgaat.',
        'Na elke fase test je met een paar klanten',
        'Op je eigen domein, met uitleg',
        'Updates, hosting en hulp',
      ],
      ownershipNote: 'Je portaal en de gegevens van je klanten blijven van jou.',
    },
    {
      name: 'Interne tool die Excel vervangt',
      shortName: 'Interne tool',
      summary:
        'Planning, voorraad en offertes in één tool, in plaats van tien gedeelde Excel-bestanden.',
      audience: 'Voor kantoor en werkvloer',
      features: [
        {name: 'Webapp', detail: 'Op maat van jullie werkwijze'},
        {name: 'Overzetten', detail: 'Je Excel-gegevens gaan mee'},
        {name: 'Samen', detail: 'Iedereen in dezelfde cijfers', sheetOnly: true},
        {name: 'Rechten', detail: 'Per rol: wie mag wat wijzigen'},
        {name: 'Export', detail: 'PDF-offertes en Excel-lijsten'},
        {name: 'Overal', detail: 'Op computer, tablet en gsm'},
      ],
      priceFrom: 7500,
      priceTo: 15000,
      maintenanceFrom: 95,
      mock: 'tool',
      sheetHeadline: 'Van losse Excel-lijsten naar één tool',
      sheetIntro:
        "Voor KMO's die planning, voorraad of offertes bijhouden in gedeelde Excel-bestanden die maar één collega echt begrijpt.",
      painPoints: [
        'Vijf versies van hetzelfde bestand',
        'Formules die breken als iemand iets schuift',
        'Alles hangt af van die ene collega',
      ],
      stepNotes: [
        '1–2 dagen, €1.250. Verrekend als je doorgaat.',
        'Na elke fase test je met je team',
        'Gegevens overgezet, team wegwijs',
        'Updates, hosting en hulp',
      ],
      ownershipNote: 'Je tool en je gegevens blijven van jou.',
    },
  ] satisfies KmoPackageSeed[],
  steps: [
    {
      title: 'Verkenning',
      body: '1–2 dagen samen kijken hoe jullie nu werken. Je krijgt een voorstel: wat we bouwen, in welke fases, en wat het kost. €1.250, verrekend als je doorgaat.',
    },
    {
      title: 'Bouw in fases',
      body: 'Korte fases met na elke fase iets dat werkt. Je test met je eigen team of klanten, en we sturen bij voor het te laat is.',
    },
    {
      title: 'Livegang',
      body: 'Op de toestellen van je team of op je eigen domein, met uitleg voor iedereen die ermee werkt.',
    },
    {
      title: 'Onderhoud',
      body: 'Een vast bedrag per maand voor updates, hosting en hulp als er iets is. Nieuwe functies spreken we apart af.',
    },
  ],
  reasons: [
    {
      title: 'Eén aanspreekpunt',
      body: 'Je praat rechtstreeks met wie je software bouwt. Geen accountmanager of doorgeefluik ertussen.',
    },
    {
      title: 'Twintig jaar ervaring',
      body: '65 projecten in iOS en web, allemaal gelogd. Ik bouw zoals ik het zelf zou willen onderhouden.',
      linkLabel: 'Bekijk het logboek',
      linkHref: '/nl',
    },
    {
      title: 'Van jou',
      body: 'De app en je gegevens zijn van jou. Stop je ooit met het onderhoud, dan neem je alles mee.',
    },
  ],
  faq: [
    {
      question: 'Welk pakket past bij ons?',
      answer:
        'Daar is de verkenning voor. Vaak is het een mix van twee, of iets kleiners om mee te beginnen.',
    },
    {
      question: 'Wat zit er in het onderhoud?',
      answer:
        'Updates voor nieuwe versies van iOS, Android en browsers, hosting, en hulp als er iets misloopt. Nieuwe functies spreken we apart af.',
    },
    {
      question: 'Werkt het met onze bestaande software?',
      answer:
        'Waar het kan, koppel ik met wat je al gebruikt, zoals je boekhouding of CRM. Dat bekijken we tijdens de verkenning.',
    },
    {
      question: 'Hoe lang duurt het?',
      answer: 'Dat hangt af van de omvang. Na de verkenning krijg je een planning per fase.',
    },
    {
      question: 'En als het na de verkenning niet klikt?',
      answer:
        'Dan heb je een uitgewerkt plan dat je kan meenemen. De verkenning is dan je enige kost.',
    },
  ],
  contactTitle: 'Plan een verkenning',
  contactBadge: 'Beschikbaar voor een verkenning',
  contactBody:
    'Vertel kort hoe jullie nu werken en waar het knelt. Dan plannen we 1 à 2 dagen om het samen uit te zoeken.',
}

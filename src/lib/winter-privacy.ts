/**
 * The privacy policy of Winter, the maintenance-hours app for gliding clubs
 * (github.com/fousa/winter), in both site locales.
 *
 * Kept in the repo rather than in Sanity: it is the URL App Store Connect
 * links to, it describes what the app's code does, and it should change in
 * a reviewed commit alongside the app, not in an editor.
 */
import type { Locale } from "@/i18n/config";

/** One heading with its paragraphs and an optional bullet list. */
export type PolicySection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type Policy = {
  title: string;
  description: string;
  updatedLabel: string;
  /** ISO date of the last change; rendered per locale. */
  updated: string;
  intro: string;
  sections: PolicySection[];
};

export const WINTER_PRIVACY_CONTACT = "jelle@fousa.be";
export const WINTER_REPOSITORY_URL = "https://github.com/fousa/winter";

export const winterPrivacy: Record<Locale, Policy> = {
  en: {
    title: "Winter privacy policy",
    description:
      "What Winter, the maintenance-hours app for gliding clubs on zweef.app, keeps on the device and what it sends.",
    updatedLabel: "Last updated",
    updated: "2026-10-23",
    intro:
      "Winter lets members of a gliding club log their maintenance hours, usually on a shared iPad in the workshop, and sends them to the club’s zweef.app account. In short: Winter has no accounts, no tracking and no servers of its own. What it keeps stays on the device; what it sends goes only to your club’s zweef.app.",
    sections: [
      {
        heading: "Who is responsible",
        paragraphs: [
          "Winter is made by Jelle Vandebeeck (fousa) in Edegem, Belgium, and is open source. The club that sets Winter up decides how it is used, and is responsible for its members’ data in zweef.app.",
        ],
      },
      {
        heading: "What stays on the device",
        paragraphs: ["Winter stores the following on the device it runs on, and nowhere else:"],
        list: [
          "the club’s members as zweef.app lists them: first name, last name and member number;",
          "the club’s material (aircraft, vehicles, other projects) as zweef.app lists it;",
          "the timers and hours: who worked, when they started and stopped, what they worked on and an optional comment;",
          "the club’s settings: its name, its zweef.app address, the closing time, and a logo if one is chosen from Photos (only that one picture is read);",
          "the club’s zweef.app API key and the settings code, in the iOS Keychain; the code only as a salted hash.",
        ],
      },
      {
        heading: "What is sent, and where",
        paragraphs: [
          "Winter talks only to the club’s own zweef.app account (admin.gliding.app, run by GlidingApp), over an encrypted connection and with the club’s API key. It fetches the members, the material and the club’s name. When someone taps “Upload”, it sends each finished session: the member’s number and name, the date, the hours, what was worked on, and a description with the start and stop time and the comment.",
          "From then on that data is in zweef.app, where the club’s board checks it, and zweef.app’s own privacy policy applies. Nothing is sent to me or to anyone else.",
        ],
      },
      {
        heading: "What Winter does not do",
        paragraphs: [],
        list: [
          "no accounts or logins;",
          "no analytics, advertising or tracking, and no third-party code;",
          "no access to location, contacts, the camera or the microphone;",
          "no selling or sharing of data.",
        ],
      },
      {
        heading: "Crash reports",
        paragraphs: [
          "If you allow iOS to share analytics with app developers, Apple may send me anonymous crash reports. Apple handles these under its own privacy policy; they contain no names or hours.",
        ],
      },
      {
        heading: "The demo",
        paragraphs: [
          "“Try with a sample club” shows a fictional club. Its members and hours exist only in memory while the demo is open; nothing is saved or sent.",
        ],
      },
      {
        heading: "How long, and removing it",
        paragraphs: [
          "The hours stay on the device after they are uploaded, so the sync screen can show what was sent. Deleting the app removes everything it stored, except the API key and the settings code, which iOS keeps in the Keychain until the device is erased or the app is set up again. Hours already in zweef.app can be changed or removed by the club’s board; ask them.",
        ],
      },
      {
        heading: "Changes and questions",
        paragraphs: [
          "When the app changes what it does with data, this page changes with it; the date at the top shows the last change. Questions are welcome by email.",
        ],
      },
    ],
  },
  nl: {
    title: "Privacybeleid van Winter",
    description:
      "Wat Winter, de app voor onderhoudsuren van zweefvliegclubs op zweef.app, op het toestel bewaart en wat het verstuurt.",
    updatedLabel: "Laatst bijgewerkt",
    updated: "2026-10-23",
    intro:
      "Met Winter registreren leden van een zweefvliegclub hun onderhoudsuren, meestal op een gedeelde iPad in de werkplaats, en de app stuurt ze naar het zweef.app-account van de club. Kort gezegd: Winter heeft geen accounts, geen tracking en geen eigen servers. Wat de app bewaart, blijft op het toestel; wat ze verstuurt, gaat alleen naar zweef.app van je club.",
    sections: [
      {
        heading: "Wie is verantwoordelijk",
        paragraphs: [
          "Winter is gemaakt door Jelle Vandebeeck (fousa) in Edegem, België, en is open source. De club die Winter instelt, beslist hoe de app gebruikt wordt en is verantwoordelijk voor de gegevens van haar leden in zweef.app.",
        ],
      },
      {
        heading: "Wat op het toestel blijft",
        paragraphs: ["Winter bewaart het volgende op het toestel waarop de app draait, en nergens anders:"],
        list: [
          "de leden van de club zoals zweef.app ze opgeeft: voornaam, achternaam en lidnummer;",
          "het materiaal van de club (toestellen, rollend materieel, andere projecten) zoals zweef.app het opgeeft;",
          "de timers en uren: wie werkte, wanneer die begon en stopte, waaraan gewerkt werd en een optionele opmerking;",
          "de instellingen van de club: de naam, het zweef.app-adres, het sluitingsuur en een logo als er een gekozen wordt uit Foto’s (alleen die ene foto wordt gelezen);",
          "de zweef.app-API-sleutel van de club en de instellingencode, in de iOS-sleutelhanger; de code alleen als gezouten hash.",
        ],
      },
      {
        heading: "Wat verstuurd wordt, en waarheen",
        paragraphs: [
          "Winter praat alleen met het eigen zweef.app-account van de club (admin.gliding.app, beheerd door GlidingApp), over een versleutelde verbinding en met de API-sleutel van de club. De app haalt de leden, het materiaal en de clubnaam op. Als iemand op ‘Uploaden’ tikt, verstuurt ze elke afgesloten sessie: het lidnummer en de naam, de datum, de uren, waaraan gewerkt werd, en een omschrijving met het begin- en einduur en de opmerking.",
          "Vanaf dan staan die gegevens in zweef.app, waar het bestuur van de club ze nakijkt, en geldt het privacybeleid van zweef.app. Er wordt niets naar mij of naar iemand anders gestuurd.",
        ],
      },
      {
        heading: "Wat Winter niet doet",
        paragraphs: [],
        list: [
          "geen accounts of logins;",
          "geen analytics, advertenties of tracking, en geen code van derden;",
          "geen toegang tot locatie, contacten, camera of microfoon;",
          "geen verkoop of delen van gegevens.",
        ],
      },
      {
        heading: "Crashrapporten",
        paragraphs: [
          "Als je iOS toestaat analysegegevens met app-ontwikkelaars te delen, kan Apple mij anonieme crashrapporten sturen. Apple behandelt die onder zijn eigen privacybeleid; ze bevatten geen namen of uren.",
        ],
      },
      {
        heading: "De demo",
        paragraphs: [
          "‘Probeer met een voorbeeldclub’ toont een verzonnen club. De leden en uren bestaan alleen in het geheugen zolang de demo open is; er wordt niets bewaard of verstuurd.",
        ],
      },
      {
        heading: "Hoe lang, en verwijderen",
        paragraphs: [
          "De uren blijven na het uploaden op het toestel, zodat het synchronisatiescherm kan tonen wat verstuurd is. Als je de app verwijdert, verdwijnt alles wat ze bewaarde, behalve de API-sleutel en de instellingencode: die houdt iOS in de sleutelhanger tot het toestel gewist wordt of de app opnieuw ingesteld wordt. Uren die al in zweef.app staan, kan het bestuur van de club aanpassen of verwijderen; vraag het hen.",
        ],
      },
      {
        heading: "Wijzigingen en vragen",
        paragraphs: [
          "Als de app iets verandert aan wat ze met gegevens doet, verandert deze pagina mee; de datum bovenaan toont de laatste wijziging. Vragen zijn welkom per e-mail.",
        ],
      },
    ],
  },
};

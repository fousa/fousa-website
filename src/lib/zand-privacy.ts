/**
 * The privacy policy of Zand, the sand timer for iPhone Duo, in both site
 * locales.
 *
 * Kept in the repo rather than in Sanity, like Winter's: it is the URL App
 * Store Connect links to, it describes what the app's code does, and it
 * should change in a reviewed commit alongside the app, not in an editor.
 */
import type { Locale } from "@/i18n/config";
import type { Policy } from "@/lib/winter-privacy";

export const ZAND_PRIVACY_CONTACT = "jelle@fousa.be";

export const zandPrivacy: Record<Locale, Policy> = {
  en: {
    title: "Zand privacy policy",
    description:
      "What Zand, the sand timer for iPhone Duo, keeps on the device and what it sends: nothing leaves the phone.",
    updatedLabel: "Last updated",
    updated: "2026-10-27",
    intro:
      "Zand is a sand timer for the iPhone Duo: you fold the phone to choose a time and hold it still to start. In short: Zand has no accounts, no tracking, no servers and no network connection at all. Everything it does happens on the phone, and the little it remembers stays there.",
    sections: [
      {
        heading: "Who is responsible",
        paragraphs: [
          "Zand is made by Jelle Vandebeeck (fousa) in Edegem, Belgium. Questions about this policy go to the email address at the bottom.",
        ],
      },
      {
        heading: "What stays on the device",
        paragraphs: ["Zand stores the following on the phone it runs on, and nowhere else:"],
        list: [
          "your settings: the timer’s times, which preset is chosen (sand, eggs or game turns), the number of players, and whether sound, vibration and the tick per stop are on;",
          "nothing else. A running timer lives in memory only; there is no history of the times you set.",
        ],
      },
      {
        heading: "The hinge",
        paragraphs: [
          "Zand reads the angle of the Duo’s hinge while it is open, because that angle is how you set the time. The readings are used on the spot to draw the screen and run the timer. They are not stored and not sent anywhere.",
        ],
      },
      {
        heading: "Notifications",
        paragraphs: [
          "Zand asks for permission to show notifications so it can tell you when the time is up while the phone is closed or the app is in the background. These are local notifications, scheduled and shown by iOS on the phone itself; no notification service and no server is involved. You can refuse, and the timer still works with its sound and the screen.",
        ],
      },
      {
        heading: "What Zand does not do",
        paragraphs: [],
        list: [
          "no accounts or logins;",
          "no internet connection, so nothing is uploaded, synced or fetched;",
          "no analytics, advertising or tracking, and no third-party code;",
          "no access to location, contacts, photos, the camera or the microphone;",
          "no selling or sharing of data, because there is none to share.",
        ],
      },
      {
        heading: "Crash reports",
        paragraphs: [
          "If you allow iOS to share analytics with app developers, Apple may send me anonymous crash reports. Apple handles these under its own privacy policy; they contain no personal data.",
        ],
      },
      {
        heading: "How long, and removing it",
        paragraphs: [
          "The settings stay until you change them. Deleting the app removes everything it stored.",
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
    title: "Privacybeleid van Zand",
    description:
      "Wat Zand, de zandloper voor iPhone Duo, op het toestel bewaart en wat het verstuurt: er verlaat niets de telefoon.",
    updatedLabel: "Laatst bijgewerkt",
    updated: "2026-10-27",
    intro:
      "Zand is een zandloper voor de iPhone Duo: je plooit de telefoon om een tijd te kiezen en houdt hem stil om te starten. Kort gezegd: Zand heeft geen accounts, geen tracking, geen servers en helemaal geen internetverbinding. Alles gebeurt op de telefoon, en het weinige dat de app onthoudt, blijft daar.",
    sections: [
      {
        heading: "Wie is verantwoordelijk",
        paragraphs: [
          "Zand is gemaakt door Jelle Vandebeeck (fousa) in Edegem, België. Vragen over dit beleid kunnen naar het e-mailadres onderaan.",
        ],
      },
      {
        heading: "Wat op het toestel blijft",
        paragraphs: ["Zand bewaart het volgende op de telefoon waarop de app draait, en nergens anders:"],
        list: [
          "je instellingen: de tijden van de timer, welk voorinstelling gekozen is (zand, eitjes of spelbeurten), het aantal spelers, en of geluid, trillen en de tik per stand aanstaan;",
          "verder niets. Een lopende timer bestaat alleen in het geheugen; er is geen geschiedenis van de tijden die je instelde.",
        ],
      },
      {
        heading: "Het scharnier",
        paragraphs: [
          "Zand leest de hoek van het scharnier van de Duo terwijl die open is, want met die hoek stel je de tijd in. De metingen worden meteen gebruikt om het scherm te tekenen en de timer te laten lopen. Ze worden niet bewaard en nergens naartoe gestuurd.",
        ],
      },
      {
        heading: "Meldingen",
        paragraphs: [
          "Zand vraagt toestemming om meldingen te tonen, zodat de app je kan verwittigen als de tijd om is terwijl de telefoon dicht is of de app op de achtergrond staat. Dat zijn lokale meldingen, die iOS op de telefoon zelf inplant en toont; er komt geen meldingsdienst of server aan te pas. Je mag weigeren; de timer werkt dan nog altijd met zijn geluid en het scherm.",
        ],
      },
      {
        heading: "Wat Zand niet doet",
        paragraphs: [],
        list: [
          "geen accounts of logins;",
          "geen internetverbinding, dus er wordt niets geüpload, gesynchroniseerd of opgehaald;",
          "geen analytics, advertenties of tracking, en geen code van derden;",
          "geen toegang tot locatie, contacten, foto’s, camera of microfoon;",
          "geen verkoop of delen van gegevens, want die zijn er niet.",
        ],
      },
      {
        heading: "Crashrapporten",
        paragraphs: [
          "Als je iOS toestaat analysegegevens met app-ontwikkelaars te delen, kan Apple mij anonieme crashrapporten sturen. Apple behandelt die onder zijn eigen privacybeleid; ze bevatten geen persoonsgegevens.",
        ],
      },
      {
        heading: "Hoe lang, en verwijderen",
        paragraphs: [
          "De instellingen blijven tot je ze verandert. Als je de app verwijdert, verdwijnt alles wat ze bewaarde.",
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

export type Lang = 'fr' | 'en'

export const translations = {
  fr: {
    nav: { wardrobe: 'VESTIAIRE', book: 'ÉDITO', about: 'ABOUT', cgu: 'CGU' },
    hero: { title: 'VESTIAIRE', sub: 'Fashion & Costumes collection for rent' },
    filters: {
      collection: 'COLLECTION',
      piece: 'PIÈCE',
      pieces: 'PIÈCES',
      clear: 'EFFACER',
      filterBy: 'FILTRER PAR',
      type: 'TYPE',
      designer: 'DESIGNER',
      color: 'COULEUR',
      size: 'TAILLE',
    },
    loading: 'CHARGEMENT...',
    emptyWardrobe: {
      label: 'VESTIAIRE',
      title: 'Le vestiaire se prépare',
      body1: 'Aucune pièce disponible pour le moment.',
      body2: 'Revenez bientôt ou écrivez-nous pour une demande spécifique.',
      cta: 'FAIRE UNE DEMANDE',
    },
    noResults: {
      label: 'VESTIAIRE',
      title: 'Aucune pièce trouvée',
      body: 'Aucun article ne correspond à ce filtre.',
      cta: 'VOIR TOUT LE VESTIAIRE',
    },
    book: {
      label: 'ÉDITO',
      title: 'Réserver une pièce',
      body1: "Pour toute demande de réservation, de disponibilité ou de tarification, contactez-nous directement par email en précisant la pièce souhaitée, les dates et l'usage prévu.",
      body2: 'Nous répondons sous 24h.',
      cta: 'NOUS ÉCRIRE',
      usageLabel: 'USAGE',
      usage: ['Shootings photo & film', 'Événements & galas', 'Projets artistiques', 'Tournages & productions'],
      leadLabel: 'DÉLAI',
      lead: ['Réservation à partir de 48h', 'avant la date souhaitée'],
    },
    about: {
      label: 'ABOUT',
      title: 'Kostum Archives',
      body1: "KOSTUM est une collection d'archives de mode et de costumes. Commencée il y a 5 ans, la collection continue de s'agrandir chaque jour. Chaque pièce est choisie pour son originalité, qu'elle vienne d'une marque, d'un opéra ou d'une production anonyme. Une sorte de cabinet de curiosités de la mode. Ce sont des archives en mouvement.",
      body2: "L'objectif est de les laisser vivre et briller à travers une variété d'images, c'est pourquoi elles sont désormais disponibles à la location. Louer, c'est les raviver en transférant une époque passée dans une vision moderne.",
      body3: "Chez KOSTUM, nous aimons aussi l'idée d'être quelqu'un d'autre pour un moment. Jouer, créer un personnage, choisir un costume, performer. KOSTUM est une collection joyeuse, et chaque pièce est sélectionnée pour son hybridité, son concept ou sa singularité.",
      body4: "Choisissez votre Kostum, louez une archive !",
      locationLabel: 'LOCALISATION',
      location: ['Paris, France — catalogue numérique uniquement'],
      catalogLabel: 'CATALOGUE',
      catalog: ['Vêtements de créateurs', 'Pièces vintage & archive', 'Accessoires & costumes'],
      contactLabel: 'CONTACT',
    },
    cgu: {
      label: 'CGU',
      title: "Conditions Générales d'Utilisation",
      items: [
        { titre: 'Location', texte: "Les pièces sont louées pour une durée définie, convenue à l'avance. Toute prolongation doit être demandée et validée avant l'échéance." },
        { titre: 'Dépôt de garantie', texte: "Un dépôt de garantie est demandé à la remise de chaque pièce. Il est restitué intégralement à son retour en bon état." },
        { titre: 'Responsabilité', texte: "Le locataire est responsable de toute dégradation survenant pendant la période de location. Les frais de réparation ou de remplacement sont à sa charge." },
        { titre: 'Annulation', texte: "Toute annulation doit être notifiée au moins 48h avant la date prévue. Passé ce délai, le dépôt de garantie pourra être retenu." },
      ],
    },
    product: {
      back: '← VESTIAIRE',
      loading: 'CHARGEMENT...',
      notFound: 'PIÈCE INTROUVABLE',
      backFull: '← RETOUR AU VESTIAIRE',
      hoverZoom: 'SURVOLER POUR ZOOMER',
      rentCta: 'RENT IT — NOUS CONTACTER',
      questionCta: 'POSER UNE QUESTION',
      description: 'DESCRIPTION',
      leadLabel: 'DÉLAI',
      leadValue: "Réservation 48h à l'avance minimum",
      usageLabel: 'USAGE',
      usageValue: 'Shootings, événements, tournages, projets artistiques',
      contactLabel: 'CONTACT',
      emailSubjectPrefix: 'Demande de location',
      emailIntro: 'Je suis intéressé(e) par la pièce suivante :',
      emailName: 'Nom',
      emailDesigner: 'Créateur',
      emailSize: 'Taille',
      emailColor: 'Couleur',
      emailClosing: "Merci de me contacter pour plus d'informations.\n\nCordialement,",
      questionSubjectPrefix: 'Question',
    },
  },
  en: {
    nav: { wardrobe: 'VESTIAIRE', book: 'EDITO', about: 'ABOUT', cgu: 'T&C' },
    hero: { title: 'VESTIAIRE', sub: 'Fashion & Costumes collection for rent' },
    filters: {
      collection: 'COLLECTION',
      piece: 'PIECE',
      pieces: 'PIECES',
      clear: 'CLEAR',
      filterBy: 'FILTER BY',
      type: 'TYPE',
      designer: 'DESIGNER',
      color: 'COLOR',
      size: 'SIZE',
    },
    loading: 'LOADING...',
    emptyWardrobe: {
      label: 'VESTIAIRE',
      title: 'The wardrobe is getting ready',
      body1: 'No items available at the moment.',
      body2: 'Check back soon or reach out for a specific request.',
      cta: 'MAKE A REQUEST',
    },
    noResults: {
      label: 'VESTIAIRE',
      title: 'No items found',
      body: 'No items match this filter.',
      cta: 'SEE ALL ITEMS',
    },
    book: {
      label: 'EDITO',
      title: 'Book a piece',
      body1: 'For any booking, availability or pricing enquiry, contact us directly by email specifying the piece you need, the dates and the intended use.',
      body2: 'We reply within 24h.',
      cta: 'WRITE TO US',
      usageLabel: 'USAGE',
      usage: ['Photo & film shoots', 'Events & galas', 'Artistic projects', 'Film & TV productions'],
      leadLabel: 'LEAD TIME',
      lead: ['Booking from 48h', 'before the desired date'],
    },
    about: {
      label: 'ABOUT',
      title: 'Kostum Archives',
      body1: 'KOSTUM is a fashion and costume archive collection. Started 5 years ago, the collection continues to grow every day. Each piece is chosen for its originality, whether it comes from a brand, an opera or an anonymous production. A kind of fashion cabinet of curiosities. These are archives in motion.',
      body2: 'The goal is to let them live and shine through a variety of images, which is why they are now available for rental. Renting means reviving them by transferring a past era into a modern vision.',
      body3: 'At KOSTUM, we also love the idea of being someone else for a moment. Playing, creating a character, choosing a costume, performing. KOSTUM is a joyful collection, and each piece is selected for its hybridity, its concept or its singularity.',
      body4: 'Choose your Kostum, rent an archive!',
      locationLabel: 'LOCATION',
      location: ['Paris, France — digital catalog only'],
      catalogLabel: 'CATALOGUE',
      catalog: ['Designer clothing', 'Vintage & archive pieces', 'Accessories & costumes'],
      contactLabel: 'CONTACT',
    },
    cgu: {
      label: 'T&C',
      title: 'Terms & Conditions',
      items: [
        { titre: 'Rental', texte: 'Items are rented for a defined period, agreed in advance. Any extension must be requested and validated before the due date.' },
        { titre: 'Security deposit', texte: 'A security deposit is required upon collection of each item. It is returned in full upon its return in good condition.' },
        { titre: 'Liability', texte: 'The renter is responsible for any damage occurring during the rental period. Repair or replacement costs are at their expense.' },
        { titre: 'Cancellation', texte: 'Any cancellation must be notified at least 48h before the scheduled date. After this period, the security deposit may be withheld.' },
      ],
    },
    product: {
      back: '← VESTIAIRE',
      loading: 'LOADING...',
      notFound: 'ITEM NOT FOUND',
      backFull: '← BACK TO VESTIAIRE',
      hoverZoom: 'HOVER TO ZOOM',
      rentCta: 'RENT IT — CONTACT US',
      questionCta: 'ASK A QUESTION',
      description: 'DESCRIPTION',
      leadLabel: 'LEAD TIME',
      leadValue: 'Booking 48h in advance minimum',
      usageLabel: 'USAGE',
      usageValue: 'Photo shoots, events, film productions, artistic projects',
      contactLabel: 'CONTACT',
      emailSubjectPrefix: 'Rental request',
      emailIntro: 'I am interested in the following piece:',
      emailName: 'Name',
      emailDesigner: 'Designer',
      emailSize: 'Size',
      emailColor: 'Colour',
      emailClosing: 'Please contact me for more information.\n\nBest regards,',
      questionSubjectPrefix: 'Question',
    },
  },
}

export type Translations = typeof translations.fr

const COLOR_FR_TO_EN: Record<string, string> = {
  noir: 'black', blanc: 'white', bleu: 'blue', rouge: 'red',
  vert: 'green', jaune: 'yellow', rose: 'pink', beige: 'beige',
  gris: 'grey', marron: 'brown', orange: 'orange',
}

const CATEGORY_FR_TO_EN: Record<string, string> = {
  tops: 'tops', pantalons: 'pants', robes: 'dresses', bijoux: 'jewelry',
  accessoires: 'accessories', manteaux: 'coats', ensemble: 'set', autres: 'others',
}

export function translateColor(value: string, lang: Lang): string {
  if (lang === 'fr') return value
  return COLOR_FR_TO_EN[value.toLowerCase()] ?? value
}

export function translateCategory(value: string, lang: Lang): string {
  if (lang === 'fr') return value
  return CATEGORY_FR_TO_EN[value.toLowerCase()] ?? value
}

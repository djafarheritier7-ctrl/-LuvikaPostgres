#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Nouveau contenu pour la section "À propos" dans chaque langue
const aboutContent = {
  fr: {
    title: "À propos de LUVIKA",
    subtitle: "Luvika : Origine du nom et genèse du projet",
    origin: {
      title: "Origine du nom Luvika",
      content: "Le nom Luvika provient de la combinaison de deux éléments significatifs :\n• Luvi, dérivé du mot Luvila, de la langue kikongo, qui désigne l'identité, l'essence, ce qui définit profondément une personne.\n• Ka, qui signifie carte, faisant référence à un support d'identification.\n\nAinsi, Luvika peut être compris comme une identité portée par une carte.\n\nCe nom incarne la vision du projet : offrir une identité numérique moderne, intégrée dans une carte NFC, permettant à chaque individu de se présenter, de partager son profil professionnel et de valoriser son identité de manière simple, sécurisée et innovante.\nÀ travers Luvika, l'identité cesse d'être simplement déclarative : elle devient numérique, portable et connectée, tout en restant fidèle à son essence culturelle et humaine."
    },
    context: {
      title: "Contexte et idée initiale",
      content: "Luvika est né d'une réflexion personnelle et profonde. À un moment de calme, je me questionnais sur la manière de valoriser mes ressources, mes origines et mon identité, particulièrement celle de ma tribu. L'idée initiale était de créer une solution capable de reconnecter les personnes à leurs sources, permettant de valoriser son histoire, son village d'origine, sa tribu et son appartenance au clan.\n\nLe concept initial visait ainsi le développement d'une application capable d'identifier clairement l'origine d'une personne : son village, sa tribu, son clan. À travers cette plateforme, ces éléments culturels et identitaires pourraient être connus, partagés et préservés."
    },
    problem: {
      title: "Problème identifié / limite du concept initial",
      content: "Cependant, une analyse plus approfondie m'a conduit à une prise de conscience importante : un projet exclusivement centré sur l'identité culturelle risquait de toucher un public limité et de ne pas favoriser une adoption large."
    },
    transformation: {
      title: "Transformation stratégique du projet",
      content: "C'est alors qu'est survenue une transformation stratégique du concept. Luvika a évolué pour devenir un identifiant professionnel numérique, basé sur un système de cartes NFC, tout en gardant l'identité comme base fondamentale de sa vision. Cette évolution a permis d'apporter au projet une utilité concrète, moderne et universelle, répondant à des besoins professionnels et commerciaux réels."
    },
    solution: {
      title: "Naissance de la solution Luvika (NFC et identité numérique)",
      content: "Durant le développement, il est apparu évident que simplement créer des profils d'utilisateurs ne suffisait pas. Ainsi, Luvika s'est structuré autour de trois plans distincts :\n• Le plan Basique, destiné aux utilisateurs qui souhaitent une présence numérique simple et accessible.\n• Le plan Professionnel, offrant des fonctionnalités avancées, incluant la création et la gestion d'événements tels que conférences, mariages, fêtes ou réunions professionnelles.\n• Le plan Business, conçu pour les entreprises et les utilisateurs ayant des besoins élargis, intégrant des outils de vente, de visibilité et de gestion avancée.\n\nGrâce à cette structuration, Luvika est devenu bien plus qu'une simple application. C'est aujourd'hui une plateforme versatile qui permet de valoriser l'identité, de faciliter les échanges professionnels, de numériser les cartes d'identification professionnelle via la technologie NFC et de créer de la valeur économique pour ses utilisateurs."
    },
    offers: {
      title: "Structuration des offres (Basique, Professionnel, Business)",
      content: "Luvika propose trois formules tarifaires adaptées à différents besoins :\n\n**Formule Basique** : Pour les particuliers qui souhaitent une présence numérique simple et accessible. Idéale pour les étudiants, jeunes professionnels et particuliers.\n\n**Formule Professionnel** : Pour les freelances, entrepreneurs et professionnels. Offre des fonctionnalités avancées comme la création d'événements, la gestion de contacts et les outils de networking.\n\n**Formule Business** : Pour les entreprises et organisations. Intègre des outils de gestion d'équipe, de visibilité commerciale et de création de valeur économique."
    },
    vision: {
      title: "Vision et mission de Luvika",
      content: "**Vision** : Devenir la référence africaine de l'identité numérique professionnelle, combinant innovation technologique et fierté culturelle.\n\n**Mission** : Transformer la carte de visite physique en une identité numérique intelligente, contrôlable, sécurisée et accessible à tous — particulièrement pour les entrepreneurs, développeurs et leaders africains.\n\nNous croyons en un futur où l'identité numérique renforce les liens professionnels tout en préservant les racines culturelles de chaque personne."
    },
    value: {
      title: "Valeur ajoutée pour les utilisateurs",
      content: "Luvika apporte une valeur ajoutée significative à ses utilisateurs :\n\n• **Facilité d'utilisation** : Interface intuitive et multilingue, accessible à tous\n• **Sécurité renforcée** : Contrôle total sur vos données personnelles et professionnelles\n• **Connectivité** : Échanges professionnels facilités grâce à la technologie NFC\n• **Visibilité** : Valorisation de votre profil et de vos compétences\n• **Culture** : Valorisation de l'identité et des racines culturelles\n• **Économie** : Création de valeur et d'opportunités commerciales\n• **Innovation** : Technologie de pointe au service du développement personnel et professionnel"
    },
    perspective: {
      title: "Perspective et ambition du projet",
      content: "Luvika a pour ambition de :\n\n• **Révolutionner le networking** en Afrique et dans le monde\n• **Créer un écosystème numérique** professionnel et culturellement ancré\n• **Faciliter les échanges** entre professionnels africains et internationaux\n• **Promouvoir l'innovation technologique africaine**\n• **Contribuer au développement économique** du continent\n• **Devenir une plateforme indispensable** pour les professionnels du monde entier\n\nNotre objectif est de faire de Luvika un symbole de l'excellence technologique africaine, tout en restant profondément connecté aux valeurs et à l'identité de ses utilisateurs."
    }
  },
  en: {
    title: "About LUVIKA",
    subtitle: "Luvika: Origin of the name and genesis of the project",
    origin: {
      title: "Origin of the name Luvika",
      content: "The name Luvika comes from the combination of two significant elements:\n• Luvi, derived from the word Luvila, from the Kikongo language, which refers to identity, essence, what deeply defines a person.\n• Ka, which means card, referring to an identification support.\n\nThus, Luvika can be understood as an identity carried by a card.\n\nThis name embodies the project's vision: to offer a modern digital identity, integrated into an NFC card, allowing each individual to present themselves, share their professional profile and value their identity in a simple, secure and innovative way.\nThrough Luvika, identity ceases to be merely declarative: it becomes digital, portable and connected, while remaining faithful to its cultural and human essence."
    },
    context: {
      title: "Context and initial idea",
      content: "Luvika was born from a personal and deep reflection. At a moment of calm, I was questioning how to value my resources, my origins and my identity, particularly that of my tribe. The initial idea was to create a solution capable of reconnecting people to their sources, allowing them to value their history, their village of origin, their tribe and their belonging to the clan.\n\nThe initial concept thus aimed at the development of an application capable of clearly identifying a person's origin: their village, tribe, clan. Through this platform, these cultural and identity elements could be known, shared and preserved."
    },
    problem: {
      title: "Identified problem / limitation of the initial concept",
      content: "However, a more in-depth analysis led me to an important awareness: a project exclusively focused on cultural identity risked reaching a limited audience and not favoring a wide adoption."
    },
    transformation: {
      title: "Strategic transformation of the project",
      content: "It was then that a strategic transformation of the concept occurred. Luvika evolved to become a digital professional identifier, based on an NFC card system, while keeping identity as the fundamental basis of its vision. This evolution allowed bringing to the project a concrete, modern and universal utility, responding to real professional and commercial needs."
    },
    solution: {
      title: "Birth of the Luvika solution (NFC and digital identity)",
      content: "During development, it became evident that simply creating user profiles was not enough. Thus, Luvika was structured around three distinct plans:\n• The Basic plan, intended for users who want a simple and accessible digital presence.\n• The Professional plan, offering advanced features, including the creation and management of events such as conferences, weddings, parties or professional meetings.\n• The Business plan, designed for companies and users with expanded needs, integrating sales tools, visibility and advanced management.\n\nThanks to this structuring, Luvika became much more than a simple application. It is today a versatile platform that allows to value identity, facilitate professional exchanges, digitize professional identification cards via NFC technology and create economic value for its users."
    },
    offers: {
      title: "Structure of offers (Basic, Professional, Business)",
      content: "Luvika offers three pricing plans adapted to different needs:\n\n**Basic Plan**: For individuals who want a simple and accessible digital presence. Ideal for students, young professionals and individuals.\n\n**Professional Plan**: For freelancers, entrepreneurs and professionals. Offers advanced features such as event creation, contact management and networking tools.\n\n**Business Plan**: For companies and organizations. Integrates team management tools, commercial visibility and economic value creation."
    },
    vision: {
      title: "Vision and mission of Luvika",
      content: "**Vision**: To become the African reference for professional digital identity, combining technological innovation and cultural pride.\n\n**Mission**: To transform the physical business card into an intelligent, controllable, secure and accessible digital identity for all — particularly for African entrepreneurs, developers and leaders.\n\nWe believe in a future where digital identity strengthens professional connections while preserving the cultural roots of each person."
    },
    value: {
      title: "Added value for users",
      content: "Luvika brings significant added value to its users:\n\n• **Ease of use**: Intuitive and multilingual interface, accessible to all\n• **Enhanced security**: Total control over your personal and professional data\n• **Connectivity**: Facilitated professional exchanges thanks to NFC technology\n• **Visibility**: Enhancement of your profile and skills\n• **Culture**: Enhancement of identity and cultural roots\n• **Economy**: Creation of value and commercial opportunities\n• **Innovation**: Cutting-edge technology at the service of personal and professional development"
    },
    perspective: {
      title: "Perspective and ambition of the project",
      content: "Luvika has the ambition to:\n\n• **Revolutionize networking** in Africa and the world\n• **Create a digital ecosystem** professionally and culturally rooted\n• **Facilitate exchanges** between African and international professionals\n• **Promote African technological innovation**\n• **Contribute to the economic development** of the continent\n• **Become an indispensable platform** for professionals around the world\n\nOur goal is to make Luvika a symbol of African technological excellence, while remaining deeply connected to the values and identity of its users."
    }
  },
  es: {
    title: "Acerca de LUVIKA",
    subtitle: "Luvika: Origen del nombre y génesis del proyecto",
    origin: {
      title: "Origen del nombre Luvika",
      content: "El nombre Luvika proviene de la combinación de dos elementos significativos:\n• Luvi, derivado de la palabra Luvila, del idioma kikongo, que se refiere a la identidad, esencia, lo que define profundamente a una persona.\n• Ka, que significa tarjeta, refiriéndose a un soporte de identificación.\n\nAsí, Luvika puede entenderse como una identidad portada por una tarjeta.\n\nEste nombre encarna la visión del proyecto: ofrecer una identidad digital moderna, integrada en una tarjeta NFC, permitiendo que cada individuo se presente, comparta su perfil profesional y valore su identidad de manera simple, segura e innovadora.\nA través de Luvika, la identidad deja de ser meramente declarativa: se vuelve digital, portátil y conectada, manteniéndose fiel a su esencia cultural y humana."
    },
    context: {
      title: "Contexto e idea inicial",
      content: "Luvika nació de una reflexión personal y profunda. En un momento de calma, me cuestionaba cómo valorizar mis recursos, mis orígenes y mi identidad, particularmente la de mi tribu. La idea inicial era crear una solución capaz de reconectar a las personas con sus fuentes, permitiendo valorizar su historia, su aldea de origen, su tribu y su pertenencia al clan.\n\nEl concepto inicial tenía como objetivo el desarrollo de una aplicación capaz de identificar claramente el origen de una persona: su aldea, tribu, clan. A través de esta plataforma, estos elementos culturales e identitarios podrían ser conocidos, compartidos y preservados."
    },
    problem: {
      title: "Problema identificado / limitación del concepto inicial",
      content: "Sin embargo, un análisis más profundo me llevó a una conciencia importante: un proyecto exclusivamente centrado en la identidad cultural arriesgaba alcanzar a un público limitado y no favorecer una adopción amplia."
    },
    transformation: {
      title: "Transformación estratégica del proyecto",
      content: "Fue entonces cuando ocurrió una transformación estratégica del concepto. Luvika evolucionó para convertirse en un identificador profesional digital, basado en un sistema de tarjetas NFC, manteniendo la identidad como base fundamental de su visión. Esta evolución permitió aportar al proyecto una utilidad concreta, moderna y universal, respondiendo a necesidades profesionales y comerciales reales."
    },
    solution: {
      title: "Nacimiento de la solución Luvika (NFC e identidad digital)",
      content: "Durante el desarrollo, se hizo evidente que simplemente crear perfiles de usuario no era suficiente. Así, Luvika se estructuró alrededor de tres planes distintos:\n• El plan Básico, destinado a usuarios que desean una presencia digital simple y accesible.\n• El plan Profesional, ofreciendo funciones avanzadas, incluyendo la creación y gestión de eventos como conferencias, bodas, fiestas o reuniones profesionales.\n• El plan Business, diseñado para empresas y usuarios con necesidades ampliadas, integrando herramientas de ventas, visibilidad y gestión avanzada.\n\nGracias a esta estructuración, Luvika se convirtió en mucho más que una simple aplicación. Es hoy una plataforma versátil que permite valorizar la identidad, facilitar los intercambios profesionales, digitalizar tarjetas de identificación profesional mediante tecnología NFC y crear valor económico para sus usuarios."
    },
    offers: {
      title: "Estructuración de ofertas (Básico, Profesional, Business)",
      content: "Luvika ofrece tres planes de precios adaptados a diferentes necesidades:\n\n**Plan Básico**: Para particulares que desean una presencia digital simple y accesible. Ideal para estudiantes, jóvenes profesionales y particulares.\n\n**Plan Profesional**: Para freelancers, emprendedores y profesionales. Ofrece funciones avanzadas como creación de eventos, gestión de contactos y herramientas de networking.\n\n**Plan Business**: Para empresas y organizaciones. Integra herramientas de gestión de equipo, visibilidad comercial y creación de valor económico."
    },
    vision: {
      title: "Visión y misión de Luvika",
      content: "**Visión**: Convertirse en la referencia africana de la identidad digital profesional, combinando innovación tecnológica y orgullo cultural.\n\n**Misión**: Transformar la tarjeta de presentación física en una identidad digital inteligente, controlable, segura y accesible para todos — particularmente para emprendedores, desarrolladores y líderes africanos.\n\nCreemos en un futuro donde la identidad digital fortalezca los lazos profesionales mientras preserva las raíces culturales de cada persona."
    },
    value: {
      title: "Valor añadido para los usuarios",
      content: "Luvika aporta un valor añadido significativo a sus usuarios:\n\n• **Facilidad de uso**: Interfaz intuitiva y multilingüe, accesible para todos\n• **Seguridad reforzada**: Control total sobre sus datos personales y profesionales\n• **Conectividad**: Intercambios profesionales facilitados gracias a la tecnología NFC\n• **Visibilidad**: Realce de su perfil y competencias\n• **Cultura**: Realce de la identidad y raíces culturales\n• **Economía**: Creación de valor y oportunidades comerciales\n• **Innovación**: Tecnología de punta al servicio del desarrollo personal y profesional"
    },
    perspective: {
      title: "Perspectiva y ambición del proyecto",
      content: "Luvika tiene la ambición de:\n\n• **Revolucionar el networking** en África y el mundo\n• **Crear un ecosistema digital** profesional y culturalmente arraigado\n• **Facilitar los intercambios** entre profesionales africanos e internacionales\n• **Promover la innovación tecnológica africana**\n• **Contribuir al desarrollo económico** del continente\n• **Convertirse en una plataforma indispensable** para profesionales de todo el mundo\n\nNuestro objetivo es hacer de Luvika un símbolo de la excelencia tecnológica africana, permaneciendo profundamente conectado a los valores y la identidad de sus usuarios."
    }
  },
  ln: {
    title: "Kala na LUVIKA",
    subtitle: "Luvika: Mokama ya lisolo pe mokama ya projet",
    origin: {
      title: "Mokama ya lisolo Luvika",
      content: "Lisolo Luvika eza na bato mibota ya bantina:\n• Luvi, eza na molukiluki Luvila, ya lingala, oyo eza na bantina ya identité, ya eseni, oyo eza na bantina ya bato moko.\n• Ka, eza na bantina ya carte, oyo eza na bantina ya support ya identité.\n\nKasi, Luvika eza na bantina ya identité oyo eza na carte.\n\nLisolo oyo eza na bantina ya vision ya projet: kozwa identité ya digital, oyo eza na carte NFC, mpona bato moko kozwa kozwa, kozwa profile ya professionnel pe kozwa identité na nzela ya simple, ya sécurisé pe ya innovant.\nNa Luvika, identité eza na bantina ya declaratif: eza digital, eza portable pe eza connecté, mpona eza na bantina ya eseni ya culture pe ya humain."
    },
    context: {
      title: "Contexte pe idee ya kala",
      content: "Luvika eza na bantina ya réflexion ya personel pe ya profonde. Na mokolo ya calme, nakipaka kala kozwa kozwa ressources na ngai, origines na ngai pe identité na ngai, kala ya tribu na ngai. Idee ya kala eza kozwa solution oyo eza na bantina ya reconnecter bato na sources, mpona kozwa kozwa histoire, village ya kala, tribu pe clan.\n\nConcept ya kala eza kozwa application oyo eza na bantina ya kozwa origine ya bato: village, tribu, clan. Na platform oyo, bato oyo eza na bantina ya culture pe identité eza na bantina ya kozwa, kozwa pe kozwa."
    },
    problem: {
      title: "Problème ya kala / limite ya concept ya kala",
      content: "Kasi, analyse ya profonde eza na bantina ya kala ya importante: projet ya exclusivement ya identité ya culture eza na bantina ya toucher audience ya limite pe eza na bantina ya favoriser adoption ya large."
    },
    transformation: {
      title: "Transformation ya stratégique ya projet",
      content: "Eza na mokolo ya transformation ya stratégique ya concept. Luvika eza na bantina ya identifiant ya professionnel ya digital, oyo eza na bantina ya système ya carte NFC, mpona eza na bantina ya identité ya base ya vision. Evolution oyo eza na bantina ya kozwa projet ya utilité ya concrete, ya moderne pe ya universel, mpona kozwa besoins ya professionnel pe ya commercial."
    },
    solution: {
      title: "Naissance ya solution Luvika (NFC pe identité ya digital)",
      content: "Na développement, eza na bantina ya evident ya créer profils ya utilisateur eza na bantina ya pas assez. Kasi, Luvika eza na bantina ya structure na bato mibota:\n• Plan ya Basique, eza na bantina ya utilisateurs oyo baza na présence ya digital ya simple pe ya accessible.\n• Plan ya Professionnel, eza na bantina ya fonctionnalités ya avancées, oyo eza na bantina ya création pe gestion ya événements kala conférences, mariages, fêtes pe réunions ya professionnel.\n• Plan ya Business, eza na bantina ya entreprises pe utilisateurs oyo bazalaka besoins ya élargis, oyo eza na bantina ya intégrer outils ya vente, visibilité pe gestion ya avancée.\n\nGrâce ya structure oyo, Luvika eza na bantina ya plus ya simple application. Eza platform ya versatile oyo eza na bantina ya kozwa identité, kozwa échanges ya professionnel, kozwa cartes ya identification ya professionnel na technologie ya NFC pe kozwa valeur ya économique mpona utilisateurs."
    },
    offers: {
      title: "Structure ya offres (Basique, Professionnel, Business)",
      content: "Luvika eza na bantina ya trois plans ya pricing oyo eza na bantina ya adaptés na différents besoins:\n\n**Plan ya Basique**: Mpona particuliers oyo bazalaka présence ya digital ya simple pe ya accessible. Ideal mpona étudiants, jeunes professionnels pe particuliers.\n\n**Plan ya Professionnel**: Mpona freelancers, entrepreneurs pe professionnels. Oyo eza na bantina ya fonctionnalités ya avancées kala création ya événements, gestion ya contacts pe outils ya networking.\n\n**Plan ya Business**: Mpona entreprises pe organisations. Oyo eza na bantina ya intégrer outils ya gestion ya équipe, visibilité ya commerciale pe création ya valeur ya économique."
    },
    vision: {
      title: "Vision pe mission ya Luvika",
      content: "**Vision**: Kozwa référence ya africaine ya identité ya professionnel ya digital, oyo eza na bantina ya combiner innovation ya technologique pe fierté ya culturel.\n\n**Mission**: Kozwa carte ya visite physique ya identité ya digital ya intelligent, contrôlable, sécurisée pe accessible mpona tous — kala entrepreneurs, développeurs pe leaders ya africains.\n\nTubaza na futur oyo identité ya digital eza na bantina ya renforcer liens ya professionnel mpona eza na bantina ya préserver racines ya culturel ya bato moko."
    },
    value: {
      title: "Valeur ya ajoutée mpona utilisateurs",
      content: "Luvika eza na bantina ya valeur ya ajoutée ya significative mpona utilisateurs:\n\n• **Facilité ya utilisation**: Interface ya intuitive pe ya multilingue, accessible mpona tous\n• **Sécurité ya renforcée**: Contrôle ya total na données ya personel pe ya professionnel\n• **Connectivité**: Échanges ya professionnel ya facilités grâce ya technologie ya NFC\n• **Visibilité**: Valorisation ya profile pe compétences\n• **Culture**: Valorisation ya identité pe racines ya culturel\n• **Économie**: Création ya valeur pe opportunités ya commerciale\n• **Innovation**: Technologie ya pointe ya service ya développement ya personel pe ya professionnel"
    },
    perspective: {
      title: "Perspective pe ambition ya projet",
      content: "Luvika eza na bantina ya ambition ya:\n\n• **Révolutionner networking** na Afrique pe na monde\n• **Créer écosystème ya digital** professionnel pe culturellement enraciné\n• **Faciliter échanges** na bantina ya professionnels ya africains pe ya internationaux\n• **Promouvoir innovation ya technologique ya africaine**\n• **Contribuer développement ya économique** ya continent\n• **Devenir platform ya indispensable** mpona professionnels ya monde entier\n\nObjectif ya ngai eza kozwa Luvika symbole ya excellence ya technologique ya africaine, mpona eza na bantina ya connecté na valeurs pe identité ya utilisateurs."
    }
  },
  pt: {
    title: "Sobre LUVIKA",
    subtitle: "Luvika: Origem do nome e gênese do projeto",
    origin: {
      title: "Origem do nome Luvika",
      content: "O nome Luvika provém da combinação de dois elementos significativos:\n• Luvi, derivado da palavra Luvila, da língua kikongo, que se refere à identidade, essência, o que define profundamente uma pessoa.\n• Ka, que significa cartão, referindo-se a um suporte de identificação.\n\nAssim, Luvika pode ser entendido como uma identidade carregada por um cartão.\n\nEsse nome encarna a visão do projeto: oferecer uma identidade digital moderna, integrada em um cartão NFC, permitindo que cada indivíduo se apresente, compartilhe seu perfil profissional e valorize sua identidade de forma simples, segura e inovadora.\nÀ través do Luvika, a identidade deixa de ser apenas declarativa: torna-se digital, portátil e conectada, permanecendo fiel à sua essência cultural e humana."
    },
    context: {
      title: "Contexto e ideia inicial",
      content: "Luvika nasceu de uma reflexão pessoal e profunda. Em um momento de calma, questionava como valorizar meus recursos, minhas origens e minha identidade, particularmente a da minha tribo. A ideia inicial era criar uma solução capaz de reconectar as pessoas às suas fontes, permitindo valorizar sua história, sua aldeia de origem, sua tribo e sua pertença ao clã.\n\nO conceito inicial visava assim o desenvolvimento de um aplicativo capaz de identificar claramente a origem de uma pessoa: sua aldeia, tribo, clã. Através desta plataforma, esses elementos culturais e identitários poderiam ser conhecidos, compartilhados e preservados."
    },
    problem: {
      title: "Problema identificado / limitação do conceito inicial",
      content: "No entanto, uma análise mais aprofundada me levou a uma importante consciência: um projeto exclusivamente focado na identidade cultural arriscava alcançar um público limitado e não favorecer uma adoção ampla."
    },
    transformation: {
      title: "Transformação estratégica do projeto",
      content: "Foi então que ocorreu uma transformação estratégica do conceito. Luvika evoluiu para se tornar um identificador profissional digital, baseado em um sistema de cartões NFC, mantendo a identidade como base fundamental de sua visão. Essa evolução permitiu trazer ao projeto uma utilidade concreta, moderna e universal, respondendo a necessidades profissionais e comerciais reais."
    },
    solution: {
      title: "Nascimento da solução Luvika (NFC e identidade digital)",
      content: "Durante o desenvolvimento, ficou evidente que simplesmente criar perfis de usuários não era suficiente. Assim, o Luvika foi estruturado em torno de três planos distintos:\n• O plano Básico, destinado a usuários que desejam uma presença digital simples e acessível.\n• O plano Profissional, oferecendo recursos avançados, incluindo a criação e gestão de eventos como conferências, casamentos, festas ou reuniões profissionais.\n• O plano Business, projetado para empresas e usuários com necessidades ampliadas, integrando ferramentas de vendas, visibilidade e gestão avançada.\n\nGraças a essa estruturação, o Luvika tornou-se muito mais do que um simples aplicativo. É hoje uma plataforma versátil que permite valorizar a identidade, facilitar os intercâmbios profissionais, digitalizar cartões de identificação profissional via tecnologia NFC e criar valor econômico para seus usuários."
    },
    offers: {
      title: "Estruturação das ofertas (Básico, Profissional, Business)",
      content: "Luvika oferece três planos de preços adaptados a diferentes necessidades:\n\n**Plano Básico**: Para particulares que desejam uma presença digital simples e acessível. Ideal para estudantes, jovens profissionais e particulares.\n\n**Plano Profissional**: Para freelancers, empreendedores e profissionais. Oferece recursos avançados como criação de eventos, gestão de contatos e ferramentas de networking.\n\n**Plano Business**: Para empresas e organizações. Integra ferramentas de gestão de equipe, visibilidade comercial e criação de valor econômico."
    },
    vision: {
      title: "Visão e missão do Luvika",
      content: "**Visão**: Tornar-se a referência africana da identidade digital profissional, combinando inovação tecnológica e orgulho cultural.\n\n**Missão**: Transformar o cartão de visita físico em uma identidade digital inteligente, controlável, segura e acessível a todos — especialmente para empreendedores, desenvolvedores e líderes africanos.\n\nAcreditamos em um futuro onde a identidade digital fortalece os laços profissionais enquanto preserva as raízes culturais de cada pessoa."
    },
    value: {
      title: "Valor acrescentado para os usuários",
      content: "Luvika traz um valor acrescentado significativo aos seus usuários:\n\n• **Facilidade de uso**: Interface intuitiva e multilíngue, acessível a todos\n• **Segurança reforçada**: Controle total sobre seus dados pessoais e profissionais\n• **Conectividade**: Intercâmbios profissionais facilitados graças à tecnologia NFC\n• **Visibilidade**: Valorização do seu perfil e competências\n• **Cultura**: Valorização da identidade e raízes culturais\n• **Economia**: Criação de valor e oportunidades comerciais\n• **Inovação**: Tecnologia de ponta ao serviço do desenvolvimento pessoal e profissional"
    },
    perspective: {
      title: "Perspectiva e ambição do projeto",
      content: "Luvika tem a ambição de:\n\n• **Revolucionar o networking** na África e no mundo\n• **Criar um ecossistema digital** profissional e culturalmente enraizado\n• **Facilitar os intercâmbios** entre profissionais africanos e internacionais\n• **Promover a inovação tecnológica africana**\n• **Contribuir para o desenvolvimento econômico** do continente\n• **Tornar-se uma plataforma indispensável** para profissionais de todo o mundo\n\nNosso objetivo é fazer do Luvika um símbolo da excelência tecnológica africana, permanecendo profundamente conectado aos valores e à identidade de seus usuários."
    }
  },
  kg: {
    title: "Mbala na LUVIKA",
    subtitle: "Luvika: Mokama ya lisolo pe mokama ya projet",
    origin: {
      title: "Mokama ya lisolo Luvika",
      content: "Lisolo Luvika eza na bato mibota ya bantina:\n• Luvi, eza na molukiluki Luvila, ya lingala, oyo eza na bantina ya identité, ya eseni, oyo eza na bantina ya bato moko.\n• Ka, eza na bantina ya carte, oyo eza na bantina ya support ya identité.\n\nKasi, Luvika eza na bantina ya identité oyo eza na carte.\n\nLisolo oyo eza na bantina ya vision ya projet: kozwa identité ya digital, oyo eza na carte NFC, mpona bato moko kozwa kozwa, kozwa profile ya professionnel pe kozwa identité na nzela ya simple, ya sécurisé pe ya innovant.\nNa Luvika, identité eza na bantina ya declaratif: eza digital, eza portable pe eza connecté, mpona eza na bantina ya eseni ya culture pe ya humain."
    },
    context: {
      title: "Contexte pe idee ya kala",
      content: "Luvika eza na bantina ya réflexion ya personel pe ya profonde. Na mokolo ya calme, nakipaka kala kozwa kozwa ressources na ngai, origines na ngai pe identité na ngai, kala ya tribu na ngai. Idee ya kala eza kozwa solution oyo eza na bantina ya reconnecter bato na sources, mpona kozwa kozwa histoire, village ya kala, tribu pe clan.\n\nConcept ya kala eza kozwa application oyo eza na bantina ya kozwa origine ya bato: village, tribu, clan. Na platform oyo, bato oyo eza na bantina ya culture pe identité eza na bantina ya kozwa, kozwa pe kozwa."
    },
    problem: {
      title: "Problème ya kala / limite ya concept ya kala",
      content: "Kasi, analyse ya profonde eza na bantina ya kala ya importante: projet ya exclusivement ya identité ya culture eza na bantina ya toucher audience ya limite pe eza na bantina ya favoriser adoption ya large."
    },
    transformation: {
      title: "Transformation ya stratégique ya projet",
      content: "Eza na mokolo ya transformation ya stratégique ya concept. Luvika eza na bantina ya identifiant ya professionnel ya digital, oyo eza na bantina ya système ya carte NFC, mpona eza na bantina ya identité ya base ya vision. Evolution oyo eza na bantina ya kozwa projet ya utilité ya concrete, ya moderne pe ya universel, mpona kozwa besoins ya professionnel pe ya commercial."
    },
    solution: {
      title: "Naissance ya solution Luvika (NFC pe identité ya digital)",
      content: "Na développement, eza na bantina ya evident ya créer profils ya utilisateur eza na bantina ya pas assez. Kasi, Luvika eza na bantina ya structure na bato mibota:\n• Plan ya Basique, eza na bantina ya utilisateurs oyo baza na présence ya digital ya simple pe ya accessible.\n• Plan ya Professionnel, eza na bantina ya fonctionnalités ya avancées, oyo eza na bantina ya création pe gestion ya événements kala conférences, mariages, fêtes pe réunions ya professionnel.\n• Plan ya Business, eza na bantina ya entreprises pe utilisateurs oyo bazalaka besoins ya élargis, oyo eza na bantina ya intégrer outils ya vente, visibilité pe gestion ya avancée.\n\nGrâce ya structure oyo, Luvika eza na bantina ya plus ya simple application. Eza platform ya versatile oyo eza na bantina ya kozwa identité, kozwa échanges ya professionnel, kozwa cartes ya identification ya professionnel na technologie ya NFC pe kozwa valeur ya économique mpona utilisateurs."
    },
    offers: {
      title: "Structure ya offres (Basique, Professionnel, Business)",
      content: "Luvika eza na bantina ya trois plans ya pricing oyo eza na bantina ya adaptés na différents besoins:\n\n**Plan ya Basique**: Mpona particuliers oyo bazalaka présence ya digital ya simple pe ya accessible. Ideal mpona étudiants, jeunes professionnels pe particuliers.\n\n**Plan ya Professionnel**: Mpona freelancers, entrepreneurs pe professionnels. Oyo eza na bantina ya fonctionnalités ya avancées kala création ya événements, gestion ya contacts pe outils ya networking.\n\n**Plan ya Business**: Mpona entreprises pe organisations. Oyo eza na bantina ya intégrer outils ya gestion ya équipe, visibilité ya commerciale pe création ya valeur ya économique."
    },
    vision: {
      title: "Vision pe mission ya Luvika",
      content: "**Vision**: Kozwa référence ya africaine ya identité ya professionnel ya digital, oyo eza na bantina ya combiner innovation ya technologique pe fierté ya culturel.\n\n**Mission**: Kozwa carte ya visite physique ya identité ya digital ya intelligent, contrôlable, sécurisée pe accessible mpona tous — kala entrepreneurs, développeurs pe leaders ya africains.\n\nTubaza na futur oyo identité ya digital eza na bantina ya renforcer liens ya professionnel mpona eza na bantina ya préserver racines ya culturel ya bato moko."
    },
    value: {
      title: "Valeur ya ajoutée mpona utilisateurs",
      content: "Luvika eza na bantina ya valeur ya ajoutée ya significative mpona utilisateurs:\n\n• **Facilité ya utilisation**: Interface ya intuitive pe ya multilingue, accessible mpona tous\n• **Sécurité ya renforcée**: Contrôle ya total na données ya personel pe ya professionnel\n• **Connectivité**: Échanges ya professionnel ya facilités grâce ya technologie ya NFC\n• **Visibilité**: Valorisation ya profile pe compétences\n• **Culture**: Valorisation ya identité pe racines ya culturel\n• **Économie**: Création ya valeur pe opportunités ya commerciale\n• **Innovation**: Technologie ya pointe ya service ya développement ya personel pe ya professionnel"
    },
    perspective: {
      title: "Perspective pe ambition ya projet",
      content: "Luvika eza na bantina ya ambition ya:\n\n• **Révolutionner networking** na Afrique pe na monde\n• **Créer écosystème ya digital** professionnel pe culturellement enraciné\n• **Faciliter échanges** na bantina ya professionnels ya africains pe ya internationaux\n• **Promouvoir innovation ya technologique ya africaine**\n• **Contribuer développement ya économique** ya continent\n• **Devenir platform ya indispensable** mpona professionnels ya monde entier\n\nObjectif ya ngai eza kozwa Luvika symbole ya excellence ya technologique ya africaine, mpona eza na bantina ya connecté na valeurs pe identité ya utilisateurs."
    }
  },
  nl: {
    title: "Over LUVIKA",
    subtitle: "Luvika: Oorsprong van de naam en ontstaan van het project",
    origin: {
      title: "Oorsprong van de naam Luvika",
      content: "De naam Luvika komt van de combinatie van twee significante elementen:\n• Luvi, afgeleid van het woord Luvila, uit de Kikongo-taal, dat verwijst naar identiteit, essentie, wat een persoon diep bepaalt.\n• Ka, wat kaart betekent, verwijzend naar een identificatiemiddel.\n\nZo kan Luvika worden begrepen als een identiteit gedragen door een kaart.\n\nDeze naam belichaamt de visie van het project: het aanbieden van een moderne digitale identiteit, geïntegreerd in een NFC-kaart, die elk individu in staat stelt zichzelf te presenteren, zijn professionele profiel te delen en zijn identiteit op een eenvoudige, veilige en innovatieve manier te waarderen.\nDoor Luvika wordt identiteit niet langer louter declaratief: het wordt digitaal, draagbaar en verbonden, terwijl het trouw blijft aan zijn culturele en menselijke essentie."
    },
    context: {
      title: "Context en initiële idee",
      content: "Luvika is ontstaan uit een persoonlijke en diepe reflectie. In een moment van rust vroeg ik me af hoe ik mijn middelen, mijn oorsprong en mijn identiteit, met name die van mijn stam, kan waarderen. Het initiële idee was om een oplossing te creëren die mensen in staat stelt om weer contact te maken met hun bronnen, waardoor ze hun geschiedenis, hun oorspronkelijke dorp, hun stam en hun clan kunnen waarderen.\n\nHet initiële concept richtte zich dus op de ontwikkeling van een applicatie die duidelijk de oorsprong van een persoon kan identificeren: hun dorp, stam, clan. Door dit platform kunnen deze culturele en identitaire elementen worden gekend, gedeeld en behouden."
    },
    problem: {
      title: "Geïdentificeerd probleem / beperking van het initiële concept",
      content: "Echter, een diepere analyse bracht mij tot een belangrijk besef: een project dat uitsluitend gericht is op culturele identiteit riskeert een beperkt publiek te bereiken en geen brede adoptie te bevorderen."
    },
    transformation: {
      title: "Strategische transformatie van het project",
      content: "Toen vond een strategische transformatie van het concept plaats. Luvika evolueerde tot een digitaal professioneel identificatiemiddel, gebaseerd op een NFC-kaartsysteem, terwijl identiteit de fundamentele basis van de visie bleef. Deze evolutie stelde het project in staat om een concrete, moderne en universele nuttigheid te bieden, die reageert op echte professionele en commerciële behoeften."
    },
    solution: {
      title: "Geboorte van de Luvika-oplossing (NFC en digitale identiteit)",
      content: "Tijdens de ontwikkeling werd duidelijk dat het enkel creëren van gebruikersprofielen niet voldoende was. Zo werd Luvika gestructureerd rond drie verschillende plannen:\n• Het Basisplan, bedoeld voor gebruikers die een eenvoudige en toegankelijke digitale aanwezigheid wensen.\n• Het Professionele Plan, dat geavanceerde functionaliteiten biedt, inclusief het creëren en beheren van evenementen zoals conferenties, bruiloften, feesten of professionele bijeenkomsten.\n• Het Business Plan, ontworpen voor bedrijven en gebruikers met uitgebreide behoeften, met geïntegreerde verkoop-, zichtbaarheids- en geavanceerde beheertools.\n\nDankzij deze structurering werd Luvika veel meer dan een eenvoudige applicatie. Het is vandaag een veelzijdig platform dat identiteit kan waarderen, professionele uitwisselingen kan vergemakkelijken, professionele identiteitskaarten kan digitaliseren via NFC-technologie en economische waarde kan creëren voor zijn gebruikers."
    },
    offers: {
      title: "Structurering van aanbiedingen (Basis, Professioneel, Business)",
      content: "Luvika biedt drie prijsplannen die aangepast zijn aan verschillende behoeften:\n\n**Basisplan**: Voor particulieren die een eenvoudige en toegankelijke digitale aanwezigheid wensen. Ideaal voor studenten, jonge professionals en particulieren.\n\n**Professioneel Plan**: Voor freelancers, ondernemers en professionals. Biedt geavanceerde functionaliteiten zoals het creëren van evenementen, contactbeheer en netwerkingtools.\n\n**Business Plan**: Voor bedrijven en organisaties. Integreert teambeheertools, commerciële zichtbaarheid en economische waardecreatie."
    },
    vision: {
      title: "Visie en missie van Luvika",
      content: "**Visie**: De Afrikaanse referentie worden voor professionele digitale identiteit, door technologische innovatie en culturele trots te combineren.\n\n**Missie**: De fysieke visitekaartje transformeren tot een intelligente, controleerbare, veilige en toegankelijke digitale identiteit voor iedereen — met name voor Afrikaanse ondernemers, ontwikkelaars en leiders.\n\nWe geloven in een toekomst waarin digitale identiteit professionele verbindingen versterkt terwijl de culturele wortels van elk persoon worden behouden."
    },
    value: {
      title: "Toegevoegde waarde voor gebruikers",
      content: "Luvika levert een significante toegevoegde waarde aan zijn gebruikers:\n\n• **Gebruiksgemak**: Intuïtieve en meertalige interface, toegankelijk voor iedereen\n• **Versterkte beveiliging**: Totale controle over uw persoonlijke en professionele gegevens\n• **Connectiviteit**: Gemakkelijker professionele uitwisselingen dankzij NFC-technologie\n• **Zichtbaarheid**: Waardering van uw profiel en vaardigheden\n• **Cultuur**: Waardering van identiteit en culturele wortels\n• **Economie**: Creatie van waarde en commerciële kansen\n• **Innovatie**: Geavanceerde technologie in dienst van persoonlijke en professionele ontwikkeling"
    },
    perspective: {
      title: "Perspectief en ambitie van het project",
      content: "Luvika heeft de ambitie om:\n\n• **Netwerken te revolutioneren** in Afrika en de wereld\n• **Een digitaal ecosysteem te creëren** dat professioneel en cultureel geworteld is\n• **Uitwisselingen te vergemakkelijken** tussen Afrikaanse en internationale professionals\n• **Afrikaanse technologische innovatie te bevorderen**\n• **Bij te dragen aan de economische ontwikkeling** van het continent\n• **Een onmisbaar platform te worden** voor professionals over de hele wereld\n\nOns doel is om van Luvika een symbool te maken van Afrikaanse technologische uitmuntendheid, terwijl we diep verbonden blijven met de waarden en identiteit van zijn gebruikers."
    }
  },
  sw: {
    title: "Kuhusu LUVIKA",
    subtitle: "Luvika: Asili ya jina na uzuri wa mradi",
    origin: {
      title: "Asili ya jina Luvika",
      content: "Jina Luvika linatokana na kuunganisha vipengele viwili vya maana:\n• Luvi, linatokana na neno Luvila, kutoka lugha ya Kikongo, linalomaanisha utambulisho, uhai, kinachowafafanua kila mtu.\n• Ka, linalomaanisha kadi, kinarejelea kifaa cha utambulisho.\n\nKwa hivyo, Luvika inaweza kueleweka kama utambulisho unaosafirishwa na kadi.\n\nJina hili linawakilisha maono ya mradi: kutoa utambulisho wa kidijitali wa kisasa, unaosajiliwa kwenye kadi ya NFC, iwezekanisha kila mtu kujitambulisha, kushiriki wasifu wake wa kikazi na kuthibitisha utambulisho wake kwa njia rahisi, ya usalama na ya kuboresha.\nKupitia Luvika, utambulisho hauwezi tena kuwa rahisi tu: huwa kidijitali, kinaweza kusafirishwa na kinaweza kuunganishwa, wakati inaacha kuwa imara kwa asili yake ya kitamaduni na ya kibinadamu."
    },
    context: {
      title: "Muktadha na wazo la awali",
      content: "Luvika ilizaliwa kutokana na kufikiria kibinafsi na kina. Wakati wa amani, nilijiuliza jinsi ningeweza kuthibitisha rasilimali zangu, asili zangu na utambulisho wangu, hasa wa kabila langu. Wazo la awali lilikuwa kuunda suluhisho linaloweza kuunganisha watu tena kwa vyanzo vyao, iwezekanisha kuthibitisha historia yao, kijiji chao cha asili, kabila chao na ujamao wao.\n\nMawazo ya awali yalilenga kuendeleza programu inayoweza kubainisha wazi asili ya mtu: kijiji chake, kabila chake, jamaa lake. Kupitia jukwaa hili, vipengele hivi vya kitamaduni na vya utambulisho vinaweza kujifunzwa, kushirikiwa na kuhifadhiwa."
    },
    problem: {
      title: "Tatizo limegunduliwa / kikomo cha dhana ya awali",
      content: "Hata hivyo, uchambuzi wa kina umenifanya nifahamu jambo muhimu: mradi unaokusudiwa tu kwenye utambulisho wa kitamaduni unakumbatia kipato kikubwa na hakinafanya kujitokeza kwa watu wengi."
    },
    transformation: {
      title: "Mabadiliko ya kisiasa ya mradi",
      content: "Kisha palikuwa mabadiliko ya kisiasa ya dhana. Luvika ilibadilika kuwa kitambulisho cha kikazi cha kidijitali, kinachotegemea mfumo wa kadi za NFC, wakati utambulisho unaacha kuwa msingi wa msingi wa maono yake. Mabadiliko haya yameniwezesha kuleta mradi faida halisi, ya kisasa na ya kimataifa, inayojibu mahitaji halisi ya kikazi na ya biashara."
    },
    solution: {
      title: "Kuzaliwa kwa suluhisho la Luvika (NFC na utambulisho wa kidijitali)",
      content: "Wakati wa kujengwa, likawezekana kuelewa kwamba kujenga tu wasifu wa watumiaji si kutosha. Kwa hivyo, Luvika ilijengwa kuhusu mipango mitatu inayotofautiana:\n• Mpango wa Msingi, unalengwa kwa watumiaji ambao wanataka uwepo wa kidijitali unaosahauliwa na unaofikiwa.\n• Mpango wa Kikazi, unatoa uwezo wa juu, unajumuisha kuunda na kudhibiti matukio kama vile mikutano, harusi, sherehe au mkutano wa kikazi.\n• Mpango wa Biashara, unalengwa kwa mashirika na watumiaji ambao wana mahitaji makubwa, unajumuisha zana za mauzo, uonekano na usimamizi wa juu.\n\nDhahiri ya muundo huu, Luvika imekuwa zaidi ya programu rahisi. Ni leo jukwaa la kila aina linalowezesha kuthibitisha utambulisho, kufacilitiisha mawasiliano ya kikazi, kudigitalisha kadi za utambulisho wa kikazi kupitia teknolojia ya NFC na kuunda thamani ya kiuchumi kwa watumiaji wake."
    },
    offers: {
      title: "Muundo wa ofa (Msingi, Kikazi, Biashara)",
      content: "Luvika inatoa mipango mitatu ya bei inayofaa mahitaji tofauti:\n\n**Mpango wa Msingi**: Kwa watu binafsi ambao wanataka uwepo wa kidijitali unaosahauliwa na unaofikiwa. Inafaa kwa wanafunzi, wafanyakazi wapya na watu binafsi.\n\n**Mpango wa Kikazi**: Kwa wafanyakazi, wajasiriamali na wafanyakazi. Inatoa uwezo wa juu kama vile kuunda matukio, usimamizi wa mawasiliano na zana za kuvutia wafanyakazi.\n\n**Mpango wa Biashara**: Kwa mashirika na mashirika. Inajumuisha zana za usimamizi wa timu, uonekano wa biashara na kuunda thamani ya kiuchumi."
    },
    vision: {
      title: "Maono na malengo ya Luvika",
      content: "**Maono**: Kuwa kibambo cha Afrika cha utambulisho wa kikazi wa kidijitali, kinachojumuisha ubunifu wa teknolojia na kiburi cha kitamaduni.\n\n**Malengo**: Kubadilisha kadi ya wakati wa kimwili kuwa utambulisho wa kidijitali unaosimamiwa, unaosimamiwa, unaosimamiwa na unaofikiwa kwa kila mtu — hasa kwa wajasiriamali, watoa mazingira na wale wanaotawala Afrika.\n\nTunamwamini katika siku ambayo utambulisho wa kidijitali unawezesha kuimarisha mawasiliano ya kikazi wakati unapambana na mizizi ya kitamaduni ya kila mtu."
    },
    value: {
      title: "Thamani inayowekwa kwa watumiaji",
      content: "Luvika inaweka thamani kubwa kwa watumiaji wake:\n\n• **Urahisi wa matumizi**: Kiongozi cha kielelezo kinachofaa kila lugha, kinachofikiwa kwa kila mtu\n• **Usalama ulioimarishwa**: Udhibiti kamili wa data yako ya kibinafsi na ya kikazi\n• **Unganisha**: Mawasiliano ya kikazi yanayofikiwa kwa teknolojia ya NFC\n• **Uonekano**: Kuthibitisha wasifu wako na uwezo wako\n• **Tamaduni**: Kuthibitisha utambulisho na mizizi ya kitamaduni\n• **Uchumi**: Kuunda thamani na fursa za biashara\n• **Ubunifu**: Teknolojia ya juu inayotumika kwa maendeleo ya kibinafsi na ya kikazi"
    },
    perspective: {
      title: "Mwanzo na hamu ya mradi",
      content: "Luvika ina hamu ya:\n\n• **Kubadilisha mawasiliano** Afrika na ulimwengu\n• **Kujenga mfumo wa kidijitali** unaosimamiwa kwa kikazi na kitamaduni\n• **Kufacilitiisha mawasiliano** kati ya wafanyakazi wa Afrika na wa kimataifa\n• **Kuthibitisha ubunifu wa teknolojia wa Afrika**\n• **Kuchangia maendeleo ya kiuchumi** ya bara\n• **Kuwa jukwaa muhimu** kwa wafanyakazi wa ulimwengu\n\nLengo letu ni kufanya Luvika kuwa kibambo cha uwezo wa teknolojia wa Afrika, wakati unaacha kuwa imara kwa maadili na utambulisho wa watumiaji wake."
    }
  },
  ar: {
    title: "عن LUVIKA",
    subtitle: "Luvika: أصل الاسم ونشأة المشروع",
    origin: {
      title: "أصل اسم Luvika",
      content: "يأتي اسم Luvika من دمج عنصرين مهمين:\n• Luvi، مشتق من كلمة Luvila، من اللغة الكيكونغو، التي تشير إلى الهوية، الجوهر، ما يحدد الشخص بشكل عميق.\n• Ka، تعني بطاقة، تشير إلى وسيلة التعريف.\n\nوبالتالي، يمكن فهم Luvika كهوية يحملها بطاقة.\n\nهذا الاسم يجسد رؤية المشروع: تقديم هوية رقمية حديثة، مدمجة في بطاقة NFC، تسمح لكل فرد بتقديم نفسه، مشاركة ملفه المهني وتقييم هويته بطريقة بسيطة وآمنة ومبتكرة.\nمن خلال Luvika، لم تعد الهوية مجرد إعلان: أصبحت رقمية، قابلة للحمل ومتصلة، مع البقاء أمينة لجوهرها الثقافي والإنساني."
    },
    context: {
      title: "السياق والفكرة الأولية",
      content: "نبع Luvika من تأمل شخصي وعميق. في لحظة هدوء، كنت أتساءل كيف يمكنني تقييم مواردي، أصولي وهويتي، خصوصًا تلك الخاصة بقبيلتي. كانت الفكرة الأولية هي إنشاء حل قادر على إعادة ربط الناس بمصادرهم، مما يسمح لهم بتقييم تاريخهم، قريتهم الأصلية، قبيلتهم وانتمائهم للعشيرة.\n\nلذلك كان الهدف من المفهوم الأولي هو تطوير تطبيق قادر على تحديد أصل الشخص بوضوح: قريته، قبيلته، عشيرته. من خلال هذا المنصة، يمكن معرفة هذه العناصر الثقافية والهوية، مشاركتها وحفظها."
    },
    problem: {
      title: "المشكلة المحددة / قيد المفهوم الأولي",
      content: "ومع ذلك، أدى التحليل الأعمق إلى وعي مهم: مشروع يركز حصريًا على الهوية الثقافية كان يخاطر بالوصول إلى جمهور محدود وعدم تعزيز اعتماد واسع."
    },
    transformation: {
      title: "التحول الاستراتيجي للمشروع",
      content: "ثم حدث تحول استراتيجي في المفهوم. تطور Luvika ليصبح معرفًا مهنيًا رقميًا، مبنيًا على نظام بطاقات NFC، مع الحفاظ على الهوية كأساس أساسي لرؤيته. سمح هذا التطور بإحضار مشروع مفيد بشكل ملموس وحديث وعالمي، يستجيب لاحتياجات مهنية وتجارية حقيقية."
    },
    solution: {
      title: "ولادة حل Luvika (NFC والهوية الرقمية)",
      content: "أثناء التطوير، أصبح من الواضح أن مجرد إنشاء ملفات تعريف المستخدمين لا يكفي. وهكذا، تم هيكلة Luvika حول ثلاث خطط مختلفة:\n• الخطة الأساسية، مخصصة للمستخدمين الذين يريدون وجود رقمي بسيط وسهل الوصول.\n• الخطة المهنية، تقدم ميزات متقدمة، بما في ذلك إنشاء وإدارة الأحداث مثل المؤتمرات، حفلات الزفاف، الحفلات أو الاجتماعات المهنية.\n• خطة الأعمال، مصممة للشركات والمستخدمين ذوي الاحتياجات الموسعة، تدمج أدوات المبيعات، الرؤية والإدارة المتقدمة.\n\nبفضل هذا التنظيم، أصبح Luvika أكثر من مجرد تطبيق بسيط. إنه اليوم منصة متعددة الاستخدامات تسمح بتقييم الهوية، تسهيل التبادلات المهنية، رقمية بطاقات التعريف المهنية عبر تقنية NFC وخلق قيمة اقتصادية لمستخدميها."
    },
    offers: {
      title: "هيكلة العروض (أساسي، مهني، أعمال)",
      content: "يقدم Luvika ثلاث خطط أسعار مخصصة لاحتياجات مختلفة:\n\n**الخطة الأساسية**: للأفراد الذين يريدون وجود رقمي بسيط وسهل الوصول. مثالي للطلاب، الشباب المهنيين والأفراد.\n\n**الخطة المهنية**: للمستقلين، رواد الأعمال والمهنيين. تقدم ميزات متقدمة مثل إنشاء الأحداث، إدارة الاتصالات وأدوات الشبكات.\n\n**خطة الأعمال**: للشركات والمنظمات. تدمج أدوات إدارة الفريق، الرؤية التجارية وخلق القيمة الاقتصادية."
    },
    vision: {
      title: "رؤية ورسالة Luvika",
      content: "**الرؤية**: أن نصبح المرجع الأفريقي للهوية الرقمية المهنية، من خلال الجمع بين الابتكار التكنولوجي والفخر الثقافي.\n\n**الرسالة**: تحويل بطاقة العمل المادية إلى هوية رقمية ذكية، قابلة للتحكم، آمنة ومتاحة للجميع — خصوصًا لرواد الأعمال، المطورين والقادة الأفارقة.\n\nنؤمن بمستقبل حيث تعزز الهوية الرقمية الروابط المهنية مع الحفاظ على الجذور الثقافية لكل شخص."
    },
    value: {
      title: "القيمة المضافة للمستخدمين",
      content: "يجلب Luvika قيمة مضافة كبيرة لمستخدميه:\n\n• **سهولة الاستخدام**: واجهة بديهية متعددة اللغات، متاحة للجميع\n• **الأمان المعزز**: تحكم كامل في بياناتك الشخصية والمهنية\n• **الاتصال**: تسهيل التبادلات المهنية بفضل تقنية NFC\n• **الرؤية**: تعزيز ملفك ومهاراتك\n• **الثقافة**: تعزيز الهوية والجذور الثقافية\n• **الاقتصاد**: خلق قيمة وفرص تجارية\n• **الابتكار**: تقنية متطورة في خدمة التنمية الشخصية والمهنية"
    },
    perspective: {
      title: "منظور وطموح المشروع",
      content: "يملك Luvika طموح:\n\n• **إعادة تشكيل الشبكات** في أفريقيا والعالم\n• **إنشاء نظام رقمي** مهني ومتجذر ثقافيًا\n• **تسهيل التبادلات** بين المهنيين الأفارقة والدوليين\n• **تعزيز الابتكار التكنولوجي الأفريقي**\n• **المساهمة في التنمية الاقتصادية** للقارة\n• **أن تصبح منصة لا غنى عنها** للمهنيين في جميع أنحاء العالم\n\nهدفنا هو جعل Luvika رمزًا للتميز التكنولوجي الأفريقي، مع البقاء مرتبطًا بعمق بالقيم وهوية مستخدميها."
    }
  }
};

// Fonction pour mettre à jour un fichier de traduction
function updateTranslationFile(locale, content) {
  const filePath = path.join(__dirname, `../messages/${locale}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Fichier ${locale}.json n'existe pas, passage au suivant.`);
    return;
  }

  try {
    // Lire le fichier existant
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const translation = JSON.parse(fileContent);

    // Mettre à jour uniquement la section about
    translation.about = content;

    // Écrire le fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(translation, null, 2), 'utf8');
    console.log(`✓ Fichier ${locale}.json mis à jour avec succès`);
  } catch (error) {
    console.error(`✗ Erreur lors de la mise à jour de ${locale}.json:`, error.message);
  }
}

// Mettre à jour tous les fichiers de traduction
console.log('Mise à jour des traductions pour la page À propos...\n');

Object.entries(aboutContent).forEach(([locale, content]) => {
  updateTranslationFile(locale, content);
});

console.log('\nMise à jour terminée !');
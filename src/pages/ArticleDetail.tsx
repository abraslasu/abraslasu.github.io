import { useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '../assets/close.svg';
import { useSuppressUI } from '../hooks/useSuppressUI';

type ArticleContent = {
  id: string;
  title: string;
  author: string;
  lead?: string;
  paragraphs: string[];
};

const ARTICLES: ArticleContent[] = [
  {
    id: 'vita-sicura',
    title: 'Vita sicura',
    author: 'Alex Boca',
    lead: 'În Italia este larg răspândit conceptul de Bella Figura: o impresie psihologică potrivit căreia trebuie să arăți bine, distins și elegant – aspect cultural care influențează comportamentul și idealurile personale ale italienilor.',
    paragraphs: [
      'Bella Figura descrie preocuparea excesivă cu aparențele care ajung să influențeze individul și autenticitatea lui. Acesta se conformează imperativului estetic și caută să fie sofisticat, frumos și elegant, prin investiții logistice și morale.',
      'La români, un concept care descrie o psihologie și o motivație existențial-culturală ar putea fi numită Vita Sicura – dorința de securitate, certitudine și stabilitate. Pentru a supraviețui în fața amenințărilor lumii externe, visăm la o viață sigură și previzibilă din care nu trebuie să lipsească resursele și măsurile împotriva pericolului. Dorința de auto-conservare aduce îngrijorare față de ziua de mâine, precum și o paranoia generală în relație cu lumea externă, compusă atât din oameni rău-intenționați, cât și din scenarii catastrofice neprevăzute.',
      'Aici, constanta culturală nu este preocuparea cu frumusețea, cum e la verișorii mediteraneeni, ci o obsesie cu „a pune pâine pe masă”, într-o lume în care, ironic, nu se mai moare de foame. Această ambiție de viață sigură este nejustificată, fiind o moștenire alimentată și perpetuată instinctiv, în cultura românească, prin frică și conservatorism. Rea-credința, în sensul de falsă convingere, primește dimensiune culturală: individul crede iluzia că supraviețuirea îi este constant amenințată, ceea ce genera teama ca sentiment existențial de bază. Aceasta îl împinge să caute siguranța prin mijloace oportuniste care întrețin inautenticitatea și instabilitatea. Un cerc vicios al amenințării și al supraviețuirii: ouroboros carpatin, survival-mode anxiogenic, unde reziliența produsă e o măsură doar împotriva propriei ființe.',
      'Ca la italieni, și la români poate exista o preocupare pentru aparențe și frumusețe, însă rareori estetica în sine este scopul. Aceasta se subscrie fricii existențiale doar ca o altă strategie de supraviețuire, una pe care o putem numi, mai specific: cosmetizare. Valoarea frumuseții reiese din capacitatea sa de a genera profit, like-uri, contacte sau recunoaștere, ceea ce va garanta un loc în lume celui care poate juca această carte. Dar dacă voalul aparențelor este îndepărtat, esența i-ar putea fi descoperită, vulnerabilizată, și de aceea omul arătos o ascunde sub un ego narcisic, dar fragil. Cosmetizarea este o strategie prin care ne obiectificăm pentru securitate, ne ascundem adevăratul chip și încercăm să ne creștem valoarea în mod artificial.',
      'O altă strategie a românilor de a se apropia de Vita Sicura este disimularea, sau vrăjeala. În dialog, în scris, în relații și afaceri, în relație cu sinele, disimularea este un mod de a crea subterfugii care să-l ajute pe individ să evite amenințări la adresa sa, ori să obțină un avantaj. Vrăjeala este o artă a iluziei, nu optice, ci existențiale, prin care folosim sofisme, complicații și lingușeli a căror scop este apărarea prin învăluire. Evitarea mesajelor directe are la bază instinctul de prezervare a ego-ului, care devine exacerbat pentru omul care vede lumea cu neîncredere și frică.',
      'Acest modus vivendi care idealizează siguranța vine dintr-o percepție că lumea este un loc periculos, competitiv și umilitor pentru cei care se vulnerabilizează. Ca măsură, adesea ne este insuflată de mici ambiția de a fi excelenți, de a ne perfecționa ca să supraviețuim prin rezultatele de care suntem în stare. În sportul de performanță, sau în artele vizuale, este observabil acest fenomen în care doar prin măreție supremă ești demn de recunoaștere și recompensă – însă doar dacă ești comparabil cu cei mai buni. Elitismul ca leac pentru un sentiment de insuficiență.',
      'Italienii vor să arate bine, românii caută să le fie bine, dar ce au în comun cele două culturi latine este o lipsă de preocupare cu esența, o obsesie cu aparențele și o motivație bazată pe circumstanțe. La italieni, frumusețea este auto-adorație și strategie de a-l impresiona pe celălalt, a-l învălui și a construi o alură scumpă: existența ostentativă. La români, siguranța este un mod de a exista prin acumulare de bunuri, avantaje și garanții orientate spre aranjarea contextului imediat: o constantă scormonire după securitate. Vezi obținerea unei proprietăți în nume propriu, cămara cu borcane, carnetul plin de 10, un post călduț la stat, PCR (pile, cunoștințe și relații), colecția de diplome, banii la saltea ș.a.',
      'Din motivația de supraviețuire apar apoi comportamente precum: obsesia cu banii, avariția, sclavia voluntară (corporatism sau mercenarism), posesivitatea, materialismul, dorința de acumulare, insatisfacția. Toate acestea sunt manifestări ale falsei credințe că siguranța este cea mai mare valoare – să ai ce mânca, să ai un acoperiș deasupra capului, să îți asiguri viitorul – toate fetișuri ale unei culturi lipsită de dialog, căutări autentice și înțelepciune. Aici, rezultatul rămâne mereu înaintea procesului, iar omul, chiar dacă și-a asigurat supraviețuirea, nu știe ce să facă cu ea.'
    ],
  },
  {
    id: 'to-listen',
    title: 'To Listen or Not to Listen',
    author: 'Alex Boca',
    paragraphs: [
      'There are some reasons that work together to make us listen to a story. The emotional intrigue the narrator creates is how we are drawn in – their delivery may be intense and passionate, or the subject may be appealing to us, whether it is gossip, news or ideas – if the stories are delivered in a way that speaks to our emotion, we can be sucked in. When the performative dimension of storytelling is refined, we tend to believe that the story matters because of the way it is told: the voice, the mannerisms, the body language, they all contribute to a potentially seductive performance. Some people speak with confidence, seriousness, humor or hope, which, when combined, makes the attitude quite intriguing. Others have a style based on charisma, tension and passion. Whatever performative strategy one adopts, we tend to be enthralled by them and listen. On the other hand, if the attitude of the storyteller is anxious, evasive or insecure, we might react with no confidence or curiosity in the person speaking, even if what they are saying might be interesting, it doesn’t matter, because the form is lacking.',
      'On the level of the structure of the content, we listen to someone more easily when the story they are telling is clear, ideas follow a logical order, the messages are being conveyed intentionally, and the language is familiar or does not create confusion. This requires trained communication skills – knowing how to express the content coherently, rather than in a confused or convoluted way. Some pragmatic people are very good at this type of communication, especially when they want to sell you something, whether an idea or a product. They have an idea in mind and create a narrative axis for it, which serves as the red line of their storytelling. Then, how that axis is enriched or subverted, through a twist or a surprise, also depends on the fact that the narrative remains clear up to that subversion point. The same applies to an idea or a belief in a dialogue: if the idea is not clearly expressed, it cannot be understood or critically examined.',
      'This was a short analysis of when storytelling works or doesn’t work in itself, but now we shift towards practical philosophy, where we do not listen to other people’s stories, for the following reasons, grouped in 3 main categories:',
      'Going from the particular, to shared generality',
      '1.⁠ ⁠The format we work with is dialogue, not narrative exposition. This is what we train: the ability to move back and forth in order to understand a subject, using questions and answers. Sometimes we may use a story or an event to initiate a dialogue, whether it is literature or something someone said or did, but we always aim to have an exchange.',
      '2.⁠ ⁠We want to move away from concrete worldly narratives in order to avoid endless discussions about trivial topics: small talk, gossip, external or internal physical circumstances (illness, material impediments, conditions, distractions, indulgence). Instead, we aim to enter the sphere of abstract thinking — where we analyze and connect concepts. ',
      '3.⁠ ⁠We interrupt stories because we want to move towards a more objective understanding when we engage in dialogue, thereby training abstract thinking and general communication capacity. We do not accept subjective or particular argumentation, which only functions in certain cases; instead, we are interested in the mental mechanisms by which ideas are generated, transmitted and problematized in a more broad and rational manner. Training the thinking competencies produces decisional and creative power, which leads to a more autonomous being.',
      'Thinking capacity',
      '1.⁠ ⁠Stories can block thinking because people tend to repeat them and automatically mentally return to what they already know has happened to them in life. Here there is no critical or creative thinking, only acceptance and repetition, which may reinforce the memory or the rhetoric in which a story is told, but the ability to think is withering in this automatic return, a reflex answer to any new challenge. A story is something prefabricated, but practical philosophy is a creative endeavor; it is an act of co-creation of ideas, not of repetition or dissemination of already existing content. In dialogue, there is a reciprocal potentiation that interlocutors experience if they know how to inspire one another and draw ideas from what the other said in order to grow their consciousness through understanding, criticism and creation.',
      '2.⁠ ⁠We do not accept or listen to stories because they can often be long expositions that consume the energy and time of listeners, when the same idea could be conveyed more directly and “economically”. This is an avoidance of thought training and can dull the mind of both the speaker and his audience, preparing both to be in producer and consumer disposition. In practical philosophy, we do not work on storytelling ability or on the narrator’s charisma, but on thinking skills mainly. Such long discourses may be more appropriate for talk therapy or psychoanalysis approaches, whereas in practical philosophy the Socratic dialogue is the primary mode of interaction.',
      '3.⁠ ⁠We interrupt stories because we want to train the capacity for conceptual synthesis. In the mere recounting of an event or an experience, the storyteller will describe where they were, what they saw, what they felt, in great detail. We want to see whether they can extract concepts and reasons from that experience, so that we can hear clearly the conscious judgment they themselves make about it. A person’s perspective is unique, but it can be processed instead of being rendered descriptively, it can be compressed into the form of an idea. If the experience has not been processed, we interrupt the story and ask questions to support a synthesis and processing stage. When we lack such external support, we must rely on our own discipline and reflect on the experiences ourselves, rather than just repeating them as they occurred.',
      'Dismantling fixist belief',
      '1.⁠ ⁠We deconstruct the personal myth. Stories are parts of foundational myths of identity — the stories people tell themselves justify a certain way of being or thinking, which may not make sense when tested in rational dialogue. For this reason, we prefer to see how a person thinks here and now, rather than accepting the justification or explanation that underlies someone’s personal “religion.” The founding myth is put into question and their identity is challenged in a way which dynamizes the being. Consider the example of someone who has a life story and repeats it constantly, living in the past without thinking about the present or the future. Whether they regard their story as one of glory or of trauma, what is common is the pleasure of telling it repeatedly and affirming their identity through what they have lived. In practical philosophy, we see identity construction as a continuous and endless process: we do not define ourselves through past actions alone, but evolve through our discovery of self.',
      '2.⁠ ⁠We seek a more authentic way of being. Stories can be lies, in the sense that a falsehood is told in bad faith — something a person knows is not true but keeps repeating because it brings them certain advantages or justifies some behaviour. Here lies the risk of believing a false story without realizing it is false, as auditors, if we simply listen, believe and grant the recognition the person seeks – and in that way, their lie becomes stronger. We can test their authenticity if we interrupt the story and initiate a dialogue, looking to reveal more than just the constructed narrative or image.',
      '3.⁠ ⁠We encourage detachment. Being able to extract a concept from an experience shows that one has adopted a certain distance from the event and can derive concepts that help in understanding and consciously analyzing a phenomenon. Otherwise, as long as the phenomenon is replayed mentally and linguistically, it has not truly ended: although it no longer takes place, psychologically and mentally we are still there, with our subjectivity, reliving it in our imagination. Thinking “coldly” about an event teaches us to detach and to extract ideas from life experiences, in order to develop awareness of the self and of the world.',
    ],
  },
];

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Suppress the global Header and Footer while this component is mounted
  useSuppressUI('article-detail');

  const article = ARTICLES.find((a) => a.id === id);

  if (!id || !article) {
    return null;
  }

  const handleClose = () => {
    navigate('/articles');
  };

  return (
    <div className="fixed inset-0 z-50 bg-palette-1 flex flex-col">
      {/* Close button (Top Right) */}
      <div className="absolute top-[var(--fluid-20-45)] right-[var(--fluid-20-45)] z-50">
        <button
          type="button"
          onClick={handleClose}
          className="text-black hover:opacity-70 transition-opacity"
          aria-label="Închide articolul"
        >
          <img src={CloseIcon} alt="Close" className="h-6 w-6" />
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-grow flex flex-col items-center justify-center w-full">
        <div className="w-full max-h-[90vh] overflow-y-auto">
          <div className="mx-auto w-full md:w-[50vw] px-[var(--fluid-20-45)] py-[var(--fluid-32-40)] text-left">
            <h2 className="typo-h2 mb-2">{article.title}</h2>
            <p className="typo-caption text-[#A1A1A1] uppercase mb-6">{article.author}</p>
            {article.lead && <p className="typo-leading-p mb-8">{article.lead}</p>}
            <div className="flex flex-col gap-4">
              {article.paragraphs.map((paragraph, index) => (
                <p key={index} className="typo-p">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

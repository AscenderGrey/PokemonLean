import Link from "next/link";
import {RELATIONS, PRICE, FAMILY_PRICE} from "@/lib/quiz-data";

/**
 * The landing. Reuses the prototype's promise, the provided templates and the same benefit/offer
 * presentation the paywall uses, so the reason to start is visible before the quiz.
 */
export default function Page() {
  return (
    <main className="landing">
      <header className="bar">
        <Link className="brand" href="/">So<em>Me</em>Card</Link>
        <Link className="btn big" href="/create">Skapa kort</Link>
      </header>

      <section className="hero">
        <p className="kicker">Ett personligt samlarkort</p>
        <h1>Gör någon du känner<br />till ett kort de vill spara.</h1>
        <p className="lede">
          Välj relation, lägg till ett foto och berätta några saker som bara du vet.
          Vi formar det till ett personligt samlarkort.
        </p>
        <div className="row">
          <Link className="btn big" href="/create">Skapa ditt kort →</Link>
        </div>
        <p className="note">Börja gratis · Se en förhandsvisning · Betala bara om du gillar resultatet</p>
      </section>

      <section className="sect" aria-labelledby="templates">
        <h2 id="templates">Välj vem kortet är till</h2>
        <h3 className="lede2">Sju kortmallar. En person som är helt egen.</h3>
        <ul className="rail">
          {RELATIONS.map(r => (
            <li key={r.key}>
              <Link className="railItem" href="/create">
                <img src={`/templates/preview/${r.template}.webp`} alt={`${r.label} kortmall`} width={560} height={750} loading="lazy" />
                <span>{r.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sect" aria-labelledby="benefits">
        <h2 id="benefits">Du bestämmer när det är klart</h2>
        <h3 className="lede2">Förhandsvisningen kostar inget.</h3>
        <p className="sub">Ta dig hela vägen till ett utkast först. Om kortet känns rätt väljer du det paket som passar.</p>
        <div className="gets">
          <div className="get"><b>Hela kortet</b><span className="d">Allt på kortet, inte bara toppen.</span></div>
          <div className="get"><b>Packet att riva upp</b><span className="d">Mottagaren får en länk och river upp det i mobilen.</span></div>
          <div className="get"><b>Skriv ut hemma</b><span className="d">Ett riktigt kort i handen.</span></div>
          <div className="get"><b>Skicka i chatten</b><span className="d">En bild att skicka till familjen.</span></div>
        </div>
      </section>

      <section className="sect" aria-labelledby="offers">
        <h2 id="offers">Välj paket</h2>
        <div className="offers2">
          <div className="offer fam">
            <span className="tagb">Bäst värde</span>
            <b>Familjepacket · {FAMILY_PRICE} kr</b><span>5 kort, ca 50 kr styck</span>
          </div>
          <div className="offer">
            <b>Ett kort · {PRICE} kr</b><span>Ett personligt kort, gjort för en person</span>
          </div>
        </div>
        <p className="note">Säker betalning sker i kassan. Du väljer tillgängligt betalsätt i kassan.</p>
      </section>

      <section className="sect" aria-labelledby="faq">
        <h2 id="faq">Vanliga frågor</h2>
        <div className="faq">
          <details><summary>Måste jag betala för att börja?</summary><p>Nej. Du kan skapa ett utkast och se förhandsvisningen innan du bestämmer dig.</p></details>
          <details><summary>Behöver jag skriva mycket?</summary><p>Nej. Några detaljer om personen räcker för att komma igång.</p></details>
          <details><summary>Vad händer med mitt foto?</summary><p>Fotot används för att skapa ditt kort.</p></details>
        </div>
      </section>

      <section className="final">
        <h2>Det bästa kortet börjar med någon du känner.</h2>
        <Link className="btn big" href="/create">Skapa ditt kort →</Link>
      </section>
    </main>
  );
}

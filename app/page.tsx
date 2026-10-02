import Link from "next/link";

/**
 * The landing page. Copy and structure follow the production landing (reference/production-landing.tsx
 * and reference/landing-live.html); this is the trimmed version with the same promise and CTA.
 */
export default function Page() {
  return (
    <main>
      <p className="eyebrow">En present med personlighet</p>
      <h1>Ett kort som<br />verkligen<br /><i>beskriver dig.</i></h1>
      <p className="lede">
        Gör någon du tycker om till huvudperson i ett eget samlarkort. Välj ett foto, svara på några
        frågor och skapa en present som känns personlig på riktigt.
      </p>
      <div className="actions">
        <Link className="button" href="/create">Skapa ett kort</Link>
        <Link className="button quiet" href="/demo">Se demon</Link>
      </div>
      <p className="lede" style={{marginTop: 26}}>Börja gratis · köp när du vill beställa kortet</p>
      <div className="steps">
        <p><b>01</b> Välj ett foto</p>
        <p><b>02</b> Berätta vad som gör personen speciell</p>
        <p><b>03</b> Skapa en present att spara</p>
      </div>
    </main>
  );
}

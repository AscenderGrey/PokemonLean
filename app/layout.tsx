import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoMeCard — ett kort som verkligen beskriver dig",
  description: "Gör någon du tycker om till huvudperson i ett eget samlarkort."
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="sv"><body>{children}</body></html>;
}

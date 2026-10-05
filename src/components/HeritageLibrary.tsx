import { useMemo, useState, type CSSProperties } from "react";
import { artifacts } from "../data/gameData";
import type { ArtifactDefinition } from "../types/game";

type HeritageLibraryProps = {
  onView3D?: (artifact: ArtifactDefinition) => void;
  onEnterWorld?: (locationId: string) => void;
  onAR?: (artifact: ArtifactDefinition) => void;
  onVR?: (artifact: ArtifactDefinition) => void;
};

type HeritageBook = {
  id: string;
  artifactId: string;
  locationId: string;
  title: string;
  spine: string;
  region: string;
  era: string;
  type: string;
  accent: string;
  base: string;
  deep: string;
  ink: string;
  blurb: string;
  history: string;
  architecture: string;
  significance: string;
  discoveries: string[];
};

const HERITAGE_BOOKS: HeritageBook[] = [
  {
    id: "hampi",
    artifactId: "stone-chariot",
    locationId: "hampi",
    title: "HAMPI",
    spine: "HAMPI · STONE CHARIOT",
    region: "Karnataka",
    era: "Vijayanagara",
    type: "Heritage City",
    accent: "#d8a64d",
    base: "#614323",
    deep: "#2b1a0e",
    ink: "#f2e5c6",
    blurb:
      "Ruins, sacred spaces, market streets and the iconic Stone Chariot turn Hampi into an open-world history lesson.",
    history:
      "Hampi was the capital of the Vijayanagara Empire and grew into a major centre of political power, trade, religion and art. Virasat uses the Stone Chariot as the gateway into this larger cultural landscape.",
    architecture:
      "The landscape combines temple complexes, monumental gateways, mandapas, stepped structures, boulder fields and carefully planned public spaces. The Stone Chariot is the visual anchor of the game world.",
    significance:
      "Hampi helps learners see how a historic city works as a connected cultural system rather than as a collection of isolated monuments.",
    discoveries: [
      "Stone Chariot and temple architecture",
      "Vijayanagara urban landscape",
      "Markets, water systems and sacred spaces",
      "Cultural puzzle: restore the lost blueprint",
    ],
  },
  {
    id: "konark",
    artifactId: "sun-wheel",
    locationId: "konark",
    title: "KONARK",
    spine: "KONARK · SUN TEMPLE",
    region: "Odisha",
    era: "13th century",
    type: "Temple Architecture",
    accent: "#e6b95f",
    base: "#8a5b25",
    deep: "#4d2d10",
    ink: "#fff0c9",
    blurb:
      "A temple imagined as the monumental chariot of the Sun, famous for its wheels, sculpture and architectural symbolism.",
    history:
      "The Konark Sun Temple is one of India's best-known monuments of the eastern Indian temple tradition. Its monumental form is closely associated with the imagery of Surya's chariot.",
    architecture:
      "The temple complex is celebrated for richly carved stone surfaces and large wheel forms that make the structure read visually as a cosmic vehicle.",
    significance:
      "Konark demonstrates how architecture can encode mythology, astronomy, craftsmanship and symbolism into a single spatial experience.",
    discoveries: [
      "Sun Temple wheel symbolism",
      "Sculptural stone craftsmanship",
      "Eastern Indian temple traditions",
      "Pattern and geometry challenges",
    ],
  },
  {
    id: "rajasthan",
    artifactId: "weave-pattern",
    locationId: "rajasthan",
    title: "RAJASTHAN",
    spine: "RAJASTHAN · LIVING CRAFT",
    region: "Rajasthan",
    era: "Living tradition",
    type: "Craft & Culture",
    accent: "#d17948",
    base: "#74342a",
    deep: "#351614",
    ink: "#f8e8d0",
    blurb:
      "Colour, textile, pattern and craft become playable clues to a living cultural landscape.",
    history:
      "Rajasthan is home to diverse artistic and craft traditions that have been carried across generations. Virasat treats pattern recognition as an entry point into that living heritage.",
    architecture:
      "Beyond monuments, cultural identity can be read through materials, motifs, textiles, decorative techniques and regional visual languages.",
    significance:
      "This volume expands heritage beyond stone monuments and shows that intangible and living traditions can become interactive learning experiences too.",
    discoveries: [
      "Textile and motif traditions",
      "Regional visual language",
      "Craft as intergenerational knowledge",
      "Pattern-matching cultural game",
    ],
  },
  {
    id: "ellora",
    artifactId: "ellora-caves",
    locationId: "ellora",
    title: "ELLORA",
    spine: "ELLORA · ROCK-CUT CAVES",
    region: "Maharashtra",
    era: "Rock-cut traditions",
    type: "Rock-cut Architecture",
    accent: "#91a9a0",
    base: "#31453f",
    deep: "#18231f",
    ink: "#e5eee8",
    blurb:
      "Caves carved directly from rock reveal how engineering, religion, sculpture and spatial planning can merge.",
    history:
      "The Ellora Caves form a major rock-cut architectural complex representing Buddhist, Hindu and Jain traditions.",
    architecture:
      "Ellora is especially useful for understanding architecture as subtraction: spaces, pillars, shrines and sculptures were carved from living rock.",
    significance:
      "The site makes a strong educational bridge between geology, architecture, religion, sculpture and engineering.",
    discoveries: [
      "Rock-cut architectural planning",
      "Multiple religious traditions",
      "Sculpture and spatial storytelling",
      "Cave-complex exploration",
    ],
  },
  {
    id: "ayodhya",
    artifactId: "ram-temple",
    locationId: "ayodhya",
    title: "AYODHYA",
    spine: "AYODHYA · RAM TEMPLE",
    region: "Uttar Pradesh",
    era: "Contemporary landmark",
    type: "Temple & Heritage",
    accent: "#c98b44",
    base: "#5e351b",
    deep: "#29160b",
    ink: "#f7e5c5",
    blurb:
      "A modern heritage volume connecting sacred tradition, place, architecture and contemporary cultural identity.",
    history:
      "Ayodhya is a major sacred city associated with the Ramayana tradition. Virasat uses its architectural landmark as a gateway for exploring the relationship between place, belief and cultural memory.",
    architecture:
      "The temple experience can introduce learners to Indian temple vocabulary, spatial sequencing, ornament, ceremonial movement and contemporary construction.",
    significance:
      "This volume shows how heritage is not only something preserved from the distant past; places continue to evolve and acquire new cultural meaning.",
    discoveries: [
      "Temple planning and spatial sequence",
      "Ramayana cultural context",
      "Sacred-place storytelling",
      "Contemporary heritage interpretation",
    ],
  },
];

function Ornament({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 42,
        height: 42,
        border: `1px solid ${color}`,
        transform: "rotate(45deg)",
        position: "relative",
        opacity: 0.9,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 7,
          border: `1px solid ${color}`,
        }}
      />
      <span
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) rotate(45deg)",
          background: color,
        }}
      />
    </div>
  );
}

function Book3D({
  book,
  selected,
  size = "large",
}: {
  book: HeritageBook;
  selected?: boolean;
  size?: "large" | "small";
}) {
  const w = size === "large" ? 185 : 58;
  const h = size === "large" ? 266 : 204;
  const d = size === "large" ? 44 : 22;

  return (
    <div
      style={{
        width: w,
        height: h,
        position: "relative",
        transformStyle: "preserve-3d",
        transform: selected
          ? "rotateX(4deg) rotateY(-24deg) rotateZ(-2deg)"
          : "rotateX(3deg) rotateY(-12deg) rotateZ(-1deg)",
        transition: "transform 500ms cubic-bezier(.22,1,.36,1)",
        filter: selected
          ? "drop-shadow(0 24px 24px rgba(0,0,0,.5))"
          : "drop-shadow(0 12px 16px rgba(0,0,0,.38))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateZ(${d / 2}px)`,
          background: `linear-gradient(145deg, ${book.base}, ${book.deep})`,
          border: "1px solid rgba(0,0,0,.55)",
          boxShadow: `inset 0 0 0 8px rgba(255,255,255,.03), inset 0 0 20px rgba(0,0,0,.3)`,
          overflow: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 10,
            border: `1px solid ${book.ink}44`,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 18,
            border: `1px solid ${book.accent}88`,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 25%, ${book.accent}22, transparent 38%)`,
          }}
        />

        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 14px 16px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 8,
              letterSpacing: ".28em",
              textTransform: "uppercase",
              color: `${book.ink}99`,
            }}
          >
            VIRASAT · HERITAGE FILE
          </div>

          <Ornament color={book.accent} />

          <div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: 27,
                letterSpacing: ".05em",
                color: book.ink,
              }}
            >
              {book.title}
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 8,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: `${book.ink}99`,
              }}
            >
              {book.type}
            </div>
          </div>

          <div
            style={{
              fontSize: 7,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: `${book.ink}77`,
            }}
          >
            {book.region} · {book.era}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateY(180deg) translateZ(${d / 2}px)`,
          background: `linear-gradient(150deg, ${book.deep}, ${book.base})`,
          border: "1px solid rgba(0,0,0,.45)",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            border: `1px solid ${book.ink}33`,
          }}
        />

        <div
          style={{
            height: "100%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ opacity: 0.65 }}>
            <Ornament color={book.accent} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: d,
          height: h,
          marginLeft: -d / 2,
          transform: `rotateY(-90deg) translateZ(${w / 2}px)`,
          background: `linear-gradient(180deg, ${book.base}, ${book.deep})`,
          borderLeft: `2px solid ${book.accent}`,
          borderRight: `2px solid ${book.accent}`,
          backfaceVisibility: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "Georgia, serif",
            fontSize: size === "large" ? 10 : 7,
            letterSpacing: ".08em",
            color: book.ink,
            whiteSpace: "nowrap",
          }}
        >
          {book.title}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          width: d,
          height: h,
          marginLeft: -d / 2,
          transform: `rotateY(90deg) translateZ(${w / 2}px)`,
          background:
            "repeating-linear-gradient(180deg,#e9dec7 0 2px,#d6c8ab 2px 3px,#efe6d5 3px 5px)",
          backfaceVisibility: "hidden",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          top: (h - d) / 2,
          width: w,
          height: d,
          transform: `rotateX(90deg) translateZ(${h / 2}px)`,
          background: "#d8ccb5",
          backfaceVisibility: "hidden",
        }}
      />
    </div>
  );
}

function SmallSpine({
  book,
  active,
  onClick,
}: {
  book: HeritageBook;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={book.title}
      style={{
        width: 62,
        height: 220,
        border: active
          ? `1px solid ${book.accent}`
          : "1px solid rgba(0,0,0,.55)",
        borderRadius: 3,
        background: `linear-gradient(180deg, ${book.base}, ${book.deep})`,
        position: "relative",
        padding: 0,
        cursor: "pointer",
        transform: active
          ? "translateY(-18px) rotate(-1.5deg)"
          : "translateY(0)",
        transition:
          "transform 300ms cubic-bezier(.22,1,.36,1), box-shadow 300ms ease",
        boxShadow: active
          ? `0 22px 34px rgba(0,0,0,.52), 0 0 0 1px ${book.accent}44`
          : "0 10px 18px rgba(0,0,0,.32)",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 6,
          background: book.accent,
        }}
      />

      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 6,
          background: book.accent,
        }}
      />

      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "rgba(0,0,0,.24)",
        }}
      />

      <span
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontFamily: "Georgia, serif",
          fontSize: 10,
          color: book.ink,
          letterSpacing: ".06em",
          position: "absolute",
          top: 22,
          bottom: 58,
          left: "50%",
          transformOrigin: "center",
          translate: "-50% 0",
          whiteSpace: "nowrap",
        }}
      >
        {book.title}
      </span>

      <span
        style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          fontSize: 7,
          color: `${book.ink}99`,
          letterSpacing: ".13em",
          position: "absolute",
          bottom: 18,
          left: "50%",
          translate: "-50% 0",
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        {book.region}
      </span>
    </button>
  );
}

export default function HeritageLibrary({
  onView3D,
  onEnterWorld,
  onAR,
  onVR,
}: HeritageLibraryProps) {
  const [selectedId, setSelectedId] = useState("hampi");
  const [showFile, setShowFile] = useState(false);

  const selected =
    useMemo(
      () =>
        HERITAGE_BOOKS.find((book) => book.id === selectedId) ??
        HERITAGE_BOOKS[0],
      [selectedId],
    );

  const artifact = artifacts.find(
    (item) => item.id === selected.artifactId,
  ) as ArtifactDefinition | undefined;

  return (
   <section
  style={{
    minHeight: "100vh",
    height: "100vh",
    padding: "110px 5vw 80px",
    background:
      "radial-gradient(circle at 75% 18%, rgba(211,154,66,.09), transparent 30%), linear-gradient(135deg,#070b09,#0c120e 50%,#160d08)",
    color: "#f0e6cf",
    position: "relative",
    overflowY: "auto",
    overflowX: "hidden",
      }}
    >
      <style>{`
        .heritage-library-shell {
          max-width: 1450px;
          margin: 0 auto;
        }

        .heritage-library-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(340px, .88fr);
          gap: 54px;
          align-items: start;
        }

        .heritage-shelf {
          border: 1px solid rgba(237,227,204,.10);
          border-radius: 8px;
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,.014) 0 2px,
              transparent 2px 92px
            ),
            linear-gradient(
              145deg,
              rgba(24,34,27,.92),
              rgba(9,14,11,.95)
            );
          padding: 38px 24px 34px;
          box-shadow:
            0 30px 80px rgba(0,0,0,.35),
            inset 0 0 40px rgba(0,0,0,.16);
        }

        .heritage-shelf-row {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 9px;
          min-height: 242px;
        }

        .heritage-shelf-board {
          height: 17px;
          margin-top: -1px;
          border-radius: 3px;
          background:
            linear-gradient(
              180deg,
              #4a3424,
              #241711 62%,
              #130d08
            );
          box-shadow:
            0 16px 26px rgba(0,0,0,.48),
            inset 0 1px 0 rgba(255,220,160,.13);
        }

        .heritage-selection {
          position: sticky;
          top: 105px;
          border: 1px solid rgba(237,227,204,.10);
          background:
            linear-gradient(
              145deg,
              rgba(20,28,22,.88),
              rgba(9,13,11,.92)
            );
          border-radius: 8px;
          padding: 28px;
          box-shadow: 0 28px 70px rgba(0,0,0,.36);
        }

        .heritage-selection-main {
          display: grid;
          grid-template-columns: 210px 1fr;
          gap: 28px;
          align-items: center;
        }

        .heritage-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .heritage-tag {
          border: 1px solid rgba(217,164,65,.35);
          padding: 6px 9px;
          color: #e5c67f;
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .heritage-title {
          margin: 16px 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(34px, 4vw, 52px);
          line-height: .95;
          letter-spacing: -.025em;
        }

        .heritage-blurb {
          color: rgba(237,227,204,.64);
          line-height: 1.75;
          font-size: 13px;
          margin: 0;
        }

        .heritage-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 22px;
        }

        .heritage-info-box {
          border: 1px solid rgba(237,227,204,.08);
          background: rgba(255,255,255,.018);
          padding: 12px;
        }

        .heritage-info-label {
          color: rgba(237,227,204,.38);
          font-size: 8px;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .heritage-info-value {
          color: #ebd39e;
          font-size: 12px;
          margin-top: 5px;
          line-height: 1.4;
        }

        .heritage-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 20px;
        }

        .heritage-action {
          min-height: 42px;
          border: 1px solid rgba(237,227,204,.14);
          background: rgba(255,255,255,.02);
          color: rgba(237,227,204,.76);
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: .15em;
          font-size: 9px;
          transition: .25s ease;
        }

        .heritage-action:hover {
          transform: translateY(-2px);
          border-color: rgba(217,164,65,.6);
          color: #f4dfae;
          background: rgba(217,164,65,.07);
        }

        .heritage-action.primary {
          grid-column: 1 / -1;
          border-color: rgba(217,164,65,.62);
          background: rgba(217,164,65,.10);
          color: #f0cf8a;
        }

        .heritage-file {
          margin-top: 22px;
          border-top: 1px solid rgba(237,227,204,.08);
          padding-top: 20px;
        }

        .heritage-file h4 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22px;
          margin: 0 0 12px;
        }

        .heritage-file p {
          margin: 0 0 16px;
          color: rgba(237,227,204,.58);
          line-height: 1.72;
          font-size: 12px;
        }

        .heritage-discoveries {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .heritage-discovery {
          border-left: 2px solid rgba(217,164,65,.42);
          padding: 7px 0 7px 11px;
          color: rgba(237,227,204,.65);
          font-size: 11px;
        }

        .heritage-library-header {
          margin-bottom: 52px;
          display: grid;
          grid-template-columns: 1fr minmax(280px, .65fr);
          gap: 40px;
          align-items: end;
        }

        .heritage-eyebrow {
          color: rgba(237,227,204,.40);
          font-size: 9px;
          letter-spacing: .28em;
          text-transform: uppercase;
        }

        .heritage-heading {
          margin: 14px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(48px, 7vw, 88px);
          line-height: .90;
          letter-spacing: -.045em;
          font-weight: 500;
        }

        .heritage-heading em {
          color: #d9a441;
          font-weight: 400;
        }

        .heritage-header-copy {
          max-width: 430px;
          justify-self: end;
          margin: 0;
          color: rgba(237,227,204,.55);
          line-height: 1.8;
          font-size: 13px;
        }

        .heritage-shelf-label {
          margin: 22px 0 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(237,227,204,.34);
          font-size: 8px;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .heritage-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(2,5,4,.82);
          backdrop-filter: blur(12px);
        }

        .heritage-modal {
          width: min(900px, 94vw);
          max-height: 88vh;
          overflow: auto;
          border: 1px solid rgba(217,164,65,.28);
          border-radius: 8px;
          padding: 30px;
          background:
            radial-gradient(circle at 75% 10%, rgba(217,164,65,.10), transparent 28%),
            linear-gradient(145deg,#121a14,#090d0a);
          box-shadow: 0 40px 100px rgba(0,0,0,.6);
        }

        .heritage-modal-top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: start;
        }

        .heritage-close {
          border: 1px solid rgba(237,227,204,.13);
          background: rgba(255,255,255,.02);
          color: rgba(237,227,204,.60);
          padding: 9px 12px;
          cursor: pointer;
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: .14em;
        }

        @media (max-width: 1050px) {
          .heritage-library-grid {
            grid-template-columns: 1fr;
          }

          .heritage-selection {
            position: static;
          }

          .heritage-library-header {
            grid-template-columns: 1fr;
          }

          .heritage-header-copy {
            justify-self: start;
          }
        }

        @media (max-width: 700px) {
          .heritage-shelf {
            padding-left: 10px;
            padding-right: 10px;
          }

          .heritage-shelf-row {
            gap: 4px;
            overflow-x: auto;
            justify-content: flex-start;
            padding: 0 4px 10px;
          }

          .heritage-shelf-row::-webkit-scrollbar {
            height: 4px;
          }

          .heritage-shelf-row > button {
            flex: 0 0 auto;
          }

          .heritage-selection-main {
            grid-template-columns: 1fr;
          }

          .heritage-info-grid {
            grid-template-columns: 1fr;
          }

          .heritage-actions {
            grid-template-columns: 1fr;
          }

          .heritage-action.primary {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="heritage-library-shell">
        <div className="heritage-library-header">
          <div>
            <div className="heritage-eyebrow">
              VIRASAT · HERITAGE LIBRARY · 3D ARCHIVE
            </div>

            <h2 className="heritage-heading">
              Pull a spine,
              <br />
              <em>read the place.</em>
            </h2>
          </div>

          <p className="heritage-header-copy">
            Each book is a destination. Select a spine to open its heritage
            record, learn the story behind the place, inspect its 3D asset,
            or enter the interactive experience.
          </p>
        </div>

        <div className="heritage-library-grid">
          <div>
            <div className="heritage-shelf-label">
              <span>THE HERITAGE SHELVES</span>
              <span>{HERITAGE_BOOKS.length} VOLUMES · INDIA</span>
            </div>

            <div className="heritage-shelf">
              <div className="heritage-shelf-row">
                {HERITAGE_BOOKS.map((book) => (
                  <SmallSpine
                    key={book.id}
                    book={book}
                    active={book.id === selected.id}
                    onClick={() => {
                      setSelectedId(book.id);
                      setShowFile(false);
                    }}
                  />
                ))}
              </div>

              <div className="heritage-shelf-board" />

              <div style={{ height: 36 }} />

              <div className="heritage-shelf-row">
                {HERITAGE_BOOKS
                  .slice()
                  .reverse()
                  .map((book) => (
                    <SmallSpine
                      key={`${book.id}-reverse`}
                      book={book}
                      active={false}
                      onClick={() => {
                        setSelectedId(book.id);
                        setShowFile(false);
                      }}
                    />
                  ))}
              </div>

              <div className="heritage-shelf-board" />

              <div
                style={{
                  marginTop: 24,
                  textAlign: "center",
                  fontSize: 8,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "rgba(237,227,204,.26)",
                }}
              >
                Hover a spine · select a destination · open its heritage file
              </div>
            </div>
          </div>

          <div className="heritage-selection">
            <div className="heritage-selection-main">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 300,
                  perspective: 1500,
                }}
              >
                <Book3D book={selected} selected />
              </div>

              <div>
                <div className="heritage-meta">
                  <span className="heritage-tag">{selected.region}</span>
                  <span className="heritage-tag">{selected.era}</span>
                  <span className="heritage-tag">{selected.type}</span>
                </div>

                <h3 className="heritage-title">{selected.title}</h3>

                <p className="heritage-blurb">{selected.blurb}</p>

                <div className="heritage-info-grid">
                  <div className="heritage-info-box">
                    <div className="heritage-info-label">Why it matters</div>
                    <div className="heritage-info-value">
                      {selected.significance}
                    </div>
                  </div>

                  <div className="heritage-info-box">
                    <div className="heritage-info-label">Architecture</div>
                    <div className="heritage-info-value">
                      {selected.architecture}
                    </div>
                  </div>
                </div>

                <div className="heritage-actions">
                  <button
                    className="heritage-action primary"
                    onClick={() => setShowFile(true)}
                  >
                    OPEN HERITAGE FILE
                  </button>

                  <button
                    className="heritage-action"
                    onClick={() =>
                      onEnterWorld?.(selected.locationId)
                    }
                  >
                    ENTER WORLD
                  </button>

                  <button
                    className="heritage-action"
                    onClick={() =>
                      artifact && onView3D?.(artifact)
                    }
                    disabled={!artifact}
                  >
                    VIEW 3D
                  </button>

                  <button
                    className="heritage-action"
                    onClick={() =>
                      artifact && onAR?.(artifact)
                    }
                    disabled={!artifact}
                  >
                    AR
                  </button>

                  <button
                    className="heritage-action"
                    onClick={() =>
                      artifact && onVR?.(artifact)
                    }
                    disabled={!artifact}
                  >
                    VR
                  </button>
                </div>
              </div>
            </div>

            <div className="heritage-file">
              <h4>What you'll discover</h4>

              <div className="heritage-discoveries">
                {selected.discoveries.map((item) => (
                  <div className="heritage-discovery" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFile && (
        <div
          className="heritage-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setShowFile(false);
            }
          }}
        >
          <div className="heritage-modal">
            <div className="heritage-modal-top">
              <div>
                <div className="heritage-eyebrow">
                  VIRASAT · VOLUME · {selected.title}
                </div>

                <h3
                  style={{
                    margin: "8px 0 0",
                    fontFamily: "Georgia, serif",
                    fontSize: "clamp(32px, 5vw, 54px)",
                    lineHeight: 1,
                  }}
                >
                  {selected.title}
                </h3>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "rgba(237,227,204,.42)",
                    fontSize: 9,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                  }}
                >
                  {selected.region} · {selected.era} · {selected.type}
                </p>
              </div>

              <button
                className="heritage-close"
                onClick={() => setShowFile(false)}
              >
                CLOSE · ESC
              </button>
            </div>

            <div
              style={{
                height: 1,
                margin: "24px 0",
                background:
                  "linear-gradient(90deg, rgba(217,164,65,.55), transparent)",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 30,
              }}
            >
              <div>
                <div className="heritage-eyebrow">HISTORY</div>

                <p
                  style={{
                    marginTop: 12,
                    color: "rgba(237,227,204,.62)",
                    lineHeight: 1.8,
                    fontSize: 13,
                  }}
                >
                  {selected.history}
                </p>
              </div>

              <div>
                <div className="heritage-eyebrow">ARCHITECTURE</div>

                <p
                  style={{
                    marginTop: 12,
                    color: "rgba(237,227,204,.62)",
                    lineHeight: 1.8,
                    fontSize: 13,
                  }}
                >
                  {selected.architecture}
                </p>
              </div>

              <div>
                <div className="heritage-eyebrow">CULTURAL SIGNIFICANCE</div>

                <p
                  style={{
                    marginTop: 12,
                    color: "rgba(237,227,204,.62)",
                    lineHeight: 1.8,
                    fontSize: 13,
                  }}
                >
                  {selected.significance}
                </p>
              </div>

              <div>
                <div className="heritage-eyebrow">
                  WHAT THE PLAYER DISCOVERS
                </div>

                <div className="heritage-discoveries">
                  {selected.discoveries.map((item) => (
                    <div
                      className="heritage-discovery"
                      key={`modal-${item}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 30,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <button
                className="heritage-action primary"
                style={{ minWidth: 190 }}
                onClick={() => {
                  setShowFile(false);
                  onEnterWorld?.(selected.locationId);
                }}
              >
                ENTER {selected.title}
              </button>

              <button
                className="heritage-action"
                style={{ minWidth: 150 }}
                onClick={() => {
                  setShowFile(false);
                  if (artifact) onView3D?.(artifact);
                }}
                disabled={!artifact}
              >
                VIEW 3D ASSET
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

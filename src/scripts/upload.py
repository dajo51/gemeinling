import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Pfad zu deinem Service Account Key
SERVICE_ACCOUNT_KEY_PATH = "src/scripts/firebase_admin.json"

# Firebase initialisieren
cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
firebase_admin.initialize_app(cred)

# Firestore-Client initialisieren
db = firestore.client()

# JSON-Daten
data = {
    "name": "standard",
    "createdAt": datetime.utcnow().isoformat() + "Z",
    "cards": [
        "stur",
        "gastfreundlich",
        "witzig",
        "ehrlich",
        "zuverlässig",
        "selbstbewusst",
        "chaotisch",
        "ordentlich",
        "optimistisch",
        "pessimistisch",
        "introvertiert",
        "extrovertiert",
        "geduldig",
        "ungeduldig",
        "abenteuerlustig",
        "bodenständig",
        "hilfsbereit",
        "egoistisch",
        "kreativ",
        "analytisch",
        "neugierig",
        "misstrauisch",
        "spontan",
        "nachdenklich",
        "romantisch",
        "pragmatisch",
        "engagiert",
        "bequem",
        "freundlich",
        "arrogant",
        "humorvoll",
        "sarkastisch",
        "ehrgeizig",
        "faul",
        "ambitioniert",
        "respektvoll",
        "kritisch",
        "nachgiebig",
        "sturköpfig",
        "offen",
        "verschlossen",
        "kalt",
        "warmherzig",
        "vernünftig",
        "idealistisch",
        "verspielt",
        "ernst",
        "impulsiv",
        "vorsichtig",
        "tolerant",
        "intolerant",
        "selbstkritisch",
        "bescheiden",
        "aufmerksam",
        "nachlässig",
        "vertrauenswürdig",
        "unzuverlässig",
        "verantwortungsbewusst",
        "gedankenlos",
        "verlässlich",
        "ehrgeizlos",
        "kommunikativ",
        "schweigsam",
        "flexibel",
        "unflexibel",
        "beständig",
        "launisch",
        "zielsicher",
        "unentschlossen",
        "weitsichtig",
        "kurzsichtig",
        "einfühlsam",
        "rücksichtslos",
        "streitlustig",
        "friedfertig",
        "belastbar",
        "überfordert",
        "kultiviert",
        "einfältig",
        "gebildet",
        "ungebildet",
        "unabhängig",
        "abhängig",
        "gewissenhaft",
        "leichtsinnig",
        "nachdenklich",
        "oberflächlich",
        "originell",
        "konventionell",
        "respektlos",
        "beharrlich",
        "nachgiebig",
        "hilfreich",
        "aufdringlich",
        "rücksichtsvoll",
        "Witzbold",
        "Abenteurer",
        "Perfektionist",
        "Träumer",
        "Realist",
        "Optimist",
        "Pessimist",
        "Besserwisser",
        "Teamplayer",
        "Einzelgänger",
        "Globetrotter",
        "Visionär",
        "Leitwolf",
        "Mitläufer",
        "Entdecker",
        "Denker",
        "Künstler",
        "Macher",
        "Anführer",
        "Pionier",
        "Planer",
        "Stratege",
        "Romantiker",
        "Workaholic",
        "Faulenzer",
        "Skeptiker",
        "Moralapostel",
        "Weltenbummler",
        "Überflieger",
        "Tagträumer",
        "Kritiker",
        "Charmeur",
        "Organisator",
        "Pragmatiker",
    ],
}


# Daten in Firestore hochladen
def upload_data():
    try:
        # Erstelle oder überschreibe das Dokument
        db.collection("decks").document("standard").set(data)
        print("Daten erfolgreich hochgeladen!")
    except Exception as e:
        print(f"Fehler beim Hochladen der Daten: {e}")


# Upload starten
if __name__ == "__main__":
    upload_data()
